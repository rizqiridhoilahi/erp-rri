import { BrevoClient } from '@getbrevo/brevo'
import { supabaseAdmin } from '@/lib/api/supabase-server'

const LIST_NAME = 'ERP RRI Customers'

function getClient() {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) throw new Error('BREVO_API_KEY not set')
  return new BrevoClient({ apiKey })
}

export async function ensureContactList(): Promise<number> {
  const client = getClient()
  const { lists } = await client.contacts.getLists({})
  const existing = lists?.find(l => l.name === LIST_NAME)
  if (existing?.id) return existing.id

  const newList = await client.contacts.createList({
    name: LIST_NAME,
    folderId: 1,
  })
  return newList.id!
}

export async function syncContact(email: string, listId: number) {
  const client = getClient()

  const { data: pics } = await supabaseAdmin
    .from('customer_pic')
    .select('nama, no_hp, customer_id')
    .eq('email', email)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle()

  const { data: customer } = pics?.customer_id
    ? await supabaseAdmin.from('customer').select('nama, kode').eq('id', pics.customer_id).single()
    : { data: null }

  const attributes: Record<string, string | boolean | number> = {
    NOME: pics?.nama ?? '',
    TELEPHONE: pics?.no_hp ?? '',
    COMPANY: customer?.nama ?? '',
    CUSTOMER_CODE: customer?.kode ?? '',
  }

  try {
    await client.contacts.getContactInfo({ identifier: email })
    await client.contacts.updateContact({
      identifier: email,
      attributes,
      listIds: [listId],
    })
    return { action: 'updated', email }
  } catch {
    await client.contacts.createContact({
      email,
      attributes,
      listIds: [listId],
      updateEnabled: true,
    })
    return { action: 'created', email }
  }
}

export async function syncAllCustomers() {
  const { data: customers } = await supabaseAdmin
    .from('customer')
    .select('id, nama, kode')
    .eq('is_active', true)

  if (!customers?.length) return { synced: 0, results: [] }

  const customerIds = customers.map(c => c.id)

  const { data: pics } = await supabaseAdmin
    .from('customer_pic')
    .select('customer_id, nama, email, no_hp')
    .in('customer_id', customerIds)
    .eq('is_active', true)

  const listId = await ensureContactList()
  const results: Array<{ action: string; email: string }> = []

  const seen = new Set<string>()
  if (pics) {
    for (const pic of pics) {
      if (!pic.email || seen.has(pic.email)) continue
      seen.add(pic.email)
      const result = await syncContact(pic.email, listId)
      results.push(result)
    }
  }

  return { synced: results.length, results }
}
