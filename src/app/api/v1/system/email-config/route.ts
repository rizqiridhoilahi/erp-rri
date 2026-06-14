import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { verifyAuthWithRole } from '@/lib/api/role-guard'
import { badRequest, internalError } from '@/lib/api/errors'

const EMAIL_CONFIG_KEYS = [
  'brevo_sender_email',
  'brevo_sender_name',
  'brevo_api_key',
  'brevo_smtp_login',
  'brevo_smtp_password',
  'brevo_webhook_secret',
  'email_inbound_secret',
] as const

function maskValue(value: string | null | undefined): string | null {
  if (!value || value.length < 8) return value ?? null
  return value.slice(0, 4) + '••••' + value.slice(-4)
}

export async function GET(request: NextRequest) {
  const auth = await verifyAuthWithRole(request, ['owner', 'admin'])
  if (auth.error) return auth.error

  const { data } = await supabaseAdmin
    .from('site_settings')
    .select('key, value')
    .in('key', EMAIL_CONFIG_KEYS)

  const envMap: Record<string, string | undefined> = {
    brevo_sender_email: process.env.BREVO_SENDER_EMAIL,
    brevo_sender_name: process.env.BREVO_SENDER_NAME,
    brevo_api_key: process.env.BREVO_API_KEY,
    brevo_smtp_login: process.env.BREVO_SMTP_LOGIN,
    brevo_smtp_password: process.env.BREVO_SMTP_PASSWORD,
    brevo_webhook_secret: process.env.BREVO_WEBHOOK_SECRET,
    email_inbound_secret: process.env.EMAIL_INBOUND_SECRET,
  }

  const result: Record<string, { value: string | null; masked: string | null; source: 'db' | 'env' | null }> = {}
  for (const key of EMAIL_CONFIG_KEYS) {
    const dbVal = (data ?? []).find(r => r.key === key)?.value ?? null
    const envVal = envMap[key] ?? null
    const value = dbVal || envVal
    const source = dbVal ? 'db' : envVal ? 'env' : null
    result[key] = { value, masked: maskValue(value), source }
  }

  return NextResponse.json({ data: result })
}

export async function POST(request: NextRequest) {
  const auth = await verifyAuthWithRole(request, ['owner', 'admin'])
  if (auth.error) return auth.error

  const body = await request.json().catch(() => null)
  if (!body) return badRequest('Invalid JSON body')

  const now = new Date().toISOString()
  const upserts: Array<{ key: string; value: string; updated_at: string }> = []

  for (const key of EMAIL_CONFIG_KEYS) {
    if (body[key] !== undefined) {
      upserts.push({ key, value: String(body[key]), updated_at: now })
    }
  }

  if (upserts.length === 0) return badRequest('Tidak ada data yang diupdate')

  const { error } = await supabaseAdmin
    .from('site_settings')
    .upsert(upserts, { onConflict: 'key' })

  if (error) return internalError(error)

  return NextResponse.json({ message: 'Pengaturan email berhasil disimpan' })
}
