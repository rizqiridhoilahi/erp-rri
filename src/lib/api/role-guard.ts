import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from './supabase-server'
import { unauthorized, forbidden } from './errors'
import type { Role } from '@/types/role'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: Role
  isActive: boolean
}

export async function verifyAuthWithRole(
  request: NextRequest,
  allowedRoles?: Role[],
): Promise<{ user: AuthUser | null; error: NextResponse | null }> {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) return { user: null, error: unauthorized('Missing authorization token') }

  const { createClient } = await import('@supabase/supabase-js')
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) return { user: null, error: unauthorized('Invalid or expired token') }

  const { data: dbUser } = await supabaseAdmin
    .from('users')
    .select('id, email, name, role, is_active')
    .eq('id', data.user.id)
    .single()

  if (!dbUser) return { user: null, error: unauthorized('User not found') }
  if (!dbUser.is_active) return { user: null, error: forbidden('Akun dinonaktifkan') }

  const authUser: AuthUser = {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    role: dbUser.role as Role,
    isActive: dbUser.is_active,
  }

  if (allowedRoles && !allowedRoles.includes(authUser.role)) {
    return { user: null, error: forbidden('Anda tidak memiliki akses ke fitur ini') }
  }

  return { user: authUser, error: null }
}
