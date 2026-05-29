"use client"
import { useState, useEffect, useCallback } from 'react'; import { useRouter, useSearchParams } from 'next/navigation'; import Link from 'next/link'
import { z } from 'zod'; import { useForm, useFieldArray } from 'react-hook-form'; import { zodResolver } from '@hookform/resolvers/zod'
import { apiFetch } from '@/lib/api/client'; import { Button } from '@/components/ui/button'; import { Input } from '@/components/ui/input'; import { Textarea } from '@/components/ui/textarea'; import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; import { DatePicker } from '@/components/ui/date-picker'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Plus, Trash2, ArrowLeft, Loader2 } from 'lucide-react'; import { toast } from 'sonner'

const itemSchema = z.object({ quotation_item_id: z.string().min(1), harga_satuan_baru: z.coerce.number().nonnegative(), diskon_baru: z.coerce.number().nonnegative().optional(), alasan: z.string().optional() })
const schema = z.object({ quotation_id: z.string().min(1), tanggal: z.string().min(1), keterangan: z.string().optional(), items: z.array(itemSchema).min(1) })
type FV = z.input<typeof schema>

interface QuotationItem {
  id: string
  barang_id: string | null
  nama_barang: string | null
  image_url: string | null
  jumlah: number
  satuan: string | null
  harga_satuan: number
  diskon: number
  barang: { id: string; nama: string; kode: string; image_url?: string } | null
}

interface QuotationData {
  id: string
  nomor: string
  items: QuotationItem[]
}

export default function TambahNegoiasiPage() {
  const router = useRouter(); const searchParams = useSearchParams()
  const [qtnOpts, setQtnOpts] = useState<Array<{ value: string; label: string }>>([])
  const [quotation, setQuotation] = useState<QuotationData | null>(null)
  const [populating, setPopulating] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const today = new Date().toISOString().split('T')[0]

  const form = useForm<FV>({
    resolver: zodResolver(schema),
    defaultValues: { tanggal: today, items: [{ quotation_item_id: '', harga_satuan_baru: 0 }] },
  })
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'items' })

  const populateFromQuotation = useCallback(async (qtnId: string) => {
    setPopulating(true)
    try {
      const res = await apiFetch<QuotationData>(`/api/v1/quotation/${qtnId}`)
      const qtn = res.data
      if (!qtn) { toast.error('Quotation tidak ditemukan'); return }
      setQuotation(qtn)

      form.setValue('quotation_id', qtn.id)

      if (qtn.items?.length) {
        const mapped = qtn.items.map((i: QuotationItem) => ({
          quotation_item_id: i.id,
          harga_satuan_baru: i.harga_satuan,
          diskon_baru: i.diskon,
          alasan: '',
        }))
        form.setValue('items', mapped)
      }

      toast.success('Data quotation berhasil dimuat')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal memuat quotation')
    } finally {
      setPopulating(false)
    }
  }, [form])

  useEffect(() => {
    apiFetch<Array<{ id: string; nomor: string }>>('/api/v1/quotation')
      .then(r => setQtnOpts((r.data ?? []).map(q => ({ value: q.id, label: q.nomor }))))
      .catch(() => toast.error('Gagal memuat data'))
  }, [])

  useEffect(() => {
    const qtnId = searchParams.get('quotation_id')
    if (qtnId) populateFromQuotation(qtnId)
  }, [searchParams, populateFromQuotation])

  const selectedQtnId = form.watch('quotation_id')

  useEffect(() => {
    if (selectedQtnId && !searchParams.get('quotation_id') && !quotation) {
      populateFromQuotation(selectedQtnId)
    }
  }, [selectedQtnId, searchParams, quotation, populateFromQuotation])

  const onSubmit = async (data: FV) => {
    setSubmitting(true)
    try {
      await apiFetch('/api/v1/negoiasi', { method: 'POST', body: JSON.stringify(data) })
      toast.success('Negosiasi berhasil!')
      router.push('/dashboard/negoiasi')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setSubmitting(false)
    }
  }

  const itemName = (item: QuotationItem) => {
    if (item.barang) return `[${item.barang.kode}] ${item.barang.nama}`
    if (item.nama_barang) return item.nama_barang
    return 'Item #' + ((quotation?.items ?? []).findIndex(i => i.id === item.id) + 1)
  }

  const itemImage = (item: QuotationItem) => item.image_url || item.barang?.image_url || null

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link href="/dashboard/negoiasi"><ArrowLeft className="h-5 w-5" /></Link></Button>
        <div><h1 className="text-3xl font-heading font-bold">Buat Negosiasi</h1><p className="text-muted-foreground mt-1">Negosiasi harga dengan customer</p></div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card><CardHeader><CardTitle className="text-base">Informasi</CardTitle></CardHeader><CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {quotation ? (
                <FormItem>
                  <FormLabel>Quotation</FormLabel>
                  <Input value={`${quotation.nomor} - ${quotation.items?.length || 0} item`} disabled className="bg-muted" />
                </FormItem>
              ) : (
                <FormField control={form.control} name="quotation_id" render={({ field }) => (
                  <FormItem><FormLabel>Quotation *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Pilih Quotation" /></SelectTrigger></FormControl>
                      <SelectContent>{qtnOpts.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              )}
              <div className="space-y-2"><label className="text-sm font-medium">Tanggal *</label><DatePicker value={form.watch('tanggal')} onChange={(v) => form.setValue('tanggal', v)} /></div>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">Keterangan</label><Textarea {...form.register('keterangan')} rows={2} placeholder="Catatan negosiasi..." /></div>
          </CardContent></Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Item Negosiasi</CardTitle>
              {!quotation && (
                <Button type="button" variant="outline" size="sm" onClick={() => append({ quotation_item_id: '', harga_satuan_baru: 0 })}>
                  <Plus className="h-4 w-4 mr-1" />Tambah
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {populating && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />Memuat data quotation...
                </div>
              )}
              {!populating && fields.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Pilih quotation untuk memuat item negosiasi</p>
              )}
              {fields.map((f, i) => {
                const qItem = quotation?.items?.find(qi => qi.id === f.quotation_item_id)
                const imgUrl = qItem ? itemImage(qItem) : null
                return (
                  <div key={f.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        Item #{i + 1}{qItem ? ` - ${itemName(qItem)}` : ''}
                      </span>
                      {fields.length > 1 && !quotation && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => remove(i)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                    <input type="hidden" {...form.register(`items.${i}.quotation_item_id`)} />
                    <div className="flex gap-4">
                      {imgUrl && (
                        <div className="shrink-0">
                          <img
                            src={imgUrl}
                            alt={qItem ? itemName(qItem) : ''}
                            className="w-40 h-40 object-cover rounded-lg border"
                          />
                        </div>
                      )}
                      <div className="flex-1 space-y-3">
                        {qItem && (
                          <div className="grid grid-cols-3 gap-3 text-sm">
                            <div className="space-y-1">
                              <span className="text-xs font-medium text-muted-foreground">Jumlah</span>
                              <p className="font-medium">{qItem.jumlah} {qItem.satuan || ''}</p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-xs font-medium text-muted-foreground">Harga Saat Ini</span>
                              <p className="font-medium">Rp {qItem.harga_satuan.toLocaleString('id-ID')}</p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-xs font-medium text-muted-foreground">Diskon Saat Ini</span>
                              <p className="font-medium">{qItem.diskon > 0 ? `${qItem.diskon}%` : '-'}</p>
                            </div>
                          </div>
                        )}
                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-2">
                            <label className="text-xs font-medium">Harga Baru *</label>
                            <Input type="number" min="0" {...form.register(`items.${i}.harga_satuan_baru`)} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-medium">Diskon Baru</label>
                            <Input type="number" min="0" step="0.01" {...form.register(`items.${i}.diskon_baru`)} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-medium">Alasan</label>
                            <Input {...form.register(`items.${i}.alasan`)} placeholder="Alasan negosiasi" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="cancel"><Link href="/dashboard/negoiasi">Batal</Link></Button>
            <Button type="submit" disabled={submitting || populating}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {submitting ? 'Menyimpan...' : 'Simpan Negosiasi'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
