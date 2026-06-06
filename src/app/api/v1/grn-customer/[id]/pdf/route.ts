import { NextRequest, NextResponse } from 'next/server'
import { pdf } from '@react-pdf/renderer'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { verifyAuth } from '@/lib/api/auth'
import { notFound, internalError } from '@/lib/api/errors'
import { GrnCustomerPDF } from '@/lib/pdf/grn-customer'

const COMPANY_KEYS = [
  'company_nama', 'company_bidang_usaha', 'company_alamat',
  'company_no_hp', 'company_email', 'company_logo_url',
  'penandatangan_nama', 'penandatangan_jabatan', 'penandatangan_no_hp',
  'tanda_tangan_stempel_url',
] as const

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error
  const { id } = await params

  const { data: grn, error } = await supabaseAdmin
    .from('grn_customer')
    .select('*, customer!customer_id(nama), gudang!gudang_id(nama, lokasi), retur_penjualan!retur_penjualan_id(nomor)')
    .eq('id', id)
    .single()
  if (error) return internalError(error)
  if (!grn) return notFound('GRN Customer tidak ditemukan')

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

  const { data: items, error: itemsError } = await supabaseAdmin
    .from('grn_customer_item')
    .select('*, barang!barang_id(nama, kode, satuan)')
    .eq('grn_customer_id', id)
    .order('urutan')
  if (itemsError) return internalError(itemsError)
  if (!items) return internalError('Gagal memuat item')

  const customer = grn.customer as { nama: string } | null
  const gudang = grn.gudang as { nama: string; lokasi: string } | null
  const returRef = grn.retur_penjualan as { nomor: string } | null

  let totalQty = 0
  const displayItems = items.map((item) => {
    totalQty += item.jumlah
    return {
      nama: item.nama_barang ?? (item.barang as { nama: string } | null)?.nama ?? '-',
      kode: item.kode_barang ?? (item.barang as { kode: string } | null)?.kode ?? '-',
      satuan: item.satuan ?? (item.barang as { satuan: string } | null)?.satuan ?? '',
      jumlah: item.jumlah,
      keterangan: item.keterangan ?? null,
      urutan: (item as { urutan: number }).urutan ?? 0,
    }
  })

  const pdfData = {
    nomor: grn.nomor,
    returNomor: returRef?.nomor ?? null,
    customerNama: customer?.nama ?? '-',
    gudangNama: gudang?.nama ?? null,
    gudangAlamat: gudang?.lokasi ?? null,
    tanggal: 'Jepara, ' + new Date(grn.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    items: displayItems,
    totalQty,
    company: {
      company_nama: company.company_nama ?? null,
      company_bidang_usaha: company.company_bidang_usaha ?? null,
      company_alamat: company.company_alamat ?? null,
      company_no_hp: company.company_no_hp ?? null,
      company_email: company.company_email ?? null,
      company_logo_url: company.company_logo_url ?? null,
      penandatangan_nama: company.penandatangan_nama ?? null,
      penandatangan_jabatan: company.penandatangan_jabatan ?? null,
      penandatangan_no_hp: company.penandatangan_no_hp ?? null,
      tanda_tangan_stempel_url: company.tanda_tangan_stempel_url ?? null,
    },
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blob = await pdf(GrnCustomerPDF({ data: pdfData }) as any).toBlob()
    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': String(blob.size),
        'Content-Disposition': `inline; filename="GRN-CUSTOMER-${grn.nomor}.pdf"`,
      },
    })
  } catch (e) {
    console.error('PDF generation error:', e)
    const msg = e instanceof Error ? e.message : 'Gagal generate PDF'
    return NextResponse.json({ error: msg, code: 'PDF_GENERATION_ERROR' }, { status: 500 })
  }
}
