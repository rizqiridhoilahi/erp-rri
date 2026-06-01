import { NextRequest, NextResponse } from 'next/server'
import { pdf } from '@react-pdf/renderer'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { verifyAuth } from '@/lib/api/auth'
import { notFound, internalError } from '@/lib/api/errors'
import { generateDocumentNumber } from '@/lib/utils/document-number'
import { TandaTerimaPDF } from '@/lib/pdf/tanda-terima'

const COMPANY_KEYS = [
  'company_nama', 'company_bidang_usaha', 'company_alamat',
  'company_no_hp', 'company_email', 'company_logo_url',
  'penandatangan_nama', 'penandatangan_jabatan', 'penandatangan_no_hp',
] as const

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(_request)
  if (auth.error) return auth.error
  const { id } = await params

  const { data: inv, error } = await supabaseAdmin
    .from('invoice')
    .select('nomor, customer!customer_id(nama)')
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

  const nomor = await generateDocumentNumber('TT')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const customer = inv.customer as any as { nama: string } | null

  const now = new Date()
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  const tanggalStr = `Jepara, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`

  const pdfData = {
    nomor,
    nomorInvoice: inv.nomor,
    tanggal: tanggalStr,
    customerNama: customer?.nama ?? '-',
    company: {
      company_nama: company.company_nama ?? null,
      company_bidang_usaha: company.company_bidang_usaha ?? null,
      company_alamat: company.company_alamat ?? null,
      company_no_hp: company.company_no_hp ?? null,
      company_email: company.company_email ?? null,
      company_logo_url: company.company_logo_url ?? null,
      penandatangan_nama: company.penandatangan_nama ?? null,
      penandatangan_jabatan: company.penandatangan_jabatan ?? null,
      penandatangan_no_hp: company.penandatangan_no_hp ?? null,
    },
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blob = await pdf(TandaTerimaPDF({ data: pdfData }) as any).toBlob()
    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${nomor}.pdf"`,
      },
    })
  } catch (e) {
    console.error('PDF generation error:', e)
    const msg = e instanceof Error ? e.message : 'Gagal generate PDF'
    return NextResponse.json({ error: msg, code: 'PDF_GENERATION_ERROR' }, { status: 500 })
  }
}
