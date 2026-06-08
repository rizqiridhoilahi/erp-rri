import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/api/auth'
import { BrevoClient } from '@getbrevo/brevo'
import { supabaseAdmin } from '@/lib/api/supabase-server'

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
    const days = parseInt(searchParams.get('days') ?? '30')

    const since = new Date()
    since.setDate(since.getDate() - days)

    // Local stats from email_log
    const { count: totalSent } = await supabaseAdmin
      .from('email_log')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', since.toISOString())

    const { count: delivered } = await supabaseAdmin
      .from('email_log')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', since.toISOString())
      .eq('status', 'delivered')

    const { count: opened } = await supabaseAdmin
      .from('email_log')
      .select('*', { count: 'exact', head: true })
      .not('opened_at', 'is', null)
      .gte('created_at', since.toISOString())

    const { count: clicked } = await supabaseAdmin
      .from('email_log')
      .select('*', { count: 'exact', head: true })
      .not('clicked_at', 'is', null)
      .gte('created_at', since.toISOString())

    const { count: bounced } = await supabaseAdmin
      .from('email_log')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', since.toISOString())
      .eq('status', 'bounced')

    // Brevo aggregated report
    const client = getClient()
    const brevoStats = await client.transactionalEmails.getAggregatedSmtpReport({
      days,
    })

    return NextResponse.json({
      data: {
        local: { totalSent, delivered, opened, clicked, bounced },
        brevo: brevoStats,
        period: { days, since: since.toISOString() },
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch stats'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
