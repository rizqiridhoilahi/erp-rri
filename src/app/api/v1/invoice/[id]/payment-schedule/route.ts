import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { verifyAuth } from '@/lib/api/auth'
import { badRequest, internalError } from '@/lib/api/errors'
import { addDays } from 'date-fns'
import { toRoman } from '@/lib/utils/roman'
import { formatChildNumber } from '@/lib/utils/document-number'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error

  const { id } = await params
  const { scheduleId, catatan } = await request.json()
  if (!scheduleId) return badRequest('scheduleId wajib diisi')

  const { error } = await supabaseAdmin
    .from('invoice_payment_schedule')
    .update({ catatan })
    .eq('id', scheduleId)
    .eq('invoice_id', id)
  if (error) return internalError(error)

  return NextResponse.json({ data: { success: true } })
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error

  const { id } = await params

  const url = new URL(request.url)
  const regenerate = url.searchParams.get('regenerate') === 'true'

  const { data: inv, error: invErr } = await supabaseAdmin
    .from('invoice')
    .select('id, customer_id, tanggal, nomor')
    .eq('id', id)
    .single()
  if (invErr || !inv) return badRequest('Invoice tidak ditemukan')

  if (regenerate) {
    const { data: existingSchedule } = await supabaseAdmin
      .from('invoice_payment_schedule')
      .select('id')
      .eq('invoice_id', id)
    if (existingSchedule && existingSchedule.length > 0) {
      const scheduleIds = existingSchedule.map((s) => s.id)
      await supabaseAdmin.from('kwitansi').delete().in('schedule_id', scheduleIds)
      await supabaseAdmin.from('invoice_payment_schedule').delete().eq('invoice_id', id)
    }
    await supabaseAdmin.from('invoice_payment').delete().eq('invoice_id', id)
    const { data: jurnalList } = await supabaseAdmin
      .from('jurnal')
      .select('id').ilike('keterangan', `%Auto-jurnal%Invoice ${inv.nomor ?? ''}%`)
    if (jurnalList && jurnalList.length > 0) {
      const jurnalIds = jurnalList.map(j => j.id)
      await supabaseAdmin.from('jurnal_item').delete().in('jurnal_id', jurnalIds)
      await supabaseAdmin.from('jurnal').delete().in('id', jurnalIds)
    }
    await supabaseAdmin.from('invoice').update({ status: 'draft', updated_at: new Date().toISOString() }).eq('id', id)
  } else {
    const { data: existing } = await supabaseAdmin
      .from('invoice_payment_schedule')
      .select('id')
      .eq('invoice_id', id)
      .limit(1)
    if (existing && existing.length > 0) {
      return badRequest('Invoice ini sudah memiliki jadwal pembayaran')
    }
  }

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
    .select('harga_satuan, jumlah, diskon')
    .eq('invoice_id', id)

  const totalAmount = (invoiceItems ?? []).reduce((sum, item) => {
    const subtotal = item.harga_satuan * item.jumlah
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

  if (regenerate) {
    const { data: newSchedule } = await supabaseAdmin
      .from('invoice_payment_schedule')
      .select('*')
      .eq('invoice_id', id)
      .order('urutan')

    const nomorInv = inv.nomor ?? `INV-${id.slice(0, 8)}`
    const terms = newSchedule ?? []

    for (let i = 0; i < terms.length; i++) {
      const term = terms[i]
      const baseNomor = formatChildNumber(nomorInv, 'KWT')
      const nomorKwt = `${baseNomor}/${toRoman(i + 1)}`

      const { data: existingKwt } = await supabaseAdmin
        .from('kwitansi')
        .select('id')
        .eq('schedule_id', term.id)
        .limit(1)
      if (existingKwt && existingKwt.length > 0) continue

      const kwtData: Record<string, unknown> = {
        invoice_id: id,
        schedule_id: term.id,
        nomor: nomorKwt,
        tanggal: now.split('T')[0],
        status: 'draft',
        total: Math.round(term.jumlah * 100) / 100,
        created_at: now,
      }

      const { data: newKwt, error: kwtErr } = await supabaseAdmin
        .from('kwitansi')
        .insert(kwtData)
        .select('id')
        .single()
      if (kwtErr || !newKwt) continue

      const { data: invItems } = await supabaseAdmin
        .from('invoice_item')
        .select('*')
        .eq('invoice_id', id)
      if (invItems) {
        const kwtItems = invItems.map((item) => ({
          kwitansi_id: newKwt.id,
          invoice_id: id,
          invoice_item_id: item.id,
          barang_id: item.barang_id,
          nama_barang: item.nama_barang,
          jumlah: item.jumlah * (term.persentase / 100),
          satuan: item.satuan,
          harga: item.harga_satuan,
          diskon: item.diskon ?? 0,
          total: Math.round((item.harga_satuan * item.jumlah - (item.diskon ?? 0)) * (term.persentase / 100) * 100) / 100,
        }))
        await supabaseAdmin.from('kwitansi_item').insert(kwtItems)
      }
    }
  }

  return NextResponse.json({ data: { count: schedule.length } }, { status: 201 })
}
