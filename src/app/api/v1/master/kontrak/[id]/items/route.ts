import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { verifyAuth } from '@/lib/api/auth'
import { badRequest, internalError } from '@/lib/api/errors'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(_request)
  if (auth.error) return auth.error
  const { id } = await params
  const { data, error } = await supabaseAdmin.from('kontrak_item')
    .select('*')
    .eq('kontrak_id', id)
    .order('created_at', { ascending: true })
  if (error) return internalError(error)
  return NextResponse.json({ data: data ?? [] })
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error
  const { id } = await params

  const body = await request.json().catch(() => null)
  if (!body) return badRequest('Invalid JSON body')

  const items = body.items as Array<{
    barang_id?: string
    kode_barang: string
    nama_barang: string
    satuan: string
    harga_satuan: number
  }> | undefined

  if (!Array.isArray(items) || items.length === 0) {
    return badRequest('items harus array dengan minimal 1 item')
  }

  const now = new Date().toISOString()
  const rows = items.map(item => ({
    id: crypto.randomUUID(),
    kontrak_id: id,
    barang_id: item.barang_id ?? null,
    kode_barang: item.kode_barang,
    nama_barang: item.nama_barang,
    satuan: item.satuan,
    harga_satuan: item.harga_satuan,
    created_at: now,
    updated_at: now,
  }))

  const { error: insertError } = await supabaseAdmin.from('kontrak_item').insert(rows)
  if (insertError) return internalError(insertError.message)

  return NextResponse.json({ data: rows, count: rows.length }, { status: 201 })
}
