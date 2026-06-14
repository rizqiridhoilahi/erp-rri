import { supabaseAdmin } from '@/lib/api/supabase-server'

const cache = new Map<string, string | null>()

export function clearEmailConfigCache() {
  cache.clear()
}

async function getFromDb(key: string): Promise<string | null> {
  if (cache.has(key)) return cache.get(key) ?? null
  const { data } = await supabaseAdmin
    .from('site_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle()
  const val = data?.value ?? null
  cache.set(key, val)
  return val
}

export async function getBrevoApiKey(): Promise<string | null> {
  return (await getFromDb('brevo_api_key')) || process.env.BREVO_API_KEY || null
}

export async function getBrevoSenderEmail(): Promise<string | null> {
  return (await getFromDb('brevo_sender_email')) || process.env.BREVO_SENDER_EMAIL || null
}

export async function getBrevoSenderName(): Promise<string | null> {
  return (await getFromDb('brevo_sender_name')) || process.env.BREVO_SENDER_NAME || null
}

export async function getBrevoSmtpLogin(): Promise<string | null> {
  return (await getFromDb('brevo_smtp_login')) || process.env.BREVO_SMTP_LOGIN || null
}

export async function getBrevoSmtpPassword(): Promise<string | null> {
  return (await getFromDb('brevo_smtp_password')) || process.env.BREVO_SMTP_PASSWORD || null
}

export async function getBrevoWebhookSecret(): Promise<string | null> {
  return (await getFromDb('brevo_webhook_secret')) || process.env.BREVO_WEBHOOK_SECRET || null
}

export async function getEmailInboundSecret(): Promise<string | null> {
  return (await getFromDb('email_inbound_secret')) || process.env.EMAIL_INBOUND_SECRET || null
}
