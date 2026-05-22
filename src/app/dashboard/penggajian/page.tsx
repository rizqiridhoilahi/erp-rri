import Link from 'next/link'
import { supabase } from '@/lib/db/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, Download } from 'lucide-react'

const s: Record<string, { label: string; v: 'secondary' | 'success' | 'warning' | 'outline' }> = {
  draft: { label: 'Draft', v: 'secondary' }, paid: { label: 'Dibayar', v: 'success' }, pending: { label: 'Pending', v: 'warning' },
}

export default async function PenggajianPage() {
  const { data, error } = await supabase.from('penggajian').select('*, karyawan!karyawan_id(nama, nik)').order('created_at', { ascending: false })
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-heading font-bold">Penggajian</h1><p className="text-muted-foreground mt-1">Pengelolaan gaji karyawan</p></div>
        <Button asChild><Link href="/dashboard/penggajian/tambah"><Plus className="h-4 w-4 mr-2" />Tambah Penggajian</Link></Button>
      </div>
      {error ? <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">{error.message}</div> :
      !data?.length ? <div className="text-center py-12 border rounded-lg bg-card"><p className="text-muted-foreground">Belum ada data penggajian.</p>
        <Button asChild className="mt-4"><Link href="/dashboard/penggajian/tambah">Input Gaji Pertama</Link></Button></div> :
      <div className="rounded-lg border bg-card"><table className="w-full"><thead><tr className="border-b bg-muted/50">
        <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Nomor</th>
        <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Karyawan</th>
        <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Periode</th>
        <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Gaji Bersih</th>
        <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
        <th className="text-right p-3 text-xs font-medium text-muted-foreground uppercase">Aksi</th>
      </tr></thead><tbody className="divide-y">
        {data.map((item) => (
          <tr key={item.id} className="hover:bg-muted/30">
            <td className="p-3 text-sm font-medium">{item.nomor}</td>
            <td className="p-3 text-sm">{item.karyawan?.nama}</td>
            <td className="p-3 text-sm">{item.bulan}/{item.tahun}</td>
            <td className="p-3 text-sm font-bold">Rp {(item.gaji_bersih ?? 0).toLocaleString('id-ID')}</td>
            <td className="p-3"><Badge variant={s[item.status]?.v ?? 'outline'}>{s[item.status]?.label ?? item.status}</Badge></td>
            <td className="p-3 text-right space-x-1">
              <Button variant="ghost" size="sm" asChild><a href={`/api/v1/slip-gaji/${item.id}/pdf`} target="_blank"><Download className="h-4 w-4" /></a></Button>
              <Button variant="ghost" size="sm" asChild><Link href={`/dashboard/penggajian/${item.id}/edit`}><Pencil className="h-4 w-4" /></Link></Button>
            </td>
          </tr>
        ))}
      </tbody></table></div>}
    </div>
  )
}
