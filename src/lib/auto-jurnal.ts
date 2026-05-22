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
