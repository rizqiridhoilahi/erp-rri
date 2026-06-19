import { NextRequest, NextResponse } from 'next/server'
import { pdf } from '@react-pdf/renderer'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { verifyAuth } from '@/lib/api/auth'
import { notFound, internalError } from '@/lib/api/errors'
import { ApprovalQuotationPDF } from '@/lib/pdf/approval-quotation'

const COMPANY_KEYS = [
  'company_nama', 'company_bidang_usaha', 'company_alamat',
  'company_no_hp', 'company_email', 'company_logo_url',
] as const

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(_request)
  if (auth.error) return auth.error
  const { id } = await params

  const { data: qtn, error } = await supabaseAdmin
    .from('quotation')
    .select('nomor, tanggal, ppn_rate, ppn_enabled, total_harga, keterangan, revisi, rfq_id, customer_id, pic_customer_id, target_margin, negotiation_buffer')
    .eq('id', id)
    .single()
  if (error) return internalError(error)
  if (!qtn) return notFound('Quotation tidak ditemukan')

  const displayNomor = `${qtn.nomor}${(qtn.revisi ?? 0) > 0 ? `-R${qtn.revisi}` : ''}`

  let rfqNomor: string | null = null
  if (qtn.rfq_id) {
    const { data: rfq } = await supabaseAdmin
      .from('rfq_customer')
      .select('nomor_rfq_customer')
      .eq('id', qtn.rfq_id)
      .single()
    if (rfq) rfqNomor = rfq.nomor_rfq_customer
  }

  let customerNama = '-'
  if (qtn.customer_id) {
    const { data: c } = await supabaseAdmin
      .from('customer')
      .select('nama')
      .eq('id', qtn.customer_id)
      .single()
    if (c) customerNama = c.nama
  }

  let picCustomerNama: string | null = null
  let picCustomerJabatan: string | null = null
  if (qtn.pic_customer_id) {
    const { data: pic } = await supabaseAdmin
      .from('customer_pic')
      .select('nama, jabatan')
      .eq('id', qtn.pic_customer_id)
      .single()
    if (pic) {
      picCustomerNama = pic.nama
      picCustomerJabatan = pic.jabatan
    }
  }

  const { data: rawItems } = await supabaseAdmin
    .from('quotation_item')
    .select('*')
    .eq('quotation_id', id)
    .eq('is_rejected', false)
    .order('urutan', { ascending: true })

  if (!rawItems || rawItems.length === 0) return notFound('Item quotation tidak ditemukan')

  const barangIds = [...new Set(rawItems.filter(i => i.barang_id).map(i => i.barang_id) ?? [])]
  let barangMap = new Map<string, { nama: string; kode: string; image_url: string | null; link_produk: string | null }>()
  if (barangIds.length > 0) {
    const { data: barangList } = await supabaseAdmin
      .from('barang')
      .select('id, nama, kode, image_url, link_produk')
      .in('id', barangIds)
    barangMap = new Map(barangList?.map(b => [b.id, b]) ?? [])
  }

  const { data: settingsRows } = await supabaseAdmin
    .from('site_settings')
    .select('key, value')
    .in('key', COMPANY_KEYS as unknown as string[])
  const company: Record<string, string> = {}
  if (settingsRows) {
    for (const row of settingsRows) company[row.key] = row.value
  }

  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  const qtnDate = new Date(qtn.tanggal)
  const tanggalStr = `Jepara, ${qtnDate.getDate()} ${months[qtnDate.getMonth()]} ${qtnDate.getFullYear()}`

  const items = rawItems.map(i => {
    const barang = i.barang_id ? barangMap.get(i.barang_id) ?? null : null
    return {
      nama_barang: i.nama_barang ?? null,
      specification: i.specification ?? null,
      image_url: i.image_url ?? null,
      link_produk: i.link_produk ?? null,
      satuan: i.satuan ?? null,
      jumlah: i.jumlah,
      harga_satuan: i.harga_satuan,
      harga_beli: i.harga_beli ?? 0,
      overhead_per_unit: i.overhead_per_unit ?? 0,
      barang: barang ? { nama: barang.nama, kode: barang.kode, image_url: barang.image_url, link_produk: barang.link_produk } : null,
    }
  })

  const pdfData = {
    nomor: displayNomor,
    rfq_nomor: rfqNomor,
    customer_nama: customerNama,
    pic_customer_nama: picCustomerNama,
    pic_customer_jabatan: picCustomerJabatan,
    tanggal: tanggalStr,
    ppn_rate: qtn.ppn_rate,
    ppn_enabled: qtn.ppn_enabled,
    total_harga: qtn.total_harga,
    keterangan: qtn.keterangan,
    target_margin: qtn.target_margin ?? 0.15,
    negotiation_buffer: qtn.negotiation_buffer ?? 0.10,
    items,
    company: {
      company_nama: company.company_nama ?? null,
      company_bidang_usaha: company.company_bidang_usaha ?? null,
      company_alamat: company.company_alamat ?? null,
      company_no_hp: company.company_no_hp ?? null,
      company_email: company.company_email ?? null,
      company_logo_url: company.company_logo_url ?? null,
    },
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blob = await pdf(ApprovalQuotationPDF({ data: pdfData }) as any).toBlob()
    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': String(blob.size),
        'Content-Disposition': `inline; filename="APPROVAL-${displayNomor}.pdf"`,
      },
    })
  } catch (e) {
    console.error('Approval PDF generation error:', e)
    const msg = e instanceof Error ? e.message : 'Gagal generate PDF'
    return NextResponse.json({ error: msg, code: 'PDF_GENERATION_ERROR' }, { status: 500 })
  }
}
