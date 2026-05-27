import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { verifyAuth } from '@/lib/api/auth'
import { badRequest, notFound } from '@/lib/api/errors'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error

  const { id } = await params
  const body = await request.json().catch(() => null)
  if (!body) return badRequest('Invalid JSON body')

  const schema = z.object({
    scanned_items: z.array(z.object({
      delivery_order_item_id: z.string().min(1, 'Item ID wajib diisi'),
      kode: z.string().min(1, 'Kode barang wajib diisi'),
    })).optional(),
  })
  const parsed = schema.safeParse(body)
  if (!parsed.success) return badRequest(parsed.error.issues.map(e => e.message).join(', '))

  const { data: doDoc, error: doError } = await supabaseAdmin
    .from('delivery_order')
    .select('id, nomor, status')
    .eq('id', (await params).id)
    .single()

  if (doError || !doDoc) return notFound('Delivery Order tidak ditemukan')

  const scannedItems = parsed.data.scanned_items
  const now = new Date().toISOString()

  const kodeList = (scannedItems ?? []).map((item: { kode: string }) => item.kode).join(', ')

  await supabaseAdmin
    .from('audit_log')
    .insert({
      module: 'delivery_order',
      action: 'scan',
      record_id: id,
      user_id: auth.user?.id ?? null,
      keterangan: `Scan DO ${doDoc.nomor} - ${scannedItems?.length ?? 0} item di-scan: [${kodeList}]`,
      created_at: now,
    })

  return NextResponse.json({ data: { message: 'Scan berhasil disimpan', scanned_count: scannedItems?.length ?? 0 } })
}