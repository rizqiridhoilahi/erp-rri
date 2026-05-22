import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { verifyAuth } from '@/lib/api/auth'
import { badRequest, internalError } from '@/lib/api/errors'

const schema = z.object({
  karyawan_id: z.string().min(1),
  tanggal: z.string().min(1),
  status: z.enum(['hadir', 'sakit', 'izin', 'alpha', 'cuti']),
  keterangan: z.string().optional(),
})

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error
  const { searchParams } = new URL(request.url)
  const karyawanId = searchParams.get('karyawan_id')
  let query = supabaseAdmin.from('absensi').select('*, karyawan!karyawan_id(nama, nik)').order('tanggal', { ascending: false })
  if (karyawanId) query = query.eq('karyawan_id', karyawanId)
  const { data, error } = await query
  if (error) return internalError(error)
  return NextResponse.json({ data: data ?? [] })
}

export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error
  const body = await request.json().catch(() => null)
  if (!body) return badRequest('Invalid JSON body')
  const parsed = schema.safeParse(body)
  if (!parsed.success) return badRequest(parsed.error.issues.map(e => e.message).join(', '))

  const now = new Date().toISOString()
  const { data, error } = await supabaseAdmin.from('absensi').insert({
    karyawan_id: parsed.data.karyawan_id, tanggal: parsed.data.tanggal,
    status: parsed.data.status, keterangan: parsed.data.keterangan ?? null,
    created_at: now, updated_at: now,
  }).select().single()
  if (error) return internalError(error)
  return NextResponse.json({ data }, { status: 201 })
}
