import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabaseAdmin } from './supabase-server'
import { unauthorized, forbidden } from './errors'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function verifyPublicAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) return { user: null, profile: null, error: unauthorized('Missing authorization token') }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) return { user: null, profile: null, error: unauthorized('Invalid or expired token') }

  const { data: profile } = await supabaseAdmin
    .from('customer_profiles')
    .select('*')
    .eq('auth_user_id', data.user.id)
    .single()

  return { user: data.user, profile, error: null }
}

export async function requireCustomerAuth(request: NextRequest) {
  const result = await verifyPublicAuth(request)
  if (result.error) return result

  if (!result.profile) {
    return { user: null, profile: null, error: forbidden('Akun belum terdaftar sebagai customer') }
  }

  if (result.profile.status_verifikasi !== 'approved') {
    return { user: null, profile: null, error: forbidden('Akun menunggu persetujuan admin') }
  }

  return result
}
