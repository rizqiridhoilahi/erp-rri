/**
 * One-time migration: convert existing single kwitansi to per-term kwitansi
 * for invoices that have payment_schedule entries.
 *
 * Usage:
 *   npx tsx scripts/migrate-kwitansi-per-term.ts
 *   npx tsx scripts/migrate-kwitansi-per-term.ts --dry-run
 */

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  console.log('='.repeat(80))
  console.log('  Migrate existing kwitansi → per-term kwitansi')
  console.log(`  Dry-run: ${DRY_RUN ? 'YES' : 'NO'}`)
  console.log('='.repeat(80))

  // Find all invoices with schedule
  const { data: invoices, error: invErr } = await supabase
    .from('invoice')
    .select('id, nomor')
    .in('id', (await supabase.from('invoice_payment_schedule').select('invoice_id').not('invoice_id', 'is', null)).data?.map(r => r.invoice_id) ?? [])
  if (invErr) { console.error('Error fetching invoices:', invErr); process.exit(1) }
  if (!invoices || invoices.length === 0) {
    console.log('No invoices with payment schedule found.')
    return
  }

  console.log(`Found ${invoices.length} invoice(s) with payment schedule.\n`)

  let converted = 0
  let errors = 0

  for (const inv of invoices) {
    const { data: existingKwt } = await supabase
      .from('kwitansi')
      .select('id, nomor')
      .eq('invoice_id', inv.id)
      .is('schedule_id', null)

    // If no kwitansi without schedule_id, skip (already migrated)
    if (!existingKwt || existingKwt.length === 0) {
      console.log(`  [SKIP] ${inv.nomor} — already migrated or no kwitansi`)
      continue
    }

    console.log(`  [CONV] ${inv.nomor} — ${existingKwt.length} kwitansi to migrate`)

    const { data: schedule } = await supabase
      .from('invoice_payment_schedule')
      .select('*')
      .eq('invoice_id', inv.id)
      .order('urutan')

    if (!schedule || schedule.length === 0) {
      console.log(`    → No schedule found, skipping`)
      continue
    }

    if (DRY_RUN) {
      console.log(`    → Would delete ${existingKwt.length} kwitansi, create ${schedule.length} per-term kwitansi`)
      converted++
      continue
    }

    // Delete existing kwitansi (cascade will handle kwitansi_item)
    for (const kwt of existingKwt) {
      const { error: delItemErr } = await supabase.from('kwitansi_item').delete().eq('kwitansi_id', kwt.id)
      if (delItemErr) console.error(`      Error deleting kwitansi_item for ${kwt.nomor}:`, delItemErr)
    }
    const kwtIds = existingKwt.map(k => k.id)
    const { error: delErr } = await supabase.from('kwitansi').delete().in('id', kwtIds)
    if (delErr) { console.error(`    Error deleting kwitansi:`, delErr); errors++; continue }

    // Create per-term kwitansi
    const nomor = inv.nomor ?? ''
    for (let i = 0; i < schedule.length; i++) {
      const term = schedule[i]
      const termNumber = i + 1
      const romanSuffix = toRoman(termNumber)
      const baseNomorKwt = await formatChildNumber(nomor, 'KWT')
      const termNomorKwt = `${baseNomorKwt}/${romanSuffix}`

      const now = new Date().toISOString()

      const { data: kwt, error: kwtErr } = await supabase
        .from('kwitansi')
        .insert({
          nomor: termNomorKwt,
          invoice_id: inv.id,
          schedule_id: term.id,
          total: Math.round(Number(term.jumlah) * 100) / 100,
          tanggal: now.split('T')[0],
          status: 'draft',
          created_at: now,
          updated_at: now,
        })
        .select('id')
        .single()

      if (kwtErr || !kwt) {
        console.error(`    Error creating kwitansi for term ${termNumber}:`, kwtErr)
        errors++
        continue
      }

      // Create kwitansi items proportionally
      const { data: invItems } = await supabase
        .from('invoice_item')
        .select('id, harga_satuan, jumlah, diskon')
        .eq('invoice_id', inv.id)

      if (invItems) {
        const kwtItems = invItems.map((item) => {
          const subtotal = Number(item.harga_satuan) * Number(item.jumlah)
          const diskonAmount = (Number(item.diskon) || 0) > 0 ? subtotal * (Number(item.diskon) / 100) : 0
          const itemTotal = subtotal - diskonAmount
          return {
            kwitansi_id: kwt.id,
            invoice_item_id: item.id,
            jumlah: Math.round(itemTotal * (Number(term.persentase) / 100) * 100) / 100,
            created_at: now,
            updated_at: now,
          }
        })

        const { error: itemsErr } = await supabase.from('kwitansi_item').insert(kwtItems)
        if (itemsErr) {
          console.error(`    Error creating kwitansi_items for term ${termNumber}:`, itemsErr)
          await supabase.from('kwitansi').delete().eq('id', kwt.id)
          errors++
        }
      }
    }
    converted++
    console.log(`    ✓ Created ${schedule.length} per-term kwitansi`)
  }

  console.log('\n' + '='.repeat(80))
  console.log(`  Complete: ${converted} invoice(s) converted, ${errors} error(s)`)
  if (DRY_RUN) console.log('  Run without --dry-run to execute.')
  else console.log('  ✓ Migration complete.')
  console.log('='.repeat(80))
}

function toRoman(n: number): string {
  const map: [number, string][] = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ]
  let result = ''
  for (const [value, numeral] of map) {
    while (n >= value) {
      result += numeral
      n -= value
    }
  }
  return result
}

async function formatChildNumber(parentNumber: string, kode: string): Promise<string> {
  const parts = parentNumber.split('-')
  if (parts.length >= 5) {
    const yy = parts[2]
    const mm = parts[3]
    const running = parts.slice(4).join('-')
    return `RRI-${kode}-${yy}-${mm}-${running}`
  }
  return parentNumber
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
