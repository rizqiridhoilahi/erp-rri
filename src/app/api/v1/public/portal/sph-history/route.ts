import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { internalError, unauthorized } from '@/lib/api/errors'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return unauthorized()

  const token = authHeader.slice(7)
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
  if (authError || !user) return unauthorized()

  const { data: profile } = await supabaseAdmin
    .from('customer_profiles')
    .select('customer_id')
    .eq('auth_user_id', user.id)
    .maybeSingle()
  if (!profile?.customer_id) return NextResponse.json({ data: { rfqs: [], stats: { total: 0, approved: 0, pending: 0, revised: 0 } } })

  const customerId = profile.customer_id
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = 10
  const offset = (page - 1) * limit
  const search = searchParams.get('search') || ''

  // Get RFQs for this customer
  let query = supabaseAdmin
    .from('rfq_customer')
    .select('*, quotation!quotation_rfq_customer_id_fkey(id, nomor, status, customer_id)')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(`nomor.ilike.%${search}%,keterangan.ilike.%${search}%`)
  }

  const { data: rfqs, error } = await query
  if (error) return internalError(error)

  // Map to SPH history entries
  const entries = (rfqs ?? []).map((rfq: Record<string, unknown>) => {
    const quotation = rfq.quotation as Record<string, unknown> | null
    const quotationStatus = quotation?.status as string | null ?? 'pending'
    return {
      id: rfq.id,
      nomor: rfq.nomor,
      tanggal: rfq.created_at,
      keterangan: rfq.keterangan,
      status: quotationStatus,
      sphNomor: quotation?.nomor ?? null,
      sphId: quotation?.id ?? null,
      pdfUrl: quotation?.id ? `/api/v1/quotation/${quotation.id}/pdf` : null,
    }
  })

  const total = entries.length
  const approved = entries.filter(e => e.status === 'approved').length
  const pending = entries.filter(e => e.status === 'pending' || e.status === 'draft').length
  const revised = entries.filter(e => e.status === 'revised').length

  const paginated = entries.slice(offset, offset + limit)

  return NextResponse.json({
    data: {
      rfqs: paginated,
      stats: { total, approved, pending, revised },
      page,
      hasMore: offset + limit < total,
    },
  })
}
