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
const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL']
const supabaseServiceKey = env['SUPABASE_SERVICE_ROLE_KEY']

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const admin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function main() {
  // 1. Site settings
  console.log('=== 1. SITE SETTINGS: company_email ===')
  const { data: siteData, error: siteErr } = await admin
    .from('site_settings')
    .select('key, value')
    .eq('key', 'company_email')
    .maybeSingle()
  if (siteErr) console.error('Error:', siteErr)
  else if (siteData) console.log('Found:', JSON.stringify(siteData, null, 2))
  else console.log('No row found for company_email in site_settings')

  // 2. Customer - no email column in schema
  console.log('\n=== 2. CUSTOMER: PT Nusa Indah Logistik Terpadu ===')
  const { data: custData, error: custErr } = await admin
    .from('customer')
    .select('*')
    .ilike('nama', '%Nusa Indah%')
  if (custErr) console.error('Error:', custErr)
  else if (custData && custData.length > 0) {
    console.log(`Found ${custData.length} customer(s):`)
    console.log(JSON.stringify(custData, null, 2))
  } else {
    console.log('No customer found matching "%Nusa Indah%"')
  }

  // 3. Customer PIC
  console.log('\n=== 3. CUSTOMER PIC for PT Nusa Indah Logistik Terpadu ===')
  if (custData && custData.length > 0) {
    const customerIds = custData.map(c => c.id)
    console.log('Customer IDs:', customerIds)
    const { data: picData, error: picErr } = await admin
      .from('customer_pic')
      .select('id, nama, email, customer_id, no_hp, jabatan')
      .in('customer_id', customerIds)
    if (picErr) console.error('Error:', picErr)
    else if (picData && picData.length > 0) {
      console.log(`Found ${picData.length} PIC(s):`)
      console.log(JSON.stringify(picData, null, 2))
    } else {
      console.log('No PICs found for this customer')
    }
  }

  // 3b. With join
  console.log('\n=== 3b. CUSTOMER PIC with customer name (join) ===')
  if (custData && custData.length > 0) {
    const customerIds = custData.map(c => c.id)
    const { data: picData2, error: picErr2 } = await admin
      .from('customer_pic')
      .select('id, nama, email, customer_id, customer:customer_id(nama)')
      .in('customer_id', customerIds)
    if (picErr2) console.error('Error:', picErr2)
    else if (picData2 && picData2.length > 0) {
      console.log(JSON.stringify(picData2, null, 2))
    } else {
      console.log('No PICs found via join')
    }
  }
}

main().catch(console.error)
