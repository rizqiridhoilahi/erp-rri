import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { verifyAuth } from '@/lib/api/auth'
import { badRequest, internalError } from '@/lib/api/errors'

const schema = z.object({
  kode: z.string().min(1, 'Kode COA harus diisi'),
  nama: z.string().min(1, 'Nama COA harus diisi'),
  jenis: z.enum(['Aset', 'Kewajiban', 'Ekuitas', 'Pendapatan', 'Beban'], { message: 'Jenis tidak valid' }),
  induk_id: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
})

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error
  const { data, error } = await supabaseAdmin.from('coa').select('*, coa!induk_id(nama)').order('kode')
  if (error) return internalError(error)
  const mapped = (data ?? []).map(item => ({ ...item, induk: item.coa?.[0] || null, coa: undefined }))
  return NextResponse.json({ data: mapped })
}

export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error
  const body = await request.json().catch(() => null)
  if (!body) return badRequest('Invalid JSON body')
  const parsed = schema.safeParse(body)
  if (!parsed.success) return badRequest(parsed.error.issues.map(e => e.message).join(', '))
  const { data, error } = await supabaseAdmin.from('coa').insert(parsed.data).select('*, coa!induk_id(nama)').single()
  if (error) return internalError(error)
  return NextResponse.json({ data: { ...data, induk: data?.coa?.[0] || null, coa: undefined } }, { status: 201 })
}
