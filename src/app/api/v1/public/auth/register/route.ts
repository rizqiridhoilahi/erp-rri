import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { badRequest, conflict, internalError } from '@/lib/api/errors'

const registerSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
})

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body) return badRequest('Invalid JSON body')

  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) return badRequest(parsed.error.issues.map(i => i.message).join(', '))

  const { email, password } = parsed.data

  const { data: existingProfile } = await supabaseAdmin
    .from('customer_profiles')
    .select('id')
    .eq('auth_user_id', email)
    .maybeSingle()

  if (existingProfile) {
    return conflict('Email sudah terdaftar')
  }

  const { data: pic, error: picError } = await supabaseAdmin
    .from('customer_pic')
    .select(`
      nama,
      no_hp,
      customer_id,
      customer:customer_id (
        nama,
        alamat
      )
    `)
    .ilike('email', email)
    .maybeSingle()

  if (picError) {
    return internalError(picError)
  }

  if (!pic) {
    return NextResponse.json(
      { error: 'Email PIC tidak ditemukan. Hubungi admin perusahaan Anda untuk didaftarkan sebagai PIC.' },
      { status: 400 }
    )
  }

  const customerArr = pic.customer as { nama: string; alamat: string }[] | null
  const customer = customerArr?.[0]

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
      customer_id: pic.customer_id,
      nama_perusahaan: customer?.nama ?? '',
      penanggung_jawab_pic: pic.nama,
      no_whatsapp_pic: pic.no_hp,
      alamat_perusahaan: customer?.alamat ?? '',
      npwp_perusahaan: null,
      status_verifikasi: 'pending',
    })

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
    return internalError(profileError)
  }

  return NextResponse.json({ data: { message: 'Registrasi berhasil. Menunggu persetujuan admin.' } }, { status: 201 })
}
