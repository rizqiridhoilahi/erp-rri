import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { verifyAuth } from '@/lib/api/auth'
import { badRequest, internalError } from '@/lib/api/errors'
import { addDays } from 'date-fns'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error

  const { id } = await params

  const { data: existing } = await supabaseAdmin
    .from('invoice_payment_schedule')
    .select('id')
    .eq('invoice_id', id)
    .limit(1)
  if (existing && existing.length > 0) {
    return badRequest('Invoice ini sudah memiliki jadwal pembayaran')
  }

  const { data: inv, error: invErr } = await supabaseAdmin
    .from('invoice')
    .select('id, customer_id, tanggal')
    .eq('id', id)
    .single()
  if (invErr || !inv) return badRequest('Invoice tidak ditemukan')

  if (!inv.tanggal) return badRequest('Invoice belum memiliki tanggal')

  const invoiceDate = new Date(inv.tanggal)
  if (isNaN(invoiceDate.getTime())) return badRequest('Format tanggal invoice tidak valid')

  const { data: cust } = await supabaseAdmin
    .from('customer')
    .select('payment_term_id')
    .eq('id', inv.customer_id)
    .single()
  if (!cust?.payment_term_id) {
    return badRequest('Customer invoice ini belum memiliki payment term. Atur payment term terlebih dahulu di halaman edit Customer.')
  }

  const { data: termItems } = await supabaseAdmin
    .from('payment_term_item')
    .select('*')
    .eq('payment_term_id', cust.payment_term_id)
    .order('urutan')
  if (!termItems || termItems.length === 0) {
    return badRequest('Payment term ini tidak memiliki item termin')
  }

  const { data: invoiceItems } = await supabaseAdmin
    .from('invoice_item')
    .select('harga, jumlah, diskon')
    .eq('invoice_id', id)

  const totalAmount = (invoiceItems ?? []).reduce((sum, item) => {
    const subtotal = item.harga * item.jumlah
    const diskonAmount = (item.diskon ?? 0) > 0 ? subtotal * ((item.diskon ?? 0) / 100) : 0
    return sum + subtotal - diskonAmount
  }, 0)

  const now = new Date().toISOString()
  const schedule = termItems.map((ti) => ({
    invoice_id: id,
    urutan: ti.urutan,
    deskripsi: ti.deskripsi,
    persentase: ti.persentase,
    jumlah: Math.round(totalAmount * (Number(ti.persentase) / 100) * 100) / 100,
    due_date: addDays(invoiceDate, ti.due_days).toISOString(),
    status: 'pending',
    paid_amount: 0,
    created_at: now,
  }))

  const { error: schedError } = await supabaseAdmin.from('invoice_payment_schedule').insert(schedule)
  if (schedError) return internalError(schedError)

  return NextResponse.json({ data: { count: schedule.length } }, { status: 201 })
}
