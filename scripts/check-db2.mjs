import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '..', '.env')
const envContent = readFileSync(envPath, 'utf-8')

function parseEnv(content) {
  const vars = {}
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    let key = trimmed.slice(0, eqIdx).trim()
    let val = trimmed.slice(eqIdx + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    vars[key] = val
  }
  return vars
}

const env = parseEnv(envContent)
const admin = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY'], {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function main() {
  // Search for Nusa Indah with different patterns
  console.log('=== Search for "Nusa" ===')
  const { data: d1 } = await admin.from('customer').select('id, nama, kode').ilike('nama', '%Nusa%')
  console.log(JSON.stringify(d1, null, 2) || 'None found')

  console.log('\n=== Search for "Indah" ===')
  const { data: d2 } = await admin.from('customer').select('id, nama, kode').ilike('nama', '%Indah%')
  console.log(JSON.stringify(d2, null, 2) || 'None found')

  console.log('\n=== Search for "Logistik" ===')
  const { data: d3 } = await admin.from('customer').select('id, nama, kode').ilike('nama', '%Logistik%')
  console.log(JSON.stringify(d3, null, 2) || 'None found')

  // List all customers
  console.log('\n=== All customers (first 20) ===')
  const { data: all } = await admin.from('customer').select('id, nama, kode').limit(20)
  console.log(JSON.stringify(all, null, 2) || 'None found')

  // List all PICs
  console.log('\n=== All customer PICs ===')
  const { data: pics } = await admin.from('customer_pic').select('id, nama, email, customer_id').limit(20)
  console.log(JSON.stringify(pics, null, 2) || 'None found')

  // Total counts
  const { count: custCount } = await admin.from('customer').select('*', { count: 'exact', head: true })
  const { count: picCount } = await admin.from('customer_pic').select('*', { count: 'exact', head: true })
  console.log(`\nTotal customers: ${custCount}, Total PICs: ${picCount}`)
}

main().catch(console.error)
