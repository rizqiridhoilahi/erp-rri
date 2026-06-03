import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { verifyAuth } from '@/lib/api/auth'
import { internalError } from '@/lib/api/errors'

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error
  const { data, error } = await supabaseAdmin.from('delivery_order').select('*, sales_order!sales_order_id(nomor), gudang!gudang_id(nama)').order('created_at', { ascending: false })
  if (error) return internalError(error)
  return NextResponse.json({ data: data ?? [] })
}
