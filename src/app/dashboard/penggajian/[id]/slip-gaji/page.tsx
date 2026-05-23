"use client"
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { apiFetch } from '@/lib/api/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Download, FileText, Loader2, AlertCircle } from 'lucide-react'

interface PenggajianDetail {
  id: string
  nomor: string
  bulan: number
  tahun: number
  gaji_pokok: number
  tunjangan: number
  potongan: number
  gaji_bersih: number
  status: string
  tanggal_pembayaran: string | null
  karyawan: { nama: string; nik: string } | null
}

const bulanNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

export default function SlipGajiPreviewPage() {
  const params = useParams()
  const id = params.id as string
  const [data, setData] = useState<PenggajianDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await apiFetch<PenggajianDetail>(`/api/v1/penggajian/${id}`)
        setData(result.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memuat data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild><Link href="/dashboard/penggajian"><ArrowLeft className="h-5 w-5" /></Link></Button>
          <div><h1 className="text-3xl font-heading font-bold">Slip Gaji</h1></div>
        </div>
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="flex items-center gap-3 py-6">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive">{error || 'Data tidak ditemukan'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const pdfUrl = `/api/v1/slip-gaji/${id}/pdf`
  const downloadUrl = `/api/v1/slip-gaji/${id}/pdf?download=1`

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild><Link href="/dashboard/penggajian"><ArrowLeft className="h-5 w-5" /></Link></Button>
          <div>
            <h1 className="text-3xl font-heading font-bold">Slip Gaji</h1>
            <p className="text-muted-foreground text-sm">{data.nomor}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <a href={downloadUrl} download={`SLIP-GAJI-${data.nomor}.pdf`}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </a>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/dashboard/penggajian/${id}/edit`}>
              <FileText className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader><CardTitle className="text-base">Informasi Slip Gaji</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Karyawan</p>
            <p className="font-medium">{data.karyawan?.nama || '-'}</p>
            <p className="text-xs text-muted-foreground">NIK: {data.karyawan?.nik || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Periode</p>
            <p className="font-medium">{bulanNames[data.bulan - 1]} {data.tahun}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Gaji Bersih</p>
            <p className="font-bold text-lg text-primary">Rp {data.gaji_bersih.toLocaleString('id-ID')}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="font-medium capitalize">{data.status}</p>
          </div>
        </CardContent>
      </Card>

      {/* PDF Preview */}
      <Card>
        <CardHeader><CardTitle className="text-base">Preview Dokumen</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="border rounded-lg overflow-hidden" style={{ height: '600px' }}>
            <iframe
              src={pdfUrl}
              className="w-full h-full"
              title="Slip Gaji Preview"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}