import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { verifyAuthWithRole } from '@/lib/api/role-guard'
import { badRequest } from '@/lib/api/errors'

async function getBrevoApiKey(): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from('site_settings')
    .select('value')
    .eq('key', 'brevo_api_key')
    .maybeSingle()
  return data?.value ?? process.env.BREVO_API_KEY ?? null
}

export async function GET(request: NextRequest) {
  const auth = await verifyAuthWithRole(request, ['owner', 'admin'])
  if (auth.error) return auth.error

  const apiKey = await getBrevoApiKey()
  if (!apiKey) {
    return NextResponse.json({ data: [], error: 'Brevo API Key belum dikonfigurasi' })
  }

  try {
    const res = await fetch('https://api.brevo.com/v3/senders', {
      headers: { 'api-key': apiKey },
    })
    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ data: [], error: `Brevo API error: ${res.status} ${err}` }, { status: 502 })
    }

    const result = await res.json()
    const senders = ((result as Record<string, unknown>).senders as Array<Record<string, unknown>> || []).map(s => ({
      id: s.id,
      name: s.name,
      email: s.email,
      active: s.active,
      createdAt: s.createdAt,
    }))

    return NextResponse.json({ data: senders })
  } catch (err) {
    return NextResponse.json({ data: [], error: err instanceof Error ? err.message : 'Unknown error' }, { status: 502 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await verifyAuthWithRole(request, ['owner', 'admin'])
  if (auth.error) return auth.error

  const body = await request.json().catch(() => null)
  if (!body) return badRequest('Invalid JSON body')

  const { email, name } = body
  if (!email) return badRequest('Email wajib diisi')
  if (!name) return badRequest('Nama wajib diisi')

  const apiKey = await getBrevoApiKey()
  if (!apiKey) {
    return NextResponse.json({ error: 'Brevo API Key belum dikonfigurasi' }, { status: 400 })
  }

  try {
    const res = await fetch('https://api.brevo.com/v3/senders', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email }),
    })

    const result = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { error: (result as Record<string, unknown>).message || `Brevo API error: ${res.status}` },
        { status: 502 },
      )
    }

    return NextResponse.json({ data: result, message: `Email verifikasi telah dikirim ke ${email}` })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 502 })
  }
}
