import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { requireCustomerAuth } from '@/lib/api/public-auth'
import { badRequest, internalError } from '@/lib/api/errors'
import { sendWhatsapp, getOwnerWhatsapp } from '@/lib/utils/whatsapp'

const submitSchema = z.object({
  perihal: z.string().optional(),
  keterangan: z.string().optional(),
})

export async function POST(request: NextRequest) {
  const auth = await requireCustomerAuth(request)
  if (auth.error) return auth.error

  const body = await request.json().catch(() => null)

  const parsed = submitSchema.safeParse(body ?? {})
  if (!parsed.success) return badRequest(parsed.error.issues.map(i => i.message).join(', '))

  const { data: cartItems, error: cartError } = await supabaseAdmin
    .from('customer_inquiry_cart')
    .select('*, barang:barang_id(id, nama, kode, satuan)')
    .eq('auth_user_id', auth.user!.id)
    .order('created_at', { ascending: true })

  if (cartError) return internalError(cartError)
  if (!cartItems || cartItems.length === 0) return badRequest('Keranjang inquiry kosong')

  const tgl = new Date()
  const year = tgl.getFullYear()
  const month = tgl.getMonth() + 1

  const { data: counterResult } = await supabaseAdmin.rpc('increment_document_counter', {
    p_kode_dokumen: 'GLB',
    p_tahun: year,
    p_bulan: month,
  })

  const runningNumber = String(counterResult ?? 1).padStart(5, '0')
  const monthStr = String(month).padStart(2, '0')
  const yearStr = String(year).slice(-2)
  const nomor = `RRI-RFQC-${yearStr}-${monthStr}-${runningNumber}`

  const recordId = crypto.randomUUID()
  const now = tgl.toISOString()

  const { data: rfq, error: rfqError } = await supabaseAdmin
    .from('rfq_customer')
    .insert({
      id: recordId,
      nomor,
      customer_id: auth.profile.customer_id,
      tanggal: now,
      perihal: parsed.data.perihal || 'Permintaan Penawaran dari Portal',
      status: 'pending',
      keterangan: parsed.data.keterangan ?? null,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single()

  if (rfqError) return internalError(rfqError)

  const items = cartItems.map((item, idx) => ({
    rfq_customer_id: recordId,
    barang_id: item.barang_id,
    nama_barang: item.barang?.nama ?? null,
    jumlah: item.quantity,
    satuan: item.barang?.satuan ?? null,
    keterangan: item.catatan_spesifik ?? null,
    urutan: idx + 1,
    created_at: now,
    updated_at: now,
  }))

  const { error: itemsError } = await supabaseAdmin
    .from('rfq_customer_item')
    .insert(items)

  if (itemsError) {
    await supabaseAdmin.from('rfq_customer').delete().eq('id', recordId)
    return internalError(itemsError)
  }

  await supabaseAdmin
    .from('customer_inquiry_cart')
    .delete()
    .eq('auth_user_id', auth.user!.id)

  const { data: customer } = await supabaseAdmin
    .from('customer')
    .select('nama')
    .eq('id', auth.profile.customer_id)
    .single()

  const namaCustomer = customer?.nama ?? 'Customer'

  const whatsappNumbers = await getOwnerWhatsapp()
  whatsappNumbers.push('085640884088')
  const uniqueNumbers = [...new Set(whatsappNumbers)]

  const waMessage = `🔔 *Inquiry Baru dari Portal*\n\nCustomer: *${namaCustomer}*\nNomor: ${nomor}\nPerihal: ${parsed.data.perihal || 'Permintaan Penawaran dari Portal'}\n\nSilakan proses di dashboard ERP.`

  for (const hp of uniqueNumbers) {
    await sendWhatsapp(hp, waMessage, auth.user?.id)
  }

  return NextResponse.json({
    data: {
      message: 'Inquiry berhasil dikirim',
      nomor,
      rfq_id: recordId,
    },
  }, { status: 201 })
}
