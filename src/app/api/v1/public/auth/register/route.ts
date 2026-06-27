import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { badRequest, conflict, internalError } from '@/lib/api/errors'

const registerSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  nama_perusahaan: z.string().optional(),
  alamat_perusahaan: z.string().optional(),
  pic_name: z.string().optional(),
  pic_phone: z.string().optional(),
})

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body) return badRequest('Invalid JSON body')

  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) return badRequest(parsed.error.issues.map(i => i.message).join(', '))

  const { email, password, nama_perusahaan, alamat_perusahaan, pic_name, pic_phone } = parsed.data

  const { data: usersData } = await supabaseAdmin.auth.admin.listUsers()
  const existingUser = usersData?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase())
  if (existingUser) {
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
    if (!nama_perusahaan || !alamat_perusahaan || !pic_name || !pic_phone) {
      return badRequest('Data perusahaan wajib diisi: nama_perusahaan, alamat_perusahaan, pic_name, pic_phone')
    }
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

  let customerId: string | null = null

  if (pic) {
    const customer = pic.customer as unknown as { nama: string; alamat: string } | null
    customerId = pic.customer_id

    const { error: profileError } = await supabaseAdmin
      .from('customer_profiles')
      .insert({
        auth_user_id: authData.user.id,
        customer_id: customerId,
        nama_perusahaan: customer?.nama ?? '',
        penanggung_jawab_pic: pic.nama,
        no_whatsapp_pic: pic.no_hp,
        alamat_perusahaan: customer?.alamat ?? '',
        npwp_perusahaan: null,
        status_verifikasi: 'approved',
      })

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return internalError(profileError)
    }
  } else {
    const customerKode = `CALON-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
    const customerIdGen = crypto.randomUUID()

    const { error: customerError } = await supabaseAdmin
      .from('customer')
      .insert({
        id: customerIdGen,
        kode: customerKode,
        nama: nama_perusahaan!,
        alamat: alamat_perusahaan!,
      })

    if (customerError) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return internalError(customerError)
    }

    customerId = customerIdGen

    const { error: profileError } = await supabaseAdmin
      .from('customer_profiles')
      .insert({
        auth_user_id: authData.user.id,
        customer_id: customerId,
        nama_perusahaan: nama_perusahaan!,
        penanggung_jawab_pic: pic_name!,
        no_whatsapp_pic: pic_phone!,
        alamat_perusahaan: alamat_perusahaan!,
        npwp_perusahaan: null,
        status_verifikasi: 'approved',
      })

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      await supabaseAdmin.from('customer').delete().eq('id', customerIdGen)
      return internalError(profileError)
    }
  }

  return NextResponse.json({ data: { message: 'Registrasi berhasil' } }, { status: 201 })
}
