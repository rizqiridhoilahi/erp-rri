import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/api/auth'
import { badRequest, internalError, notFound } from '@/lib/api/errors'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { storageService } from '@/lib/storage'

function extractStoragePath(url: string): string | null {
  const r2Match = url.match(/^https:\/\/files\.erp\.pt-rri\.com\/(.+)/)
  if (r2Match) return r2Match[1]
  return null
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error

  const { id } = await params

  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('client_logo')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !existing) return notFound('Logo tidak ditemukan')

  const formData = await request.formData().catch(() => null)
  if (!formData) return badRequest('Invalid form data')

  const file = formData.get('file') as File | null
  const altText = formData.get('alt_text') as string | null
  const urutan = formData.get('urutan') as string | null

  let newFileUrl = existing.file_url

  if (file) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) return badRequest('Gambar harus JPG, PNG, atau WebP')

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) return badRequest('Ukuran file maksimal 5MB')

    const oldPath = extractStoragePath(existing.file_url)
    if (oldPath) {
      await storageService.delete(oldPath).catch(() => {})
    }

    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const filePath = `dokumen/logo-klien/${timestamp}_${safeName}`
    const buffer = Buffer.from(await file.arrayBuffer())

    try {
      const uploadResult = await storageService.upload(buffer, filePath, file.type)
      newFileUrl = uploadResult.webViewLink
    } catch (err) {
      return internalError('Gagal upload: ' + (err instanceof Error ? err.message : 'unknown error'))
    }
  }

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (altText !== null && altText.trim()) updates.alt_text = altText.trim()
  if (urutan !== null) updates.urutan = parseInt(urutan, 10)
  if (newFileUrl !== existing.file_url) updates.file_url = newFileUrl

  const { data: updated, error: updateError } = await supabaseAdmin
    .from('client_logo')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (updateError) return internalError(updateError)

  return NextResponse.json({ data: updated })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error

  const { id } = await params

  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('client_logo')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !existing) return notFound('Logo tidak ditemukan')

  const path = extractStoragePath(existing.file_url)
  if (path) {
    await storageService.delete(path).catch(() => {})
  }

  const { error: deleteError } = await supabaseAdmin
    .from('client_logo')
    .delete()
    .eq('id', id)

  if (deleteError) return internalError(deleteError)

  return NextResponse.json({ data: { message: 'Logo berhasil dihapus' } })
}
