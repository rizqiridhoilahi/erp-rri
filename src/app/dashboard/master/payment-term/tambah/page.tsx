"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BreadcrumbNav, type BreadcrumbItem } from "@/components/breadcrumb-nav"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

const breadcrumbItems: BreadcrumbItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Master Data" },
  { label: "Payment Term", href: "/dashboard/master/payment-term" },
  { label: "Tambah" },
]

interface ItemRow {
  deskripsi: string
  persentase: string
  due_days: string
}

export default function TambahPaymentTermPage() {
  const router = useRouter()
  const [nama, setNama] = useState("")
  const [items, setItems] = useState<ItemRow[]>([{ deskripsi: "DP", persentase: "50", due_days: "0" }, { deskripsi: "Pelunasan", persentase: "50", due_days: "30" }])
  const [submitting, setSubmitting] = useState(false)

  const addItem = () => setItems((prev) => [...prev, { deskripsi: "", persentase: "", due_days: "0" }])
  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx))
  const updateItem = (idx: number, field: keyof ItemRow, value: string) => {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)))
  }

  const totalPersentase = items.reduce((s, item) => s + (parseFloat(item.persentase) || 0), 0)

  const handleSubmit = async () => {
    if (!nama.trim()) { toast.error('Nama payment term harus diisi'); return }
    if (items.length === 0) { toast.error('Minimal 1 termin'); return }
    if (totalPersentase !== 100) { toast.error(`Total persentase harus 100% (saat ini ${totalPersentase}%)`); return }
    if (items.some((i) => !i.deskripsi.trim())) { toast.error('Semua termin harus memiliki deskripsi'); return }

    setSubmitting(true)
    try {
      await apiFetch('/api/v1/master/payment-term', {
        method: 'POST',
        body: JSON.stringify({
          nama: nama.trim(),
          items: items.map((i) => ({
            deskripsi: i.deskripsi.trim(),
            persentase: parseFloat(i.persentase),
            due_days: parseInt(i.due_days) || 0,
          })),
        }),
      })
      toast.success('Payment term berhasil dibuat')
      router.push('/dashboard/master/payment-term')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-xl">
      <BreadcrumbNav items={breadcrumbItems} />
      <h1 className="text-2xl font-bold mt-2">Tambah Payment Term</h1>
      <p className="text-sm text-muted-foreground mb-6">Buat termin pembayaran multi-tahap baru</p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nama Payment Term</label>
          <Input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Contoh: DP 50% + Pelunasan 50%" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Termin Pembayaran</label>
            <span className={`text-xs ${totalPersentase === 100 ? 'text-green-600' : 'text-destructive'}`}>
              Total: {totalPersentase}%
            </span>
          </div>
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-start">
                <Input
                  placeholder="Deskripsi (DP, Pelunasan, dll)"
                  value={item.deskripsi}
                  onChange={(e) => updateItem(idx, 'deskripsi', e.target.value)}
                  className="flex-1"
                />
                <div className="w-24">
                  <Input
                    type="number"
                    placeholder="%"
                    value={item.persentase}
                    onChange={(e) => updateItem(idx, 'persentase', e.target.value)}
                  />
                </div>
                <div className="w-28">
                  <Input
                    type="number"
                    placeholder="Jatuh tempo (hari)"
                    value={item.due_days}
                    onChange={(e) => updateItem(idx, 'due_days', e.target.value)}
                  />
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeItem(idx)} disabled={items.length === 1}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={addItem} className="mt-2">
            <Plus className="h-4 w-4 mr-1" />Tambah Termin
          </Button>
        </div>

        <Button onClick={handleSubmit} disabled={submitting} className="w-full">
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitting ? 'Menyimpan...' : 'Simpan'}
        </Button>

        <Button variant="back" onClick={() => router.push('/dashboard/master/payment-term')} className="w-full">
          Kembali
        </Button>
      </div>
    </div>
  )
}
