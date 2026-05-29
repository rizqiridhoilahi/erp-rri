import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { verifyAuth } from '@/lib/api/auth'
import { badRequest, notFound, internalError } from '@/lib/api/errors'

const VALID_STATUSES = ['draft', 'sent', 'proses_negosiasi', 'approved', 'rejected', 'closed'] as const

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  draft: ['sent', 'rejected'],
  sent: ['approved', 'rejected', 'proses_negosiasi'],
  proses_negosiasi: ['approved', 'rejected'],
  approved: ['closed'],
  rejected: ['draft'],
  closed: [],
}

function isValidTransition(from: string, to: string): boolean {
  if (from === to) return true
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false
}

const schema = z.object({
  status: z.enum(VALID_STATUSES, { message: 'Status tidak valid' }),
})

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error

  const { id } = await params
  const body = await request.json().catch(() => null)
  if (!body) return badRequest('Invalid JSON body')

  const parsed = schema.safeParse(body)
  if (!parsed.success) return badRequest(parsed.error.issues.map(e => e.message).join(', '))

  const { data: current } = await supabaseAdmin
    .from('quotation')
    .select('status')
    .eq('id', id)
    .single()

  if (!current) return notFound('Quotation tidak ditemukan')

  if (!isValidTransition(current.status, parsed.data.status)) {
    return badRequest(
      `Status tidak bisa diubah dari '${current.status}' ke '${parsed.data.status}'`
    )
  }

  const { data, error } = await supabaseAdmin
    .from('quotation')
    .update({ status: parsed.data.status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*, customer!customer_id(id, nama, kode)')
    .single()

  if (error) return internalError(error)
  if (!data) return notFound('Quotation tidak ditemukan')

  return NextResponse.json({ data })
}
