import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { verifyAuth } from '@/lib/api/auth'
import { badRequest, internalError } from '@/lib/api/errors'

const COMPANY_KEYS = [
  'company_nama', 'company_bidang_usaha', 'company_alamat',
  'company_no_hp', 'company_email', 'company_logo_url', 'company_npwp',
  'penandatangan_nama', 'penandatangan_jabatan', 'penandatangan_no_hp',
  'tanda_tangan_url', 'stempel_url', 'tanda_tangan_stempel_url',
  'company_bank_name', 'company_rekening_nama', 'company_rekening_nomor',
] as const

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error

  const { data, error } = await supabaseAdmin
    .from('site_settings')
    .select('*')
    .in('key', COMPANY_KEYS)

  if (error) return internalError(error)

  const result: Record<string, string | null> = {}
  for (const key of COMPANY_KEYS) {
    result[key] = (data ?? []).find(r => r.key === key)?.value ?? null
  }

  return NextResponse.json({ data: result })
}

export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error

  const body = await request.json().catch(() => null)
  if (!body) return badRequest('Invalid JSON body')

  const now = new Date().toISOString()
  const upserts = COMPANY_KEYS
    .filter(key => body[key] !== undefined)
    .map(key => ({
      key,
      value: String(body[key]),
      updated_at: now,
    }))

  if (upserts.length === 0) return badRequest('Tidak ada data yang diupdate')

  const { error } = await supabaseAdmin
    .from('site_settings')
    .upsert(upserts, { onConflict: 'key' })

  if (error) return internalError(error)

  return NextResponse.json({ message: 'Pengaturan berhasil disimpan' })
}
