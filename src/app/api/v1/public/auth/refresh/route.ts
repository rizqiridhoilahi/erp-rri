import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { badRequest, unauthorized, internalError } from '@/lib/api/errors'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body?.refresh_token) return badRequest('refresh_token required')

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: body.refresh_token,
  })

  if (error || !data.session) return unauthorized('Gagal refresh token. Silakan login ulang.')

  return NextResponse.json({
    data: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    },
  })
}
