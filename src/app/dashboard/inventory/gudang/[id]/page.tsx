"use client"
import Link from 'next/link'
import { useState, useEffect } from 'react'; import { useParams } from 'next/navigation'
import { apiFetch } from '@/lib/api/client'; import { Button } from '@/components/ui/button'; import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Edit, Loader2 } from 'lucide-react'; import { toast } from 'sonner'

interface Gudang { id: string; nama: string; lokasi: string | null; keterangan: string | null; created_at: string; updated_at: string }

export default function DetailGudangPage() {
  const params = useParams(); const [data, setData] = useState<Gudang | null>(null); const [loading, setLoading] = useState(true)
  useEffect(() => {
    apiFetch<Gudang>(`/api/v1/master/gudang/${params.id}`).then(r => setData(r.data)).catch(() => toast.error('Gagal memuat data gudang')).finally(() => setLoading(false))
  }, [params.id])
  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  if (!data) return <div className="text-center py-20 text-muted-foreground">Gudang tidak ditemukan</div>
  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-4"><Button variant="ghost" size="icon" asChild><Link href="/dashboard/inventory/gudang"><ArrowLeft className="h-5 w-5" /></Link></Button><div><h1 className="text-3xl font-heading font-bold">Detail Gudang</h1></div></div>
      <Card><CardHeader><CardTitle className="text-base">{data.nama}</CardTitle></CardHeader><CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1"><p className="text-sm text-muted-foreground">Nama</p><p className="font-medium">{data.nama}</p></div>
          <div className="space-y-1"><p className="text-sm text-muted-foreground">Lokasi</p><p className="font-medium">{data.lokasi ?? '-'}</p></div>
          <div className="space-y-1 sm:col-span-2"><p className="text-sm text-muted-foreground">Keterangan</p><p className="font-medium">{data.keterangan ?? '-'}</p></div>
          <div className="space-y-1"><p className="text-sm text-muted-foreground">Dibuat</p><p className="font-medium">{new Date(data.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
          <div className="space-y-1"><p className="text-sm text-muted-foreground">Diperbarui</p><p className="font-medium">{new Date(data.updated_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
        </div>
      </CardContent></Card>
      <div className="flex justify-end gap-3"><Button variant="cancel" asChild><Link href="/dashboard/inventory/gudang">Kembali</Link></Button><Button asChild><Link href={`/dashboard/inventory/gudang/${data.id}/edit`}><Edit className="h-4 w-4 mr-2" />Edit</Link></Button></div>
    </div>
  )
}
