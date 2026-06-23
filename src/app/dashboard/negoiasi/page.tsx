import Link from 'next/link'
import { supabase } from '@/lib/db/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Plus, Pencil, Eye } from 'lucide-react'
import { ExportButton } from "@/components/export-button"
export const dynamic = 'force-dynamic'

const s: Record<string, { label: string; v: 'secondary' | 'warning' | 'success' | 'outline' }> = {
  draft: { label: 'Draft', v: 'secondary' }, sent: { label: 'Dikirim', v: 'warning' }, approved: { label: 'Disetujui', v: 'success' }, rejected: { label: 'Ditolak', v: 'outline' },
}

export default async function NegoiasiPage() {
  const { data, error } = await supabase.from('negoiasi').select('*, quotation!quotation_id(id, nomor, pic_customer_id, customer!customer_id(id, nama, kode))').order('tanggal', { ascending: false })

  const picIds = (data ?? []).map(n => n.quotation?.pic_customer_id).filter(Boolean) as string[]
  const picMap: Record<string, string> = {}
  if (picIds.length > 0) {
    const { data: pics } = await supabase.from('customer_pic').select('id, nama').in('id', picIds)
    if (pics) {
      for (const p of pics) picMap[p.id] = p.nama
    }
  }

  const statusPriority: Record<string, number> = { draft: 1, sent: 1.5, approved: 2, rejected: 3 }
  ;(data ?? []).sort((a, b) => {
    const pa = statusPriority[a.status] ?? 99
    const pb = statusPriority[b.status] ?? 99
    if (pa !== pb) return pa - pb
    return new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-heading font-bold">Negosiasi</h1><p className="text-muted-foreground mt-1">Track counter offer dan approval</p></div>
        <div className="flex items-center gap-2"><ExportButton table="negoisasi" /><Button asChild><Link href="/dashboard/negoiasi/tambah"><Plus className="h-4 w-4 mr-2" />Tambah Negosiasi</Link></Button></div>
      </div>
      {error ? <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">{error.message}</div> :
      !data?.length ? <div className="text-center py-12 border rounded-lg bg-card"><p className="text-muted-foreground">Belum ada negosiasi.</p>
        <Button asChild className="mt-4"><Link href="/dashboard/negoiasi/tambah">Buat Negosiasi Pertama</Link></Button></div> :
      <div className="rounded-lg border bg-card"><Table><TableHeader><TableRow>
        <TableHead>Nomor</TableHead>
        <TableHead>Quotation</TableHead>
        <TableHead>Customer</TableHead>
        <TableHead>PIC</TableHead>
        <TableHead>Tanggal</TableHead>
        <TableHead>Status</TableHead>
        <TableHead className="text-right">Aksi</TableHead>
      </TableRow></TableHeader><TableBody>
        {data.map((item: { id: string; nomor: string; quotation: { nomor: string; pic_customer_id: string | null; customer: { nama: string } | null } | null; tanggal: string; status: string }) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.nomor}</TableCell>
            <TableCell className="font-medium">{item.quotation?.nomor ?? '-'}</TableCell>
            <TableCell className="font-medium">{item.quotation?.customer?.nama ?? '-'}</TableCell>
            <TableCell className="font-medium">{picMap[item.quotation?.pic_customer_id ?? ''] ?? '-'}</TableCell>
            <TableCell className="font-medium">{new Date(item.tanggal).toLocaleDateString('id-ID')}</TableCell>
            <TableCell><Badge variant={s[item.status]?.v ?? 'outline'}>{s[item.status]?.label ?? item.status}</Badge></TableCell>
            <TableCell className="text-right"><Button variant="ghost" size="sm" asChild><Link href={`/dashboard/negoiasi/${item.id}`}><Eye className="h-4 w-4" /><span className="sr-only">Detail</span></Link></Button><Button variant="ghost" size="sm" asChild><Link href={`/dashboard/negoiasi/${item.id}/edit`}><Pencil className="h-4 w-4" /><span className="sr-only">Edit</span></Link></Button></TableCell>
          </TableRow>
        ))}
      </TableBody></Table></div>}
    </div>
  )
}
