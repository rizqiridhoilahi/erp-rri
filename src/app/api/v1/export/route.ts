import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { verifyAuth } from '@/lib/api/auth'
import { badRequest, internalError } from '@/lib/api/errors'
import * as XLSX from 'xlsx'

const allowedTables = ['barang', 'supplier', 'customer', 'invoice', 'quotation', 'purchase_order', 'purchase_request', 'karyawan', 'jurnal', 'absensi', 'penggajian', 'coa', 'kontrak', 'sales_order', 'delivery_order']

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error

  const { searchParams } = new URL(request.url)
  const table = searchParams.get('table')
  const format = searchParams.get('format') ?? 'xlsx'

  if (!table || !allowedTables.includes(table)) return badRequest('Table tidak valid')

  const { data, error } = await supabaseAdmin.from(table).select('*').order('created_at', { ascending: false }).limit(5000)
  if (error) return internalError(error)
  if (!data?.length) return badRequest('Data kosong')

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, table)

  if (format === 'csv') {
    const csv = XLSX.utils.sheet_to_csv(ws)
    return new NextResponse(csv, {
      headers: { 'Content-Type': 'text/csv', 'Content-Disposition': `attachment; filename="${table}-export.csv"` },
    })
  }

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
  return new NextResponse(buf, {
    headers: { 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Content-Disposition': `attachment; filename="${table}-export.xlsx"` },
  })
}
