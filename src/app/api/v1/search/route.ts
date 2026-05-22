import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { verifyAuth } from '@/lib/api/auth'
import { badRequest } from '@/lib/api/errors'

const schema = z.object({ q: z.string().min(1) })

export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error
  const body = await request.json().catch(() => null)
  if (!body) return badRequest('Invalid JSON body')
  const parsed = schema.safeParse(body)
  if (!parsed.success) return badRequest('Query harus diisi')

  const q = `%${parsed.data.q}%`
  const results: Array<{ table: string; id: string; label: string; href: string }> = []

  const queries = [
    { table: 'barang', select: 'id, nama, kode', query: supabaseAdmin.from('barang').select('id, nama, kode').or(`nama.ilike.${q},kode.ilike.${q}`).limit(5) },
    { table: 'supplier', select: 'id, nama', query: supabaseAdmin.from('supplier').select('id, nama').ilike('nama', q).limit(5) },
    { table: 'customer', select: 'id, nama', query: supabaseAdmin.from('customer').select('id, nama').ilike('nama', q).limit(5) },
    { table: 'invoice', select: 'id, nomor', query: supabaseAdmin.from('invoice').select('id, nomor').ilike('nomor', q).limit(5) },
    { table: 'quotation', select: 'id, nomor', query: supabaseAdmin.from('quotation').select('id, nomor').ilike('nomor', q).limit(5) },
    { table: 'karyawan', select: 'id, nama', query: supabaseAdmin.from('karyawan').select('id, nama').ilike('nama', q).limit(5) },
    { table: 'purchase_order', select: 'id, nomor', query: supabaseAdmin.from('purchase_order').select('id, nomor').ilike('nomor', q).limit(5) },
  ]

  const responses = await Promise.allSettled(queries.map(q => q.query))
  const tableNames = ['barang', 'supplier', 'customer', 'invoice', 'quotation', 'karyawan', 'purchase_order']

  responses.forEach((res, i) => {
    if (res.status === 'fulfilled' && res.value.data) {
      for (const row of res.value.data) {
        const r = row as { id: string; nomor?: string; nama?: string; kode?: string }
        const label = r.nomor ?? r.nama ?? r.kode ?? r.id
        results.push({ table: tableNames[i], id: row.id, label: `[${tableNames[i].toUpperCase()}] ${label}`, href: `/dashboard/${tableNames[i]}/${row.id}/edit` })
      }
    }
  })

  return NextResponse.json({ data: results.slice(0, 20) })
}
