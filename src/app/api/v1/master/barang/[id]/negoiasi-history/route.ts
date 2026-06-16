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
    .select('id, negoiasi_id, harga_satuan_lama, diskon_lama, harga_satuan_baru, diskon_baru, alasan, is_rejected, created_at')
    .in('quotation_item_id', qtnIds)
    .order('created_at', { ascending: false })

  if (error) return internalError(error)

  const negoIds = [...new Set(
    (negoItems ?? []).map(n => n.negoiasi_id).filter(Boolean) as string[]
  )]

  const negoMap = new Map<string, { id: string; nomor: string; tanggal: string; status: string; revision: number; quotation_id: string }>()
  if (negoIds.length > 0) {
    const { data: negos } = await supabaseAdmin
      .from('negoiasi')
      .select('id, nomor, tanggal, status, revision, quotation_id')
      .in('id', negoIds)
    for (const n of negos ?? []) {
      const raw = n as { id: string; nomor: string; tanggal: string; status: string; revision: number; quotation_id: string }
      negoMap.set(raw.id, raw)
    }
  }

  const quotationIds = [...new Set(
    (negoItems ?? []).map(n => {
      const nego = negoMap.get(n.negoiasi_id)
      return nego?.quotation_id
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
    const nego = negoMap.get(item.negoiasi_id) ?? {} as { id: string; nomor: string; tanggal: string; status: string; revision: number; quotation_id: string }
    const quotation = nego.quotation_id ? quotationMap.get(nego.quotation_id) : null

    return {
      nego_id: nego.id ?? null,
      nego_nomor: nego.nomor ?? null,
      nego_tanggal: nego.tanggal ?? null,
      nego_status: nego.status ?? null,
      nego_revision: nego.revision ?? null,
      quotation_nomor: quotation?.nomor ?? null,
      customer_nama: quotation?.customer?.nama ?? null,
      customer_kode: quotation?.customer?.kode ?? null,
      harga_satuan_lama: item.harga_satuan_lama ?? null,
      diskon_lama: item.diskon_lama ?? null,
      harga_satuan_baru: item.harga_satuan_baru ?? null,
      diskon_baru: item.diskon_baru ?? null,
      alasan: item.alasan ?? null,
      is_rejected: item.is_rejected ?? false,
    }
  })

  return NextResponse.json({ data: history })
}
