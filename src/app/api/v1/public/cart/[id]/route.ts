import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { requireCustomerAuth } from '@/lib/api/public-auth'
import { badRequest, internalError, notFound } from '@/lib/api/errors'

const updateSchema = z.object({
  quantity: z.number().int().min(1).optional(),
  catatan_spesifik: z.string().optional(),
})

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireCustomerAuth(request)
  if (auth.error) return auth.error

  const { id } = await params

  const body = await request.json().catch(() => null)
  if (!body) return badRequest('Invalid JSON body')

  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return badRequest(parsed.error.issues.map(i => i.message).join(', '))

  const { data: existing } = await supabaseAdmin
    .from('customer_inquiry_cart')
    .select('id')
    .eq('id', id)
    .eq('auth_user_id', auth.user!.id)
    .maybeSingle()

  if (!existing) return notFound('Item tidak ditemukan di keranjang')

  const updates: Record<string, unknown> = {}
  if (parsed.data.quantity !== undefined) updates.quantity = parsed.data.quantity
  if (parsed.data.catatan_spesifik !== undefined) updates.catatan_spesifik = parsed.data.catatan_spesifik

  const { error } = await supabaseAdmin
    .from('customer_inquiry_cart')
    .update(updates)
    .eq('id', id)

  if (error) return internalError(error)

  return NextResponse.json({ data: { message: 'Keranjang diperbarui' } })
}
