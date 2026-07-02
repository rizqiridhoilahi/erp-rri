import { NextRequest, NextResponse } from 'next/server'
import { pdf } from '@react-pdf/renderer'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { verifyAuth } from '@/lib/api/auth'
import { notFound, internalError } from '@/lib/api/errors'
import { DOLabelPengirimanPDF } from '@/lib/pdf/do-label-pengiriman'

const COMPANY_KEYS = [
  'company_nama', 'company_alamat', 'company_no_hp', 'company_email', 'company_logo_url',
] as const

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(_request)
  if (auth.error) return auth.error
  const { id } = await params

  const { searchParams } = new URL(_request.url)
  const row = searchParams.has('row') ? Number(searchParams.get('row')) : undefined
  const col = searchParams.has('col') ? Number(searchParams.get('col')) : undefined

  const { data: doDoc, error } = await supabaseAdmin
    .from('delivery_order')
    .select('*, sales_order!sales_order_id(nomor, customer_po_id, di_id)')
    .eq('id', id)
    .single()
  if (error) return internalError(error)
  if (!doDoc) return notFound('Delivery Order tidak ditemukan')

  const so = doDoc.sales_order as { nomor: string; customer_po_id: string | null; di_id: string | null } | null

  // Company settings
  const { data: settingsRows } = await supabaseAdmin
    .from('site_settings')
    .select('key, value')
    .in('key', COMPANY_KEYS as unknown as string[])
  const company: Record<string, string> = {}
  if (settingsRows) {
    for (const row of settingsRows) {
      company[row.key] = row.value
    }
  }

  // Resolve customer, PIC, alamat
  let customerNama = '-'
  let customerAlamat: string | null = null
  let picNama: string | null = null
  let picJabatan: string | null = null
  let picNoHp: string | null = null
  let picJenisKelamin: string | null = null

  async function resolveFromPO(poId: string) {
    const { data: po } = await supabaseAdmin
      .from('customer_po')
      .select('customer!customer_id(nama, alamat), pic_customer_id')
      .eq('id', poId)
      .single()
    const poData = po as { customer: { nama: string; alamat: string | null } | null; pic_customer_id: string | null } | null
    if (poData?.customer) {
      customerNama = poData.customer.nama
      customerAlamat = poData.customer.alamat
    }
    if (poData?.pic_customer_id) {
      const { data: pic } = await supabaseAdmin
        .from('customer_pic')
        .select('nama, jabatan, no_hp, jenis_kelamin')
        .eq('id', poData.pic_customer_id)
        .single()
      const picData = pic as { nama: string; jabatan: string | null; no_hp: string | null; jenis_kelamin: string | null } | null
      if (picData) {
        picNama = picData.nama
        picJabatan = picData.jabatan
        picNoHp = picData.no_hp
        picJenisKelamin = picData.jenis_kelamin
      }
    }
  }

  async function resolveFromDI(diId: string) {
    const { data: di } = await supabaseAdmin
      .from('di')
      .select('customer!customer_id(nama, alamat)')
      .eq('id', diId)
      .single()
    const diData = di as { customer: { nama: string; alamat: string | null } | null } | null
    if (diData?.customer) {
      customerNama = diData.customer.nama
      customerAlamat = diData.customer.alamat
    }
  }

  if (so?.customer_po_id) {
    await resolveFromPO(so.customer_po_id)
  } else if (so?.di_id) {
    await resolveFromDI(so.di_id)
  }

  const pdfData = {
    do_nomor: doDoc.nomor,
    tanggal: doDoc.tanggal,
    customer: {
      nama: customerNama,
      alamat: customerAlamat,
    },
    pic: {
      nama: picNama || customerNama,
      jabatan: picJabatan,
      no_hp: picNoHp,
      jenis_kelamin: picJenisKelamin,
    },
    company: {
      company_nama: company.company_nama ?? null,
      company_alamat: company.company_alamat ?? null,
      company_no_hp: company.company_no_hp ?? null,
      company_email: company.company_email ?? null,
      company_logo_url: company.company_logo_url ?? null,
    },
  }

  const suffix = (row !== undefined && col !== undefined) ? `-baris${row}-kolom${col}` : ''
  const filename = `${doDoc.nomor}-label-pengiriman${suffix}.pdf`

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blob = await pdf(DOLabelPengirimanPDF({ data: pdfData, row, col }) as any).toBlob()
    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': String(blob.size),
        'Content-Disposition': `inline; filename="${filename}"`,
      },
    })
  } catch {
    return internalError('Gagal generate PDF')
  }
}
