import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { notFound, internalError } from '@/lib/api/errors'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: barang, error } = await supabaseAdmin
    .from('barang')
    .select('id, nama, kode, satuan, spesifikasi, image_url, deskripsi_katalog, spesifikasi_teknis, kategori_barang!kategori_id(nama)')
    .eq('id', id)
    .eq('is_published_to_catalog', true)
    .eq('is_active', true)
    .single()

  if (error) return internalError(error)
  if (!barang) return notFound('Produk tidak ditemukan')

  const { data: gambar } = await supabaseAdmin
    .from('barang_gambar')
    .select('id, url, urutan, is_primary')
    .eq('barang_id', id)
    .order('urutan', { ascending: true })

  return NextResponse.json({
    data: {
      ...barang,
      gambar: gambar ?? [],
    },
  })
}
