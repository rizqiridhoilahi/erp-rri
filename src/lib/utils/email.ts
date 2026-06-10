import { supabaseAdmin } from '@/lib/api/supabase-server'
import { sendEmailViaBrevo as brevoSend } from '@/lib/email/brevo'

export async function getCompanyEmail(): Promise<string> {
  const { data } = await supabaseAdmin
    .from('site_settings')
    .select('value')
    .eq('key', 'company_email')
    .maybeSingle()
  return data?.value ?? process.env.BREVO_SENDER_EMAIL ?? 'noreply@erp-rri.com'
}

interface SendEmailParams {
  to: string
  subject: string
  html?: string
  text?: string
  templateId?: number
  params?: Record<string, unknown>
  attachments?: Array<{ filename: string; content: Buffer; contentType?: string }>
  referenceType?: string
  referenceId?: string
  toNama?: string
  cc?: Array<{ email: string; name?: string }>
  bcc?: Array<{ email: string; name?: string }>
  tags?: string[]
}

export async function sendEmail(params: SendEmailParams) {
  return brevoSend({
    to: { email: params.to, name: params.toNama },
    subject: params.subject,
    htmlContent: params.html,
    textContent: params.text,
    templateId: params.templateId,
    params: params.params,
    attachment: params.attachments?.map(a => ({
      name: a.filename,
      content: a.content.toString('base64'),
    })),
    cc: params.cc,
    bcc: params.bcc,
    tags: params.tags,
    referenceType: params.referenceType,
    referenceId: params.referenceId,
  })
}
