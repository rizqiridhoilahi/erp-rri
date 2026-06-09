// Cloudflare Email Worker — ERP RRI Inbound Email Pipeline
// ==========================================================
// Deploy via Cloudflare Dashboard: Workers & Pages → Create Worker → Paste this code
// Set env vars in Worker settings (see SETTINGS section below)
//
// Flow:
//   Email arrives at pt-rri.com MX → Email Routing Rule → This Worker
//   1. Parse email (headers + body)
//   2. POST to ERP API  → stored in email_log (inbound=true) → Mail Center Inbox
//   3. Relay via Brevo   → arrives at Gmail with proper DKIM/SPF/DMARC → Inbox, not Spam
//   4. Fallback forward  → if Brevo fails, forward original via Cloudflare
//
// ==========================================================
// SETTINGS — Configure these as Worker environment variables:
// ==========================================================
// ERP_INBOUND_URL=https://erp-rri.vercel.app/api/v1/email/inbound
// ERP_INBOUND_SECRET=<generate with: openssl rand -hex 32>
// BREVO_API_KEY=xkeysib-...
// FORWARD_TO_EMAIL=mazzjoeq@gmail.com
// SENDER_EMAIL=marzuqi@pt-rri.com
// SENDER_NAME="ERP RRI"
// MAX_BODY_SIZE=1048576  (1MB, optional)

export default {
  async email(message, env, ctx) {
    const MAX_BODY = parseInt(env.MAX_BODY_SIZE || '1048576', 10)
    const startTime = Date.now()

    // ---- 1. Extract headers ----
    const from = message.from
    const to = message.to
    const subject = message.headers.get('subject') || '(No Subject)'
    const messageId = message.headers.get('message-id') || `cf-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const replyTo = message.headers.get('reply-to') || from

    // ---- 2. Read & parse raw MIME body ----
    let rawText = ''
    try {
      const reader = message.raw.getReader()
      const chunks = []
      let totalSize = 0
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        totalSize += value.length
        if (totalSize > MAX_BODY) {
          chunks.push(value.slice(0, MAX_BODY - totalSize + value.length))
          break
        }
        chunks.push(value)
      }
      const allBytes = new Uint8Array(totalSize > MAX_BODY ? MAX_BODY : chunks.reduce((a, c) => a + c.length, 0))
      let pos = 0
      for (const chunk of chunks) {
        allBytes.set(chunk, pos)
        pos += chunk.length
      }
      rawText = new TextDecoder().decode(allBytes)
    } catch (err) {
      console.error('Error reading raw email:', err.message)
    }

    // ---- 3. Parse MIME ----
    const parsed = parseMime(rawText)
    const htmlBody = parsed.htmlBody || ''
    const textBody = parsed.textBody || ''
    const hasAttachments = parsed.hasAttachments || false
    const finalBody = htmlBody || textBody || '(no body)'

    // ---- 4. Send to ERP API (store in email_log) ----
    let erpSuccess = false
    try {
      const erpRes = await fetch(env.ERP_INBOUND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.ERP_INBOUND_SECRET}`,
        },
        body: JSON.stringify({
          messageId,
          fromEmail: from,
          fromNama: from,
          toEmail: to,
          subject,
          body: finalBody.substring(0, 50000),
          hasAttachments,
        }),
      })
      erpSuccess = erpRes.ok
      if (!erpSuccess) {
        const erpErr = await erpRes.text()
        console.error(`ERP API error (${erpRes.status}):`, erpErr)
      }
    } catch (err) {
      console.error('Failed to call ERP API:', err.message)
    }

    // ---- 5. Relay via Brevo (fix spam — proper DKIM/SPF) ----
    let brevoSuccess = false
    try {
      const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': env.BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: env.SENDER_NAME || 'ERP RRI', email: env.SENDER_EMAIL },
          to: [{ email: env.FORWARD_TO_EMAIL }],
          replyTo: { email: replyTo, name: from },
          subject: `${subject}`,
          htmlContent: buildRelayBody(from, to, subject, htmlBody || textBody),
          tags: ['inbound-relay'],
        }),
      })
      brevoSuccess = brevoRes.ok
      if (!brevoSuccess) {
        const brevoErr = await brevoRes.text()
        console.error(`Brevo relay error (${brevoRes.status}):`, brevoErr)
      }
    } catch (err) {
      console.error('Failed to relay via Brevo:', err.message)
    }

    // ---- 6. Fallback: forward original via Cloudflare ----
    if (!brevoSuccess) {
      try {
        await message.forward(env.FORWARD_TO_EMAIL)
        console.log('Fallback: forwarded original email to', env.FORWARD_TO_EMAIL)
      } catch (fwdErr) {
        console.error('Fallback forward failed:', fwdErr.message)
      }
    }

    const elapsed = Date.now() - startTime
    console.log(`Processed email from=${from} subject="${subject}" erp=${erpSuccess} brevo=${brevoSuccess} fallback=${!brevoSuccess} ${elapsed}ms`)
  },
}

// ---- MIME Parser (zero dependencies) ----
function parseMime(rawText) {
  if (!rawText) return { htmlBody: '', textBody: '', hasAttachments: false }

  const headerEnd = rawText.indexOf('\r\n\r\n')
  if (headerEnd < 0) return { htmlBody: '', textBody: rawText, hasAttachments: false }

  const headerSection = rawText.substring(0, headerEnd)
  const bodySection = rawText.substring(headerEnd + 4)

  const headers = parseHeaders(headerSection)
  const contentType = headers['content-type'] || 'text/plain'
  const contentEncoding = (headers['content-transfer-encoding'] || '').toLowerCase().trim()

  let decodedBody = bodySection
  if (contentEncoding === 'base64') {
    try {
      const binary = atob(bodySection.replace(/[\r\n\s]/g, ''))
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
      decodedBody = new TextDecoder().decode(bytes)
    } catch { decodedBody = bodySection }
  } else if (contentEncoding === 'quoted-printable') {
    decodedBody = decodeQuotedPrintable(bodySection)
  }

  const boundaryMatch = contentType.match(/boundary="?([^";]+)"?/)
  if (boundaryMatch) {
    return parseMultipart(decodedBody, boundaryMatch[1])
  }

  if (contentType.includes('text/html')) {
    return { htmlBody: decodedBody.trim(), textBody: '', hasAttachments: false }
  }
  return { htmlBody: '', textBody: decodedBody.trim(), hasAttachments: false }
}

function parseHeaders(headerSection) {
  const headers = {}
  const lines = headerSection.split('\r\n')
  let currentKey = ''
  for (const line of lines) {
    if (line.startsWith(' ') || line.startsWith('\t')) {
      if (currentKey) headers[currentKey] += ' ' + line.trim()
    } else {
      const colonIdx = line.indexOf(':')
      if (colonIdx > 0) {
        currentKey = line.substring(0, colonIdx).toLowerCase().trim()
        headers[currentKey] = line.substring(colonIdx + 1).trim()
      }
    }
  }
  return headers
}

function parseMultipart(body, boundary) {
  const parts = body.split('--' + boundary)
  let htmlBody = ''
  let textBody = ''
  let hasAttachments = false

  for (const part of parts) {
    const trimmed = part.trim()
    if (!trimmed || trimmed === '--') continue

    const partHeaderEnd = part.indexOf('\r\n\r\n')
    if (partHeaderEnd < 0) continue

    const partHeaders = parseHeaders(part.substring(0, partHeaderEnd))
    const partBody = part.substring(partHeaderEnd + 4)

    const ct = (partHeaders['content-type'] || '').toLowerCase()
    const ce = (partHeaders['content-transfer-encoding'] || '').toLowerCase().trim()
    const cd = (partHeaders['content-disposition'] || '').toLowerCase()

    let decoded = partBody
    if (ce === 'base64') {
      try {
        const binary = atob(partBody.replace(/[\r\n\s]/g, ''))
        const bytes = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
        decoded = new TextDecoder().decode(bytes)
      } catch { decoded = partBody }
    } else if (ce === 'quoted-printable') {
      decoded = decodeQuotedPrintable(partBody)
    }

    if (cd.includes('attachment') || cd.includes('filename=')) {
      hasAttachments = true
      continue
    }

    const subBoundary = ct.match(/boundary="?([^";]+)"?/)
    if (subBoundary) {
      const sub = parseMultipart(decoded, subBoundary[1])
      if (sub.htmlBody) htmlBody = sub.htmlBody
      if (sub.textBody) textBody = sub.textBody
      if (sub.hasAttachments) hasAttachments = true
      continue
    }

    if (ct.includes('text/html')) {
      htmlBody = decoded.trim()
    } else if (ct.includes('text/plain') && !htmlBody) {
      textBody = decoded.trim()
    }
  }

  return { htmlBody, textBody, hasAttachments }
}

function decodeQuotedPrintable(text) {
  return text
    .replace(/=\r\n/g, '')
    .replace(/=([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
}

function buildRelayBody(from, to, subject, originalBody) {
  const safeOriginal = originalBody
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 0; margin: 0; background: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #0000FF, #0000D9); padding: 20px 30px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: 600;">ERP RRI — Pesan Masuk</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                <tr><td style="padding: 4px 0; color: #666; font-size: 13px;">Dari</td></tr>
                <tr><td style="padding: 2px 0 12px; color: #333; font-size: 15px; font-weight: 600;">${escapeHtml(from)}</td></tr>
                <tr><td style="padding: 4px 0; color: #666; font-size: 13px;">Tujuan</td></tr>
                <tr><td style="padding: 2px 0 12px; color: #333; font-size: 15px;">${escapeHtml(to)}</td></tr>
                <tr><td style="padding: 4px 0; color: #666; font-size: 13px;">Subjek</td></tr>
                <tr><td style="padding: 2px 0 12px; color: #333; font-size: 15px; font-weight: 600;">${escapeHtml(subject)}</td></tr>
              </table>
              <hr style="border: none; border-top: 1px solid #eee; margin: 0 0 20px;">
              <div style="color: #333; font-size: 14px; line-height: 1.6;">
                ${safeOriginal}
              </div>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="color: #999; font-size: 12px; font-style: italic;">
                Pesan ini dikirim ke ${escapeHtml(to)} dan diteruskan secara otomatis oleh ERP RRI.
                Balas email ini akan langsung terkirim ke ${escapeHtml(from)}.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function escapeHtml(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
