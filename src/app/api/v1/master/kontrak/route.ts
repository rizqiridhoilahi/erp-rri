import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { verifyAuth } from '@/lib/api/auth'
import { badRequest, internalError } from '@/lib/api/errors'

const schema = z.object({
  nomor_kontrak: z.string().min(1, 'Nomor kontrak harus diisi'),
  nama_kontrak: z.string().min(1, 'Nama kontrak harus diisi'),
  supplier_id: z.string().min(1, 'Supplier harus dipilih'),
  customer_id: z.string().min(1, 'Customer harus dipilih'),
  tanggal_mulai: z.string().min(1, 'Tanggal mulai harus diisi'),
  tanggal_selesai: z.string().min(1, 'Tanggal selesai harus diisi'),
  nilai_kontrak: z.coerce.number().nonnegative().default(0),
  keterangan: z.string().optional(),
  is_active: z.boolean().default(true),
})

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error
  const { data, error } = await supabaseAdmin.from('kontrak').select('*, supplier!supplier_id(nama), customer!customer_id(nama)').order('created_at', { ascending: false })
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
  const { data, error } = await supabaseAdmin.from('kontrak').insert(parsed.data).select('*, supplier!supplier_id(nama), customer!customer_id(nama)').single()
  if (error) return internalError(error)
  return NextResponse.json({ data }, { status: 201 })
}
