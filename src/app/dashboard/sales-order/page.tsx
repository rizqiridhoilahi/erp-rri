import Link from 'next/link'
import { supabase } from '@/lib/db/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Plus, Eye } from 'lucide-react'
import { ExportButton } from "@/components/export-button"
export const dynamic = 'force-dynamic'

const s: Record<string, { label: string; v: 'secondary' | 'warning' | 'success' | 'outline' | 'destructive' }> = {
  draft: { label: 'Draft', v: 'secondary' }, confirmed: { label: 'Dikonfirmasi', v: 'warning' }, processed: { label: 'Diproses', v: 'success' }, delivered: { label: 'Dikirim', v: 'outline' }, cancelled: { label: 'Dibatalkan', v: 'destructive' },
}

export default async function SalesOrderPage() {
  const { data, error } = await supabase.from('sales_order').select('*, customer_po!customer_po_id(nomor, nomor_po_customer, customer!customer_id(nama), customer_pic!pic_customer_id(nama), customer_id), di_id').order('tanggal', { ascending: false })
  const { data: doData } = await supabase.from('delivery_order').select('sales_order_id, nomor, status')
  const doBySoId = new Map(doData?.map(d => [d.sales_order_id, d]) ?? [])

  // Fetch DI data separately for SOs with di_id
  const diIds = data?.filter(s => s.di_id).map(s => s.di_id) ?? []
  const { data: diData } = diIds.length > 0
    ? await supabase.from('di').select('id, nomor, nomor_di_customer, pic_customer_id, customer!customer_id(nama)').in('id', diIds)
    : { data: null }
  const diById = new Map(diData?.map(d => [d.id, d]) ?? [])

  const diPicIds = [...diById.values()].map(d => d.pic_customer_id).filter(Boolean) as string[]
  const diPicById = new Map<string, string>()
  if (diPicIds.length > 0) {
    const { data: pics } = await supabase.from('customer_pic').select('id, nama').in('id', diPicIds)
    if (pics) for (const p of pics) diPicById.set(p.id, p.nama)
  }

  const statusPriority: Record<string, number> = { draft: 1, confirmed: 2, processed: 3, delivered: 4, cancelled: 5 }
  ;(data ?? []).sort((a, b) => {
    const pa = statusPriority[a.status] ?? 99
    const pb = statusPriority[b.status] ?? 99
    if (pa !== pb) return pa - pb
    return new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-heading font-bold">Sales Order</h1><p className="text-muted-foreground mt-1">Order penjualan internal</p></div>
        <ExportButton table="sales_order" />
        <Button asChild><Link href="/dashboard/sales-order/tambah"><Plus className="h-4 w-4 mr-2" />Tambah SO</Link></Button>
      </div>
      {error ? <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">{error.message}</div> :
      !data?.length ? <div className="text-center py-12 border rounded-lg bg-card"><p className="text-muted-foreground">Belum ada Sales Order.</p>
        <Button asChild className="mt-4"><Link href="/dashboard/sales-order/tambah">Buat SO Pertama</Link></Button></div> :
      <div className="rounded-lg border bg-card"><Table><TableHeader><TableRow>
        <TableHead>Nomor</TableHead>
        <TableHead>No PO Ref / No. DI Ref</TableHead>
        <TableHead>Customer</TableHead>
        <TableHead>PIC</TableHead>
        <TableHead>Tanggal</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Aktif</TableHead>
        <TableHead>DO</TableHead>
        <TableHead className="text-right">Aksi</TableHead>
      </TableRow></TableHeader><TableBody>
        {data.map((item: Record<string, unknown>) => {
          const doItem = doBySoId.get(item.id as string)
          const diFromMap = item.di_id ? diById.get(item.di_id as string) : null
          const customerPo = item.customer_po as { nomor?: string; nomor_po_customer?: string; customer?: { nama?: string }; customer_pic?: { nama?: string } } | null
          const poRef = diFromMap?.nomor_di_customer ?? customerPo?.nomor_po_customer ?? '-'
          const customerNama = (diFromMap?.customer as { nama?: string } | undefined)?.nama ?? customerPo?.customer?.nama ?? '-'
          const picNama = customerPo?.customer_pic?.nama ?? (diFromMap?.pic_customer_id ? diPicById.get(diFromMap.pic_customer_id) : null) ?? '-'
          return (
          <TableRow key={item.id as string}>
            <TableCell className="font-medium">{item.nomor as string}</TableCell>
            <TableCell className="font-medium">{poRef}</TableCell>
            <TableCell className="font-medium">{customerNama}</TableCell>
            <TableCell className="font-medium">{picNama}</TableCell>
            <TableCell className="font-medium">{new Date(item.tanggal as string).toLocaleDateString('id-ID')}</TableCell>
            <TableCell><Badge variant={s[item.status as string]?.v ?? 'outline'}>{s[item.status as string]?.label ?? item.status}</Badge></TableCell>
            <TableCell><Badge variant={item.is_active ? 'default' : 'secondary'} className="text-xs">{item.is_active ? 'Ya' : 'Tidak'}</Badge></TableCell>
            <TableCell>{doItem ? <Badge variant="secondary">{doItem.nomor}</Badge> : '-'}</TableCell>
            <TableCell className="text-right"><Button variant="ghost" size="sm" asChild><Link href={`/dashboard/sales-order/${item.id as string}`}><Eye className="h-4 w-4" /></Link></Button></TableCell>
          </TableRow>
        )})}
      </TableBody></Table></div>}
    </div>
  )
}
