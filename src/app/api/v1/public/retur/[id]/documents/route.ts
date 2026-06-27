import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { storageService } from '@/lib/storage/r2'
import { internalError, unauthorized, badRequest, notFound } from '@/lib/api/errors'

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authHeader = _request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return unauthorized()

  const token = authHeader.slice(7)
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
  if (authError || !user) return unauthorized()

  const { data: profile } = await supabaseAdmin
    .from('customer_profiles')
    .select('customer_id')
    .eq('auth_user_id', user.id)
    .maybeSingle()
  if (!profile?.customer_id) return unauthorized()

  const { id } = await params

  const { data: retur } = await supabaseAdmin
    .from('retur_penjualan')
    .select('id, customer_id')
    .eq('id', id)
    .eq('customer_id', profile.customer_id)
    .maybeSingle()
  if (!retur) return notFound('Retur tidak ditemukan')

  const form = await _request.formData().catch(() => null)
  if (!form) return badRequest('Invalid form data')

  const file = form.get('file') as File | null
  if (!file) return badRequest('File tidak ditemukan')

  const ext = file.name.split('.').pop() || 'jpg'
  const filePath = `dokumen/retur-penjualan/${id}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const result = await storageService.upload(buffer, filePath, file.type)

  const { data: doc, error: docError } = await supabaseAdmin
    .from('retur_penjualan_document')
    .insert({
      retur_penjualan_id: id,
      file_name: file.name,
      file_url: result.webViewLink,
    })
    .select()
    .single()

  if (docError) return internalError(docError)

  return NextResponse.json({ data: doc }, { status: 201 })
}
