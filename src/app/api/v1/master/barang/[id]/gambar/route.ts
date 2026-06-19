import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/api/auth'
import { badRequest, internalError, notFound } from '@/lib/api/errors'
import { storageService } from '@/lib/storage'
import { supabaseAdmin } from '@/lib/api/supabase-server'

function extractStoragePath(url: string): string | null {
  const r2Match = url.match(/^https:\/\/files\.erp\.pt-rri\.com\/(.+)/)
  if (r2Match) return r2Match[1]
  const supabaseMatch = url.match(/\/public\/dokumen\/(.+)/)
  if (supabaseMatch) return supabaseMatch[1]
  return null
}

async function getNextUrutan(barangId: string): Promise<number> {
  const { data: existing } = await supabaseAdmin
    .from('barang_gambar')
    .select('urutan')
    .eq('barang_id', barangId)
    .order('urutan', { ascending: false })
    .limit(1)
  return (existing?.[0]?.urutan ?? -1) + 1
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(_request)
  if (auth.error) return auth.error

  const { id } = await params

  const { data: images, error } = await supabaseAdmin
    .from('barang_gambar')
    .select('*')
    .eq('barang_id', id)
    .order('urutan', { ascending: true })

  if (error) return internalError(error)
  return NextResponse.json({ data: images ?? [] })
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error

  const { id } = await params

  const { data: barang } = await supabaseAdmin
    .from('barang').select('id').eq('id', id).single()
  if (!barang) return notFound('Barang tidak ditemukan')

  const formData = await request.formData().catch(() => null)
  if (!formData) return badRequest('Invalid form data')

  const file = formData.get('file') as File | null
  if (!file) return badRequest('File harus diupload')

  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) return badRequest('Ukuran file maksimal 5MB')

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) return badRequest('Gambar harus JPG, PNG, atau WebP')

  const urutan = await getNextUrutan(id)
  const isPrimaryParam = formData.get('is_primary') === 'true'

  const timestamp = Date.now()
  const filePath = `barang/${id}/${timestamp}-${urutan}.webp`
  const buffer = Buffer.from(await file.arrayBuffer())

  let uploadResult
  try {
    uploadResult = await storageService.upload(buffer, filePath, 'image/webp')
  } catch (err) {
    return internalError('Gagal upload file: ' + (err instanceof Error ? err.message : 'unknown error'))
  }

  if (isPrimaryParam) {
    await supabaseAdmin
      .from('barang_gambar')
      .update({ is_primary: false })
      .eq('barang_id', id)
  }

  const { data: newImage, error } = await supabaseAdmin
    .from('barang_gambar')
    .insert({
      barang_id: id,
      url: uploadResult.webViewLink,
      urutan,
      is_primary: isPrimaryParam,
    })
    .select()
    .single()

  if (error) return internalError(error)

  return NextResponse.json({ data: newImage }, { status: 201 })
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error

  const { id } = await params
  const body = await request.json().catch(() => null)
  if (!body) return badRequest('Invalid JSON body')

  const { gambar_id, urutan, is_primary } = body
  if (!gambar_id) return badRequest('gambar_id required')
  if (urutan === undefined && is_primary === undefined) return badRequest('urutan or is_primary required')

  const updateData: Record<string, unknown> = {}
  if (typeof urutan === 'number') updateData.urutan = urutan
  if (typeof is_primary === 'boolean') {
    if (is_primary) {
      await supabaseAdmin
        .from('barang_gambar')
        .update({ is_primary: false })
        .eq('barang_id', id)
    }
    updateData.is_primary = is_primary
  }

  const { data: updated, error } = await supabaseAdmin
    .from('barang_gambar')
    .update(updateData)
    .eq('id', gambar_id)
    .eq('barang_id', id)
    .select()
    .single()

  if (error) return internalError(error)
  if (!updated) return notFound('Gambar tidak ditemukan')
  return NextResponse.json({ data: updated })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error

  const { id } = await params
  const { searchParams } = new URL(request.url)
  const gambarId = searchParams.get('gambar_id')
  if (!gambarId) return badRequest('gambar_id query param required')

  const { data: image } = await supabaseAdmin
    .from('barang_gambar')
    .select('id, url')
    .eq('id', gambarId)
    .eq('barang_id', id)
    .single()

  if (!image) return notFound('Gambar tidak ditemukan')

  if (image.url) {
    const path = extractStoragePath(image.url)
    if (path) {
      await storageService.delete(path).catch(() => {})
    }
  }

  const { error } = await supabaseAdmin
    .from('barang_gambar')
    .delete()
    .eq('id', gambarId)

  if (error) return internalError(error)
  return NextResponse.json({ data: { message: 'Gambar berhasil dihapus' } })
}
