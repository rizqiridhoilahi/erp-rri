"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/db/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Pencil, Trash2 } from "lucide-react"
import { BreadcrumbNav, type BreadcrumbItem } from "@/components/breadcrumb-nav"
import { apiFetch } from "@/lib/api/client"
import { toast } from "sonner"

const breadcrumbItems: BreadcrumbItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Master Data" },
  { label: "Payment Term" },
]

interface PaymentTerm {
  id: string
  nama: string
  is_active: boolean
  payment_term_item: { id: string; deskripsi: string; persentase: number; due_days: number; urutan: number }[]
  created_at: string
}

export default function PaymentTermListPage() {
  const router = useRouter()
  const [data, setData] = useState<PaymentTerm[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('payment_term').select('*, payment_term_item(*)').order('created_at', { ascending: false })
      if (error) throw error
      setData(data ?? [])
    })().catch(() => toast.error('Gagal memuat data')).finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus payment term ini?')) return
    try {
      await apiFetch(`/api/v1/master/payment-term/${id}`, { method: 'DELETE' })
      setData((prev) => prev.filter((d) => d.id !== id))
      toast.success('Payment term berhasil dihapus')
    } catch {
      toast.error('Gagal menghapus')
    }
  }

  if (loading) return <div className="text-center py-20 text-muted-foreground">Memuat...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <BreadcrumbNav items={breadcrumbItems} />
          <h1 className="text-3xl font-heading font-bold mt-2">Payment Term</h1>
          <p className="text-muted-foreground">Master termin pembayaran multi-tahap</p>
        </div>
        <Button onClick={() => router.push('/dashboard/master/payment-term/tambah')}>
          <Plus className="h-4 w-4 mr-2" />Tambah Payment Term
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {data.length === 0 ? (
            <p className="text-center py-10 text-muted-foreground">Belum ada payment term</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Termin</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.nama}</TableCell>
                    <TableCell>
                      {item.payment_term_item
                        .sort((a, b) => a.urutan - b.urutan)
                        .map((t) => `${t.deskripsi} (${t.persentase}%, ${t.due_days}h)`).join(', ')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.is_active ? "success" : "secondary"}>
                        {item.is_active ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/master/payment-term/${item.id}`)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/master/payment-term/${item.id}/edit`)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
