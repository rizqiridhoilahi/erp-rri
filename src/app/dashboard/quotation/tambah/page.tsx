"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { apiFetch } from '@/lib/api/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { DatePicker } from '@/components/ui/date-picker'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Plus, Trash2, ArrowLeft, Loader2, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { FormSkeleton } from '@/components/ui/skeleton'

const itemSchema = z.object({
  barang_id: z.string().optional(),
  specification: z.string().optional(),
  justification: z.string().optional(),
  image_url: z.string().optional(),
  nama_barang: z.string().optional(),
  satuan: z.string().min(1, 'Satuan harus diisi'),
  jumlah: z.coerce.number().int().positive('Jumlah harus > 0'),
  harga_satuan: z.coerce.number().nonnegative('Harga harus diisi'),
  harga_beli: z.coerce.number().nonnegative().optional().default(0),
  diskon: z.coerce.number().nonnegative().optional(),
  keterangan: z.string().optional(),
})

const qtnSchema = z.object({
  customer_id: z.string().min(1, 'Customer harus dipilih'),
  rfq_id: z.string().optional(),
  referensi: z.string().optional(),
  lampiran: z.string().optional(),
  perihal: z.string().default('Penawaran Harga'),
  pic_customer_id: z.string().optional(),
  alamat: z.string().optional(),
  tanggal: z.string().min(1, 'Tanggal harus diisi'),
  masa_berlaku: z.string().optional(),
  ppn_rate: z.coerce.number().nonnegative().default(0.11),
  ppn_enabled: z.boolean().default(false),
  overhead_biaya: z.coerce.number().nonnegative().default(0),
  overhead_metode: z.enum(['quantity', 'price']).default('quantity'),
  target_margin: z.coerce.number().min(0).max(1).default(0.15),
  negotiation_buffer: z.coerce.number().min(0).max(1).default(0.10),
  keterangan: z.string().optional(),
  items: z.array(itemSchema).min(1, 'Minimal 1 item'),
})

type QtnFormValues = z.input<typeof qtnSchema>

const masaBerlakuOptions = [
  { value: '1 Minggu', label: '1 Minggu' },
  { value: '2 Minggu', label: '2 Minggu' },
  { value: '3 Minggu', label: '3 Minggu' },
  { value: '1 Bulan', label: '1 Bulan' },
]

interface BarangOption {
  value: string
  label: string
  satuan: string
  spesifikasi: string
  justification: string
  image_url: string
}

export default function TambahQuotationPage() {
  const router = useRouter()
  const [customerOptions, setCustomerOptions] = useState<Array<{ value: string; label: string; alamat?: string }>>([])
  const [barangData, setBarangData] = useState<BarangOption[]>([])
  const [picOptions, setPicOptions] = useState<Array<{ value: string; label: string }>>([])
  const [rfqOptions, setRfqOptions] = useState<Array<{ value: string; label: string }>>([])
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [rfqPicLabel, setRfqPicLabel] = useState('')
  const [rfqItemLabels, setRfqItemLabels] = useState<string[]>([])
  const [isRfqLoaded, setIsRfqLoaded] = useState(false)
  const [nomorDokumen, setNomorDokumen] = useState('')

  const today = new Date().toISOString().split('T')[0]

  const form = useForm<QtnFormValues>({
    resolver: zodResolver(qtnSchema),
    defaultValues: {
      tanggal: today,
      perihal: 'Penawaran Harga',
      lampiran: '',
      ppn_rate: 0.11,
      ppn_enabled: false,
      overhead_biaya: 0,
      overhead_metode: 'quantity',
      target_margin: 0.15,
      negotiation_buffer: 0.10,
      items: [{ barang_id: '', jumlah: 1, harga_satuan: 0, specification: '', justification: '', image_url: '', nama_barang: '', satuan: '' }],
    },
  })

  const { register, handleSubmit, control, watch, setValue } = form
  const { fields, append, remove, replace } = useFieldArray({ control, name: 'items' })

  const selectedCustomerId = watch('customer_id')
  const selectedRfqId = watch('rfq_id')

  useEffect(() => {
    const rfqIdFromUrl = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('rfq_id') : null
    Promise.all([
      apiFetch<Array<{ id: string; nama: string; kode: string; alamat?: string }>>('/api/v1/master/customer'),
      apiFetch<Array<{ id: string; nama: string; kode: string; satuan: string; spesifikasi?: string; justification?: string; image_url?: string }>>('/api/v1/master/barang/dropdown'),
      apiFetch<Array<{ id: string; nomor: string; nomor_rfq_customer?: string }>>('/api/v1/rfq-customer'),
    ]).then(([customers, barang, rfqs]) => {
      setCustomerOptions((customers.data ?? []).map(c => ({ value: c.id, label: `[${c.kode}] ${c.nama}`, alamat: c.alamat ?? '' })))
      const bOptions = (barang.data ?? []).map(b => ({
        value: b.id,
        label: `[${b.kode}] ${b.nama}`,
        satuan: b.satuan,
        spesifikasi: b.spesifikasi ?? '',
        justification: b.justification ?? '',
        image_url: b.image_url ?? '',
      }))
      setBarangData(bOptions)
      setRfqOptions((rfqs.data ?? []).map(r => ({ value: r.id, label: r.nomor_rfq_customer || r.nomor })))
      if (rfqIdFromUrl) {
        setValue('rfq_id', rfqIdFromUrl)
      }
      if (!rfqIdFromUrl) {
        apiFetch<{ nomor: string }>('/api/v1/system/nomor-baru?kode=SPH')
          .then(res => setNomorDokumen(res.data.nomor))
          .catch(() => {})
      }
    }).catch(() => toast.error('Gagal memuat data referensi')).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedCustomerId) { setPicOptions([]); return }
    apiFetch<Array<{ id: string; nama: string; jabatan?: string }>>(`/api/v1/master/pic-customer?customer_id=${selectedCustomerId}`)
      .then((res) => setPicOptions((res.data ?? []).map(p => ({ value: p.id, label: `${p.nama}${p.jabatan ? ` (${p.jabatan})` : ''}` }))))
      .catch(() => {})
    const cust = customerOptions.find(c => c.value === selectedCustomerId)
    if (cust?.alamat) setValue('alamat', cust.alamat)
  }, [selectedCustomerId, customerOptions, setValue])

  useEffect(() => {
    let cancelled = false

    if (!selectedRfqId) {
      setRfqPicLabel('')
      setRfqItemLabels([])
      setIsRfqLoaded(false)
      apiFetch<{ nomor: string }>('/api/v1/system/nomor-baru?kode=SPH')
        .then(res => {
          if (cancelled) return
          setNomorDokumen(res.data.nomor)
        })
        .catch(() => {})
    } else {
      interface RfqData {
        customer_id: string
        pic_customer_id: string | null
        nomor: string
        nomor_rfq_customer: string | null
        pic_customer: { id: string; nama: string; jabatan: string } | null
        items: Array<{
          barang_id: string | null
          nama_barang: string | null
          jumlah: number
          satuan: string | null
          image_url: string | null
          keterangan: string | null
          justification: string | null
          barang: { id: string; nama: string; kode: string; satuan: string } | null
        }>
      }

      apiFetch<RfqData>(`/api/v1/rfq-customer/${selectedRfqId}`)
        .then((res) => {
          if (cancelled) return
          const rfq = res.data as RfqData

          setValue('referensi', rfq.nomor_rfq_customer || rfq.nomor)
          setValue('customer_id', rfq.customer_id)

          const cust = customerOptions.find(c => c.value === rfq.customer_id)
          if (cust?.alamat) setValue('alamat', cust.alamat)

          if (rfq.pic_customer_id) {
            setValue('pic_customer_id', rfq.pic_customer_id)
          }
          if (rfq.pic_customer) {
            const label = `${rfq.pic_customer.nama}${rfq.pic_customer.jabatan ? ` (${rfq.pic_customer.jabatan})` : ''}`
            setPicOptions([{ value: rfq.pic_customer.id, label }])
            setRfqPicLabel(label)
          }

          const newItems = (rfq.items ?? []).map(item => ({
            barang_id: item.barang_id || '',
            specification: item.keterangan || '',
            justification: item.justification || '',
            image_url: item.image_url || '',
            nama_barang: item.barang?.nama || item.nama_barang || '',
            satuan: item.satuan || '',
            jumlah: item.jumlah,
            harga_satuan: 0,
            diskon: 0,
            keterangan: '',
          }))
          if (cancelled) return
          replace(newItems)

          setRfqItemLabels(rfq.items.map(item =>
            item.barang?.nama || item.nama_barang || ''
          ))

          if (rfq.nomor) {
            const parts = rfq.nomor.split('-')
            if (parts.length >= 5) {
              setNomorDokumen(`RRI-SPH-${parts[2]}-${parts[3]}-${parts[4]}`)
            }
          }

          setIsRfqLoaded(true)

          newItems.forEach((item, i) => {
            if (item.barang_id) {
              const barang = barangData.find(b => b.value === item.barang_id)
              if (barang) {
                if (!item.keterangan && barang.spesifikasi) {
                  setValue(`items.${i}.specification`, barang.spesifikasi)
                }
                if (barang.justification) {
                  setValue(`items.${i}.justification`, barang.justification)
                }
              }
            }
          })
        })
        .catch(() => toast.error('Gagal memuat data RFQ Customer'))
    }

    return () => { cancelled = true }
  }, [selectedRfqId, customerOptions, barangData, replace, setValue])

  const handleBarangChange = (index: number, barangId: string) => {
    const barang = barangData.find(b => b.value === barangId)
    if (barang) {
      setValue(`items.${index}.specification`, barang.spesifikasi)
      setValue(`items.${index}.justification`, barang.justification)
      setValue(`items.${index}.image_url`, barang.image_url)
      setValue(`items.${index}.satuan`, barang.satuan)
    }
  }

  const onSubmit = async (data: QtnFormValues) => {
    setSubmitting(true)
    try {
      const res = await apiFetch<{ id: string }>('/api/v1/quotation', {
        method: 'POST',
        body: JSON.stringify(data),
      })

      toast.success('Quotation berhasil dibuat!')
      router.push('/dashboard/quotation')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <FormSkeleton />

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/quotation"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-heading font-bold">Buat Quotation</h1>
          <p className="text-muted-foreground mt-1">Surat Penawaran Harga (SPH) untuk customer</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Header Surat</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800 px-4 py-3">
                <FileText className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
                <div className="text-sm">
                  <span className="text-muted-foreground">Nomor Dokumen Internal: </span>
                  <span className="font-mono font-semibold">{nomorDokumen || 'Memuat...'}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={control} name="rfq_id" render={({ field }) => (
                  <FormItem><FormLabel>No. Referensi (RFQ)</FormLabel>
                    <Select onValueChange={(v) => field.onChange(v)} value={field.value} disabled={isRfqLoaded}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Pilih RFQ" /></SelectTrigger></FormControl>
                      <SelectContent>{rfqOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={control} name="lampiran" render={({ field }) => (
                  <FormItem><FormLabel>Lampiran</FormLabel><FormControl><Input {...field} placeholder="Softcopy Penawaran Harga" /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={control} name="perihal" render={({ field }) => (
                  <FormItem><FormLabel>Perihal</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={control} name="tanggal" render={({ field }) => (
                  <FormItem><FormLabel>Tanggal *</FormLabel><FormControl><DatePicker value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Kepada Yth.</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={control} name="customer_id" render={({ field }) => (
                  <FormItem><FormLabel>Customer *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isRfqLoaded}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Pilih Customer" /></SelectTrigger></FormControl>
                      <SelectContent>{customerOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={control} name="pic_customer_id" render={({ field }) => (
                  <FormItem><FormLabel>PIC Customer</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ''} disabled={isRfqLoaded}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Pilih PIC" /></SelectTrigger></FormControl>
                      <SelectContent>{picOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={control} name="alamat" render={({ field }) => (
                <FormItem><FormLabel>Alamat Tujuan</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>
              )} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Item Penawaran</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={() => append({ barang_id: '', jumlah: 1, harga_satuan: 0, harga_beli: 0, specification: '', justification: '', image_url: '', nama_barang: '', satuan: '' })}>
                <Plus className="h-4 w-4 mr-1" />Tambah Item
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Item #{index + 1}</span>
                    {fields.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={control} name={`items.${index}.barang_id`} render={({ field }) => (
                      <FormItem><FormLabel>Barang *</FormLabel>
                        {rfqItemLabels[index] ? (
                          <FormControl>
                            <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted/30 px-3 text-sm">{rfqItemLabels[index]}</div>
                          </FormControl>
                        ) : (
                          <Select onValueChange={(v) => { field.onChange(v); handleBarangChange(index, v) }} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Pilih Barang" /></SelectTrigger></FormControl>
                            <SelectContent>{barangData.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                          </Select>
                        )}
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={control} name={`items.${index}.specification`} render={({ field }) => (
                      <FormItem><FormLabel>Specification</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={control} name={`items.${index}.justification`} render={({ field }) => (
                      <FormItem><FormLabel>Justification</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={control} name={`items.${index}.image_url`} render={({ field }) => (
                      <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input {...field} placeholder="https://..." /></FormControl>
                        {field.value && <img src={field.value} alt="" className="mt-1 h-12 w-12 object-contain rounded border" />}
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    <FormField control={control} name={`items.${index}.jumlah`} render={({ field }) => (
                      <FormItem><FormLabel>Qty *</FormLabel><FormControl><Input type="number" min="1" value={String(field.value ?? '')} onChange={e => field.onChange(Number(e.target.value))} onBlur={field.onBlur} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={control} name={`items.${index}.satuan`} render={({ field }) => (
                      <FormItem><FormLabel>UoM</FormLabel><FormControl><Input value={String(field.value ?? '')} onChange={field.onChange} onBlur={field.onBlur} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={control} name={`items.${index}.harga_beli`} render={({ field }) => (
                      <FormItem><FormLabel>Harga Beli *</FormLabel><FormControl><Input type="number" min="0" step="1" value={String(field.value ?? '')} onChange={e => field.onChange(Number(e.target.value))} onBlur={field.onBlur} placeholder="0" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={control} name={`items.${index}.harga_satuan`} render={({ field }) => (
                      <FormItem><FormLabel>Harga Jual *</FormLabel><FormControl><Input type="number" min="0" step="1" value={String(field.value ?? '')} onChange={e => field.onChange(Number(e.target.value))} onBlur={field.onBlur} placeholder="0" /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <div className="grid grid-cols-8 gap-3">
                    {(() => {
                      const qty = Number(watch(`items.${index}.jumlah`)) || 0
                      const hargaBeli = Number(watch(`items.${index}.harga_beli`)) || 0
                      const hargaJual = Number(watch(`items.${index}.harga_satuan`)) || 0
                      const items = watch('items') || []
                      const overheadBiaya = Number(watch('overhead_biaya')) || 0
                      const metode = watch('overhead_metode') || 'quantity'
                      const totalQty = items.reduce((s, i) => s + (Number(i.jumlah) || 0), 0)
                      const totalValue = items.reduce((s, i) => s + (Number(i.jumlah) || 0) * (Number(i.harga_satuan) || 0), 0)
                      const overheadPerUnit = overheadBiaya <= 0 ? 0
                        : metode === 'quantity'
                          ? (totalQty > 0 ? overheadBiaya / totalQty : 0)
                          : (totalValue > 0 ? overheadBiaya * hargaJual / totalValue : 0)
                      const marginKotor = hargaJual - hargaBeli
                      const marginBersih = marginKotor - overheadPerUnit
                      const marginKotorPct = hargaJual > 0 ? (marginKotor / hargaJual) * 100 : 0
                      const marginBersihPct = hargaJual > 0 ? (marginBersih / hargaJual) * 100 : 0
                      const targetMargin = Number(watch('target_margin')) || 0.15
                      const buffer = Number(watch('negotiation_buffer')) || 0.10
                      const targetWithBufferPct = (1 - (1 - targetMargin) * (1 - buffer)) * 100
                      const marginStatus = marginBersihPct >= targetWithBufferPct ? 'full' : marginBersihPct >= targetMargin * 100 ? 'on_target' : 'below'
                      const statusIcon = marginStatus === 'full' ? '✅' : marginStatus === 'on_target' ? '⚠️' : '🔴'
                      const statusLabel = marginStatus === 'full' ? 'Ada Buffer' : marginStatus === 'on_target' ? 'Sesuai Target' : 'Dibawah Target'
                      const statusColor = marginStatus === 'full' ? 'text-green-600 border-green-300 bg-green-50' : marginStatus === 'on_target' ? 'text-yellow-700 border-yellow-300 bg-yellow-50' : 'text-red-600 border-red-300 bg-red-50'
                      return (
                        <>
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">Total Harga Beli</label>
                            <div className="h-10 flex items-center px-3 border rounded-md bg-muted/30 text-sm font-medium text-muted-foreground">
                              Rp {(qty * hargaBeli).toLocaleString('id-ID')}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-medium">Total Harga Jual</label>
                            <div className="h-10 flex items-center px-3 border rounded-md bg-muted/30 text-sm font-medium">
                              Rp {(qty * hargaJual).toLocaleString('id-ID')}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-medium">Margin Kotor (Rp)</label>
                            <div className={`h-10 flex items-center px-3 border rounded-md bg-muted/30 text-sm font-medium ${marginKotor >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              Rp {marginKotor.toLocaleString('id-ID')}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-medium">Margin Kotor (%)</label>
                            <div className={`h-10 flex items-center px-3 border rounded-md bg-muted/30 text-sm font-medium ${marginKotor >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {marginKotorPct.toFixed(1)}%
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">Overhead</label>
                            <div className="h-10 flex items-center px-3 border rounded-md bg-muted/30 text-sm font-medium text-muted-foreground">
                              Rp {overheadPerUnit.toLocaleString('id-ID')}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-medium">Margin Bersih (Rp)</label>
                            <div className={`h-10 flex items-center px-3 border rounded-md bg-muted/30 text-sm font-medium ${marginBersih >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              Rp {marginBersih.toLocaleString('id-ID')}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-medium">Margin Bersih (%)</label>
                            <div className={`h-10 flex items-center px-3 border rounded-md bg-muted/30 text-sm font-medium ${marginBersih >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {marginBersihPct.toFixed(1)}%
                            </div>
                          </div>
                          <div className={`flex items-center justify-center h-10 px-2 border rounded-md text-xs font-medium ${statusColor}`}>
                            {statusIcon} {statusLabel}
                          </div>
                        </>
                      )
                    })()}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {fields.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Biaya Overhead</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Biaya operasional tambahan (pengiriman, dll) yang dialokasikan ke setiap item.</p>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={control} name="overhead_biaya" render={({ field }) => (
                    <FormItem><FormLabel>Total Overhead (Rp)</FormLabel><FormControl><Input type="number" min="0" step="1" value={String(field.value ?? '')} onChange={e => field.onChange(Number(e.target.value))} placeholder="0" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={control} name="overhead_metode" render={({ field }) => (
                    <FormItem><FormLabel>Metode Alokasi</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Pilih metode" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="quantity">Per Quantity (rata per unit)</SelectItem>
                          <SelectItem value="price">Per Harga Jual (proporsional)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                {(Number(watch('overhead_biaya')) || 0) > 0 && (
                  <div className="overflow-x-auto">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Preview Alokasi Overhead</p>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-xs text-muted-foreground">
                          <th className="py-1 pr-2">Item</th>
                          <th className="py-1 px-2 text-right">Qty</th>
                          <th className="py-1 px-2 text-right">Overhead/Unit</th>
                          <th className="py-1 pl-2 text-right">Total Overhead</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const items = watch('items') || []
                          const overheadBiaya = Number(watch('overhead_biaya')) || 0
                          const metode = watch('overhead_metode') || 'quantity'
                          const totalQty = items.reduce((s, i) => s + (Number(i.jumlah) || 0), 0)
                          const totalValue = items.reduce((s, i) => s + (Number(i.jumlah) || 0) * (Number(i.harga_satuan) || 0), 0)
                          const perUnit = metode === 'quantity'
                            ? (totalQty > 0 ? overheadBiaya / totalQty : 0)
                            : (totalValue > 0 ? overheadBiaya / totalValue : 0)
                          return items.map((item, i) => {
                            const qty = Number(item.jumlah) || 0
                            const val = qty * (Number(item.harga_satuan) || 0)
                            const overheadUnit = metode === 'quantity' ? perUnit : (totalValue > 0 ? overheadBiaya * val / totalValue / qty : 0)
                            const totalOverhead = qty * overheadUnit
                            return (
                              <tr key={i} className="border-b last:border-0">
                                <td className="py-1 pr-2 font-medium">Item #{i + 1}</td>
                                <td className="py-1 px-2 text-right">{qty}</td>
                                <td className="py-1 px-2 text-right">Rp {overheadUnit.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                                <td className="py-1 pl-2 text-right">Rp {totalOverhead.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                              </tr>
                            )
                          })
                        })()}
                        <tr className="font-medium border-t">
                          <td className="py-1 pr-2" colSpan={3}>Total</td>
                          <td className="py-1 pl-2 text-right">Rp {(Number(watch('overhead_biaya')) || 0).toLocaleString('id-ID')}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle className="text-base">Pengaturan</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={control} name="masa_berlaku" render={({ field }) => (
                  <FormItem><FormLabel>Masa Berlaku</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ''}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Pilih masa berlaku" /></SelectTrigger></FormControl>
                      <SelectContent>{masaBerlakuOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={control} name="ppn_enabled" render={({ field }) => (
                  <FormItem><FormLabel>PPN</FormLabel>
                    <div className="flex items-center gap-3 h-10">
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                      <span className="text-sm text-muted-foreground">{field.value ? 'PPN 11%' : 'Non-PPN'}</span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={control} name="keterangan" render={({ field }) => (
                <FormItem><FormLabel>Keterangan</FormLabel><FormControl><Textarea {...field} rows={2} placeholder="Catatan tambahan..." /></FormControl><FormMessage /></FormItem>
              )} />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="cancel">
              <Link href="/dashboard/quotation">Batal</Link>
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {submitting ? 'Menyimpan...' : 'Simpan Quotation'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
