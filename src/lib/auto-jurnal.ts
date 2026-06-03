import { supabaseAdmin } from '@/lib/api/supabase-server'
import { generateDocumentNumber } from '@/lib/utils/document-number'

export async function generateInvoiceJournal(invoiceId: string) {
  const { data: inv, error } = await supabaseAdmin
    .from('invoice')
    .select('*, customer!customer_id(nama), sales_order!sales_order_id(nomor)')
    .eq('id', invoiceId)
    .single()
  if (error || !inv) return { success: false, error: 'Invoice not found' }

  const { data: items } = await supabaseAdmin
    .from('invoice_item')
    .select('*')
    .eq('invoice_id', invoiceId)
  if (!items?.length) return { success: false, error: 'No items' }

  const totalDpp = items.reduce((s, i) => s + (i.harga * i.jumlah - (i.diskon ?? 0)), 0)
  const totalPPN = items.reduce((s, i) => s + (i.ppn ?? 0), 0)
  const totalPPh = items.reduce((s, i) => s + (i.pph ?? 0), 0)
  const grandTotal = totalDpp + totalPPN - totalPPh

  const { data: arAkun } = await supabaseAdmin.from('coa').select('id').eq('kode', '1-1100').maybeSingle()
  const { data: revAkun } = await supabaseAdmin.from('coa').select('id').eq('kode', '4-1000').maybeSingle()
  const { data: ppnAkun } = await supabaseAdmin.from('coa').select('id').eq('kode', '2-2000').maybeSingle()
  const { data: pphAkun } = await supabaseAdmin.from('coa').select('id').eq('kode', '2-2100').maybeSingle()

  if (!arAkun || !revAkun || !ppnAkun) return { success: false, error: 'COA accounts not configured. Create: 1-1100 (AR), 4-1000 (Revenue), 2-2000 (PPN)' }

  const now = new Date().toISOString()
  const nomor = await generateDocumentNumber('JRN')

  const jurnalItems = [
    { akun_id: arAkun.id, debit: grandTotal, credit: 0, keterangan: `Piutang - ${inv.customer?.nama ?? '-'}` },
    { akun_id: revAkun.id, debit: 0, credit: totalDpp, keterangan: `Pendapatan - ${inv.sales_order?.nomor ?? inv.nomor}` },
    { akun_id: ppnAkun.id, debit: 0, credit: totalPPN, keterangan: `PPN Keluaran - ${inv.nomor}` },
  ]
  if (totalPPh > 0 && pphAkun) {
    jurnalItems.push({ akun_id: pphAkun.id, debit: totalPPh, credit: 0, keterangan: `PPh Dipungut - ${inv.nomor}` })
  }

  const { data: jurnal, error: jErr } = await supabaseAdmin.from('jurnal').insert({
    nomor, tanggal: inv.tanggal, status: 'draft',
    keterangan: `Auto-jurnal dari Invoice ${inv.nomor}`,
    created_at: now, updated_at: now,
  }).select().single()
  if (jErr) return { success: false, error: jErr.message }

  const { error: jiErr } = await supabaseAdmin.from('jurnal_item').insert(
    jurnalItems.map(ji => ({ ...ji, jurnal_id: jurnal.id, created_at: now, updated_at: now }))
  )
  if (jiErr) {
    await supabaseAdmin.from('jurnal').delete().eq('id', jurnal.id)
    return { success: false, error: jiErr.message }
  }

  return { success: true, jurnal }
}

export async function generatePaymentJournal(invoiceId: string, _paymentId: string, amount: number, tanggal: string) {
  const { data: inv } = await supabaseAdmin
    .from('invoice')
    .select('*, customer!customer_id(nama)')
    .eq('id', invoiceId)
    .single()
  if (!inv) return { success: false, error: 'Invoice not found' }

  const { data: arAkun } = await supabaseAdmin.from('coa').select('id').eq('kode', '1-1100').maybeSingle()
  const { data: kasAkun } = await supabaseAdmin.from('coa').select('id').eq('kode', '1-1101').maybeSingle()

  if (!arAkun) return { success: false, error: 'COA AR (1-1100) not configured' }
  if (!kasAkun) return { success: false, error: 'COA Kas/Bank (1-1101) not configured. Buat akun dengan kode 1-1101' }

  const now = new Date().toISOString()
  const nomor = await generateDocumentNumber('JRN')

  const { data: jurnal, error: jErr } = await supabaseAdmin.from('jurnal').insert({
    nomor, tanggal, status: 'draft',
    keterangan: `Pembayaran dari ${inv.customer?.nama ?? '-'} - ${inv.nomor}`,
    created_at: now, updated_at: now,
  }).select().single()
  if (jErr) return { success: false, error: jErr.message }

  const jurnalItems = [
    { akun_id: kasAkun.id, debit: amount, credit: 0, keterangan: `Penerimaan Kas - ${inv.nomor}` },
    { akun_id: arAkun.id, debit: 0, credit: amount, keterangan: `Pelunasan Piutang - ${inv.nomor}` },
  ]

  const { error: jiErr } = await supabaseAdmin.from('jurnal_item').insert(
    jurnalItems.map(ji => ({ ...ji, jurnal_id: jurnal.id, created_at: now, updated_at: now }))
  )
  if (jiErr) {
    await supabaseAdmin.from('jurnal').delete().eq('id', jurnal.id)
    return { success: false, error: jiErr.message }
  }

  return { success: true, jurnal }
}

export async function generateSupplierPaymentJournal(paymentId: string) {
  const { data: payment } = await supabaseAdmin
    .from('supplier_payment')
    .select('*, supplier!supplier_id(nama), purchase_order!purchase_order_id(nomor)')
    .eq('id', paymentId)
    .single()
  if (!payment) return { success: false, error: 'Payment not found' }

  const { data: apAkun } = await supabaseAdmin.from('coa').select('id').eq('kode', '2-1000').maybeSingle()
  const { data: kasAkun } = await supabaseAdmin.from('coa').select('id').eq('kode', '1-1101').maybeSingle()

  if (!apAkun) return { success: false, error: 'COA AP/Hutang (2-1000) not configured. Buat akun dengan kode 2-1000' }
  if (!kasAkun) return { success: false, error: 'COA Kas/Bank (1-1101) not configured. Buat akun dengan kode 1-1101' }

  const now = new Date().toISOString()
  const nomor = await generateDocumentNumber('JRN')

  const { data: jurnal, error: jErr } = await supabaseAdmin.from('jurnal').insert({
    nomor, tanggal: payment.tanggal_bayar, status: 'draft',
    keterangan: `Pembayaran ke ${payment.supplier?.nama ?? '-'} - ${payment.purchase_order?.nomor ?? '-'}`,
    created_at: now, updated_at: now,
  }).select().single()
  if (jErr) return { success: false, error: jErr.message }

  const jumlah = parseFloat(String(payment.nominal))
  const jurnalItems = [
    { akun_id: apAkun.id, debit: jumlah, credit: 0, keterangan: `Lunaskan Hutang - ${payment.purchase_order?.nomor ?? '-'}` },
    { akun_id: kasAkun.id, debit: 0, credit: jumlah, keterangan: `Pembayaran ke ${payment.supplier?.nama ?? '-'}` },
  ]

  const { error: jiErr } = await supabaseAdmin.from('jurnal_item').insert(
    jurnalItems.map(ji => ({ ...ji, jurnal_id: jurnal.id, created_at: now, updated_at: now }))
  )
  if (jiErr) {
    await supabaseAdmin.from('jurnal').delete().eq('id', jurnal.id)
    return { success: false, error: jiErr.message }
  }

  return { success: true, jurnal }
}
