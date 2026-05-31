import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { verifyAuth } from '@/lib/api/auth'
import { badRequest, internalError } from '@/lib/api/errors'

export async function GET(_request: NextRequest) {
  const auth = await verifyAuth(_request)
  if (auth.error) return auth.error

  const { data, error } = await supabaseAdmin
    .from('kendaraan')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) return internalError(error)
  return NextResponse.json({ data: data ?? [] })
}

export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error

  const body = await request.json().catch(() => null)
  if (!body) return badRequest('Invalid JSON body')
  if (!body.nama) return badRequest('Nama kendaraan wajib diisi')
  if (!body.no_polisi) return badRequest('No. Polisi wajib diisi')

  const now = new Date().toISOString()
  const { data, error } = await supabaseAdmin.from('kendaraan').insert({
    nama: body.nama,
    no_polisi: body.no_polisi,
    is_active: body.is_active !== false,
    created_at: now,
    updated_at: now,
  }).select().single()

  if (error) return internalError(error)
  return NextResponse.json({ data }, { status: 201 })
}
