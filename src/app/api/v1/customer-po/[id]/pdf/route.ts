import { NextRequest, NextResponse } from 'next/server'
import { pdf } from '@react-pdf/renderer'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { verifyAuth } from '@/lib/api/auth'
import { notFound, internalError } from '@/lib/api/errors'
import { CustomerPdfPO } from '@/lib/pdf/customer-po'

const COMPANY_KEYS = [
  'company_nama', 'company_alamat', 'company_no_hp', 'company_email', 'company_logo_url',
  'penandatangan_nama', 'penandatangan_jabatan',
] as const

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error
  const { id } = await params

  const { data: po, error } = await supabaseAdmin
    .from('customer_po')
    .select('*, customer!customer_id(nama, alamat), customer_pic!pic_customer_id(nama, jabatan)')
    .eq('id', id)
    .single()
  if (error) return internalError(error)
  if (!po) return notFound('PO tidak ditemukan')

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

  const { data: items } = await supabaseAdmin
    .from('customer_po_item')
    .select('*, barang!barang_id(nama, kode, satuan)')
    .eq('customer_po_id', id)
    .order('urutan')
  if (!items) return internalError('Gagal memuat item')

  const customer = po.customer as { nama: string; alamat: string } | null
  const pic = po.customer_pic as { nama: string; jabatan: string } | null

  const pdfData = {
    nomor: po.nomor,
    nomor_po_customer: po.nomor_po_customer ?? null,
    tanggal: po.tanggal,
    customerNama: customer?.nama ?? '-',
    customerAlamat: customer?.alamat ?? '',
    picNama: pic?.nama ?? null,
    picJabatan: pic?.jabatan ?? null,
    termsOfPayment: po.terms_of_payment ?? null,
    waktuPengiriman: po.waktu_pengiriman ?? null,
    keterangan: po.keterangan ?? null,
    grandTotal: items.reduce((s, i) => s + i.jumlah * i.harga_satuan, 0),
    items: items.map(i => ({
      urutan: i.urutan ?? 0,
      nama_barang: (i.barang as { nama: string } | null)?.nama ?? '-',
      kode_barang: (i.barang as { kode: string } | null)?.kode ?? '-',
      satuan: (i.barang as { satuan: string } | null)?.satuan ?? '',
      jumlah: i.jumlah,
      harga_satuan: i.harga_satuan,
    })),
    company: {
      company_nama: company.company_nama ?? null,
      company_alamat: company.company_alamat ?? null,
      company_no_hp: company.company_no_hp ?? null,
      company_email: company.company_email ?? null,
      company_logo_url: company.company_logo_url ?? null,
      penandatangan_nama: company.penandatangan_nama ?? null,
      penandatangan_jabatan: company.penandatangan_jabatan ?? null,
    },
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blob = await pdf(CustomerPdfPO({ data: pdfData }) as any).toBlob()
    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': String(blob.size),
        'Content-Disposition': `inline; filename="PO-${po.nomor}.pdf"`,
      },
    })
  } catch (e) {
    console.error('PDF generation error:', e)
    const msg = e instanceof Error ? e.message : 'Gagal generate PDF'
    return NextResponse.json({ error: msg, code: 'PDF_GENERATION_ERROR' }, { status: 500 })
  }
}
