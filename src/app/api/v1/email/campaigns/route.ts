import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/api/auth'
import { BrevoClient } from '@getbrevo/brevo'

function getClient() {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) throw new Error('BREVO_API_KEY not set')
  return new BrevoClient({ apiKey })
}

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') ?? undefined
    const limit = parseInt(searchParams.get('limit') ?? '10')
    const offset = parseInt(searchParams.get('offset') ?? '0')

    const client = getClient()
    const result = await client.emailCampaigns.getEmailCampaigns({
      status: status as 'archive' | 'sent' | 'queued' | 'draft' | 'inProcess' | undefined,
      limit,
      offset,
    })
    return NextResponse.json({ data: result })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch campaigns'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
