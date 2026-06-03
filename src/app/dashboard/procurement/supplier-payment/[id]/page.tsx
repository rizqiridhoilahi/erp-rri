"use client"

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Pencil, ExternalLink, Loader2 } from 'lucide-react'

interface SupplierPaymentData {
  id: string
  purchase_order_id: string
  supplier_id: string
  nominal: number
  tanggal_bayar: string
  metode: string
  bukti_transfer: string | null
  keterangan: string | null
  created_at: string
  supplier: { nama: string } | null
  purchase_order: { nomor: string } | null
}

const metodeMap: Record<string, string> = {
  transfer: 'Transfer Bank',
  tunai: 'Tunai',
  giro: 'Giro',
}

export default function SupplierPaymentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState('')
  const [data, setData] = useState<SupplierPaymentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    params.then(p => setId(p.id))
  }, [params])

  useEffect(() => {
    if (!id) return
    apiFetch<SupplierPaymentData>(`/api/v1/procurement/supplier-payment/${id}`)
      .then(r => { setData(r.data); setLoading(false) })
      .catch((err) => { setError(err instanceof Error ? err.message : 'Gagal memuat data'); setLoading(false) })
  }, [id])

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin mr-2" />Memuat...</div>
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild><Link href="/dashboard/procurement/supplier-payment"><ArrowLeft className="h-5 w-5" /></Link></Button>
          <div><h1 className="text-3xl font-heading font-bold">Pembayaran Supplier</h1></div>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            {error ? (
              <div className="space-y-2">
                <p className="text-destructive font-medium">{error}</p>
                <Button variant="outline" size="sm" onClick={() => { setLoading(true); setError(null); apiFetch<SupplierPaymentData>(`/api/v1/procurement/supplier-payment/${id}`).then(r => { setData(r.data); setLoading(false) }).catch(e => { setError(e instanceof Error ? e.message : 'Gagal memuat data'); setLoading(false) }) }}>
                  Coba Lagi
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground">Pembayaran tidak ditemukan.</p>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild><Link href="/dashboard/procurement/supplier-payment"><ArrowLeft className="h-5 w-5" /></Link></Button>
          <div>
            <h1 className="text-3xl font-heading font-bold">Pembayaran Supplier</h1>
            <p className="text-muted-foreground mt-1">Detail pembayaran ke supplier</p>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/dashboard/procurement/supplier-payment/${id}/edit`}><Pencil className="h-4 w-4 mr-2" />Edit</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Supplier</p>
              <p className="font-medium">{data.supplier?.nama ?? '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Purchase Order</p>
              <div className="flex items-center gap-2">
                <p className="font-medium">{data.purchase_order?.nomor ?? '-'}</p>
                <Button variant="ghost" size="icon" className="h-5 w-5" asChild>
                  <Link href={`/dashboard/procurement/purchase-order/${data.purchase_order_id}`}><ExternalLink className="h-3 w-3" /></Link>
                </Button>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nominal</p>
              <p className="font-bold text-lg">Rp {data.nominal.toLocaleString('id-ID')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tanggal Bayar</p>
              <p className="font-medium">{new Date(data.tanggal_bayar).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Metode</p>
              <Badge variant="outline">{metodeMap[data.metode] ?? data.metode}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Dibuat</p>
              <p className="font-medium">{new Date(data.created_at).toLocaleDateString('id-ID')}</p>
            </div>
            {data.bukti_transfer && (
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Bukti Transfer</p>
                <a href={data.bukti_transfer} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">Lihat file</a>
              </div>
            )}
            {data.keterangan && (
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Keterangan</p>
                <p className="font-medium">{data.keterangan}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
