import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyAuth } from '@/lib/api/auth'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { badRequest, internalError } from '@/lib/api/errors'

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error

  const { searchParams } = new URL(request.url)
  const supplierId = searchParams.get('supplier_id')
  let query = supabaseAdmin.from('supplier_payment').select('*, supplier!supplier_id(nama)').order('created_at', { ascending: false })
  if (supplierId) query = query.eq('supplier_id', supplierId)
  const { data, error } = await query
  if (error) return internalError(error.message)
  return NextResponse.json({ data })
}

const createSchema = z.object({
  purchaseOrderId: z.string().min(1, 'PO wajib diisi'),
  supplierId: z.string().min(1, 'Supplier wajib diisi'),
  nominal: z.number().min(1, 'Nominal wajib diisi'),
  tanggalBayar: z.string().min(1, 'Tanggal bayar wajib diisi'),
  metode: z.string().optional(),
  buktiTransfer: z.string().optional(),
  keterangan: z.string().optional(),
})

export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error
  const body = await request.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return badRequest(parsed.error.issues.map(e => e.message).join(', '))

  const { data, error } = await supabaseAdmin.from('supplier_payment').insert({
    purchase_order_id: parsed.data.purchaseOrderId,
    supplier_id: parsed.data.supplierId,
    nominal: parsed.data.nominal,
    tanggal_bayar: parsed.data.tanggalBayar,
    metode: parsed.data.metode ?? 'transfer',
    bukti_transfer: parsed.data.buktiTransfer ?? null,
    keterangan: parsed.data.keterangan ?? null,
  }).select().single()
  if (error) return internalError(error.message)
  return NextResponse.json({ data })
}
