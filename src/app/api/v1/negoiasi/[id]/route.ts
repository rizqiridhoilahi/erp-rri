import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { verifyAuth } from '@/lib/api/auth'
import { badRequest, notFound, internalError } from '@/lib/api/errors'

const NEGO_QUOTATION_ALLOWED = ['sent', 'proses_negosiasi']

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(_request); if (auth.error) return auth.error
  const { id } = await params
  const { data: neg, error } = await supabaseAdmin.from('negoiasi').select('*, quotation!quotation_id(nomor)').eq('id', id).single()
  if (error) return internalError(error)
  if (!neg) return notFound('Negosiasi tidak ditemukan')
  const { data: items } = await supabaseAdmin.from('negoiasi_item').select('*, quotation_item!quotation_item_id(id, harga_satuan, diskon, jumlah, barang!barang_id(id, nama, kode, satuan))').eq('negoiasi_id', id)
  return NextResponse.json({ data: { ...neg, items: items ?? [] } })
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error
  const { id } = await params
  const body = await request.json().catch(() => null)
  if (!body) return badRequest('Invalid JSON body')

  const upd: Record<string, unknown> = {}
  if (body.status) upd.status = body.status
  if (body.keterangan !== undefined) upd.keterangan = body.keterangan
  const now = new Date().toISOString()
  upd.updated_at = now

  const { data, error } = await supabaseAdmin.from('negoiasi').update(upd).eq('id', id).select().single()
  if (error) return internalError(error)
  if (!data) return notFound('Negosiasi tidak ditemukan')

  if (body.status === 'approved' || body.status === 'rejected') {
    const { data: qtnCheck } = await supabaseAdmin
      .from('quotation')
      .select('id, status')
      .eq('id', data.quotation_id)
      .single()

    if (!qtnCheck) return notFound('Quotation tidak ditemukan')

    if (!NEGO_QUOTATION_ALLOWED.includes(qtnCheck.status)) {
      return badRequest(
        `Quotation status '${qtnCheck.status}' tidak bisa dinegosiasikan. Hanya status: ${NEGO_QUOTATION_ALLOWED.join(', ')}`
      )
    }

    const { data: confirmedPO } = await supabaseAdmin
      .from('customer_po')
      .select('id, nomor')
      .eq('quotation_id', data.quotation_id)
      .eq('status', 'confirmed')
      .limit(1)

    if (confirmedPO && confirmedPO.length > 0) {
      return badRequest(
        `Quotation ini sudah memiliki PO Customer (${confirmedPO[0].nomor}) yang dikonfirmasi. Tidak bisa mengubah status negosiasi.`
      )
    }
  }

  if (body.status === 'approved') {
    const { data: negoItems } = await supabaseAdmin
      .from('negoiasi_item')
      .select('quotation_item_id, harga_satuan_baru, diskon_baru')
      .eq('negoiasi_id', id)

    for (const negoItem of negoItems ?? []) {
      await supabaseAdmin
        .from('quotation_item')
        .update({
          harga_satuan: negoItem.harga_satuan_baru,
          diskon: negoItem.diskon_baru ?? 0,
          updated_at: now,
        })
        .eq('id', negoItem.quotation_item_id)
    }

    const { data: qtnItems } = await supabaseAdmin
      .from('quotation_item')
      .select('id, harga_satuan, jumlah, diskon')
      .eq('quotation_id', data.quotation_id)

    const { data: qtn } = await supabaseAdmin
      .from('quotation')
      .select('ppn_enabled, ppn_rate, revisi')
      .eq('id', data.quotation_id)
      .single()

    const ppnEnabled = qtn?.ppn_enabled ?? true
    const ppnRate = qtn?.ppn_rate ?? 0.11
    let totalBaru = 0

    for (const qi of qtnItems ?? []) {
      const subtotal = qi.jumlah * qi.harga_satuan
      const diskonAmount = subtotal * ((qi.diskon ?? 0) / 100)
      const totalItem = subtotal - diskonAmount
      totalBaru += totalItem

      await supabaseAdmin
        .from('quotation_item')
        .update({ ppn_per_item: ppnEnabled ? totalItem * ppnRate : 0 })
        .eq('id', qi.id)
    }

    await supabaseAdmin
      .from('quotation')
      .update({
        status: 'approved',
        total_harga: totalBaru,
        revisi: (qtn?.revisi ?? 0) + 1,
        updated_at: now,
      })
      .eq('id', data.quotation_id)
  } else if (body.status === 'rejected') {
    await supabaseAdmin
      .from('quotation')
      .update({ status: 'rejected', updated_at: now })
      .eq('id', data.quotation_id)
  }

  return NextResponse.json({ data })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error
  const { id } = await params
  await supabaseAdmin.from('negoiasi_item').delete().eq('negoiasi_id', id)
  const { error } = await supabaseAdmin.from('negoiasi').delete().eq('id', id)
  if (error) return internalError(error)
  return new NextResponse(null, { status: 204 })
}
