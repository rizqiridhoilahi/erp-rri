import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { verifyAuth } from '@/lib/api/auth'
import { badRequest, notFound, internalError } from '@/lib/api/errors'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error
  const { id } = await params
  const { data, error } = await supabaseAdmin.from('absensi').select('*, karyawan:karyawan_id(id, nama, nik)').eq('id', id).single()
  if (error) return internalError(error)
  if (!data) return notFound()
  return NextResponse.json({ data })
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error
  const { id } = await params
  const body = await request.json().catch(() => null)
  if (!body) return badRequest('Invalid JSON body')

  const upd: Record<string, unknown> = {}
  if (body.status) upd.status = body.status
  if (body.keterangan !== undefined) upd.keterangan = body.keterangan
  upd.updated_at = new Date().toISOString()

  const { data, error } = await supabaseAdmin.from('absensi').update(upd).eq('id', id).select().single()
  if (error) return internalError(error)
  if (!data) return notFound()
  return NextResponse.json({ data })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error
  const { id } = await params
  const { error } = await supabaseAdmin.from('absensi').delete().eq('id', id)
  if (error) return internalError(error)
  return new NextResponse(null, { status: 204 })
}
