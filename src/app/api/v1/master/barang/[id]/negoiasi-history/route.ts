import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { verifyAuth } from '@/lib/api/auth'
import { internalError } from '@/lib/api/errors'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(_request); if (auth.error) return auth.error
  const { id } = await params

  const { data: qtnItems } = await supabaseAdmin
    .from('quotation_item')
    .select('id')
    .eq('barang_id', id)

  const qtnIds = (qtnItems ?? []).map(q => q.id)
  if (qtnIds.length === 0) return NextResponse.json({ data: [] })

  const { data: negoItems, error } = await supabaseAdmin
    .from('negoiasi_item')
    .select('id, harga_satuan_lama, diskon_lama, harga_satuan_baru, diskon_baru, alasan, is_rejected, created_at, negoiasi!negoiasi_id(id, nomor, tanggal, status, revision, quotation_id)')
    .in('quotation_item_id', qtnIds)
    .order('created_at', { ascending: false })

  if (error) return internalError(error)

  const quotationIds = [...new Set(
    (negoItems ?? []).map(n => {
      const arr = (n as Record<string, unknown>).negoiasi as Array<{ quotation_id: string }> | undefined
      return arr?.[0]?.quotation_id
    }).filter(Boolean) as string[]
  )]

  const quotationMap = new Map<string, { nomor: string; customer: { nama: string; kode: string } | null }>()
  if (quotationIds.length > 0) {
    const { data: quotations } = await supabaseAdmin
      .from('quotation')
      .select('id, nomor, customer!customer_id(id, nama, kode)')
      .in('id', quotationIds)
    for (const q of quotations ?? []) {
      const raw = q as { id: string; nomor: string; customer: unknown }
      const customer = raw.customer as { nama: string; kode: string } | null
      quotationMap.set(raw.id, { nomor: raw.nomor, customer })
    }
  }

  const history = (negoItems ?? []).map(item => {
    const raw = item as Record<string, unknown>
    const negoArr = raw.negoiasi as Array<Record<string, unknown>> | undefined
    const nego = negoArr?.[0] ?? {}

    const quotation = nego.quotation_id ? quotationMap.get(nego.quotation_id as string) : null

    return {
      nego_id: nego.id ?? null,
      nego_nomor: nego.nomor ?? null,
      nego_tanggal: nego.tanggal ?? null,
      nego_status: nego.status ?? null,
      nego_revision: nego.revision ?? null,
      quotation_nomor: quotation?.nomor ?? null,
      customer_nama: quotation?.customer?.nama ?? null,
      customer_kode: quotation?.customer?.kode ?? null,
      harga_satuan_lama: raw.harga_satuan_lama ?? null,
      diskon_lama: raw.diskon_lama ?? null,
      harga_satuan_baru: raw.harga_satuan_baru ?? null,
      diskon_baru: raw.diskon_baru ?? null,
      alasan: raw.alasan ?? null,
      is_rejected: raw.is_rejected ?? false,
    }
  })

  return NextResponse.json({ data: history })
}
