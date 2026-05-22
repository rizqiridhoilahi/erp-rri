import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { verifyAuth } from '@/lib/api/auth'
import { badRequest, internalError } from '@/lib/api/errors'
import { generateDocumentNumber } from '@/lib/utils/document-number'

const schema = z.object({
  karyawan_id: z.string().min(1),
  bulan: z.coerce.number().int().min(1).max(12),
  tahun: z.coerce.number().int().min(2020).max(2100),
  gaji_pokok: z.coerce.number().positive(),
  tunjangan: z.coerce.number().optional().default(0),
  potongan: z.coerce.number().optional().default(0),
  keterangan: z.string().optional(),
})

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error
  const { data, error } = await supabaseAdmin.from('penggajian').select('*, karyawan!karyawan_id(nama, nik)').order('created_at', { ascending: false })
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

  const nomor = await generateDocumentNumber('GJ')
  const now = new Date().toISOString()
  const gajiBersih = parsed.data.gaji_pokok + parsed.data.tunjangan - parsed.data.potongan

  const { data, error } = await supabaseAdmin.from('penggajian').insert({
    nomor, karyawan_id: parsed.data.karyawan_id, bulan: parsed.data.bulan,
    tahun: parsed.data.tahun, gaji_pokok: parsed.data.gaji_pokok,
    tunjangan: parsed.data.tunjangan, potongan: parsed.data.potongan,
    gaji_bersih: gajiBersih, status: 'draft',
    keterangan: parsed.data.keterangan ?? null,
    created_at: now, updated_at: now,
  }).select().single()
  if (error) return internalError(error)
  return NextResponse.json({ data }, { status: 201 })
}
