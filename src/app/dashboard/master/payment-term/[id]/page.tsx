"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { supabase } from "@/lib/db/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { BreadcrumbNav, type BreadcrumbItem } from "@/components/breadcrumb-nav"
import { ArrowLeft, Pencil } from "lucide-react"

interface PaymentTerm {
  id: string
  nama: string
  is_active: boolean
  payment_term_item: { id: string; deskripsi: string; persentase: number; due_days: number; urutan: number }[]
  created_at: string
}

export default function PaymentTermDetailPage() {
  const router = useRouter()
  const pathname = usePathname()
  const id = pathname.split("/").pop()
  const [data, setData] = useState<PaymentTerm | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    ;(async () => {
      const { data, error } = await supabase.from('payment_term').select('*, payment_term_item(*)').eq('id', id).single()
      if (error || !data) { setData(null) } else { setData(data) }
    })().finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="text-center py-20 text-muted-foreground">Memuat...</div>
  if (!data) return <div className="text-center py-20 text-muted-foreground">Payment term tidak ditemukan</div>

  const items = [...(data.payment_term_item ?? [])].sort((a, b) => a.urutan - b.urutan)
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Master Data" },
    { label: "Payment Term", href: "/dashboard/master/payment-term" },
    { label: data.nama },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/master/payment-term')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <BreadcrumbNav items={breadcrumbItems} />
            <h1 className="text-3xl font-heading font-bold mt-2">{data.nama}</h1>
          </div>
        </div>
        <Button onClick={() => router.push(`/dashboard/master/payment-term/${data.id}/edit`)}>
          <Pencil className="h-4 w-4 mr-2" />Edit
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Nama</p>
              <p className="font-medium">{data.nama}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={data.is_active ? "success" : "secondary"}>
                {data.is_active ? 'Aktif' : 'Nonaktif'}
              </Badge>
            </div>
          </div>

          <h3 className="text-lg font-semibold mb-2">Termin Pembayaran</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead className="text-right">Persentase</TableHead>
                <TableHead className="text-right">Jatuh Tempo (hari)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.urutan}</TableCell>
                  <TableCell>{item.deskripsi}</TableCell>
                  <TableCell className="text-right">{item.persentase}%</TableCell>
                  <TableCell className="text-right">{item.due_days} hari</TableCell>
                </TableRow>
              ))}
              <TableRow className="font-bold">
                <TableCell colSpan={2}>Total</TableCell>
                <TableCell className="text-right">{items.reduce((s, i) => s + i.persentase, 0)}%</TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
