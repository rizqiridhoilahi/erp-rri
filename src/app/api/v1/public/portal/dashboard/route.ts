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
    .select('*')
    .eq('auth_user_id', user.id)
    .maybeSingle()
  if (!profile) return unauthorized()

  const customerId = profile.customer_id

  // RFQ count
  let rfqCount = 0
  let recentRfqs: { id: string; nomor: string; status: string; createdAt: string }[] = []
  if (customerId) {
    const { data: rfqs } = await supabaseAdmin
      .from('rfq_customer')
      .select('id, nomor, status, created_at')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
      .limit(5)
    rfqCount = rfqs?.length ?? 0
    recentRfqs = (rfqs ?? []).map(r => ({ id: r.id, nomor: r.nomor, status: r.status, createdAt: r.created_at }))
  }

  // Document counts (SPH/PO/Invoice)
  let sphCount = 0
  let poCount = 0
  let invoiceCount = 0
  if (customerId) {
    const { data: sphs } = await supabaseAdmin
      .from('quotation')
      .select('id', { count: 'exact', head: true })
      .eq('customer_id', customerId)
    sphCount = sphs?.length ?? 0

    const { data: pos } = await supabaseAdmin
      .from('customer_po')
      .select('id', { count: 'exact', head: true })
      .eq('customer_id', customerId)
    poCount = pos?.length ?? 0

    const { data: invoices } = await supabaseAdmin
      .from('invoice')
      .select('id', { count: 'exact', head: true })
      .eq('customer_id', customerId)
    invoiceCount = invoices?.length ?? 0
  }

  return NextResponse.json({
    data: {
      profile: {
        id: profile.id,
        nama_perusahaan: profile.nama_perusahaan,
        penanggung_jawab_pic: profile.penanggung_jawab_pic,
        status_verifikasi: profile.status_verifikasi,
        customer_id: profile.customer_id,
      },
      stats: {
        rfqCount,
        sphCount,
        poCount,
        invoiceCount,
        totalDocuments: sphCount + poCount + invoiceCount,
      },
      recentRfqs,
    },
  })
}
