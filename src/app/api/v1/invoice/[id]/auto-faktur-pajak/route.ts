import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { verifyAuth } from '@/lib/api/auth'
import { badRequest, notFound, internalError } from '@/lib/api/errors'
import { generateFakturPajakFromInvoice } from '@/lib/auto-faktur-pajak'

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(_request)
  if (auth.error) return auth.error
  const { id } = await params

  const body = await _request.json().catch(() => null)
  if (!body) return badRequest('Invalid JSON body')
  if (!body.nomor_faktur) return badRequest('Nomor faktur wajib diisi')

  const result = await generateFakturPajakFromInvoice(id, body.nomor_faktur)
  if (!result.success) {
    if (result.error === 'Invoice not found') return notFound('Invoice tidak ditemukan')
    if (result.error === 'No items') return badRequest('Invoice tidak memiliki item')
    return internalError(result.error ?? 'Gagal membuat Faktur Pajak')
  }

  return NextResponse.json({ data: result.fakturPajak }, { status: 201 })
}
