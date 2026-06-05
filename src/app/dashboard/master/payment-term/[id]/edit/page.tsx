"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { supabase } from "@/lib/db/client"
import type { PostgrestSingleResponse } from "@supabase/supabase-js"
import { apiFetch } from "@/lib/api/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface ItemRow {
  deskripsi: string
  persentase: string
  due_days: string
}

interface PaymentTermItemRaw {
  urutan: number
  deskripsi: string
  persentase: number
  due_days: number
}

interface PaymentTermRaw {
  nama: string
  payment_term_item: PaymentTermItemRaw[] | null
}

export default function EditPaymentTermPage() {
  const router = useRouter()
  const pathname = usePathname()
  const id = pathname.split("/").at(-2)
  const [nama, setNama] = useState("")
  const [items, setItems] = useState<ItemRow[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!id) return
    ;(async () => {
      const { data, error } = await supabase.from('payment_term').select('*, payment_term_item(*)').eq('id', id).single() as unknown as PostgrestSingleResponse<PaymentTermRaw>
      if (error || !data) { toast.error('Payment term tidak ditemukan'); return }
      setNama(data.nama)
      const termItems = data.payment_term_item ?? []
      setItems(termItems.sort((a, b) => a.urutan - b.urutan).map((i) => ({
        deskripsi: i.deskripsi,
        persentase: String(i.persentase),
        due_days: String(i.due_days),
      })))
    })().finally(() => setLoading(false))
  }, [id])

  const addItem = () => setItems((prev) => [...prev, { deskripsi: "", persentase: "", due_days: "0" }])
  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx))
  const updateItem = (idx: number, field: keyof ItemRow, value: string) => {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)))
  }

  const totalPersentase = items.reduce((s, item) => s + (parseFloat(item.persentase) || 0), 0)

  const handleSubmit = async () => {
    if (!id) return
    if (!nama.trim()) { toast.error('Nama payment term harus diisi'); return }
    if (items.length === 0) { toast.error('Minimal 1 termin'); return }
    if (totalPersentase !== 100) { toast.error(`Total persentase harus 100% (saat ini ${totalPersentase}%)`); return }
    if (items.some((i) => !i.deskripsi.trim())) { toast.error('Semua termin harus memiliki deskripsi'); return }

    setSubmitting(true)
    try {
      await apiFetch(`/api/v1/master/payment-term/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          nama: nama.trim(),
          items: items.map((i) => ({
            deskripsi: i.deskripsi.trim(),
            persentase: parseFloat(i.persentase),
            due_days: parseInt(i.due_days) || 0,
          })),
        }),
      })
      toast.success('Payment term berhasil diperbarui')
      router.push(`/dashboard/master/payment-term/${id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="text-center py-20 text-muted-foreground">Memuat...</div>

  return (
    <div className="max-w-xl">
      <BreadcrumbNav items={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Master Data" },
        { label: "Payment Term", href: "/dashboard/master/payment-term" },
        { label: "Edit" },
      ]} />
      <h1 className="text-2xl font-bold mt-2">Edit Payment Term</h1>

      <div className="space-y-4 mt-6">
        <div>
          <label className="block text-sm font-medium mb-1">Nama Payment Term</label>
          <Input value={nama} onChange={(e) => setNama(e.target.value)} />
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
                <Input value={item.deskripsi} onChange={(e) => updateItem(idx, 'deskripsi', e.target.value)} placeholder="Deskripsi" className="flex-1" />
                <div className="w-24"><Input type="number" value={item.persentase} onChange={(e) => updateItem(idx, 'persentase', e.target.value)} placeholder="%" /></div>
                <div className="w-28"><Input type="number" value={item.due_days} onChange={(e) => updateItem(idx, 'due_days', e.target.value)} placeholder="Jatuh tempo (hari)" /></div>
                <Button variant="ghost" size="icon" onClick={() => removeItem(idx)} disabled={items.length <= 1}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={addItem} className="mt-2"><Plus className="h-4 w-4 mr-1" />Tambah Termin</Button>
        </div>

        <Button onClick={handleSubmit} disabled={submitting} className="w-full">
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
        </Button>
      </div>
    </div>
  )
}
