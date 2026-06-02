"use client"

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { apiFetch } from '@/lib/api/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

import { ArrowLeft, Loader2 } from 'lucide-react'
import { DatePicker } from '@/components/ui/date-picker'
import { toast } from 'sonner'

interface InvoiceItem {
  id: string
  barang: { nama: string; kode: string; satuan: string } | null
  nama_barang: string | null
  kode_barang: string | null
  satuan: string | null
  harga: number
  jumlah: number
  diskon: number | null
}

interface InvoiceData {
  id: string
  nomor: string
  customer: { nama: string; kode: string } | null
  sales_order: { nomor: string } | null
  tanggal: string
  top: string
  status: string
  items: InvoiceItem[]
}

const schema = z.object({
  tanggal: z.string().optional(),
  status: z.string().optional(),
  top: z.string().optional(),
})
type FV = z.input<typeof schema>

const STATUS_OPTS = [
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Kirim ke Customer' },
]

export default function EditInvoicePage() {
  const router = useRouter()
  const params = useParams()
  const [inv, setInv] = useState<InvoiceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<FV>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'draft', top: '' },
  })

  useEffect(() => {
    if (!params.id) return
    apiFetch<InvoiceData>(`/api/v1/invoice/${params.id}`)
      .then((r) => {
        const d = r.data
        const invTanggal = (() => {
          const t = d.tanggal as unknown
          if (t instanceof Date) return (t as Date).toISOString().split('T')[0]
          return (t as string | undefined)?.split('T')[0] ?? ''
        })()
        setInv(d)
        form.reset({
          tanggal: invTanggal,
          status: d.status,
          top: d.top,
        })
        setLoading(false)
      })
      .catch(() => {
        toast.error('Gagal memuat data invoice')
        router.push('/dashboard/invoice')
      })
  }, [params.id])

  const onSubmit = async (data: FV) => {
    setSubmitting(true)
    try {
      await apiFetch(`/api/v1/invoice/${params.id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      toast.success('Invoice berhasil diupdate!')
      router.push(`/dashboard/invoice/${params.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
  if (!inv) return null

  const isDraft = inv.status === 'draft'

  const total = inv.items.reduce((s, i) => s + (i.harga * i.jumlah - (i.diskon ?? 0)), 0)

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/invoice/${params.id}`}><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-heading font-bold">Edit Invoice</h1>
          <p className="text-muted-foreground mt-1">{inv.nomor}</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Informasi Invoice</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">{inv.customer?.nama ?? '-'}</p>
                  <p className="text-xs text-muted-foreground">{inv.customer?.kode ?? ''}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sales Order</p>
                  <p className="font-medium">{inv.sales_order?.nomor ?? '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tanggal</p>
                  <p className="font-medium">{new Date(inv.tanggal).toLocaleDateString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">TOP</p>
                  <p className="font-medium">{inv.top}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Pengaturan</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="tanggal" render={({ field }) => (
                  <FormItem><FormLabel>Tanggal</FormLabel><FormControl><DatePicker value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="top" render={({ field }) => (
                  <FormItem><FormLabel>TOP</FormLabel><FormControl><Input {...field} placeholder="e.g. 30 Hari" /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </CardContent>
          </Card>

          {isDraft && (
            <Card>
              <CardHeader><CardTitle className="text-base">Status</CardTitle></CardHeader>
              <CardContent>
                <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {STATUS_OPTS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <p className="text-xs text-muted-foreground mt-2">
                  Mengubah ke &quot;Kirim ke Customer&quot; akan membuat jurnal akuntansi.
                </p>
              </CardContent>
            </Card>
          )}

          {inv.items.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Item Barang</CardTitle></CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Barang</TableHead>
                      <TableHead className="text-right">Harga</TableHead>
                      <TableHead className="text-right">Jumlah</TableHead>
                      <TableHead className="text-right">Diskon</TableHead>
                      <TableHead className="text-right">DPP</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inv.items.map((item, i) => {
                      const brg = item.barang as { nama: string; kode: string; satuan: string } | null
                      const diskon = item.diskon ?? 0
                      const dpp = item.harga * item.jumlah - diskon
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                          <TableCell>
                            <div className="text-sm font-medium">{brg?.nama ?? '-'}</div>
                            <div className="text-xs text-muted-foreground">{brg?.kode} — {brg?.satuan}</div>
                          </TableCell>
                          <TableCell className="text-right">{item.harga.toLocaleString('id-ID')}</TableCell>
                          <TableCell className="text-right">{item.jumlah}</TableCell>
                          <TableCell className="text-right">{diskon > 0 ? diskon.toLocaleString('id-ID') : '-'}</TableCell>
                          <TableCell className="text-right">{dpp.toLocaleString('id-ID')}</TableCell>
                          <TableCell className="text-right font-medium">{dpp.toLocaleString('id-ID')}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
                <div className="border-t mt-4 pt-4 space-y-1.5 text-sm px-6 pb-6">
                  <div className="flex justify-end items-center gap-8 border-t pt-2 mt-2">
                    <span className="font-bold">Grand Total</span>
                    <span className="font-bold text-lg w-32 text-right">{total.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" asChild>
              <Link href={`/dashboard/invoice/${params.id}`}>Batal</Link>
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {submitting ? '...' : 'Update Invoice'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
