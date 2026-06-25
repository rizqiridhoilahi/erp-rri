import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { badRequest } from '@/lib/api/errors'

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email')?.trim().toLowerCase()

  if (!email) {
    return badRequest('Parameter email wajib diisi')
  }

  const { data: pic, error } = await supabaseAdmin
    .from('customer_pic')
    .select(`
      nama,
      email,
      no_hp,
      customer_id,
      customer:customer_id (
        nama,
        alamat
      )
    `)
    .ilike('email', email)
    .maybeSingle()

  if (error) {
    console.error('Error looking up PIC:', error)
    return NextResponse.json({ error: 'Gagal mencari data PIC' }, { status: 500 })
  }

  if (!pic) {
    return NextResponse.json({ data: null })
  }

  const customerArr = pic.customer as { nama: string; alamat: string }[] | null
  const customer = customerArr?.[0]

  return NextResponse.json({
    data: {
      nama_pic: pic.nama,
      email: pic.email,
      no_hp: pic.no_hp,
      nama_perusahaan: customer?.nama ?? '',
      alamat_perusahaan: customer?.alamat ?? '',
    },
  })
}
