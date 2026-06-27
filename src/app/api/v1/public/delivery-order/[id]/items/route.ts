import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { internalError, unauthorized, notFound } from '@/lib/api/errors'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authHeader = _request.headers.get('authorization')
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

  const { id } = await params

  const { data: doRecord } = await supabaseAdmin
    .from('delivery_order')
    .select('id')
    .eq('id', id)
    .eq('customer_id', profile.customer_id)
    .maybeSingle()
  if (!doRecord) return notFound('DO tidak ditemukan')

  const { data: items, error } = await supabaseAdmin
    .from('delivery_order_item')
    .select('*, barang!barang_id(id, nama, kode, satuan, image_url)')
    .eq('delivery_order_id', id)
    .order('urutan')

  if (error) return internalError(error)

  return NextResponse.json({ data: items ?? [] })
}
