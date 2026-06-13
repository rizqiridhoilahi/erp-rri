import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { verifyAuth } from '@/lib/api/auth'
import { badRequest, notFound, internalError } from '@/lib/api/errors'
import { generateInvoiceJournal } from '@/lib/auto-jurnal'
// AUTO-EMAIL DISABLED
// import { sendEmail } from '@/lib/utils/email'
// import { fetchCompanySettings } from '@/lib/email/templates'
// import { invoiceEmailHtml } from '@/lib/email/templates/invoice'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(_request); if (auth.error) return auth.error
  const { id } = await params
  const { data: inv, error } = await supabaseAdmin.from('invoice').select('*, sales_order!sales_order_id(nomor, di!fk_sales_order_di(nomor, nomor_di_customer, kontrak_id, customer_pic(nama, jabatan)), customer_po!customer_po_id(nomor, nomor_po_customer, customer_pic!pic_customer_id(nama, jabatan))), customer!customer_id(nama, kode)').eq('id', id).single()
  if (error) return internalError(error)
  if (!inv) return notFound('Invoice tidak ditemukan')
  const { data: items } = await supabaseAdmin.from('invoice_item').select('*, barang!barang_id(nama, kode, satuan)').eq('invoice_id', id).order('urutan')

  let kontrak_nomor: string | null = null
  if (inv.sales_order?.di?.kontrak_id) {
    const { data: kontrak } = await supabaseAdmin.from('kontrak').select('nomor_kontrak').eq('id', inv.sales_order.di.kontrak_id).single()
    if (kontrak) kontrak_nomor = kontrak.nomor_kontrak
  }

  let do_nomor: string | null = null
  let internal_grn: { id: string; nomor: string } | null = null
  const { data: dos } = await supabaseAdmin.from('delivery_order').select('id, nomor').eq('sales_order_id', inv.sales_order_id)
  if (dos && dos.length > 0) {
    do_nomor = dos[0].nomor
    const { data: returList } = await supabaseAdmin.from('retur_penjualan').select('id').in('delivery_order_id', dos.map(d => d.id))
    if (returList?.length) {
      const { data: grnList } = await supabaseAdmin.from('grn_customer').select('id, nomor').in('retur_penjualan_id', returList.map(r => r.id)).order('created_at', { ascending: false }).limit(1)
      if (grnList?.length) internal_grn = grnList[0]
    }
  }

  type SalesOrderWithPIC = {
  nomor: string
  customer_po_id?: string
  di_id?: string
  di?: {
    nomor?: string
    nomor_di_customer?: string
    kontrak_id?: string
    customer_pic?: { nama: string; jabatan: string }
  } | null
  customer_po?: {
    nomor?: string
    nomor_po_customer?: string
    customer_pic?: { nama: string; jabatan: string }
  } | null
}

const soPIC = inv.sales_order as SalesOrderWithPIC | null | undefined
const pic_nama = soPIC?.di?.customer_pic?.nama ?? soPIC?.customer_po?.customer_pic?.nama ?? null
const pic_jabatan = soPIC?.di?.customer_pic?.jabatan ?? soPIC?.customer_po?.customer_pic?.jabatan ?? null
const cpo_ref = soPIC?.customer_po?.nomor ?? null
const cpo_cust_ref = soPIC?.customer_po?.nomor_po_customer ?? null

  const { data: schedule } = await supabaseAdmin.from('invoice_payment_schedule').select('*').eq('invoice_id', id).order('urutan')

  return NextResponse.json({ data: { ...inv, items: items ?? [], schedule: schedule ?? [], kontrak_nomor, do_nomor, cpo_ref, cpo_cust_ref, pic_nama, pic_jabatan, internal_grn } })
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error
  const { id } = await params
  const body = await request.json().catch(() => null)
  if (!body) return badRequest('Invalid JSON body')

  const upd: Record<string, unknown> = {}
  if (body.status) upd.status = body.status
  if (body.tanggal) upd.tanggal = new Date(body.tanggal + "T00:00:00.000Z")
  if (body.top) upd.top = body.top
  if (body.grn_customer_nomor !== undefined) upd.grn_customer_nomor = body.grn_customer_nomor
  if (body.nomor_tanda_terima !== undefined) upd.nomor_tanda_terima = body.nomor_tanda_terima
  if (body.keterangan_invoice !== undefined) upd.keterangan_invoice = body.keterangan_invoice
  upd.updated_at = new Date().toISOString()

  const { data: oldInv } = await supabaseAdmin.from('invoice').select('status').eq('id', id).single()

  const { data, error } = await supabaseAdmin.from('invoice').update(upd).eq('id', id).select().single()
  if (error) return internalError(error)
  if (!data) return notFound('Invoice tidak ditemukan')

  if (data.status === 'sent' && oldInv?.status !== 'sent') {
    await generateInvoiceJournal(id)

    try {
      const { data: customer } = await supabaseAdmin
        .from('customer')
        .select('nama')
        .eq('id', data.customer_id)
        .single()

      const { data: items } = await supabaseAdmin
        .from('invoice_item')
        .select('harga, jumlah, diskon, ppn, pph')
        .eq('invoice_id', id)

      const total = (items ?? []).reduce((sum, item) => {
        const subtotal = Number(item.harga) * item.jumlah - Number(item.diskon ?? 0)
        const ppn = Number(item.ppn ?? 0)
        const pph = Number(item.pph ?? 0)
        return sum + subtotal + ppn - pph
      }, 0)

      const { data: so } = await supabaseAdmin
        .from('sales_order')
        .select('customer_po_id, di_id')
        .eq('id', data.sales_order_id)
        .single()

      if (so) {
        let customerId: string | null = null
        if (so.customer_po_id) {
          const { data: po } = await supabaseAdmin.from('customer_po').select('customer_id').eq('id', so.customer_po_id).single()
          customerId = po?.customer_id ?? null
        } else if (so.di_id) {
          const { data: di } = await supabaseAdmin.from('di').select('customer_id').eq('id', so.di_id).single()
          customerId = di?.customer_id ?? null
        }
        if (customerId) {
          const { data: pics } = await supabaseAdmin.from('customer_pic').select('nama, email').eq('customer_id', customerId).eq('is_active', true).limit(1)
          const pic = pics?.[0]
          // AUTO-EMAIL DISABLED — uncomment to re-enable
          // if (pic?.email) {
          //   const company = await fetchCompanySettings()
          //   const html = invoiceEmailHtml({...})
          //   await sendEmail({...})
          // }
        }
      }
    } catch {
      // Email sending is best-effort
    }
  }

  if (body.items) {
    await supabaseAdmin.from('invoice_item').delete().eq('invoice_id', id)
    const now = new Date().toISOString()
    const items = body.items.map((item: { barang_id: string; harga: number; jumlah: number; diskon?: number; keterangan?: string; nama_barang?: string; kode_barang?: string; satuan?: string }, idx: number) => ({
      invoice_id: id, barang_id: item.barang_id, harga: item.harga, jumlah: item.jumlah,
      diskon: item.diskon ?? 0,
      nama_barang: item.nama_barang ?? null,
      kode_barang: item.kode_barang ?? null,
      satuan: item.satuan ?? null,
      keterangan: item.keterangan ?? null, urutan: idx + 1, created_at: now, updated_at: now,
    }))
    const { error: itemsError } = await supabaseAdmin.from('invoice_item').insert(items)
    if (itemsError) return internalError(itemsError)
  }

  return NextResponse.json({ data })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error
  const { id } = await params

  const { data: inv } = await supabaseAdmin.from('invoice').select('nomor').eq('id', id).single()

  await supabaseAdmin.from('invoice_item').delete().eq('invoice_id', id)
  await supabaseAdmin.from('kwitansi').delete().eq('invoice_id', id)

  if (inv?.nomor) {
    const { data: jurnalList } = await supabaseAdmin.from('jurnal').select('id').ilike('keterangan', `%Auto-jurnal dari Invoice ${inv.nomor}%`)
    if (jurnalList?.length) {
      const jurnalIds = jurnalList.map(j => j.id)
      await supabaseAdmin.from('jurnal_item').delete().in('jurnal_id', jurnalIds)
      await supabaseAdmin.from('jurnal').delete().in('id', jurnalIds)
    }
  }

  const { error } = await supabaseAdmin.from('invoice').delete().eq('id', id)
  if (error) return internalError(error)
  return new NextResponse(null, { status: 204 })
}
