import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { badRequest, conflict, internalError } from '@/lib/api/errors'

const registerSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  nama_perusahaan: z.string().min(1, 'Nama perusahaan wajib diisi'),
  penanggung_jawab_pic: z.string().min(1, 'Nama PIC wajib diisi'),
  no_whatsapp_pic: z.string().min(1, 'No WhatsApp wajib diisi'),
  alamat_perusahaan: z.string().min(1, 'Alamat perusahaan wajib diisi'),
  npwp_perusahaan: z.string().optional(),
})

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body) return badRequest('Invalid JSON body')

  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) return badRequest(parsed.error.issues.map(i => i.message).join(', '))

  const { email, password, nama_perusahaan, penanggung_jawab_pic, no_whatsapp_pic, alamat_perusahaan, npwp_perusahaan } = parsed.data

  const { data: existingProfile } = await supabaseAdmin
    .from('customer_profiles')
    .select('id')
    .eq('nama_perusahaan', nama_perusahaan)
    .maybeSingle()

  if (existingProfile) {
    return conflict('Perusahaan sudah terdaftar')
  }

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) {
    if (authError.message.includes('already registered')) {
      return conflict('Email sudah terdaftar')
    }
    return internalError(authError)
  }

  const { error: profileError } = await supabaseAdmin
    .from('customer_profiles')
    .insert({
      auth_user_id: authData.user.id,
      nama_perusahaan,
      penanggung_jawab_pic,
      no_whatsapp_pic,
      alamat_perusahaan,
      npwp_perusahaan: npwp_perusahaan || null,
      status_verifikasi: 'pending',
    })

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
    return internalError(profileError)
  }

  return NextResponse.json({ data: { message: 'Registrasi berhasil. Menunggu persetujuan admin.' } }, { status: 201 })
}
