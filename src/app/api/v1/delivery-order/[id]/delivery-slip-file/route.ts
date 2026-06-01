import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { verifyAuth } from '@/lib/api/auth'
import { badRequest, notFound, internalError } from '@/lib/api/errors'
import { storageService } from '@/lib/storage'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error

  const { id } = await params

  const { data: doDoc } = await supabaseAdmin
    .from('delivery_order')
    .select('id, delivery_slip_file_url')
    .eq('id', id)
    .single()
  if (!doDoc) return notFound('Delivery Order tidak ditemukan')

  const formData = await request.formData().catch(() => null)
  if (!formData) return badRequest('Invalid form data')

  const file = formData.get('file') as File | null
  if (!file) return badRequest('File harus diupload')

  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) return badRequest('Ukuran file maksimal 10MB')

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  if (!allowedTypes.includes(file.type)) return badRequest('File harus JPG, PNG, WebP, atau PDF')

  if (doDoc.delivery_slip_file_url) {
    const match = doDoc.delivery_slip_file_url.match(/\/public\/dokumen\/(.+)/)
    if (match) {
      await storageService.delete(match[1]).catch(() => {})
    }
  }

  const timestamp = Date.now()
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const filePath = `dokumen/delivery-order/${id}/delivery-slip-${timestamp}-${safeName}`
  const buffer = Buffer.from(await file.arrayBuffer())

  let uploadResult
  try {
    uploadResult = await storageService.upload(buffer, filePath, file.type)
  } catch (err) {
    return internalError('Gagal upload file: ' + (err instanceof Error ? err.message : 'unknown error'))
  }

  await supabaseAdmin
    .from('delivery_order')
    .update({ delivery_slip_file_url: uploadResult.webViewLink, updated_at: new Date().toISOString() })
    .eq('id', id)

  return NextResponse.json({ data: { fileUrl: uploadResult.webViewLink } })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error

  const { id } = await params

  const { data: doDoc } = await supabaseAdmin
    .from('delivery_order')
    .select('id, delivery_slip_file_url')
    .eq('id', id)
    .single()
  if (!doDoc) return notFound('Delivery Order tidak ditemukan')

  if (doDoc.delivery_slip_file_url) {
    const match = doDoc.delivery_slip_file_url.match(/\/public\/dokumen\/(.+)/)
    if (match) {
      await storageService.delete(match[1]).catch(() => {})
    }
  }

  await supabaseAdmin
    .from('delivery_order')
    .update({ delivery_slip_file_url: null, updated_at: new Date().toISOString() })
    .eq('id', id)

  return NextResponse.json({ data: { message: 'File berhasil dihapus' } })
}
