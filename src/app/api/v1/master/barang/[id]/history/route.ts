import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { verifyAuth } from '@/lib/api/auth'
import { internalError } from '@/lib/api/errors'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAuth(_request)
  if (auth.error) return auth.error

  const { id } = await params

  const invoiceQuery = supabaseAdmin
    .from('invoice_item')
    .select('invoice_id, harga, jumlah, diskon')
    .eq('barang_id', id)
    .order('created_at', { ascending: false })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: invoiceItems, error: iiErr } = await (invoiceQuery as any)

  if (iiErr) return internalError(iiErr)

  const rawItems = (invoiceItems as Array<{ invoice_id: string; harga: string; jumlah: number; diskon: string | null }>) ?? []

  if (rawItems.length === 0) return NextResponse.json({ data: [] })

  const invoiceIds = [...new Set(rawItems.map((i) => i.invoice_id))]

  const invQuery = supabaseAdmin
    .from('invoice')
    .select('id, nomor, tanggal, status, customer!customer_id(nama, kode), sales_order!sales_order_id(nomor, di!fk_sales_order_di(nomor, nomor_di_customer, kontrak_id), customer_po!customer_po_id(nomor, nomor_po_customer))')
    .in('id', invoiceIds)
    .neq('status', 'draft')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: invRows, error: invErr } = await (invQuery as any)

  if (invErr) return internalError(invErr)

  type InvoiceRow = {
    id: string
    nomor: string
    tanggal: string
    status: string
    customer: { nama: string; kode: string } | null
    sales_order: {
      nomor: string
      di: {
        nomor: string
        nomor_di_customer: string | null
        kontrak_id: string | null
      } | null
      customer_po: {
        nomor: string
        nomor_po_customer: string | null
      } | null
    } | null
  }

  const invoices = (invRows as InvoiceRow[]) ?? []

  const kontrakIds = [
    ...new Set(
      invoices
        .map((inv) => inv.sales_order?.di?.kontrak_id)
        .filter((k): k is string => k != null)
    ),
  ]

  const kontrakMap: Record<string, string> = {}
  if (kontrakIds.length > 0) {
    const { data: kontraks } = await supabaseAdmin
      .from('kontrak')
      .select('id, nomor_kontrak')
      .in('id', kontrakIds)

    for (const k of kontraks ?? []) {
      kontrakMap[k.id] = k.nomor_kontrak
    }
  }

  const invoiceMap = new Map(invoices.map((inv) => [inv.id, inv]))

  const history = rawItems
    .map((item) => {
      const inv = invoiceMap.get(item.invoice_id)
      if (!inv || !inv.sales_order) return null

      const so = inv.sales_order
      const hrg = Number(item.harga)
      const qty = item.jumlah
      const disc = Number(item.diskon ?? 0)

      return {
        invoice_id: item.invoice_id,
        invoice_nomor: inv.nomor,
        invoice_tanggal: inv.tanggal,
        invoice_status: inv.status,
        customer_nama: inv.customer?.nama ?? null,
        customer_kode: inv.customer?.kode ?? null,
        so_nomor: so.nomor,
        di_nomor: so.di?.nomor ?? null,
        di_nomor_customer: so.di?.nomor_di_customer ?? null,
        kontrak_nomor: so.di?.kontrak_id ? (kontrakMap[so.di.kontrak_id] ?? null) : null,
        cpo_nomor: so.customer_po?.nomor ?? null,
        cpo_nomor_customer: so.customer_po?.nomor_po_customer ?? null,
        harga_satuan: hrg,
        jumlah: qty,
        diskon: disc,
        total: hrg * qty - disc,
        path: so.di != null ? 'Kontrak → DI' : so.customer_po != null ? 'PO Customer' : null,
      }
    })
    .filter((h): h is NonNullable<typeof h> => h != null)

  return NextResponse.json({ data: history })
}
