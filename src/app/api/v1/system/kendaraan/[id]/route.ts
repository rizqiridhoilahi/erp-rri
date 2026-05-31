import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { verifyAuth } from '@/lib/api/auth'
import { badRequest, notFound, internalError } from '@/lib/api/errors'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error
  const { id } = await params

  const body = await request.json().catch(() => null)
  if (!body) return badRequest('Invalid JSON body')

  const upd: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (body.nama !== undefined) upd.nama = body.nama
  if (body.no_polisi !== undefined) upd.no_polisi = body.no_polisi
  if (body.is_active !== undefined) upd.is_active = body.is_active

  const { data, error } = await supabaseAdmin.from('kendaraan').update(upd).eq('id', id).select().single()
  if (error) return internalError(error)
  if (!data) return notFound('Kendaraan tidak ditemukan')
  return NextResponse.json({ data })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error
  const { id } = await params

  const { error } = await supabaseAdmin.from('kendaraan').delete().eq('id', id)
  if (error) return internalError(error)
  return new NextResponse(null, { status: 204 })
}
