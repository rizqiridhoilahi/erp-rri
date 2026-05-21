import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { unauthorized } from './errors'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function verifyAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) return { user: null, error: unauthorized('Missing authorization token') }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) return { user: null, error: unauthorized('Invalid or expired token') }

  return { user: data.user, error: null }
}
