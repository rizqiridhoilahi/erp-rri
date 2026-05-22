"use client"
import { useState, useEffect } from 'react'; import { useRouter } from 'next/navigation'; import { z } from 'zod'; import { useForm } from 'react-hook-form'; import { zodResolver } from '@hookform/resolvers/zod'
import { apiFetch } from '@/lib/api/client'; import { Button } from '@/components/ui/button'; import { Input } from '@/components/ui/input'; import { Textarea } from '@/components/ui/textarea'; import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Loader2 } from 'lucide-react'; import { toast } from 'sonner'

const schema = z.object({ karyawan_id: z.string().min(1), tanggal: z.string().min(1), status: z.enum(['hadir', 'sakit', 'izin', 'alpha', 'cuti']), keterangan: z.string().optional() })
type FV = z.input<typeof schema>
const statusOpts = [{ value: 'hadir', label: 'Hadir' }, { value: 'sakit', label: 'Sakit' }, { value: 'izin', label: 'Izin' }, { value: 'alpha', label: 'Alpha' }, { value: 'cuti', label: 'Cuti' }]

export default function TambahAbsensiPage() {
  const router = useRouter(); const [kOpts, setKOpts] = useState<Array<{ value: string; label: string }>>([]); const [submitting, setSubmitting] = useState(false)
  const today = new Date().toISOString().split('T')[0]
  const { register, handleSubmit, formState: { errors } } = useForm<FV>({ resolver: zodResolver(schema), defaultValues: { tanggal: today, status: 'hadir' } })
  useEffect(() => { apiFetch<{ data: Array<{ id: string; nama: string; nik: string; is_active: boolean }> }>('/api/v1/master/karyawan').then(r => { const d = r.data ?? []; setKOpts(d.filter(k => k.is_active !== false).map(x => ({ value: x.id, label: `[${x.nik}] ${x.nama}` }))) }).catch(() => toast.error('Gagal')) }, [])
  const onSubmit = async (data: FV) => {
    setSubmitting(true); try { await apiFetch('/api/v1/absensi', { method: 'POST', body: JSON.stringify(data) }); toast.success('Absensi dicatat!'); router.push('/dashboard/absensi') }
    catch (err) { toast.error(err instanceof Error ? err.message : 'Error') } finally { setSubmitting(false) }
  }
  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-4"><Button variant="ghost" size="icon" asChild><a href="/dashboard/absensi"><ArrowLeft className="h-5 w-5" /></a></Button><div><h1 className="text-3xl font-heading font-bold">Tambah Absensi</h1></div></div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6"><Card><CardHeader><CardTitle className="text-base">Data Kehadiran</CardTitle></CardHeader><CardContent className="space-y-4">
        <div className="space-y-2"><label className="text-sm font-medium">Karyawan *</label>
          <select {...register('karyawan_id')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring"><option value="">Pilih</option>{kOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><label className="text-sm font-medium">Tanggal *</label><Input type="date" {...register('tanggal')} /></div>
          <div className="space-y-2"><label className="text-sm font-medium">Status *</label>
            <select {...register('status')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring">{statusOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
        </div>
        <div className="space-y-2"><label className="text-sm font-medium">Keterangan</label><Textarea {...register('keterangan')} rows={2} /></div>
      </CardContent></Card><div className="flex justify-end gap-3"><Button type="button" variant="outline" asChild><a href="/dashboard/absensi">Batal</a></Button>
        <Button type="submit" disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{submitting ? '...' : 'Simpan'}</Button></div></form>
    </div>
  )
}
