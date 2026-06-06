import { NextRequest, NextResponse } from 'next/server'
import { pdf } from '@react-pdf/renderer'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { verifyAuth } from '@/lib/api/auth'
import { notFound, internalError } from '@/lib/api/errors'
import { ReturPenjualanPDF } from '@/lib/pdf/retur-penjualan'

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

  const { data: retur, error } = await supabaseAdmin
    .from('retur_penjualan')
    .select('*, customer!customer_id(nama, alamat), delivery_order!delivery_order_id(id, nomor)')
    .eq('id', id)
    .single()
  if (error) return internalError(error)
  if (!retur) return notFound('Retur Penjualan tidak ditemukan')

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
    .from('retur_penjualan_item')
    .select('*, barang!barang_id(nama, kode, satuan)')
    .eq('retur_penjualan_id', id)
  if (!items) return internalError('Gagal memuat item')

  let hargaMap = new Map<string, number>()
  let picNama: string | null = null
  let picJenisKelamin: string | null = null
  let picJabatan: string | null = null
  const doObj = retur.delivery_order as { id: string; nomor: string } | null
  if (doObj?.id) {
    const { data: doDoc } = await supabaseAdmin
      .from('delivery_order')
      .select('sales_order_id')
      .eq('id', doObj.id)
      .single()

    if (doDoc?.sales_order_id) {
      // Pricing from invoice items, fallback to SO items
      const { data: invoice } = await supabaseAdmin
        .from('invoice')
        .select('id')
        .eq('sales_order_id', doDoc.sales_order_id)
        .maybeSingle()
      if (invoice) {
        const { data: invItems } = await supabaseAdmin
          .from('invoice_item')
          .select('barang_id, harga')
          .eq('invoice_id', invoice.id)
        hargaMap = new Map((invItems ?? []).map(i => [i.barang_id, Number(i.harga)]))
      }
      if (hargaMap.size === 0 || items.some(item => !hargaMap.has(item.barang_id))) {
        const { data: soItems } = await supabaseAdmin
          .from('sales_order_item')
          .select('barang_id, harga_satuan')
          .eq('sales_order_id', doDoc.sales_order_id)
        for (const si of (soItems ?? [])) {
          if (!hargaMap.has(si.barang_id)) {
            hargaMap.set(si.barang_id, Number(si.harga_satuan))
          }
        }
      }

      // PIC data from SO → DI/CPO → customer_pic (explicit 3-step)
      const { data: soRow } = await supabaseAdmin
        .from('sales_order')
        .select('di_id, customer_po_id')
        .eq('id', doDoc.sales_order_id)
        .single()
      if (soRow) {
        let picId: string | null = null
        if (soRow.di_id) {
          const { data: diRow } = await supabaseAdmin
            .from('di')
            .select('pic_customer_id')
            .eq('id', soRow.di_id)
            .single()
          if (diRow?.pic_customer_id) picId = diRow.pic_customer_id
        }
        if (!picId && soRow.customer_po_id) {
          const { data: cpoRow } = await supabaseAdmin
            .from('customer_po')
            .select('pic_customer_id')
            .eq('id', soRow.customer_po_id)
            .single()
          if (cpoRow?.pic_customer_id) picId = cpoRow.pic_customer_id
        }
        if (picId) {
          const { data: pic } = await supabaseAdmin
            .from('customer_pic')
            .select('nama, jabatan, jenis_kelamin')
            .eq('id', picId)
            .single()
          if (pic) {
            picNama = pic.nama
            picJenisKelamin = pic.jenis_kelamin
            picJabatan = pic.jabatan
          }
        }
      }
    }
  }

  const customer = retur.customer as { nama: string; alamat: string | null } | null

  let grandTotal = 0
  const displayItems = items.map((item, idx) => {
    const hargaSatuan = hargaMap.get(item.barang_id) ?? 0
    const subtotal = hargaSatuan * item.jumlah
    grandTotal += subtotal
    return {
      nama: item.nama_barang ?? (item.barang as { nama: string } | null)?.nama ?? '-',
      kode: item.kode_barang ?? (item.barang as { kode: string } | null)?.kode ?? '-',
      satuan: item.satuan ?? (item.barang as { satuan: string } | null)?.satuan ?? '',
      jumlah: item.jumlah,
      hargaSatuan,
      keterangan: item.keterangan ?? null,
      urutan: idx + 1,
    }
  })

  const pdfData = {
    nomor: retur.nomor,
    doNomor: doObj?.nomor ?? null,
    customerNama: customer?.nama ?? '-',
    customerAlamat: customer?.alamat ?? null,
    picNama,
    picJenisKelamin,
    picJabatan,
    tanggal: 'Jepara, ' + new Date(retur.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    items: displayItems,
    grandTotal,
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
    const blob = await pdf(ReturPenjualanPDF({ data: pdfData }) as any).toBlob()
    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': String(blob.size),
        'Content-Disposition': `inline; filename="NOTA-RETUR-${retur.nomor}.pdf"`,
      },
    })
  } catch (e) {
    console.error('PDF generation error:', e)
    const msg = e instanceof Error ? e.message : 'Gagal generate PDF'
    return NextResponse.json({ error: msg, code: 'PDF_GENERATION_ERROR' }, { status: 500 })
  }
}
