import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { verifyAuth } from '@/lib/api/auth'
import { notFound, badRequest, internalError } from '@/lib/api/errors'
import { z } from 'zod'

const schema = z.object({
  is_rejected: z.boolean(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error

  const { id, itemId } = await params

  const body = await request.json().catch(() => null)
  if (!body) return badRequest('Invalid JSON body')
  const parsed = schema.safeParse(body)
  if (!parsed.success) return badRequest(parsed.error.issues.map(e => e.message).join(', '))

  const { data: neg } = await supabaseAdmin
    .from('negoiasi')
    .select('status')
    .eq('id', id)
    .single()

  if (!neg) return notFound('Negosiasi tidak ditemukan')
  if (neg.status !== 'draft') return badRequest('Status negosiasi bukan draft')

  const { data: item } = await supabaseAdmin
    .from('negoiasi_item')
    .select('id')
    .eq('id', itemId)
    .eq('negoiasi_id', id)
    .single()

  if (!item) return notFound('Item negosiasi tidak ditemukan')

  const { error } = await supabaseAdmin
    .from('negoiasi_item')
    .update({ is_rejected: parsed.data.is_rejected })
    .eq('id', itemId)

  if (error) return internalError(error)

  return NextResponse.json({ data: { is_rejected: parsed.data.is_rejected } })
}
