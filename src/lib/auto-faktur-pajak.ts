import { supabaseAdmin } from '@/lib/api/supabase-server'
import { generateDocumentNumber } from '@/lib/utils/document-number'

export async function generateFakturPajakFromInvoice(invoiceId: string, nomorFaktur: string) {
  const { data: inv, error } = await supabaseAdmin
    .from('invoice')
    .select('*')
    .eq('id', invoiceId)
    .single()
  if (error || !inv) return { success: false, error: 'Invoice not found' }

  const { data: items } = await supabaseAdmin
    .from('invoice_item')
    .select('*')
    .eq('invoice_id', invoiceId)
    .order('urutan', { ascending: true })
  if (!items?.length) return { success: false, error: 'No items' }

  const totalDpp = items.reduce((s, i) => s + (i.harga * i.jumlah - (i.diskon ?? 0)), 0)
  const totalPPN = items.reduce((s, i) => s + (i.ppn ?? 0), 0)
  const totalPPh = items.reduce((s, i) => s + (i.pph ?? 0), 0)

  const nomor = await generateDocumentNumber('FP')
  const now = new Date().toISOString()

  const { data: fp, error: fpError } = await supabaseAdmin
    .from('faktur_pajak')
    .insert({
      nomor,
      invoice_id: invoiceId,
      nomor_faktur: nomorFaktur,
      tanggal: inv.tanggal,
      status: 'draft',
      dpp: totalDpp,
      ppn: totalPPN,
      pph: totalPPh > 0 ? totalPPh : null,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single()
  if (fpError) return { success: false, error: fpError.message }

  const fpItems = items.map(i => {
    const dpp = i.harga * i.jumlah - (i.diskon ?? 0)
    return {
      faktur_pajak_id: fp.id,
      invoice_item_id: i.id,
      harga: i.harga,
      dpp,
      ppn: i.ppn ?? 0,
      pph: i.pph ?? null,
      created_at: now,
      updated_at: now,
    }
  })

  const { error: itemsError } = await supabaseAdmin
    .from('faktur_pajak_item')
    .insert(fpItems)
  if (itemsError) {
    await supabaseAdmin.from('faktur_pajak').delete().eq('id', fp.id)
    return { success: false, error: itemsError.message }
  }

  return { success: true, fakturPajak: fp }
}
