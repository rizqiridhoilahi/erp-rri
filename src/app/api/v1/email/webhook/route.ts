import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/api/supabase-server'

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

export async function POST(request: NextRequest) {
  const body: BrevoWebhookEvent | BrevoWebhookEvent[] = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const events = Array.isArray(body) ? body : [body]

  for (const event of events) {
    const messageId = normalizeMessageId(event['message-id'] ?? '')
    if (!messageId) continue

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
        // Just log, no status update needed
        break
      }
      default: {
        console.log('Unknown Brevo webhook event:', event.event, messageId)
      }
    }
  }

  return NextResponse.json({ received: true })
}
