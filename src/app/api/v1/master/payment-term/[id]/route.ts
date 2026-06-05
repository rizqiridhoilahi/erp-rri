import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { verifyAuth } from '@/lib/api/auth'
import { badRequest, notFound, internalError } from '@/lib/api/errors'

const itemSchema = z.object({
  deskripsi: z.string().min(1),
  persentase: z.coerce.number().positive(),
  due_days: z.coerce.number().int().min(0),
})

const updateSchema = z.object({
  nama: z.string().min(1).optional(),
  items: z.array(itemSchema).optional(),
})

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(_request); if (auth.error) return auth.error
  const { id } = await params
  const { data, error } = await supabaseAdmin
    .from('payment_term')
    .select('*, payment_term_item(*)')
    .eq('id', id)
    .single()
  if (error) return internalError(error)
  if (!data) return notFound('Payment term tidak ditemukan')
  return NextResponse.json({ data })
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error
  const { id } = await params

  const body = await request.json().catch(() => null)
  if (!body) return badRequest('Invalid JSON body')
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return badRequest(parsed.error.issues.map(e => e.message).join(', '))

  if (parsed.data.nama) {
    const { error } = await supabaseAdmin.from('payment_term').update({ nama: parsed.data.nama, updated_at: new Date().toISOString() }).eq('id', id)
    if (error) return internalError(error)
  }

  if (parsed.data.items) {
    await supabaseAdmin.from('payment_term_item').delete().eq('payment_term_id', id)
    const now = new Date().toISOString()
    const items = parsed.data.items.map((item, idx) => ({
      payment_term_id: id,
      urutan: idx + 1,
      deskripsi: item.deskripsi,
      persentase: item.persentase,
      due_days: item.due_days,
      created_at: now,
    }))
    const { error } = await supabaseAdmin.from('payment_term_item').insert(items)
    if (error) return internalError(error)
  }

  const { data } = await supabaseAdmin.from('payment_term').select('*, payment_term_item(*)').eq('id', id).single()
  return NextResponse.json({ data })
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(_request); if (auth.error) return auth.error
  const { id } = await params
  const { error } = await supabaseAdmin.from('payment_term').delete().eq('id', id)
  if (error) return internalError(error)
  return new NextResponse(null, { status: 204 })
}
