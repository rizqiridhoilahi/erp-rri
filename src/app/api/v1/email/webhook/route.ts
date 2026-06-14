import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { createHmac } from 'crypto'
import { getBrevoWebhookSecret } from '@/lib/email/config'

interface BrevoWebhookEvent {
  event: string
  email: string
  'message-id': string
  date?: string
  ts?: number
  tag?: string
  subject?: string
  reason?: string
  bounce_type?: string
  template_id?: number
  link?: string
}

function normalizeMessageId(raw: string): string {
  return raw.replace(/^<|>$/g, '').trim()
}

async function verifyWebhookSignature(request: NextRequest, rawBody: string): Promise<boolean> {
  const secret = await getBrevoWebhookSecret()
  if (!secret) return true

  const signature = request.headers.get('X Brevo Signature') ||
                    request.headers.get('x-brevo-signature') ||
                    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')

  if (!signature) return false

  const expectedSig = createHmac('sha256', secret).update(rawBody).digest('hex')
  return signature === expectedSig || signature === expectedSig.toLowerCase()
}

async function verifyMessageIdExists(messageId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('email_log')
    .select('id')
    .eq('message_id', messageId)
    .maybeSingle()
  return !!data
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text().catch(() => '')
  if (!rawBody) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  if (!(await verifyWebhookSignature(request, rawBody))) {
    const secret = await getBrevoWebhookSecret()
    if (secret) {
      console.log('Webhook: signature verification failed')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  }

  let body: BrevoWebhookEvent | BrevoWebhookEvent[]
  try {
    body = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const events = Array.isArray(body) ? body : [body]

  for (const event of events) {
    const messageId = normalizeMessageId(event['message-id'] ?? '')
    if (!messageId) continue

    const messageExists = await verifyMessageIdExists(messageId)
    if (!messageExists) {
      console.log(`Webhook: message-id ${messageId} not found in email_log, skipping`)
      continue
    }

    const now = new Date(event.ts ? event.ts * 1000 : Date.now()).toISOString()

    switch (event.event) {
      case 'delivered': {
        await supabaseAdmin.from('email_log').update({
          status: 'delivered',
          delivered_at: now,
          updated_at: now,
        }).eq('message_id', messageId)
        break
      }
      case 'opened': {
        await supabaseAdmin.from('email_log').update({
          opened_at: now,
          updated_at: now,
        }).eq('message_id', messageId)
        break
      }
      case 'click': {
        await supabaseAdmin.from('email_log').update({
          clicked_at: now,
          updated_at: now,
        }).eq('message_id', messageId)
        break
      }
      case 'hard_bounce': {
        await supabaseAdmin.from('email_log').update({
          status: 'bounced',
          bounce_type: 'hard',
          error_message: event.reason ?? 'Hard bounce',
          updated_at: now,
        }).eq('message_id', messageId)
        break
      }
      case 'soft_bounce': {
        await supabaseAdmin.from('email_log').update({
          status: 'bounced',
          bounce_type: 'soft',
          error_message: event.reason ?? 'Soft bounce',
          updated_at: now,
        }).eq('message_id', messageId)
        break
      }
      case 'blocked': {
        await supabaseAdmin.from('email_log').update({
          status: 'failed',
          error_message: `Blocked: ${event.reason ?? 'Unknown reason'}`,
          updated_at: now,
        }).eq('message_id', messageId)
        break
      }
      case 'spam': {
        await supabaseAdmin.from('email_log').update({
          status: 'spam',
          updated_at: now,
        }).eq('message_id', messageId)
        break
      }
      case 'invalid': {
        await supabaseAdmin.from('email_log').update({
          status: 'failed',
          error_message: `Invalid email: ${event.email}`,
          updated_at: now,
        }).eq('message_id', messageId)
        break
      }
      case 'unsubscribed': {
        break
      }
      default: {
        console.log('Unknown Brevo webhook event:', event.event, messageId)
      }
    }
  }

  return NextResponse.json({ received: true })
}
