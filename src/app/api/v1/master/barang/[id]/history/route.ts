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

  // --- 1. Invoice-based history (existing flow) ---
  const invoiceQuery = supabaseAdmin
    .from('invoice_item')
    .select('invoice_id, harga, jumlah, diskon')
    .eq('barang_id', id)
    .order('created_at', { ascending: false })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: invoiceItems, error: iiErr } = await (invoiceQuery as any)

  if (iiErr) return internalError(iiErr)

  const rawItems = (invoiceItems as Array<{ invoice_id: string; harga: string; jumlah: number; diskon: string | null }>) ?? []

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let history: any[] = []

  const invoiceIds = [...new Set(rawItems.map((i) => i.invoice_id))]

  if (invoiceIds.length > 0) {
    const invQuery = supabaseAdmin
      .from('invoice')
      .select('id, nomor, tanggal, status, customer!customer_id(nama, kode), sales_order!sales_order_id(nomor, di!fk_sales_order_di(nomor, nomor_di_customer, kontrak_id), customer_po!customer_po_id(nomor, nomor_po_customer))')
      .in('id', invoiceIds)
      .neq('status', 'draft')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: invRows, error: invErr } = await (invQuery as any)

    if (invErr) return internalError(invErr)

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

    history = rawItems
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
  }

  // --- 2. EXT: Customer PO items tanpa sales_order (Import PO) ---
  const { data: soCpoIds } = await supabaseAdmin
    .from('sales_order')
    .select('customer_po_id')
    .not('customer_po_id', 'is', null)
  const excludeCpoIds = new Set((soCpoIds ?? []).map(s => s.customer_po_id).filter(Boolean))

  const { data: extCpoRaw, error: extCpoErr } = await (supabaseAdmin
    .from('customer_po_item')
    .select('id, customer_po_id, harga_satuan, jumlah, customer_po!customer_po_id(id, nomor, tanggal, nomor_po_customer, customer!customer_id(nama, kode))')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .eq('barang_id', id) as any)

  if (extCpoErr) console.error('EXT CPO query error:', extCpoErr)

  const extCpoItems = (extCpoRaw ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((i: any) => !excludeCpoIds.has(i.customer_po_id) && i.customer_po?.customer)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((item: any) => ({
      invoice_id: 'cpo-' + item.id,
      invoice_nomor: '',
      invoice_tanggal: item.customer_po.tanggal,
      invoice_status: '',
      customer_nama: item.customer_po.customer.nama,
      customer_kode: item.customer_po.customer.kode,
      so_nomor: null,
      di_nomor: null,
      di_nomor_customer: null,
      kontrak_nomor: null,
      cpo_nomor: item.customer_po.nomor,
      cpo_nomor_customer: item.customer_po.nomor_po_customer ?? null,
      harga_satuan: Number(item.harga_satuan),
      jumlah: item.jumlah,
      diskon: 0,
      total: Number(item.harga_satuan) * item.jumlah,
      path: 'Import PO',
    }))

  // --- 3. EXT: DI items tanpa sales_order (Import DI) ---
  const { data: soDiIds } = await supabaseAdmin
    .from('sales_order')
    .select('di_id')
    .not('di_id', 'is', null)
  const excludeDiIds = new Set((soDiIds ?? []).map(s => s.di_id).filter(Boolean))

  const { data: extDiItemRaw, error: extDiErr } = await (supabaseAdmin
    .from('di_item')
    .select('id, di_id, harga_satuan, jumlah')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .eq('barang_id', id) as any)

  if (extDiErr) console.error('EXT DI items query error:', extDiErr)

  // Fetch DI records + customer untuk item yang tidak punya sales_order
  const extDiItemIds = [...new Set((extDiItemRaw ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((i: any) => !excludeDiIds.has(i.di_id))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((i: any) => i.di_id)
    .filter(Boolean))]

  const diMap = new Map<string, { nomor: string; tanggal: string; nomor_di_customer: string | null; kontrak_id: string | null; customer: { nama: string; kode: string } }>()

  if (extDiItemIds.length > 0) {
    const { data: diRecords } = await (supabaseAdmin
      .from('di')
      .select('id, nomor, tanggal, nomor_di_customer, kontrak_id, customer!customer_id(nama, kode)')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .in('id', extDiItemIds) as any)

    for (const d of diRecords ?? []) {
      if (d.customer) {
        diMap.set(d.id, {
          nomor: d.nomor,
          tanggal: d.tanggal,
          nomor_di_customer: d.nomor_di_customer,
          kontrak_id: d.kontrak_id,
          customer: d.customer,
        })
      }
    }
  }

  // Fetch kontrak nomor untuk EXT DI items
  const diKontrakIds = [...new Set(
    [...diMap.values()].map(d => d.kontrak_id).filter((k): k is string => k != null)
  )]
  const extDiKontrakMap: Record<string, string> = {}
  if (diKontrakIds.length > 0) {
    const { data: kontraks } = await supabaseAdmin
      .from('kontrak')
      .select('id, nomor_kontrak')
      .in('id', diKontrakIds)
    for (const k of kontraks ?? []) {
      extDiKontrakMap[k.id] = k.nomor_kontrak
    }
  }

  const extDiItems = (extDiItemRaw ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((i: any) => !excludeDiIds.has(i.di_id) && diMap.has(i.di_id))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((item: any) => {
      const di = diMap.get(item.di_id)!
      return {
        invoice_id: 'di-' + item.id,
        invoice_nomor: '',
        invoice_tanggal: di.tanggal,
        invoice_status: '',
        customer_nama: di.customer.nama,
        customer_kode: di.customer.kode,
        so_nomor: null,
        di_nomor: di.nomor,
        di_nomor_customer: di.nomor_di_customer ?? null,
        kontrak_nomor: di.kontrak_id ? (extDiKontrakMap[di.kontrak_id] ?? null) : null,
        cpo_nomor: null,
        cpo_nomor_customer: null,
        harga_satuan: Number(item.harga_satuan),
        jumlah: item.jumlah,
        diskon: 0,
        total: Number(item.harga_satuan) * item.jumlah,
        path: 'Import DI',
      }
    })

  const allHistory = [...history, ...extCpoItems, ...extDiItems]
  allHistory.sort((a, b) => new Date(b.invoice_tanggal).getTime() - new Date(a.invoice_tanggal).getTime())

  return NextResponse.json({ data: allHistory })
}
