import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { verifyAuth } from '@/lib/api/auth'
import { badRequest, internalError } from '@/lib/api/errors'

const itemSchema = z.object({
  deskripsi: z.string().min(1),
  persentase: z.coerce.number().positive(),
  due_days: z.coerce.number().int().min(0),
})

const createSchema = z.object({
  nama: z.string().min(1, 'Nama payment term harus diisi'),
  items: z.array(itemSchema).min(1, 'Minimal 1 termin'),
})

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error

  const { data, error } = await supabaseAdmin
    .from('payment_term')
    .select('*, payment_term_item(*)')
    .order('created_at', { ascending: false })
  if (error) return internalError(error)
  return NextResponse.json({ data: data ?? [] })
}

export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error

  const body = await request.json().catch(() => null)
  if (!body) return badRequest('Invalid JSON body')
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return badRequest(parsed.error.issues.map(e => e.message).join(', '))

  const now = new Date().toISOString()
  const { data: term, error: termError } = await supabaseAdmin
    .from('payment_term')
    .insert({ nama: parsed.data.nama, created_at: now, updated_at: now })
    .select()
    .single()
  if (termError) return internalError(termError)

  const items = parsed.data.items.map((item, idx) => ({
    payment_term_id: term.id,
    urutan: idx + 1,
    deskripsi: item.deskripsi,
    persentase: item.persentase,
    due_days: item.due_days,
    created_at: now,
  }))
  const { error: itemsError } = await supabaseAdmin.from('payment_term_item').insert(items)
  if (itemsError) {
    await supabaseAdmin.from('payment_term').delete().eq('id', term.id)
    return internalError(itemsError)
  }

  const { data: fullTerm } = await supabaseAdmin
    .from('payment_term')
    .select('*, payment_term_item(*)')
    .eq('id', term.id)
    .single()

  return NextResponse.json({ data: fullTerm }, { status: 201 })
}
