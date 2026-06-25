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
  const { data: retur, error } = await supabaseAdmin
    .from('retur_penjualan')
    .select('*, delivery_order!delivery_order_id(id, nomor)')
    .eq('id', id)
    .eq('customer_id', profile.customer_id)
    .single()

  if (error) return notFound('Retur tidak ditemukan')
  if (!retur) return notFound('Retur tidak ditemukan')

  const { data: items } = await supabaseAdmin
    .from('retur_penjualan_item')
    .select('*, barang!barang_id(nama, kode, satuan, image_url)')
    .eq('retur_penjualan_id', id)

  return NextResponse.json({ data: { ...retur, items: items ?? [] } })
}
