"use client"

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface SupplierPaymentData {
  id: string
  purchase_order_id: string
  supplier_id: string
  nominal: number
  tanggal_bayar: string
  metode: string
  bukti_transfer: string | null
  keterangan: string | null
  supplier: { nama: string } | null
  purchase_order: { nomor: string } | null
}

export default function EditSupplierPaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [id, setId] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ metode: 'transfer', buktiTransfer: '', keterangan: '' })
  const [data, setData] = useState<SupplierPaymentData | null>(null)

  useEffect(() => {
    params.then(p => setId(p.id))
  }, [params])

  useEffect(() => {
    if (!id) return
    apiFetch<SupplierPaymentData>(`/api/v1/procurement/supplier-payment/${id}`)
      .then(r => {
        setData(r.data)
        setForm({
          metode: r.data.metode,
          buktiTransfer: r.data.bukti_transfer ?? '',
          keterangan: r.data.keterangan ?? '',
        })
        setLoading(false)
      })
      .catch(() => { toast.error('Gagal memuat data'); setLoading(false) })
  }, [id])

  const handleSave = async () => {
    setSaving(true)
    try {
      await apiFetch(`/api/v1/procurement/supplier-payment/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          metode: form.metode,
          buktiTransfer: form.buktiTransfer || undefined,
          keterangan: form.keterangan || undefined,
        }),
      })
      toast.success('Pembayaran berhasil diperbarui')
      router.push(`/dashboard/procurement/supplier-payment/${id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin mr-2" />Memuat...</div>
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="icon" asChild><Link href="/dashboard/procurement/supplier-payment"><ArrowLeft className="h-5 w-5" /></Link></Button>
        <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">Pembayaran tidak ditemukan.</p></CardContent></Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link href={`/dashboard/procurement/supplier-payment/${id}`}><ArrowLeft className="h-5 w-5" /></Link></Button>
        <div><h1 className="text-3xl font-heading font-bold">Edit Pembayaran</h1></div>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Supplier</Label>
              <Input value={data.supplier?.nama ?? '-'} disabled />
            </div>
            <div className="space-y-2">
              <Label>Purchase Order</Label>
              <Input value={data.purchase_order?.nomor ?? '-'} disabled />
            </div>
            <div className="space-y-2">
              <Label>Nominal</Label>
              <Input value={`Rp ${data.nominal.toLocaleString('id-ID')}`} disabled />
            </div>
            <div className="space-y-2">
              <Label>Tanggal Bayar</Label>
              <Input value={new Date(data.tanggal_bayar).toLocaleDateString('id-ID')} disabled />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Metode</Label>
            <Select value={form.metode} onValueChange={(v) => setForm(f => ({ ...f, metode: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="transfer">Transfer Bank</SelectItem>
                <SelectItem value="tunai">Tunai</SelectItem>
                <SelectItem value="giro">Giro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Link Bukti Transfer</Label>
            <Input value={form.buktiTransfer} onChange={(e) => setForm(f => ({ ...f, buktiTransfer: e.target.value }))} placeholder="URL file bukti transfer" />
          </div>

          <div className="space-y-2">
            <Label>Keterangan</Label>
            <Input value={form.keterangan} onChange={(e) => setForm(f => ({ ...f, keterangan: e.target.value }))} placeholder="Catatan" />
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Simpan
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/dashboard/procurement/supplier-payment/${id}`}>Batal</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
