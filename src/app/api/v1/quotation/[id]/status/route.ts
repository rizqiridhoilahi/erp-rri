import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { verifyAuth } from '@/lib/api/auth'
import { badRequest, notFound, internalError } from '@/lib/api/errors'
import { logAudit } from '@/lib/audit'
import { sendEmail } from '@/lib/utils/email'

const VALID_STATUSES = ['draft', 'sent', 'proses_negosiasi', 'approved', 'rejected', 'closed'] as const

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  draft: ['sent', 'rejected'],
  sent: ['approved', 'rejected', 'proses_negosiasi'],
  proses_negosiasi: ['approved', 'rejected'],
  approved: ['sent', 'closed'],
  rejected: ['draft'],
  closed: [],
}

function isValidTransition(from: string, to: string): boolean {
  if (from === to) return true
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false
}

const schema = z.object({
  status: z.enum(VALID_STATUSES, { message: 'Status tidak valid' }),
})

const COMPANY_KEYS = [
  'company_nama', 'company_alamat', 'company_no_hp', 'company_email',
  'penandatangan_nama', 'penandatangan_jabatan', 'company_logo_url',
] as const

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error

  const { id } = await params
  const body = await request.json().catch(() => null)
  if (!body) return badRequest('Invalid JSON body')

  const parsed = schema.safeParse(body)
  if (!parsed.success) return badRequest(parsed.error.issues.map(e => e.message).join(', '))

  const { data: current } = await supabaseAdmin
    .from('quotation')
    .select('status')
    .eq('id', id)
    .single()

  if (!current) return notFound('Quotation tidak ditemukan')

  if (!isValidTransition(current.status, parsed.data.status)) {
    return badRequest(
      `Status tidak bisa diubah dari '${current.status}' ke '${parsed.data.status}'`
    )
  }

  const { data, error } = await supabaseAdmin
    .from('quotation')
    .update({ status: parsed.data.status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*, customer!customer_id(id, nama, kode)')
    .single()

  if (error) return internalError(error)
  if (!data) return notFound('Quotation tidak ditemukan')

  await logAudit({
    userId: auth.user?.id,
    action: 'UPDATE',
    tableName: 'quotation',
    recordId: id,
    changes: { status: { old: current.status, new: parsed.data.status } },
  })

  // Send email notification when quotation is marked as sent
  if (parsed.data.status === 'sent') {
    try {
      const { data: pics } = await supabaseAdmin
        .from('customer_pic')
        .select('nama, email')
        .eq('customer_id', data.customer_id)
        .eq('is_active', true)
        .limit(1)

      const pic = pics?.[0]
      if (pic?.email) {
        const { data: companySettings } = await supabaseAdmin
          .from('site_settings')
          .select('*')
          .in('key', COMPANY_KEYS as unknown as string[])

        const company: Record<string, string> = {}
        if (companySettings) {
          for (const row of companySettings) {
            company[row.key] = row.value
          }
        }

        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1e40af;">Quotation: ${data.nomor}</h2>
            <p>Kepada Yth. ${pic.nama},</p>
            <p>Bersama ini kami sampaikan Quotation dengan detail sebagai berikut:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Nomor</td><td style="padding: 8px; border: 1px solid #e2e8f0;">${data.nomor}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Perihal</td><td style="padding: 8px; border: 1px solid #e2e8f0;">${data.perihal}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Tanggal</td><td style="padding: 8px; border: 1px solid #e2e8f0;">${new Date(data.tanggal).toLocaleDateString('id-ID')}</td></tr>
            </table>
            <p>Silakan akses dokumen lengkap melalui portal customer RRI atau hubungi kami untuk detail lebih lanjut.</p>
            <p>Terima kasih atas perhatian dan kerjasamanya.</p>
            <p>Hormat kami,<br/>${company.company_nama ?? 'ERP RRI'}</p>
          </div>
        `

        const subject = `Quotation: ${data.nomor} - ${data.perihal}`

        await sendEmail({
          to: pic.email,
          toNama: pic.nama,
          subject,
          html,
          referenceType: 'quotation',
          referenceId: id,
        })
      }
    } catch {
      // Email sending is best-effort — don't block status transition
    }
  }

  return NextResponse.json({ data })
}
