import { NextRequest, NextResponse } from 'next/server'
import { pdf } from '@react-pdf/renderer'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { verifyAuth } from '@/lib/api/auth'
import { notFound, internalError } from '@/lib/api/errors'
import { FakturPajakPDF } from '@/lib/pdf/faktur-pajak'

const COMPANY_KEYS = [
  'company_nama', 'company_alamat', 'company_npwp',
] as const

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(_request)
  if (auth.error) return auth.error
  const { id } = await params

  const { data: fp, error } = await supabaseAdmin
    .from('faktur_pajak')
    .select('*, invoice!invoice_id(nomor, customer_id, customer!customer_id(nama, alamat))')
    .eq('id', id)
    .single()
  if (error) return internalError(error)
  if (!fp) return notFound('Faktur Pajak tidak ditemukan')

  const { data: items } = await supabaseAdmin
    .from('faktur_pajak_item')
    .select('*, invoice_item!invoice_item_id(harga, barang_id, barang!barang_id(nama, kode, satuan))')
    .eq('faktur_pajak_id', id)

  const { data: settings } = await supabaseAdmin
    .from('site_settings')
    .select('*')
    .in('key', COMPANY_KEYS as unknown as string[])

  const company: Record<string, string> = {}
  if (settings) {
    for (const row of settings) {
      company[row.key] = row.value
    }
  }

  const customer = fp.invoice as unknown as { customer: { nama: string; alamat: string | null } }

  const invoice = fp.invoice as unknown as { nomor: string }

  const pdfData = {
    nomor: fp.nomor,
    nomorFaktur: fp.nomor_faktur,
    tanggal: fp.tanggal,
    dpp: fp.dpp,
    ppn: fp.ppn,
    pph: fp.pph,
    companyNama: company.company_nama ?? 'Radio Republik Indonesia',
    companyAlamat: company.company_alamat ?? '',
    companyNpwp: company.company_npwp ?? '',
    customerNama: customer?.customer?.nama ?? '-',
    customerAlamat: customer?.customer?.alamat ?? '-',
    invoiceNomor: invoice?.nomor ?? '-',
    items: (items ?? []).map(i => {
      const invItem = i.invoice_item as unknown as { harga: number; barang: { nama: string; kode: string; satuan: string } }
      return {
        nama: invItem?.barang?.nama ?? '-',
        kode: invItem?.barang?.kode ?? '',
        satuan: invItem?.barang?.satuan ?? '',
        jumlah: 1,
        harga: i.harga,
        dpp: i.dpp,
        ppn: i.ppn,
        pph: i.pph,
      }
    }),
  }

  try {
    const blob = await pdf(FakturPajakPDF({ data: pdfData })).toBlob()
    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': String(blob.size),
        'Content-Disposition': `inline; filename="FP-${fp.nomor}.pdf"`,
      },
    })
  } catch {
    return internalError('Gagal generate PDF')
  }
}
