import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/api/auth'
import { badRequest, internalError } from '@/lib/api/errors'
import { storageService } from '@/lib/storage'

export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error

  const formData = await request.formData().catch(() => null)
  if (!formData) return badRequest('Invalid form data')

  const file = formData.get('file') as File | null
  if (!file) return badRequest('File harus diupload')

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) return badRequest('Gambar harus JPG, PNG, atau WebP')

  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) return badRequest('Ukuran file maksimal 5MB')

  const timestamp = Date.now()
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const filePath = `company/${timestamp}_${safeName}`

  const buffer = Buffer.from(await file.arrayBuffer())

  let uploadResult
  try {
    uploadResult = await storageService.upload(buffer, filePath, file.type)
  } catch (err) {
    return internalError('Gagal upload: ' + (err instanceof Error ? err.message : 'unknown error'))
  }

  return NextResponse.json({
    data: {
      fileUrl: uploadResult.webViewLink,
      fileName: file.name,
    },
  }, { status: 201 })
}
