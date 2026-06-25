import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { internalError, unauthorized } from '@/lib/api/errors'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return unauthorized()

  const token = authHeader.slice(7)
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
  if (authError || !user) return unauthorized()

  const { data: profile } = await supabaseAdmin
    .from('customer_profiles')
    .select('customer_id')
    .eq('auth_user_id', user.id)
    .maybeSingle()
  if (!profile?.customer_id) return unauthorized()

  const { data: dos, error } = await supabaseAdmin
    .from('delivery_order')
    .select('id, nomor, tanggal, status, keterangan')
    .eq('customer_id', profile.customer_id)
    .order('created_at', { ascending: false })

  if (error) return internalError(error)

  return NextResponse.json({ data: dos ?? [] })
}
