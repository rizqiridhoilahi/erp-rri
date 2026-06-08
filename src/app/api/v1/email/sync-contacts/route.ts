import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/api/auth'
import { syncAllCustomers, syncContact, ensureContactList } from '@/lib/email/contacts'

export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error

  try {
    const body = await request.json().catch(() => ({}))
    const { email } = body

    if (email) {
      const listId = await ensureContactList()
      const result = await syncContact(email, listId)
      return NextResponse.json({ data: result })
    }

    const result = await syncAllCustomers()
    return NextResponse.json({ data: result })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to sync contacts'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
