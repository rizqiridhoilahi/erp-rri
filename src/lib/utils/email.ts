import nodemailer from 'nodemailer'
import { supabaseAdmin } from '@/lib/api/supabase-server'

function getTransporter() {
  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT ?? '587')
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) {
    throw new Error('SMTP not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS env vars')
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })
}

export async function getCompanyEmail(): Promise<string> {
  const { data } = await supabaseAdmin
    .from('site_settings')
    .select('value')
    .eq('key', 'company_email')
    .maybeSingle()
  return data?.value ?? process.env.SMTP_USER ?? 'noreply@erp-rri.com'
}

interface SendEmailParams {
  to: string
  subject: string
  html?: string
  text?: string
  attachments?: Array<{ filename: string; content: Buffer; contentType?: string }>
  referenceType?: string
  referenceId?: string
  toNama?: string
}

export async function sendEmail(params: SendEmailParams) {
  const { to, subject, html, text, attachments, referenceType, referenceId, toNama } = params

  const from = await getCompanyEmail()

  let status: string
  let errorMessage: string | null = null

  try {
    const transporter = getTransporter()
    await transporter.sendMail({
      from: `"ERP RRI" <${from}>`,
      to,
      subject,
      html,
      text,
      attachments: attachments?.map(a => ({
        filename: a.filename,
        content: a.content,
        contentType: a.contentType,
      })),
    })
    status = 'sent'
  } catch (err) {
    status = 'failed'
    errorMessage = err instanceof Error ? err.message : String(err)
  }

  const now = new Date().toISOString()
  await supabaseAdmin.from('email_log').insert({
    to_email: to,
    to_nama: toNama ?? null,
    subject,
    body: html ?? text ?? null,
    status,
    error_message: errorMessage,
    reference_type: referenceType ?? null,
    reference_id: referenceId ?? null,
    created_at: now,
    updated_at: now,
  })

  if (status === 'failed') {
    throw new Error(errorMessage ?? 'Failed to send email')
  }

  return { success: true }
}
