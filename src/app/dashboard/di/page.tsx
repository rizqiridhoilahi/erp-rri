import Link from 'next/link'
import { supabase } from '@/lib/db/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Plus, Pencil, Eye } from 'lucide-react'
import { ExportButton } from "@/components/export-button"
import { ItemsPopover } from "@/components/customer-po-items-popover"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
export const dynamic = 'force-dynamic'

const s: Record<string, { label: string; v: 'secondary' | 'warning' | 'success' | 'outline' }> = {
  draft: { label: 'Draft', v: 'secondary' }, confirmed: { label: 'Dikonfirmasi', v: 'success' }, cancelled: { label: 'Batal', v: 'outline' },
}

export default async function DiPage() {
  const { data, error } = await supabase.from('di').select('*, customer!customer_id(nama, kode), customer_pic!pic_customer_id(nama, no_hp), di_item(id, nama_barang, satuan, jumlah, harga_satuan)').order('tanggal', { ascending: false })

  const kontrakIds = (data ?? []).map(d => d.kontrak_id).filter(Boolean) as string[]
  const kontrakMap: Record<string, { nama: string; nomor_kontrak: string | null }> = {}
  if (kontrakIds.length > 0) {
    const { data: kontrakData } = await supabase.from('kontrak').select('id, nama, nomor_kontrak').in('id', kontrakIds)
    if (kontrakData) {
      for (const k of kontrakData) kontrakMap[k.id] = k
    }
  }

  const statusPriority: Record<string, number> = { draft: 1, confirmed: 2, cancelled: 3 }
  ;(data ?? []).sort((a, b) => {
    const pa = statusPriority[a.status] ?? 99
    const pb = statusPriority[b.status] ?? 99
    if (pa !== pb) return pa - pb
    return new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
  })
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-heading font-bold">Delivery Instruction</h1><p className="text-muted-foreground mt-1">Instruksi pengiriman barang</p></div>
        <ExportButton table="di" />
        <Button asChild><Link href="/dashboard/di/tambah"><Plus className="h-4 w-4 mr-2" />Tambah DI</Link></Button>
      </div>
      {error ? <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">{error.message}</div> :
      !data?.length ? <div className="text-center py-12 border rounded-lg bg-card"><p className="text-muted-foreground">Belum ada DI.</p>
        <Button asChild className="mt-4"><Link href="/dashboard/di/tambah">Buat DI Pertama</Link></Button></div> :
      <div className="rounded-lg border bg-card"><Table><TableHeader><TableRow>
        <TableHead>No. DI Internal</TableHead>
        <TableHead>No. DI Customer</TableHead>
        <TableHead>Kontrak</TableHead>
        <TableHead>Customer</TableHead>
        <TableHead>PIC</TableHead>
        <TableHead>Tanggal</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Item Barang</TableHead>
        <TableHead className="text-right">Total</TableHead>
        <TableHead className="text-right">Aksi</TableHead>
      </TableRow></TableHeader><TableBody>
        {data.map((item: { id: string; nomor: string; nomor_di_customer: string | null; kontrak_id: string | null; customer: { nama: string; kode: string } | null; customer_pic: { nama: string } | null; tanggal: string; status: string; di_item: { id: string; nama_barang: string | null; satuan: string | null; jumlah: number; harga_satuan: number }[] }) => {
          const kontrak = item.kontrak_id ? kontrakMap[item.kontrak_id] : null
          return (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.nomor}</TableCell>
            <TableCell>{item.nomor_di_customer ?? '-'}</TableCell>
            <TableCell>
              {kontrak ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-auto min-h-0 py-0.5 px-2 text-xs font-normal truncate max-w-[160px]">{kontrak.nama}</Button>
                  </PopoverTrigger>
                  <PopoverContent className="max-w-xs p-3 text-sm break-words">
                    <p className="font-medium">{kontrak.nama}</p>
                    {kontrak.nomor_kontrak && <p className="text-muted-foreground text-xs mt-1">No. Kontrak: {kontrak.nomor_kontrak}</p>}
                  </PopoverContent>
                </Popover>
              ) : '-'}
            </TableCell>
            <TableCell>{item.customer?.nama}</TableCell>
            <TableCell className="font-medium">{item.customer_pic?.nama ?? '-'}</TableCell>
            <TableCell className="font-medium">{new Date(item.tanggal).toLocaleDateString('id-ID')}</TableCell>
            <TableCell><Badge variant={s[item.status]?.v ?? 'outline'}>{s[item.status]?.label ?? item.status}</Badge></TableCell>
            <TableCell><ItemsPopover items={(item.di_item ?? []).map((i: { id: string; nama_barang: string | null; satuan: string | null; jumlah: number; harga_satuan: number }) => ({ id: i.id, nama: i.nama_barang, satuan: i.satuan, jumlah: i.jumlah, harga_satuan: i.harga_satuan }))} /></TableCell>
            <TableCell className="text-right font-medium text-primary">Rp {((item.di_item ?? []).reduce((sum: number, i: { jumlah: number; harga_satuan: number }) => sum + (i.jumlah || 0) * (i.harga_satuan || 0), 0)).toLocaleString('id-ID')}</TableCell>
            <TableCell className="text-right space-x-1"><Button variant="ghost" size="sm" asChild><Link href={`/dashboard/di/${item.id}`}><Eye className="h-4 w-4" /></Link></Button><Button variant="ghost" size="sm" asChild><Link href={`/dashboard/di/${item.id}/edit`}><Pencil className="h-4 w-4" /></Link></Button></TableCell>
          </TableRow>
        )})}
      </TableBody></Table></div>}
    </div>
  )
}
