import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { verifyAuth } from '@/lib/api/auth'
import { badRequest, notFound, internalError } from '@/lib/api/errors'
import { generateDOFromSO } from '@/lib/auto-sales'
import { sendWhatsapp } from '@/lib/utils/whatsapp'

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  draft: ['confirmed', 'cancelled'],
  confirmed: ['processed'],
  processed: ['delivered'],
  delivered: [],
  cancelled: [],
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(_request)
  if (auth.error) return auth.error

  const { id } = await params

  const { data: so, error } = await supabaseAdmin
    .from('sales_order')
    .select(`
      *,
      customer_po!customer_po_id(
        id, nomor, waktu_pengiriman, pic_customer_id,
        customer!customer_id(nama, kode)
      ),
      di_id
    `)
    .eq('id', id)
    .single()

  if (error) return internalError(error)
  if (!so) return notFound('Sales Order tidak ditemukan')

  let customerFromDi: Record<string, unknown> | null = null
  let picCustomer = null
  let diRef: Record<string, unknown> | null = null

  const picCustomerId = (so.customer_po as Record<string, unknown> | null)?.pic_customer_id as string | null
  if (picCustomerId) {
    const { data } = await supabaseAdmin.from('customer_pic').select('nama, no_hp').eq('id', picCustomerId).maybeSingle()
    picCustomer = data
  } else if (so.di_id) {
    const { data: diData } = await supabaseAdmin
      .from('di')
      .select('customer_id, customer!customer_id(nama, kode)')
      .eq('id', so.di_id as string)
      .single()
    customerFromDi = ((diData as Record<string, unknown>)?.customer ?? null) as Record<string, unknown> | null

    const { data: diWithPic } = await supabaseAdmin
      .from('di')
      .select('customer_pic!pic_customer_id(nama, no_hp)')
      .eq('id', so.di_id as string)
      .maybeSingle()
    if (diWithPic?.customer_pic) {
      picCustomer = (diWithPic as Record<string, unknown>).customer_pic as { nama: string; no_hp: string }
    }

    const { data: fullDi } = await supabaseAdmin
      .from('di')
      .select('*')
      .eq('id', so.di_id as string)
      .maybeSingle()
    diRef = fullDi
  }

  const { data: items } = await supabaseAdmin
    .from('sales_order_item')
    .select('*, barang!barang_id(nama, kode, satuan, harga_beli_default, image_url)')
    .eq('sales_order_id', id)
    .order('urutan', { ascending: true })

  const { data: doDoc } = await supabaseAdmin
    .from('delivery_order')
    .select('id, nomor, status')
    .eq('sales_order_id', id)
    .maybeSingle()

  const { data: rfqs } = await supabaseAdmin
    .from('rfq_supplier')
    .select('id, nomor, status, rfq_supplier_item!rfq_supplier_id(id, barang_id, jumlah, harga_penawaran)')
    .eq('sales_order_id', id)

  const { data: prs } = await supabaseAdmin
    .from('purchase_request')
    .select('id, nomor, status')
    .eq('sales_order_id', id)

  const prIds = (prs ?? []).map(p => p.id)
  let prItems: Array<Record<string, unknown>> = []
  let pos: Array<Record<string, unknown>> = []
  let poItems: Array<Record<string, unknown>> = []

  if (prIds.length > 0) {
    const { data: pri } = await supabaseAdmin
      .from('purchase_request_item')
      .select('id, purchase_request_id, barang_id, jumlah')
      .in('purchase_request_id', prIds)
    prItems = pri ?? []

    const { data: poData } = await supabaseAdmin
      .from('purchase_order')
      .select('id, nomor, status, purchase_request_id')
      .in('purchase_request_id', prIds)
    pos = poData ?? []

    const poIds = pos.map(p => p.id)
    if (poIds.length > 0) {
      const { data: poi } = await supabaseAdmin
        .from('purchase_order_item')
        .select('id, purchase_order_id, barang_id, jumlah')
        .in('purchase_order_id', poIds)
      poItems = poi ?? []
    }
  }

  const procurement = {
    purchase_requests: (prs ?? []).map(pr => ({
      ...pr,
      items: prItems.filter(i => i.purchase_request_id === pr.id)
    })),
    purchase_orders: pos.map(po => ({
      ...po,
      items: poItems.filter(i => i.purchase_order_id === po.id)
    })),
    rfq_suppliers: rfqs ?? []
  }

  return NextResponse.json({ data: { ...so, items: items ?? [], delivery_order: doDoc ?? null, pic_customer: picCustomer, procurement, customer: customerFromDi, di_ref: diRef } })
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error

  const { id } = await params
  const body = await request.json().catch(() => null)
  if (!body) return badRequest('Invalid JSON body')

  const { data: old } = await supabaseAdmin.from('sales_order').select('status').eq('id', id).single()
  if (!old) return notFound('Sales Order tidak ditemukan')

  const upd: Record<string, unknown> = {}
  if (body.status) {
    const allowed = ALLOWED_TRANSITIONS[old.status] ?? []
    if (!allowed.includes(body.status)) {
      return badRequest(`Status tidak valid: ${old.status} → ${body.status}`)
    }
    upd.status = body.status
  }
  if (body.is_active !== undefined) upd.is_active = body.is_active
  if (body.di_id !== undefined) upd.di_id = body.di_id || null
  upd.updated_at = new Date().toISOString()

  const { data, error } = await supabaseAdmin.from('sales_order').update(upd).eq('id', id).select().single()
  if (error) return internalError(error)
  if (!data) return notFound('Sales Order tidak ditemukan')

  if (body.items !== undefined) {
    if (!Array.isArray(body.items) || !body.items.length) {
      return badRequest('Items harus array dengan minimal 1 item')
    }
    const { error: delError } = await supabaseAdmin.from('sales_order_item').delete().eq('sales_order_id', id)
    if (delError) return internalError(delError)

    const now = new Date().toISOString()
    const newItems = body.items.map((item: { barang_id: string; jumlah: number; harga_satuan: number; keterangan?: string }, idx: number) => ({
      sales_order_id: id,
      barang_id: item.barang_id,
      jumlah: item.jumlah,
      harga_satuan: item.harga_satuan,
      keterangan: item.keterangan ?? null,
      urutan: idx + 1,
      created_at: now,
      updated_at: now,
    }))

    const { error: insError } = await supabaseAdmin.from('sales_order_item').insert(newItems)
    if (insError) return internalError(insError)
  }

  let autoGenerated = null
  if (body.status === 'processed' && old.status !== 'processed') {
    const result = await generateDOFromSO(id)
    if (result.success) autoGenerated = result.data

    const { data: soRecord } = await supabaseAdmin.from('sales_order').select('customer_po_id, di_id, nomor').eq('id', id).single()
    if (soRecord) {
      let customerId: string | null = null
      if (soRecord.customer_po_id) {
        const { data: po } = await supabaseAdmin.from('customer_po').select('customer_id').eq('id', soRecord.customer_po_id).single()
        customerId = po?.customer_id ?? null
      } else if (soRecord.di_id) {
        const { data: diDoc } = await supabaseAdmin.from('di').select('customer_id').eq('id', soRecord.di_id).single()
        customerId = diDoc?.customer_id ?? null
      }
      if (customerId) {
        const { data: pics } = await supabaseAdmin.from('customer_pic').select('no_hp, nama').eq('customer_id', customerId).eq('is_active', true).limit(1)
        const pic = pics?.[0]
        if (pic?.no_hp) {
          const msg = `Kepada Yth. ${pic.nama},\n\nSales Order *${soRecord.nomor}* telah diproses. Delivery Order otomatis telah dibuat.\n\nTerima kasih.\n\n- ERP RRI`
          await sendWhatsapp(pic.no_hp, msg, auth.user?.id)
        }
      }
    }
  }

  const { data: fullData } = await supabaseAdmin
    .from('sales_order')
    .select(`
      *,
      customer_po!customer_po_id(
        id, nomor, waktu_pengiriman, pic_customer_id,
        customer!customer_id(nama, kode)
      ),
      di_id
    `)
    .eq('id', id)
    .single()

  const picCustomerId2 = (fullData?.customer_po as Record<string, unknown> | null)?.pic_customer_id as string | null
  let picCustomer2 = null
  if (picCustomerId2) {
    const { data } = await supabaseAdmin.from('customer_pic').select('nama, no_hp').eq('id', picCustomerId2).maybeSingle()
    picCustomer2 = data
  }

  const { data: updatedItems } = await supabaseAdmin
    .from('sales_order_item')
    .select('*, barang!barang_id(nama, kode, satuan, harga_beli_default, image_url)')
    .eq('sales_order_id', id)
    .order('urutan', { ascending: true })

  return NextResponse.json({ data: { ...fullData, items: updatedItems ?? [], autoGenerated, pic_customer: picCustomer2 } })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error

  const { id } = await params
  await supabaseAdmin.from('sales_order_item').delete().eq('sales_order_id', id)
  const { error } = await supabaseAdmin.from('sales_order').delete().eq('id', id)
  if (error) return internalError(error)
  return new NextResponse(null, { status: 204 })
}
