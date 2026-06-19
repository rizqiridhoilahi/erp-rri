import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { requireCustomerAuth } from '@/lib/api/public-auth'
import { badRequest, internalError } from '@/lib/api/errors'

const addItemSchema = z.object({
  barang_id: z.string().min(1, 'barang_id wajib diisi'),
  quantity: z.number().int().min(1, 'Quantity minimal 1'),
  catatan_spesifik: z.string().optional(),
})

export async function GET(request: NextRequest) {
  const auth = await requireCustomerAuth(request)
  if (auth.error) return auth.error

  const { data: items, error } = await supabaseAdmin
    .from('customer_inquiry_cart')
    .select('*, barang:barang_id(id, nama, kode, satuan, image_url)')
    .eq('auth_user_id', auth.user!.id)
    .order('created_at', { ascending: false })

  if (error) return internalError(error)

  return NextResponse.json({ data: items ?? [] })
}

export async function POST(request: NextRequest) {
  const auth = await requireCustomerAuth(request)
  if (auth.error) return auth.error

  const body = await request.json().catch(() => null)
  if (!body) return badRequest('Invalid JSON body')

  const parsed = addItemSchema.safeParse(body)
  if (!parsed.success) return badRequest(parsed.error.issues.map(i => i.message).join(', '))

  const { data: existing } = await supabaseAdmin
    .from('customer_inquiry_cart')
    .select('id, quantity')
    .eq('auth_user_id', auth.user!.id)
    .eq('barang_id', parsed.data.barang_id)
    .maybeSingle()

  if (existing) {
    const { error: updateError } = await supabaseAdmin
      .from('customer_inquiry_cart')
      .update({ quantity: existing.quantity + parsed.data.quantity })
      .eq('id', existing.id)

    if (updateError) return internalError(updateError)
    return NextResponse.json({ data: { message: 'Quantity diperbarui', id: existing.id } })
  }

  const { data: newItem, error: insertError } = await supabaseAdmin
    .from('customer_inquiry_cart')
    .insert({
      auth_user_id: auth.user!.id,
      barang_id: parsed.data.barang_id,
      quantity: parsed.data.quantity,
      catatan_spesifik: parsed.data.catatan_spesifik ?? null,
    })
    .select()
    .single()

  if (insertError) return internalError(insertError)

  return NextResponse.json({ data: newItem }, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  const auth = await requireCustomerAuth(request)
  if (auth.error) return auth.error

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) return badRequest('id parameter wajib diisi')

  const { error } = await supabaseAdmin
    .from('customer_inquiry_cart')
    .delete()
    .eq('id', id)
    .eq('auth_user_id', auth.user!.id)

  if (error) return internalError(error)

  return NextResponse.json({ data: { message: 'Item dihapus dari keranjang' } })
}
