import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/api/auth'
import { badRequest, internalError } from '@/lib/api/errors'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { storageService } from '@/lib/storage'

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error

  const { searchParams } = new URL(request.url)
  const activeOnly = searchParams.get('active_only') === 'true'

  let query = supabaseAdmin
    .from('client_logo')
    .select('*')
    .order('urutan', { ascending: true })

  if (activeOnly) {
    query = query.eq('is_active', true)
  }

  const { data, error } = await query

  if (error) return internalError(error)

  return NextResponse.json({ data: data ?? [] })
}

export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error

  const formData = await request.formData().catch(() => null)
  if (!formData) return badRequest('Invalid form data')

  const file = formData.get('file') as File | null
  const altText = formData.get('alt_text') as string | null

  if (!file) return badRequest('File harus diupload')
  if (!altText || !altText.trim()) return badRequest('Nama perusahaan harus diisi')

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) return badRequest('Gambar harus JPG, PNG, atau WebP')

  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) return badRequest('Ukuran file maksimal 5MB')

  const timestamp = Date.now()
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const filePath = `dokumen/logo-klien/${timestamp}_${safeName}`
  const buffer = Buffer.from(await file.arrayBuffer())

  let uploadResult
  try {
    uploadResult = await storageService.upload(buffer, filePath, file.type)
  } catch (err) {
    return internalError('Gagal upload: ' + (err instanceof Error ? err.message : 'unknown error'))
  }

  const { data: maxExisting } = await supabaseAdmin
    .from('client_logo')
    .select('urutan')
    .order('urutan', { ascending: false })
    .limit(1)
    .single()

  const nextUrutan = (maxExisting?.urutan ?? -1) + 1
  const now = new Date().toISOString()

  const { data: record, error: insertError } = await supabaseAdmin
    .from('client_logo')
    .insert({
      alt_text: altText.trim(),
      file_url: uploadResult.webViewLink,
      urutan: nextUrutan,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single()

  if (insertError) {
    await storageService.delete(filePath).catch(() => {})
    return internalError(insertError)
  }

  return NextResponse.json({ data: record }, { status: 201 })
}
