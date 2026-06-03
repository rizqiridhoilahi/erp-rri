import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { verifyAuth } from '@/lib/api/auth'
import { internalError } from '@/lib/api/errors'

interface DiRow {
  id: string
  nomor: string
  nomor_di_customer: string | null
  customer: { nama: string } | null
}

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error

  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') ?? ''

  const { data, error } = await supabaseAdmin
    .from('di')
    .select('id, nomor, nomor_di_customer, customer:customer_id(nama)')
    .not('nomor_di_customer', 'is', null)
    .ilike('nomor_di_customer', `%${q}%`)
    .order('nomor_di_customer')
    .limit(20)

  if (error) return internalError(error)

  const result = (data as unknown as DiRow[] ?? []).map((r) => ({
    id: r.id,
    nomor: r.nomor,
    nomor_di_customer: r.nomor_di_customer,
    customer_nama: r.customer?.nama ?? '',
  }))

  return NextResponse.json({ data: result })
}
