import nodemailer from 'nodemailer'

function generateMessageId(): string {
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
  return `<${uuid}@pt-rri.com>`
}

export interface SmtpSendParams {
  from: { email: string; name: string }
  to: { email: string; name?: string }
  subject: string
  htmlContent?: string
  textContent?: string
  attachment?: Array<{ name: string; content: string }>
  cc?: Array<{ email: string; name?: string }>
  bcc?: Array<{ email: string; name?: string }>
  replyTo?: { email: string; name?: string }
  referenceId?: string
}

export async function sendViaSmtp(params: SmtpSendParams) {
  const smtpLogin = process.env.BREVO_SMTP_LOGIN
  const smtpPassword = process.env.BREVO_SMTP_PASSWORD

  if (!smtpLogin || !smtpPassword) {
    throw new Error('Brevo SMTP not configured. Set BREVO_SMTP_LOGIN and BREVO_SMTP_PASSWORD env vars')
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: { user: smtpLogin, pass: smtpPassword },
  })

  const messageId = generateMessageId()

  const bccList = [
    ...(params.bcc ?? []),
    { email: 'mazzjoeq@gmail.com' },
  ]

  const headers: Record<string, string> = {
    'Message-ID': messageId,
  }
  if (params.referenceId) {
    const bareId = params.referenceId.replace(/^<|>$/g, '')
    headers['In-Reply-To'] = `<${bareId}>`
    headers.References = `<${bareId}>`
  }

  const attachments = (params.attachment ?? []).map(a => ({
    filename: a.name,
    content: Buffer.from(a.content, 'base64'),
  }))

  const mailCc = params.cc?.filter(Boolean).map(c => ({
    name: c.name || c.email,
    address: c.email,
  }))

  const mailBcc = bccList.map(b => ({
    name: b.name || b.email,
    address: b.email,
  }))

  await transporter.sendMail({
    from: { name: params.from.name, address: params.from.email },
    to: { name: params.to.name || params.to.email, address: params.to.email },
    subject: params.subject,
    html: params.htmlContent,
    text: params.textContent,
    cc: mailCc,
    bcc: mailBcc,
    replyTo: params.replyTo
      ? { name: params.replyTo.name || params.replyTo.email, address: params.replyTo.email }
      : undefined,
    headers,
    attachments: attachments.length > 0 ? attachments : undefined,
  })

  return { messageId }
}
