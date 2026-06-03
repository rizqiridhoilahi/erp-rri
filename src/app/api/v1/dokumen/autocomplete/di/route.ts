import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { verifyAuth } from '@/lib/api/auth'
import { internalError } from '@/lib/api/errors'

interface DiRow {
  id: string
  nomor: string
  customer_id: string
  customer: { nama: string } | null
}

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error

  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') ?? ''

  const { data, error } = await supabaseAdmin
    .from('di')
    .select('id, nomor, customer_id, customer:customer_id(nama)')
    .ilike('nomor', `%${q}%`)
    .order('nomor')
    .limit(20)

  if (error) return internalError(error)

  const result = (data as unknown as DiRow[] ?? []).map((r) => ({
    id: r.id,
    nomor: r.nomor,
    customer_id: r.customer_id,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    customer_nama: (r.customer as any)?.nama ?? '',
  }))

  return NextResponse.json({ data: result })
}
