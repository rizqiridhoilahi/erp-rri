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
  if (!profile?.customer_id) return NextResponse.json({ data: { documents: [], stats: { total: 0, sph: 0, po: 0, invoice: 0 } } })

  const customerId = profile.customer_id
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'all'
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = 10
  const offset = (page - 1) * limit

  const documents: {
    id: string
    type: string
    nomor: string
    tanggal: string
    status: string
    pdfUrl: string | null
  }[] = []

  // Fetch SPH (quotation)
  if (type === 'all' || type === 'sph') {
    const { data: sphs } = await supabaseAdmin
      .from('quotation')
      .select('id, nomor, tanggal, status')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1)
    if (sphs) {
      for (const sph of sphs) {
        documents.push({
          id: `pdf-quotation-${sph.id}`,
          type: 'SPH',
          nomor: sph.nomor,
          tanggal: sph.tanggal,
          status: sph.status === 'approved' ? 'approved' : sph.status,
          pdfUrl: `/api/v1/quotation/${sph.id}/pdf`,
        })
      }
    }
  }

  // Fetch PO (customer_po)
  if (type === 'all' || type === 'po') {
    const { data: pos } = await supabaseAdmin
      .from('customer_po')
      .select('id, nomor, tanggal, status')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1)
    if (pos) {
      for (const po of pos) {
        documents.push({
          id: `pdf-customer-po-${po.id}`,
          type: 'PO',
          nomor: po.nomor,
          tanggal: po.tanggal,
          status: po.status,
          pdfUrl: `/api/v1/customer-po/${po.id}/pdf`,
        })
      }
    }
  }

  // Fetch Invoice
  if (type === 'all' || type === 'invoice') {
    const { data: invoices } = await supabaseAdmin
      .from('invoice')
      .select('id, nomor, tanggal, status')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1)
    if (invoices) {
      for (const inv of invoices) {
        documents.push({
          id: `pdf-invoice-${inv.id}`,
          type: 'Invoice',
          nomor: inv.nomor,
          tanggal: inv.tanggal,
          status: inv.status,
          pdfUrl: `/api/v1/invoice/${inv.id}/pdf`,
        })
      }
    }
  }

  // Sort by date descending
  documents.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())

  return NextResponse.json({
    data: {
      documents: documents.slice(0, limit),
      stats: {
        total: documents.length,
        sph: documents.filter(d => d.type === 'SPH').length,
        po: documents.filter(d => d.type === 'PO').length,
        invoice: documents.filter(d => d.type === 'Invoice').length,
      },
      page,
      hasMore: documents.length > limit,
    },
  })
}
