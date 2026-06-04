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

  if (!arAkun) return { success: false, error: 'COA 1-1100 (Piutang Dagang) belum dibuat. Buat akun dengan kode 1-1100' }
  if (!revAkun) return { success: false, error: 'COA 4-1000 (Pendapatan) belum dibuat. Buat akun dengan kode 4-1000' }
  if (!ppnAkun) return { success: false, error: 'COA 2-2000 (PPN Keluaran) belum dibuat. Buat akun dengan kode 2-2000' }

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

  if (!arAkun) return { success: false, error: 'COA 1-1100 (Piutang Dagang) belum dibuat. Buat akun dengan kode 1-1100' }
  if (!kasAkun) return { success: false, error: 'COA 1-1101 (Kas/Bank) belum dibuat. Buat akun dengan kode 1-1101' }

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

  if (!apAkun) return { success: false, error: 'COA 2-1000 (Hutang Dagang) belum dibuat. Buat akun dengan kode 2-1000' }
  if (!kasAkun) return { success: false, error: 'COA 1-1101 (Kas/Bank) belum dibuat. Buat akun dengan kode 1-1101' }

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

export async function generateReturPenjualanJournal(returId: string) {
  const { data: retur } = await supabaseAdmin
    .from('retur_penjualan')
    .select('*, customer!customer_id(nama)')
    .eq('id', returId)
    .single()
  if (!retur) return { success: false, error: 'Retur penjualan not found' }

  const { data: arAkun } = await supabaseAdmin.from('coa').select('id').eq('kode', '1-1100').maybeSingle()
  const { data: revAkun } = await supabaseAdmin.from('coa').select('id').eq('kode', '4-1000').maybeSingle()
  if (!arAkun) return { success: false, error: 'COA 1-1100 (Piutang Dagang) belum dibuat. Buat akun dengan kode 1-1100' }
  if (!revAkun) return { success: false, error: 'COA 4-1000 (Pendapatan) belum dibuat. Buat akun dengan kode 4-1000' }

  let totalEstimasi = 0
  if (retur.delivery_order_id) {
    const { data: doDoc } = await supabaseAdmin
      .from('delivery_order')
      .select('sales_order_id')
      .eq('id', retur.delivery_order_id)
      .single()
    if (doDoc?.sales_order_id) {
      const { data: invoice } = await supabaseAdmin
        .from('invoice')
        .select('id')
        .eq('sales_order_id', doDoc.sales_order_id)
        .maybeSingle()
      if (invoice) {
        const { data: invItems } = await supabaseAdmin
          .from('invoice_item')
          .select('barang_id, harga')
          .eq('invoice_id', invoice.id)
        const hargaMap = new Map((invItems ?? []).map(i => [i.barang_id, Number(i.harga)]))
        const { data: returItems } = await supabaseAdmin
          .from('retur_penjualan_item')
          .select('barang_id, jumlah')
          .eq('retur_penjualan_id', returId)
        totalEstimasi = (returItems ?? []).reduce((sum, item) => {
          return sum + (hargaMap.get(item.barang_id) ?? 0) * item.jumlah
        }, 0)
      }
    }
  }

  if (totalEstimasi <= 0) {
    return { success: false, error: 'Tidak dapat menghitung estimasi nilai retur. Buat jurnal manual.' }
  }

  const now = new Date().toISOString()
  const nomor = await generateDocumentNumber('JRN')

  const jurnalItems = [
    { akun_id: revAkun.id, debit: totalEstimasi, credit: 0, keterangan: `Retur Penjualan - ${retur.nomor}` },
    { akun_id: arAkun.id, debit: 0, credit: totalEstimasi, keterangan: `Pengurangan Piutang - ${retur.customer?.nama ?? '-'}` },
  ]

  const { data: jurnal, error: jErr } = await supabaseAdmin.from('jurnal').insert({
    nomor, tanggal: retur.tanggal, status: 'draft',
    keterangan: `Auto-jurnal dari Retur Penjualan ${retur.nomor}`,
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

export async function generateReturPembelianJournal(returId: string) {
  const { data: retur } = await supabaseAdmin
    .from('retur_pembelian')
    .select('*, supplier!supplier_id(nama)')
    .eq('id', returId)
    .single()
  if (!retur) return { success: false, error: 'Retur pembelian not found' }

  const { data: apAkun } = await supabaseAdmin.from('coa').select('id').eq('kode', '2-1000').maybeSingle()
  if (!apAkun) return { success: false, error: 'COA 2-1000 (Hutang Dagang) belum dibuat. Buat akun dengan kode 2-1000' }

  const { data: persediaanAkun } = await supabaseAdmin
    .from('coa')
    .select('id, kode, nama')
    .or('kode.ilike.1-14%,nama.ilike.%persediaan%')
    .maybeSingle()

  if (!persediaanAkun) {
    return { success: false, error: 'COA Persediaan Barang (misal 1-1400) belum dibuat. Buat akun dengan kode 1-1400 atau nama mengandung "Persediaan"' }
  }

  let totalEstimasi = 0
  if (retur.purchase_order_id) {
    const { data: po } = await supabaseAdmin
      .from('purchase_order')
      .select('nomor')
      .eq('id', retur.purchase_order_id)
      .single()
    if (po) {
      const { data: poItems } = await supabaseAdmin
        .from('purchase_order_item')
        .select('barang_id, harga')
        .eq('purchase_order_id', retur.purchase_order_id)
      const hargaMap = new Map((poItems ?? []).map(i => [i.barang_id, Number(i.harga)]))
      const { data: returItems } = await supabaseAdmin
        .from('retur_pembelian_item')
        .select('barang_id, jumlah')
        .eq('retur_pembelian_id', returId)
      totalEstimasi = (returItems ?? []).reduce((sum, item) => {
        return sum + (hargaMap.get(item.barang_id) ?? 0) * item.jumlah
      }, 0)
    }
  }

  if (totalEstimasi <= 0) {
    return { success: false, error: 'Tidak dapat menghitung estimasi nilai retur. Buat jurnal manual.' }
  }

  const now = new Date().toISOString()
  const nomor = await generateDocumentNumber('JRN')

  const jurnalItems = [
    { akun_id: apAkun.id, debit: totalEstimasi, credit: 0, keterangan: `Pengurangan Hutang - Retur ${retur.nomor}` },
    { akun_id: persediaanAkun.id, debit: 0, credit: totalEstimasi, keterangan: `Pengurangan Persediaan - ${retur.supplier?.nama ?? '-'}` },
  ]

  const { data: jurnal, error: jErr } = await supabaseAdmin.from('jurnal').insert({
    nomor, tanggal: retur.tanggal, status: 'draft',
    keterangan: `Auto-jurnal dari Retur Pembelian ${retur.nomor}`,
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
