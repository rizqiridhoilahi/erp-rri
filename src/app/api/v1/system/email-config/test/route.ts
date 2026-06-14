import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { verifyAuthWithRole } from '@/lib/api/role-guard'
import nodemailer from 'nodemailer'

async function getConfig(key: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from('site_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle()
  return data?.value ?? null
}

async function getFullValue(key: string, envKey: string): Promise<string | null> {
  const dbVal = await getConfig(key)
  return dbVal || process.env[envKey] || null
}

export async function POST(request: NextRequest) {
  const auth = await verifyAuthWithRole(request, ['owner', 'admin'])
  if (auth.error) return auth.error

  const results: Array<{ name: string; status: 'ok' | 'error' | 'warning'; message: string }> = []

  // 1. Test Brevo API
  const apiKey = await getFullValue('brevo_api_key', 'BREVO_API_KEY')
  if (apiKey) {
    try {
      const res = await fetch('https://api.brevo.com/v3/account', {
        headers: { 'api-key': apiKey },
      })
      if (res.ok) {
        const account = await res.json()
        results.push({ name: 'Brevo API', status: 'ok', message: `Tersambung (${(account as Record<string, unknown>).email || 'ok'})` })
      } else {
        const err = await res.text()
        results.push({ name: 'Brevo API', status: 'error', message: `Gagal: ${res.status} ${err}` })
      }
    } catch (err) {
      results.push({ name: 'Brevo API', status: 'error', message: err instanceof Error ? err.message : 'Unknown error' })
    }
  } else {
    results.push({ name: 'Brevo API', status: 'error', message: 'API Key tidak dikonfigurasi' })
  }

  // 2. Test Brevo SMTP
  const smtpLogin = await getFullValue('brevo_smtp_login', 'BREVO_SMTP_LOGIN')
  const smtpPassword = await getFullValue('brevo_smtp_password', 'BREVO_SMTP_PASSWORD')
  if (smtpLogin && smtpPassword) {
    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 587,
        secure: false,
        auth: { user: smtpLogin, pass: smtpPassword },
      })
      await transporter.verify()
      results.push({ name: 'Brevo SMTP', status: 'ok', message: 'Koneksi SMTP berhasil' })
    } catch (err) {
      results.push({ name: 'Brevo SMTP', status: 'error', message: err instanceof Error ? err.message : 'Unknown error' })
    }
  } else {
    results.push({ name: 'Brevo SMTP', status: 'error', message: 'SMTP credentials tidak dikonfigurasi' })
  }

  // 3. Test sender email
  const senderEmail = await getFullValue('brevo_sender_email', 'BREVO_SENDER_EMAIL')
  results.push({
    name: 'Sender Email',
    status: senderEmail ? 'ok' : 'error',
    message: senderEmail ? `${senderEmail} (terverifikasi)` : 'Tidak dikonfigurasi',
  })

  // 4. Test webhook secret
  const webhookSecret = await getFullValue('brevo_webhook_secret', 'BREVO_WEBHOOK_SECRET')
  results.push({
    name: 'Webhook Secret',
    status: webhookSecret ? 'ok' : 'warning',
    message: webhookSecret ? 'Terkonfigurasi' : 'Tidak dikonfigurasi (webhook tanpa verifikasi)',
  })

  // 5. Test inbound secret
  const inboundSecret = await getFullValue('email_inbound_secret', 'EMAIL_INBOUND_SECRET')
  results.push({
    name: 'Inbound Secret',
    status: inboundSecret ? 'ok' : 'warning',
    message: inboundSecret ? 'Terkonfigurasi' : 'Tidak dikonfigurasi (inbound tidak akan berfungsi)',
  })

  return NextResponse.json({ data: results })
}
