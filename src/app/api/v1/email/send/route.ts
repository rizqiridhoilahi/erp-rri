import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/api/auth"
import { sendEmail } from "@/lib/utils/email"

export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 })

  try {
    const body = await request.json()
    const { toEmail, toNama, subject, body: htmlBody, cc, referenceType, referenceId, templateId, params } = body

    if (!toEmail) {
      return NextResponse.json({ error: "toEmail is required" }, { status: 400 })
    }
    if (!subject && !templateId) {
      return NextResponse.json({ error: "subject or templateId is required" }, { status: 400 })
    }

    const result = await sendEmail({
      to: toEmail,
      toNama: toNama || undefined,
      subject: subject || "",
      html: htmlBody || undefined,
      templateId: templateId || undefined,
      params: params || undefined,
      referenceType: referenceType || undefined,
      referenceId: referenceId || undefined,
    })

    return NextResponse.json({ data: result })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send email"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
