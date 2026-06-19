import { NextRequest, NextResponse } from 'next/server'
import { pdf } from '@react-pdf/renderer'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { verifyAuth } from '@/lib/api/auth'
import { notFound, internalError } from '@/lib/api/errors'
import { SuratPernyataanNonPkpPDF } from '@/lib/pdf/surat-pernyataan-non-pkp'

const COMPANY_KEYS = [
  'company_nama', 'company_bidang_usaha', 'company_alamat',
  'company_no_hp', 'company_email', 'company_logo_url',
  'penandatangan_nama', 'penandatangan_jabatan', 'company_npwp',
] as const

function formatNpkpNumber(invoiceNomor: string): string {
  const parts = invoiceNomor.split('-')
  const yy = parts[2]
  const mm = parts[3]
  const counter = parts[4]
  const last4 = counter.slice(-4)
  return `RRI-SP/NPKP-${yy}-${mm}-${last4}`
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(_request)
  if (auth.error) return auth.error
  const { id } = await params

  const { data: inv, error } = await supabaseAdmin
    .from('invoice')
    .select('nomor, tanggal')
    .eq('id', id)
    .single()
  if (error) return internalError(error)
  if (!inv) return notFound('Invoice tidak ditemukan')

  const { data: settingsRows } = await supabaseAdmin
    .from('site_settings')
    .select('key, value')
    .in('key', COMPANY_KEYS as unknown as string[])
  const company: Record<string, string> = {}
  if (settingsRows) {
    for (const row of settingsRows) {
      company[row.key] = row.value
    }
  }

  const nomor = formatNpkpNumber(inv.nomor)

  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  const invDate = new Date(inv.tanggal)
  const tanggalStr = `Jepara, ${invDate.getDate()} ${months[invDate.getMonth()]} ${invDate.getFullYear()}`

  const pdfData = {
    nomor,
    tanggal: tanggalStr,
    penandatanganNama: company.penandatangan_nama ?? 'Mohamad Marzuqi',
    penandatanganJabatan: company.penandatangan_jabatan ?? 'Direktur',
    alamat: company.company_alamat ?? 'Jerukwangi-Bangsri, Jepara',
    npwp: company.company_npwp ?? '',
    companyNama: company.company_nama ?? 'PT. RIZQI RIDHO ILAHI',
    companyBidangUsaha: company.company_bidang_usaha ?? null,
    companyLogoUrl: company.company_logo_url ?? null,
    companyAlamat: company.company_alamat ?? null,
    companyNoHp: company.company_no_hp ?? null,
    companyEmail: company.company_email ?? null,
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blob = await pdf(SuratPernyataanNonPkpPDF({ data: pdfData }) as any).toBlob()
    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': String(blob.size),
        'Content-Disposition': `inline; filename="${nomor}.pdf"`,
      },
    })
  } catch (e) {
    console.error('PDF generation error:', e)
    const msg = e instanceof Error ? e.message : 'Gagal generate PDF'
    return NextResponse.json({ error: msg, code: 'PDF_GENERATION_ERROR' }, { status: 500 })
  }
}
