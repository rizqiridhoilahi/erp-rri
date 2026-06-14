import Link from 'next/link'
import { supabase } from '@/lib/db/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Plus, Pencil, Eye } from 'lucide-react'
import { ExportButton } from "@/components/export-button"
export const dynamic = 'force-dynamic'

const s: Record<string, { label: string; v: 'secondary' | 'success' | 'outline' | 'warning' | 'destructive' }> = {
  draft: { label: 'Draft', v: 'secondary' }, completed: { label: 'Selesai', v: 'success' },
  pending: { label: 'Pending', v: 'secondary' },
  partial: { label: 'Dibayar Sebagian', v: 'warning' },
  paid: { label: 'Lunas', v: 'success' },
}

export default async function KwitansiPage() {
  const { data, error } = await supabase.from('kwitansi').select('*, invoice!invoice_id(nomor, customer!customer_id(nama, kode), sales_order!sales_order_id(nomor, di!fk_sales_order_di(nomor, nomor_di_customer), customer_po!customer_po_id(nomor, nomor_po_customer)))').order('created_at', { ascending: false })

  const invoiceIds = [...new Set((data ?? []).map(k => k.invoice_id))]
  const { data: invItemsData } = invoiceIds.length > 0 ? await supabase.from('invoice_item').select('invoice_id, harga, jumlah, diskon').in('invoice_id', invoiceIds) : { data: [] }
  const invoiceTotals: Record<string, number> = {}
  for (const item of invItemsData ?? []) {
    invoiceTotals[item.invoice_id] = (invoiceTotals[item.invoice_id] || 0) + (item.harga * item.jumlah - (item.diskon ?? 0))
  }

  const scheduleIds = [...new Set((data ?? []).map(k => (k as Record<string, unknown>).schedule_id).filter(Boolean))] as string[]
  const scheduleStatusMap: Record<string, string> = {}
  if (scheduleIds.length > 0) {
    const { data: scheds } = await supabase.from('invoice_payment_schedule').select('id, status').in('id', scheduleIds)
    for (const s of scheds ?? []) scheduleStatusMap[s.id] = s.status
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-heading font-bold">Kwitansi</h1><p className="text-muted-foreground mt-1">Tanda terima pembayaran</p></div>
        <ExportButton table="kwitansi" />
        <Button asChild><Link href="/dashboard/kwitansi/tambah"><Plus className="h-4 w-4 mr-2" />Tambah Kwitansi</Link></Button>
      </div>
      {error ? <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">{error.message}</div> :
      !data?.length ? <div className="text-center py-12 border rounded-lg bg-card"><p className="text-muted-foreground">Belum ada kwitansi.</p>
        <Button asChild className="mt-4"><Link href="/dashboard/kwitansi/tambah">Buat Kwitansi Pertama</Link></Button></div> :
      <div className="rounded-lg border bg-card"><Table><TableHeader><TableRow>
        <TableHead>Nomor</TableHead>
        <TableHead>Invoice Ref</TableHead>
        <TableHead>DI Ref</TableHead>
        <TableHead>DI Cust. Ref</TableHead>
        <TableHead>CPO Ref</TableHead>
        <TableHead>CPO Cust. Ref</TableHead>
        <TableHead>Customer</TableHead>
        <TableHead className="text-right">Total</TableHead>
        <TableHead>Tanggal</TableHead>
        <TableHead>Status</TableHead>
        <TableHead className="text-right">Aksi</TableHead>
      </TableRow></TableHeader><TableBody>
        {data.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.nomor}</TableCell>
            <TableCell className="font-medium">{item.invoice?.nomor ?? '-'}</TableCell>
            <TableCell className="font-medium">{item.invoice?.sales_order?.di?.nomor ?? '-'}</TableCell>
            <TableCell className="font-medium">{item.invoice?.sales_order?.di?.nomor_di_customer ?? '-'}</TableCell>
            <TableCell className="font-medium">{item.invoice?.sales_order?.customer_po?.nomor ?? '-'}</TableCell>
            <TableCell className="font-medium">{item.invoice?.sales_order?.customer_po?.nomor_po_customer ?? '-'}</TableCell>
            <TableCell className="font-medium">{item.invoice?.customer?.nama ?? '-'}</TableCell>
            <TableCell className="font-medium">Rp {(invoiceTotals[item.invoice_id] ?? 0).toLocaleString('id-ID')}</TableCell>
            <TableCell className="font-medium">{new Date(item.tanggal).toLocaleDateString('id-ID')}</TableCell>
            <TableCell>
              <Badge variant={
                (item as Record<string, unknown>).schedule_id
                  ? (s[scheduleStatusMap[(item as Record<string, unknown>).schedule_id as string]]?.v ?? 'outline')
                  : (s[item.status]?.v ?? 'outline')
              }>
                {(item as Record<string, unknown>).schedule_id
                  ? (s[scheduleStatusMap[(item as Record<string, unknown>).schedule_id as string]]?.label ?? 'Pending')
                  : (s[item.status]?.label ?? item.status)}
              </Badge>
            </TableCell>
            <TableCell className="text-right space-x-1">
              <Button variant="ghost" size="sm" asChild><Link href={`/dashboard/kwitansi/${item.id}`}><Eye className="h-4 w-4" /></Link></Button>
              <Button variant="ghost" size="sm" asChild><Link href={`/dashboard/kwitansi/${item.id}/edit`}><Pencil className="h-4 w-4" /></Link></Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody></Table></div>}
    </div>
  )
}
