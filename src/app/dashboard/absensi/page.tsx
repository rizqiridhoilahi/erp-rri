import Link from 'next/link'
import { supabase } from '@/lib/db/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Pencil } from 'lucide-react'

const s: Record<string, { label: string; v: 'success' | 'warning' | 'secondary' | 'destructive' | 'outline' }> = {
  hadir: { label: 'Hadir', v: 'success' }, sakit: { label: 'Sakit', v: 'warning' },
  izin: { label: 'Izin', v: 'secondary' }, alpha: { label: 'Alpha', v: 'destructive' }, cuti: { label: 'Cuti', v: 'outline' },
}

export default async function AbsensiPage() {
  const { data, error } = await supabase.from('absensi').select('*, karyawan!karyawan_id(nama, nik)').order('tanggal', { ascending: false }).limit(100)
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-heading font-bold">Absensi</h1><p className="text-muted-foreground mt-1">Catatan kehadiran karyawan</p></div>
        <Button asChild><Link href="/dashboard/absensi/tambah"><Plus className="h-4 w-4 mr-2" />Tambah Absensi</Link></Button>
      </div>
      {error ? <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">{error.message}</div> :
      !data?.length ? <div className="text-center py-12 border rounded-lg bg-card"><p className="text-muted-foreground">Belum ada absensi.</p>
        <Button asChild className="mt-4"><Link href="/dashboard/absensi/tambah">Input Absensi Pertama</Link></Button></div> :
      <div className="rounded-lg border bg-card"><table className="w-full"><thead><tr className="border-b bg-muted/50">
        <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Karyawan</th>
        <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">NIK</th>
        <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Tanggal</th>
        <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
        <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Keterangan</th>
        <th className="text-right p-3 text-xs font-medium text-muted-foreground uppercase">Aksi</th>
      </tr></thead><tbody className="divide-y">
        {data.map((item) => (
          <tr key={item.id} className="hover:bg-muted/30">
            <td className="p-3 text-sm font-medium">{item.karyawan?.nama}</td>
            <td className="p-3 text-sm text-muted-foreground">{item.karyawan?.nik}</td>
            <td className="p-3 text-sm">{new Date(item.tanggal).toLocaleDateString('id-ID')}</td>
            <td className="p-3"><Badge variant={s[item.status]?.v ?? 'outline'}>{s[item.status]?.label ?? item.status}</Badge></td>
            <td className="p-3 text-sm text-muted-foreground">{item.keterangan ?? '-'}</td>
            <td className="p-3 text-right"><Button variant="ghost" size="sm" asChild><Link href={`/dashboard/absensi/${item.id}/edit`}><Pencil className="h-4 w-4" /></Link></Button></td>
          </tr>
        ))}
      </tbody></table></div>}
    </div>
  )
}
