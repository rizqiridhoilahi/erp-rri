import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/api/supabase-server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = Math.max(1, Math.min(50, parseInt(searchParams.get('limit') ?? '12')))
  const kategoriId = searchParams.get('kategori_id') ?? ''
  const search = searchParams.get('search') ?? ''

  const offset = (page - 1) * limit

  let query = supabaseAdmin
    .from('barang')
    .select('id, nama, kode, satuan, image_url, kategori_barang!kategori_id(nama), is_published_to_catalog, deskripsi_katalog', { count: 'exact' })
    .eq('is_published_to_catalog', true)
    .eq('is_active', true)

  if (search) {
    query = query.or(`nama.ilike.%${search}%,kode.ilike.%${search}%`)
  }

  if (kategoriId) {
    query = query.eq('kategori_id', kategoriId)
  }

  query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1)

  const { data: items, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data: categories } = await supabaseAdmin
    .from('kategori_barang')
    .select('id, nama')
    .order('nama')

  const totalPages = Math.ceil((count ?? 0) / limit)

  return NextResponse.json({
    data: {
      items: items ?? [],
      count: count ?? 0,
      page,
      totalPages,
      categories: categories ?? [],
    },
  })
}
