import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { verifyAuth } from '@/lib/api/auth'
import { badRequest, internalError } from '@/lib/api/errors'

const schema = z.object({
  nik: z.string().min(1, 'NIK harus diisi'),
  nama: z.string().min(1, 'Nama harus diisi'),
  email: z.string().email('Email tidak valid'),
  no_hp: z.string().optional(),
  jabatan_id: z.string().min(1, 'Jabatan harus dipilih'),
  gaji_pokok: z.coerce.number().nonnegative().optional(),
  tanggal_masuk: z.string().optional(),
  is_active: z.boolean().default(true),
})

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error
  const { data, error } = await supabaseAdmin.from('karyawan').select('*, jabatan!jabatan_id(nama)').order('nama')
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
  const { data, error } = await supabaseAdmin.from('karyawan').insert(parsed.data).select('*, jabatan!jabatan_id(nama)').single()
  if (error) return internalError(error)
  return NextResponse.json({ data }, { status: 201 })
}
