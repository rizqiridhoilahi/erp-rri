import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { verifyAuth } from '@/lib/api/auth'
import { internalError } from '@/lib/api/errors'

async function resolveDiNomor(diNomor: string): Promise<string[]> {
  const { data: di } = await supabaseAdmin
    .from('di')
    .select('id, kontrak_id')
    .eq('nomor', diNomor)
    .maybeSingle()

  if (!di) return []

  const uuids: string[] = [di.id]
  if (di.kontrak_id) uuids.push(di.kontrak_id)

  const { data: soList } = await supabaseAdmin
    .from('sales_order')
    .select('id')
    .eq('di_id', di.id)

  const soIds = (soList ?? []).map(s => s.id)
  uuids.push(...soIds)

  if (soIds.length > 0) {
    const [doResult, invResult] = await Promise.all([
      supabaseAdmin.from('delivery_order').select('id').in('sales_order_id', soIds),
      supabaseAdmin.from('invoice').select('id').in('sales_order_id', soIds),
    ])

    const doIds = (doResult.data ?? []).map(d => d.id)
    const invIds = (invResult.data ?? []).map(i => i.id)
    uuids.push(...doIds, ...invIds)

    if (invIds.length > 0) {
      const { data: kwList } = await supabaseAdmin
        .from('kwitansi')
        .select('id')
        .in('invoice_id', invIds)
      uuids.push(...(kwList ?? []).map(k => k.id))
    }

    if (doIds.length > 0) {
      const [rpResult, gcByDoResult] = await Promise.all([
        supabaseAdmin.from('retur_penjualan').select('id').in('delivery_order_id', doIds),
        supabaseAdmin.from('grn_customer').select('id').in('delivery_order_id', doIds),
      ])

      const rpIds = (rpResult.data ?? []).map(r => r.id)
      uuids.push(...rpIds)

      const gcIds = (gcByDoResult.data ?? []).map(g => g.id)
      uuids.push(...gcIds)

      if (rpIds.length > 0) {
        const { data: gcByRpList } = await supabaseAdmin
          .from('grn_customer')
          .select('id')
          .in('retur_penjualan_id', rpIds)
        uuids.push(...(gcByRpList ?? []).map(g => g.id))
      }
    }
  }

  return [...new Set(uuids)]
}

async function resolvePoNomor(poNomor: string): Promise<string[]> {
  const { data: cpo } = await supabaseAdmin
    .from('customer_po')
    .select('id, quotation_id')
    .eq('nomor', poNomor)
    .maybeSingle()

  if (!cpo) return []

  const uuids: string[] = [cpo.id]
  if (cpo.quotation_id) {
    uuids.push(cpo.quotation_id)
    const { data: q } = await supabaseAdmin
      .from('quotation')
      .select('rfq_id')
      .eq('id', cpo.quotation_id)
      .maybeSingle()
    if (q?.rfq_id) uuids.push(q.rfq_id)
  }

  const { data: soList } = await supabaseAdmin
    .from('sales_order')
    .select('id, di_id')
    .eq('customer_po_id', cpo.id)

  const soIds = (soList ?? []).map(s => s.id)
  uuids.push(...soIds)

  for (const so of soList ?? []) {
    if (so.di_id) {
      uuids.push(so.di_id)
      const { data: di } = await supabaseAdmin
        .from('di')
        .select('kontrak_id')
        .eq('id', so.di_id)
        .maybeSingle()
      if (di?.kontrak_id) uuids.push(di.kontrak_id)
    }
  }

  if (soIds.length > 0) {
    const [doResult, invResult] = await Promise.all([
      supabaseAdmin.from('delivery_order').select('id').in('sales_order_id', soIds),
      supabaseAdmin.from('invoice').select('id').in('sales_order_id', soIds),
    ])

    const doIds = (doResult.data ?? []).map(d => d.id)
    const invIds = (invResult.data ?? []).map(i => i.id)
    uuids.push(...doIds, ...invIds)

    if (invIds.length > 0) {
      const { data: kwList } = await supabaseAdmin
        .from('kwitansi')
        .select('id')
        .in('invoice_id', invIds)
      uuids.push(...(kwList ?? []).map(k => k.id))
    }

    if (doIds.length > 0) {
      const [rpResult, gcByDoResult] = await Promise.all([
        supabaseAdmin.from('retur_penjualan').select('id').in('delivery_order_id', doIds),
        supabaseAdmin.from('grn_customer').select('id').in('delivery_order_id', doIds),
      ])

      const rpIds = (rpResult.data ?? []).map(r => r.id)
      uuids.push(...rpIds)

      const gcIds = (gcByDoResult.data ?? []).map(g => g.id)
      uuids.push(...gcIds)

      if (rpIds.length > 0) {
        const { data: gcByRpList } = await supabaseAdmin
          .from('grn_customer')
          .select('id')
          .in('retur_penjualan_id', rpIds)
        uuids.push(...(gcByRpList ?? []).map(g => g.id))
      }
    }
  }

  return [...new Set(uuids)]
}

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error

  const { searchParams } = new URL(request.url)
  const customerId = searchParams.get('customerId')
  const modul = searchParams.get('modul')
  const search = searchParams.get('search')
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')
  const diNomor = searchParams.get('diNomor')
  const poNomor = searchParams.get('poNomor')

  let recordIds: string[] | null = null

  if (diNomor) {
    recordIds = await resolveDiNomor(diNomor)
    if (recordIds.length === 0) {
      return NextResponse.json({ data: [], count: 0 })
    }
  }

  if (poNomor) {
    const poIds = await resolvePoNomor(poNomor)
    if (poIds.length === 0) {
      return NextResponse.json({ data: [], count: 0 })
    }
    recordIds = recordIds
      ? recordIds.filter(id => poIds.includes(id))
      : poIds
  }

  let query = supabaseAdmin
    .from('all_documents')
    .select('*', { count: 'exact' })

  if (recordIds) {
    query = query.in('recordid', recordIds)
  }

  if (customerId) {
    query = query.eq('customerid', customerId)
  }

  if (modul) {
    query = query.eq('modul', modul)
  }

  if (search) {
    query = query.ilike('filename', `%${search}%`)
  }

  if (startDate) {
    query = query.gte('uploadedat', startDate)
  }

  if (endDate) {
    query = query.lte('uploadedat', `${endDate}T23:59:59.999Z`)
  }

  query = query.order('uploadedat', { ascending: false })

  const { data, error, count } = await query

  if (error) return internalError(error)

  return NextResponse.json({
    data: data ?? [],
    count: count ?? 0,
  })
}
