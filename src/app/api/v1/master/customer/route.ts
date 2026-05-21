import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { verifyAuth } from '@/lib/api/auth'
import { badRequest, internalError } from '@/lib/api/errors'

const schema = z.object({
  nama: z.string().min(1, 'Nama customer harus diisi'),
  kode: z.string().min(1, 'Kode customer harus diisi'),
  email: z.string().email('Email tidak valid').optional().or(z.literal('')),
  no_telp: z.string().optional(),
  alamat: z.string().optional(),
  npwp: z.string().optional(),
  is_active: z.boolean().default(true),
})

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error
  const { data, error } = await supabaseAdmin.from('customer').select('*').order('nama')
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
  const { data, error } = await supabaseAdmin.from('customer').insert(parsed.data).select().single()
  if (error) return internalError(error)
  return NextResponse.json({ data }, { status: 201 })
}
