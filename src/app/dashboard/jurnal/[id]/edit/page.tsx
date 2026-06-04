"use client"
import Link from 'next/link'
import { useState, useEffect } from 'react'; import { useRouter, useParams } from 'next/navigation'; import { z } from 'zod'; import { useForm, useFieldArray } from 'react-hook-form'; import { zodResolver } from '@hookform/resolvers/zod'
import { apiFetch } from '@/lib/api/client'; import { Button } from '@/components/ui/button'; import { Input } from '@/components/ui/input'; import { Textarea } from '@/components/ui/textarea'; import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Plus, Trash2, ArrowLeft, Loader2 } from 'lucide-react'; import { toast } from 'sonner'

const itemSchema = z.object({ akun_id: z.string().min(1), debit: z.coerce.number().min(0), credit: z.coerce.number().min(0), keterangan: z.string().optional() })
const schema = z.object({ status: z.string().optional(), keterangan: z.string().optional(), items: z.array(itemSchema).min(2) })
type FV = z.input<typeof schema>

const statusOpts = [{ value: 'draft', label: 'Draft' }, { value: 'posted', label: 'Posted' }]

export default function EditJurnalPage() {
  const router = useRouter(); const params = useParams(); const [loading, setLoading] = useState(true); const [submitting, setSubmitting] = useState(false)
  const [akunOpts, setAkunOpts] = useState<Array<{ value: string; label: string }>>([])
  const form = useForm<FV>({ resolver: zodResolver(schema) })
  const { register, handleSubmit, control, reset } = form
  const { fields, append, remove } = useFieldArray({ control, name: 'items' })

  useEffect(() => {
    apiFetch<Array<{ id: string; kode: string; nama: string }>>('/api/v1/master/coa')
      .then(r => setAkunOpts((r.data ?? []).map(x => ({ value: x.id, label: `[${x.kode}] ${x.nama}` })))).catch(() => toast.error('Gagal'))
  }, [])

  useEffect(() => {
    if (akunOpts.length === 0) return
    apiFetch<{ status: string; keterangan: string | null; items: Array<{ akun_id: { id: string }; debit: number; credit: number; keterangan: string | null }> }>(`/api/v1/jurnal/${params.id}`)
      .then(r => {
        const items = (r.data.items ?? []).map((i: { akun_id: { id: string }; debit: number; credit: number; keterangan: string | null }) => ({
          akun_id: i.akun_id?.id ?? '', debit: i.debit, credit: i.credit, keterangan: i.keterangan ?? '',
        }))
        reset({ status: r.data.status, keterangan: r.data.keterangan ?? '', items })
        setLoading(false)
      }).catch(() => { toast.error('Gagal'); router.push('/dashboard/jurnal') })
  }, [params.id, reset, router, akunOpts.length])

  const onSubmit = async (data: FV) => {
    setSubmitting(true); try { await apiFetch(`/api/v1/jurnal/${params.id}`, { method: 'PUT', body: JSON.stringify(data) }); toast.success('Diupdate!'); router.push('/dashboard/jurnal') }
    catch (err) { toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan') } finally { setSubmitting(false) }
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4"><Button variant="ghost" size="icon" asChild><Link href="/dashboard/jurnal"><ArrowLeft className="h-5 w-5" /></Link></Button><div><h1 className="text-3xl font-heading font-bold">Edit Jurnal</h1></div></div>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card><CardHeader><CardTitle className="text-base">Informasi</CardTitle></CardHeader><CardContent className="space-y-4">
            <div className="space-y-2"><label className="text-sm font-medium">Status</label>
              <select {...register('status')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring">{statusOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
            <FormField control={control} name="keterangan" render={({ field }) => (
              <FormItem><FormLabel>Keterangan</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>
            )} />
          </CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-base">Item (Debit / Credit)</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={() => append({ akun_id: '', debit: 0, credit: 0 })}><Plus className="h-4 w-4 mr-1" />Tambah</Button></CardHeader>
            <CardContent className="space-y-4">{fields.map((f, i) => (
              <div key={f.id} className="p-4 border rounded-lg space-y-3"><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Item #{i+1}</span>{fields.length > 1 && <Button type="button" variant="ghost" size="sm" onClick={() => remove(i)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}</div>
                <div className="grid grid-cols-4 gap-3">
                  <FormField control={control} name={`items.${i}.akun_id`} render={({ field }) => (
                    <FormItem><FormLabel>Akun *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger></FormControl>
                        <SelectContent>{akunOpts.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="space-y-2"><label className="text-xs font-medium">Debit</label><Input type="number" step="0.01" {...register(`items.${i}.debit`)} /></div>
                  <div className="space-y-2"><label className="text-xs font-medium">Credit</label><Input type="number" step="0.01" {...register(`items.${i}.credit`)} /></div>
                  <div className="space-y-2"><label className="text-xs font-medium">Keterangan</label><Input {...register(`items.${i}.keterangan`)} /></div>
                </div>
              </div>
            ))}</CardContent></Card>
          <div className="flex justify-end gap-3"><Button type="button" variant="cancel" asChild><Link href="/dashboard/jurnal">Batal</Link></Button>
            <Button type="submit" disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{submitting ? '...' : 'Update Jurnal'}</Button></div>
        </form>
      </Form>
    </div>
  )
}