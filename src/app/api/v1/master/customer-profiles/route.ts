import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { verifyAuth } from '@/lib/api/auth'
import { verifyAuthWithRole } from '@/lib/api/role-guard'
import { badRequest, internalError, notFound } from '@/lib/api/errors'
import { sendEmail } from '@/lib/utils/email'
import { emailLayout } from '@/lib/email/templates'

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') ?? ''

  let query = supabaseAdmin
    .from('customer_profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status_verifikasi', status)

  const { data, error } = await query
  if (error) return internalError(error)

  return NextResponse.json({ data: data ?? [] })
}

const updateSchema = z.object({
  id: z.string().min(1),
  action: z.enum(['approve', 'reject']),
  customer_id: z.string().optional(),
})

export async function PUT(request: NextRequest) {
  const auth = await verifyAuthWithRole(request, ['owner', 'admin', 'sales'])
  if (auth.error) return auth.error

  const body = await request.json().catch(() => null)
  if (!body) return badRequest('Invalid JSON body')

  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return badRequest(parsed.error.issues.map(i => i.message).join(', '))

  const { data: profile } = await supabaseAdmin
    .from('customer_profiles')
    .select('*')
    .eq('id', parsed.data.id)
    .single()

  if (!profile) return notFound('Profile tidak ditemukan')

  if (parsed.data.action === 'approve') {
    let customerId = parsed.data.customer_id

    if (!customerId) {
      const { data: newCustomer } = await supabaseAdmin
        .from('customer')
        .insert({
          nama: profile.nama_perusahaan,
          kode: `CUST-${profile.nama_perusahaan.slice(0, 4).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
          alamat: profile.alamat_perusahaan,
          kontak: profile.no_whatsapp_pic,
        })
        .select()
        .single()

      if (!newCustomer) return internalError('Gagal membuat customer')
      customerId = newCustomer.id
    }

    const { error: updateError } = await supabaseAdmin
      .from('customer_profiles')
      .update({
        status_verifikasi: 'approved',
        customer_id: customerId,
      })
      .eq('id', parsed.data.id)

    if (updateError) return internalError(updateError)

    const { data: pic } = await supabaseAdmin
      .from('customer_pic')
      .select('email')
      .eq('nama', profile.penanggung_jawab_pic)
      .maybeSingle()
    const picEmail = pic?.email

    if (picEmail) {
      const html = emailLayout(`
        <p>Yth. <strong>${profile.penanggung_jawab_pic}</strong>,</p>
        <p>Akun portal klien RRI untuk perusahaan <strong>${profile.nama_perusahaan}</strong> telah disetujui.</p>
        <p>Anda sekarang dapat masuk ke portal klien menggunakan email dan password yang telah didaftarkan.</p>
        <p style="margin-top:20px">
          <a href="https://pt-rri.com/customer-login" style="display:inline-block;background:#0000ff;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:bold">
            Masuk ke Portal
          </a>
        </p>
        <p style="margin-top:20px;color:#64748B;font-size:14px">
          Email: ${picEmail}<br>
          Perusahaan: ${profile.nama_perusahaan}
        </p>
      `, 'Akun Disetujui')

      await sendEmail({
        to: picEmail,
        toNama: profile.penanggung_jawab_pic,
        cc: [{ email: 'marzuqi@pt-rri.com', name: 'Mohamad Marzuqi' }],
        subject: 'Akun Portal Klien RRI — Disetujui',
        html,
        referenceType: 'customer-profiles',
        referenceId: parsed.data.id,
      }).catch(err => console.error('Gagal kirim email notifikasi approve:', err))
    }
  } else {
    const { error: updateError } = await supabaseAdmin
      .from('customer_profiles')
      .update({ status_verifikasi: 'rejected' })
      .eq('id', parsed.data.id)

    if (updateError) return internalError(updateError)
  }

  return NextResponse.json({ data: { message: `Profile ${parsed.data.action === 'approve' ? 'disetujui' : 'ditolak'}` } })
}
