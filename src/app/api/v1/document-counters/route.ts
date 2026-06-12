import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { verifyAuthWithRole } from '@/lib/api/role-guard'
import { badRequest, internalError } from '@/lib/api/errors'

export async function GET(request: NextRequest) {
  const { error } = await verifyAuthWithRole(request, ['admin', 'owner'])
  if (error) return error

  const { data, error: dbError } = await supabaseAdmin
    .from('document_counter')
    .select('*')
    .order('tahun', { ascending: false })
    .order('bulan', { ascending: false })
    .order('kode_dokumen')

  if (dbError) return internalError(dbError)
  return NextResponse.json({ data: data ?? [] })
}

export async function PATCH(request: NextRequest) {
  const { error } = await verifyAuthWithRole(request, ['admin', 'owner'])
  if (error) return error

  const body = await request.json().catch(() => null)
  if (!body) return badRequest('Invalid JSON body')

  const { kode_dokumen, tahun, bulan, counter } = body
  if (!kode_dokumen || typeof tahun !== 'number' || typeof bulan !== 'number' || typeof counter !== 'number') {
    return badRequest('Field kode_dokumen (string), tahun (number), bulan (number), counter (number) wajib diisi')
  }

  const { data, error: dbError } = await supabaseAdmin
    .from('document_counter')
    .upsert({
      kode_dokumen,
      tahun,
      bulan,
      counter,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'kode_dokumen, tahun, bulan' })
    .select()
    .single()

  if (dbError) return internalError(dbError)
  return NextResponse.json({ data })
}
