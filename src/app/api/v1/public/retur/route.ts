import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { internalError, unauthorized, badRequest } from '@/lib/api/errors'
import { formatChildNumber } from '@/lib/utils/document-number'

const itemSchema = z.object({
  barang_id: z.string().min(1),
  jumlah: z.coerce.number().int().positive(),
  keterangan: z.string().optional(),
})

const createSchema = z.object({
  delivery_order_id: z.string().min(1),
  keterangan: z.string().optional(),
  items: z.array(itemSchema).min(1),
})

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return unauthorized()

  const token = authHeader.slice(7)
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
  if (authError || !user) return unauthorized()

  const { data: profile } = await supabaseAdmin
    .from('customer_profiles')
    .select('customer_id')
    .eq('auth_user_id', user.id)
    .maybeSingle()
  if (!profile?.customer_id) return unauthorized()

  const { data: returs, error } = await supabaseAdmin
    .from('retur_penjualan')
    .select('*, delivery_order!delivery_order_id(nomor)')
    .eq('customer_id', profile.customer_id)
    .order('created_at', { ascending: false })

  if (error) return internalError(error)

  // Get items for each retur
  const withItems = await Promise.all((returs ?? []).map(async (retur) => {
    const { data: items } = await supabaseAdmin
      .from('retur_penjualan_item')
      .select('*, barang!barang_id(nama, kode, satuan)')
      .eq('retur_penjualan_id', retur.id)
    return { ...retur, items: items ?? [] }
  }))

  return NextResponse.json({ data: withItems })
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return unauthorized()

  const token = authHeader.slice(7)
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
  if (authError || !user) return unauthorized()

  const { data: profile } = await supabaseAdmin
    .from('customer_profiles')
    .select('customer_id')
    .eq('auth_user_id', user.id)
    .maybeSingle()
  if (!profile?.customer_id) return unauthorized()

  const body = await request.json().catch(() => null)
  if (!body) return badRequest('Invalid JSON body')
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return badRequest(parsed.error.issues.map(e => e.message).join(', '))

  // Get DO number for child format
  const { data: parent } = await supabaseAdmin
    .from('delivery_order')
    .select('nomor')
    .eq('id', parsed.data.delivery_order_id)
    .maybeSingle()

  const nomor = parent?.nomor
    ? formatChildNumber(parent.nomor, 'RTJ')
    : await formatChildNumber(`RRI-DO-${new Date().getFullYear().toString().slice(2)}-${String(new Date().getMonth() + 1).padStart(2, '0')}-0000`, 'RTJ')

  const now = new Date().toISOString()

  const { data: retur, error: returError } = await supabaseAdmin.from('retur_penjualan').insert({
    nomor,
    customer_id: profile.customer_id,
    delivery_order_id: parsed.data.delivery_order_id,
    tanggal: now,
    status: 'draft',
    keterangan: parsed.data.keterangan ?? null,
    created_at: now,
    updated_at: now,
  }).select().single()

  if (returError) return internalError(returError)

  // Resolve barang names
  const barangIds = [...new Set(parsed.data.items.map(i => i.barang_id))]
  const { data: barangList } = await supabaseAdmin.from('barang').select('id, nama, kode, satuan').in('id', barangIds)
  const barangMap = new Map((barangList ?? []).map(b => [b.id, b]))

  const items = parsed.data.items.map(i => {
    const b = barangMap.get(i.barang_id)
    return {
      retur_penjualan_id: retur.id,
      barang_id: i.barang_id,
      jumlah: i.jumlah,
      nama_barang: b?.nama ?? null,
      kode_barang: b?.kode ?? null,
      satuan: b?.satuan ?? null,
      keterangan: i.keterangan ?? null,
      created_at: now,
      updated_at: now,
    }
  })

  const { error: ie } = await supabaseAdmin.from('retur_penjualan_item').insert(items)
  if (ie) {
    await supabaseAdmin.from('retur_penjualan').delete().eq('id', retur.id)
    return internalError(ie)
  }

  return NextResponse.json({ data: { ...retur, items } }, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return unauthorized()

  const token = authHeader.slice(7)
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
  if (authError || !user) return unauthorized()

  const { data: profile } = await supabaseAdmin
    .from('customer_profiles')
    .select('customer_id')
    .eq('auth_user_id', user.id)
    .maybeSingle()
  if (!profile?.customer_id) return unauthorized()

  const body = await request.json().catch(() => null)
  if (!body?.id) return badRequest('ID retur required')

  const upd: Record<string, unknown> = {}
  if (body.keterangan !== undefined) upd.keterangan = body.keterangan
  if (body.items) upd.status = 'draft'
  upd.updated_at = new Date().toISOString()

  const { data: retur, error } = await supabaseAdmin
    .from('retur_penjualan')
    .update(upd)
    .eq('id', body.id)
    .eq('customer_id', profile.customer_id)
    .eq('status', 'draft')
    .select()
    .single()

  if (error) return internalError(error)
  if (!retur) return badRequest('Retur tidak ditemukan atau sudah diproses')

  if (body.items) {
    await supabaseAdmin.from('retur_penjualan_item').delete().eq('retur_penjualan_id', body.id)
    const now = new Date().toISOString()
    const barangIds = [...new Set(body.items.map((i: { barang_id: string }) => i.barang_id))]
    const { data: barangList } = await supabaseAdmin.from('barang').select('id, nama, kode, satuan').in('id', barangIds)
    const barangMap = new Map((barangList ?? []).map((b: { id: string; nama: string; kode: string; satuan: string }) => [b.id, b]))
    const items = body.items.map((i: { barang_id: string; jumlah: number; keterangan?: string }) => {
      const b = barangMap.get(i.barang_id)
      return {
        retur_penjualan_id: body.id, barang_id: i.barang_id, jumlah: i.jumlah,
        nama_barang: b?.nama ?? null, kode_barang: b?.kode ?? null, satuan: b?.satuan ?? null,
        keterangan: i.keterangan ?? null, created_at: now, updated_at: now,
      }
    })
    await supabaseAdmin.from('retur_penjualan_item').insert(items)
  }

  return NextResponse.json({ data: retur })
}
