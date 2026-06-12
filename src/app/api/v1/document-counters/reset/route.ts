import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { verifyAuthWithRole } from '@/lib/api/role-guard'
import { internalError } from '@/lib/api/errors'

export async function POST(request: NextRequest) {
  const { error } = await verifyAuthWithRole(request, ['admin', 'owner'])
  if (error) return error

  const { data: docs, error: fetchError } = await supabaseAdmin
    .from('document_counter')
    .select('*')
    .eq('kode_dokumen', 'GLOBAL')
    .order('tahun', { ascending: false })
    .order('bulan', { ascending: false })

  if (fetchError) return internalError(fetchError)

  const { data: rfqcData, error: rfqcError } = await supabaseAdmin
    .from('rfq_customer')
    .select('nomor')

  if (rfqcError) return internalError(rfqcError)

  const { data: diData, error: diError } = await supabaseAdmin
    .from('di')
    .select('nomor')

  if (diError) return internalError(diError)

  const allNumbers = [...(rfqcData ?? []), ...(diData ?? [])]
    .map(r => r.nomor)
    .filter((n): n is string => !!n && /^RRI-[A-Z]+-\d{2}-\d{2}-\d{4}$/.test(n))

  if (allNumbers.length === 0) {
    return NextResponse.json({
      data: {
        message: 'Tidak ada dokumen RFQC/DI ditemukan. GLOBAL counter tidak diubah.',
        current: docs?.[0] ?? null,
      },
    })
  }

  let maxCounter = 0
  let maxYear = 0
  let maxMonth = 0

  for (const nomor of allNumbers) {
    const parts = nomor.split('-')
    const yy = parseInt(parts[2])
    const mm = parseInt(parts[3])
    const counter = parseInt(parts[4])
    const fullYear = 2000 + yy

    if (counter > maxCounter || (counter === maxCounter && (fullYear > maxYear || (fullYear === maxYear && mm > maxMonth)))) {
      maxCounter = counter
      maxYear = fullYear
      maxMonth = mm
    }
  }

  const { data: updated, error: updateError } = await supabaseAdmin
    .from('document_counter')
    .upsert({
      kode_dokumen: 'GLOBAL',
      tahun: maxYear,
      bulan: maxMonth,
      counter: maxCounter,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'kode_dokumen, tahun, bulan' })
    .select()
    .single()

  if (updateError) return internalError(updateError)

  return NextResponse.json({
    data: {
      message: `GLOBAL counter direset ke ${maxYear}-${String(maxMonth).padStart(2, '0')} nomor ${maxCounter}`,
      previous: docs?.[0] ?? null,
      current: updated,
    },
  })
}
