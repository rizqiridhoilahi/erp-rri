import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { badRequest, unauthorized, forbidden, internalError } from '@/lib/api/errors'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
})

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body) return badRequest('Invalid JSON body')

  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) return badRequest(parsed.error.issues.map(i => i.message).join(', '))

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      return unauthorized('Email atau password salah')
    }
    return internalError(error)
  }

  const { data: profile } = await supabaseAdmin
    .from('customer_profiles')
    .select('status_verifikasi')
    .eq('auth_user_id', data.user.id)
    .maybeSingle()

  if (profile && profile.status_verifikasi === 'rejected') {
    return forbidden('Akun Anda telah ditolak. Silakan hubungi admin.')
  }

  return NextResponse.json({
    data: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    },
  })
}
