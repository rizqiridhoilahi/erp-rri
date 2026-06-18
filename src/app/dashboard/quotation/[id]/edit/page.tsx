"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { z } from 'zod'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { apiFetch } from '@/lib/api/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Plus, Trash2, ArrowLeft, Loader2, FileText } from 'lucide-react'
import { toast } from 'sonner'

const itemSchema = z.object({
  barang_id: z.string().optional().nullable(),
  specification: z.string().optional(),
  justification: z.string().optional(),
  image_url: z.string().optional(),
  nama_barang: z.string().optional().nullable(),
  satuan: z.string().optional(),
  jumlah: z.coerce.number().int().positive(),
  harga_satuan: z.coerce.number().nonnegative(),
  harga_beli: z.coerce.number().nonnegative().optional().default(0),
  diskon: z.coerce.number().nonnegative().optional(),
  keterangan: z.string().optional(),
})

const qtnSchema = z.object({
  customer_id: z.string().min(1),
  rfq_id: z.string().optional(),
  referensi: z.string().optional(),
  lampiran: z.string().optional(),
  perihal: z.string().default('Penawaran Harga'),
  pic_customer_id: z.string().optional(),
  alamat: z.string().optional(),
  tanggal: z.string().min(1),
  status: z.string().optional(),
  masa_berlaku: z.string().optional(),
  ppn_rate: z.coerce.number().nonnegative().default(0.11),
  ppn_enabled: z.boolean().default(false),
  overhead_biaya: z.coerce.number().nonnegative().default(0),
  overhead_metode: z.enum(['quantity', 'price']).default('quantity'),
  target_margin: z.coerce.number().min(0).max(1).default(0.15),
  negotiation_buffer: z.coerce.number().min(0).max(1).default(0.10),
  keterangan: z.string().optional(),
  items: z.array(itemSchema).min(1),
})

type QtnFormValues = z.input<typeof qtnSchema>

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Terkirim' },
  { value: 'proses_negosiasi', label: 'Proses Negosiasi' },
  { value: 'approved', label: 'Disetujui' },
  { value: 'rejected', label: 'Ditolak' },
  { value: 'closed', label: 'Ditutup' },
]

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

export default function EditQuotationPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [customerOptions, setCustomerOptions] = useState<Array<{ value: string; label: string; alamat?: string }>>([])
  const [barangData, setBarangData] = useState<BarangOption[]>([])
  const [picOptions, setPicOptions] = useState<Array<{ value: string; label: string }>>([])
  const [rfqOptions, setRfqOptions] = useState<Array<{ value: string; label: string }>>([])

  const { register, handleSubmit, control, reset, watch, setValue } = useForm<QtnFormValues>({
    resolver: zodResolver(qtnSchema),
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'items' })
  const selectedCustomerId = watch('customer_id')
  const [isRfqLoaded, setIsRfqLoaded] = useState(false)
  const [rfqItemLabels, setRfqItemLabels] = useState<string[]>([])
  const [nomorDokumen, setNomorDokumen] = useState('')

  useEffect(() => {
    const id = params.id as string

    Promise.all([
      apiFetch<Array<{ id: string; nama: string; kode: string; alamat?: string }>>('/api/v1/master/customer'),
      apiFetch<Array<{ id: string; nama: string; kode: string; satuan: string; spesifikasi?: string; justification?: string; image_url?: string }>>('/api/v1/master/barang/dropdown'),
      apiFetch<Array<{ id: string; nomor: string }>>('/api/v1/rfq-customer'),
    ]).then(([customers, barang, rfqs]) => {
      setCustomerOptions((customers.data ?? []).map(c => ({ value: c.id, label: `[${c.kode}] ${c.nama}`, alamat: c.alamat ?? '' })))
      setBarangData((barang.data ?? []).map(b => ({
        value: b.id,
        label: `[${b.kode}] ${b.nama}`,
        satuan: b.satuan,
        spesifikasi: b.spesifikasi ?? '',
        justification: b.justification ?? '',
        image_url: b.image_url ?? '',
      })))
      setRfqOptions((rfqs.data ?? []).map(r => ({ value: r.id, label: r.nomor })))
    }).catch(() => toast.error('Gagal memuat data referensi'))

    apiFetch<{
      id: string
      nomor: string
      customer_id: string
      rfq_id: string | null
      referensi: string | null
      lampiran: string | null
      perihal: string
      pic_customer_id: string | null
      alamat: string | null
      tanggal: string
      status: string
      masa_berlaku: string | null
      ppn_rate: number
      ppn_enabled: boolean
      keterangan: string | null
      overhead_biaya: number
      overhead_metode: string
      target_margin: number
      negotiation_buffer: number
      items: Array<{
        barang_id: string | null
        barang?: { id: string; kode: string; nama: string } | null
        specification: string | null
        justification: string | null
        image_url: string | null
        nama_barang: string | null
        satuan: string | null
        jumlah: number
        harga_satuan: number
        harga_beli: number | null
        diskon: number | null
        keterangan: string | null
      }>
    }>(`/api/v1/quotation/${id}`)
      .then((res) => {
        const qtn = res.data
        setNomorDokumen(qtn.nomor)
        setIsRfqLoaded(!!qtn.rfq_id)
        setRfqItemLabels(
          qtn.items.map(i =>
            i.barang ? `[${i.barang.kode}] ${i.barang.nama}` : (i.nama_barang || '')
          )
        )
        reset({
          customer_id: qtn.customer_id,
          rfq_id: qtn.rfq_id ?? '',
          referensi: qtn.referensi ?? '',
          lampiran: qtn.lampiran ?? '',
          perihal: qtn.perihal ?? 'Penawaran Harga',
          pic_customer_id: qtn.pic_customer_id ?? '',
          alamat: qtn.alamat ?? '',
          tanggal: qtn.tanggal.split('T')[0],
          status: qtn.status,
          masa_berlaku: qtn.masa_berlaku ?? '',
          ppn_rate: qtn.ppn_rate,
          ppn_enabled: qtn.ppn_enabled,
          overhead_biaya: qtn.overhead_biaya ?? 0,
          overhead_metode: (qtn.overhead_metode as 'quantity' | 'price') ?? 'quantity',
          target_margin: qtn.target_margin ?? 0.15,
          negotiation_buffer: qtn.negotiation_buffer ?? 0.10,
          keterangan: qtn.keterangan ?? '',
          items: qtn.items.length > 0 ? qtn.items.map(i => ({
            barang_id: i.barang_id ?? null,
            specification: i.specification ?? '',
            justification: i.justification ?? '',
            image_url: i.image_url ?? '',
            nama_barang: i.nama_barang ?? '',
            satuan: i.satuan ?? '',
            jumlah: i.jumlah,
            harga_satuan: i.harga_satuan,
            harga_beli: i.harga_beli ?? 0,
            diskon: i.diskon ?? 0,
            keterangan: i.keterangan ?? '',
          })) : [{ barang_id: '', jumlah: 1, harga_satuan: 0, harga_beli: 0, specification: '', justification: '', image_url: '', nama_barang: '', satuan: '' }],
        })
        setLoading(false)
      })
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : 'Gagal memuat Quotation')
        router.push('/dashboard/quotation')
      })
  }, [params.id, reset, router])

  useEffect(() => {
    if (!selectedCustomerId) { setPicOptions([]); return }
    apiFetch<Array<{ id: string; nama: string; jabatan?: string }>>(`/api/v1/master/pic-customer?customer_id=${selectedCustomerId}`)
      .then((res) => setPicOptions((res.data ?? []).map(p => ({ value: p.id, label: `${p.nama}${p.jabatan ? ` (${p.jabatan})` : ''}` }))))
      .catch(() => {})
  }, [selectedCustomerId])

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
      await apiFetch(`/api/v1/quotation/${params.id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      toast.success('Quotation berhasil diupdate!')
      router.push('/dashboard/quotation')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/quotation"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Edit Quotation</h1>
          <p className="text-muted-foreground mt-1">Update surat penawaran harga</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Header Surat</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800 px-4 py-3">
              <FileText className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
              <div className="text-sm">
                <span className="text-muted-foreground">Nomor Dokumen Internal: </span>
                <span className="font-mono font-semibold">{nomorDokumen}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">No. Referensi (RFQ)</label>
                <select {...register('rfq_id')} disabled={isRfqLoaded} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:opacity-50">
                  <option value="">Pilih RFQ</option>
                  {rfqOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Lampiran</label>
                <Input {...register('lampiran')} placeholder="Softcopy Penawaran Harga" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Perihal</label>
                <Input {...register('perihal')} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tanggal <span className="text-destructive">*</span></label>
                <DatePicker value={watch('tanggal')} onChange={(v) => setValue('tanggal', v)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Kepada Yth.</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Customer <span className="text-destructive">*</span></label>
                <select {...register('customer_id')}
                  disabled={isRfqLoaded}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring disabled:opacity-50">
                  <option value="">Pilih Customer</option>
                  {customerOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">PIC Customer</label>
                <select {...register('pic_customer_id')}
                  disabled={isRfqLoaded}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring disabled:opacity-50">
                  <option value="">Pilih PIC</option>
                  {picOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Alamat Tujuan</label>
              <Textarea {...register('alamat')} rows={2} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Item Penawaran</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={() => append({ barang_id: '', jumlah: 1, harga_satuan: 0, harga_beli: 0, specification: '', justification: '', image_url: '', satuan: '' })}>
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
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Barang <span className="text-destructive">*</span></label>
                    {isRfqLoaded ? (
                      <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
                        {rfqItemLabels[index] || `Item #${index + 1} (dari RFQ)`}
                      </div>
                    ) : (
                    <select {...register(`items.${index}.barang_id`)}
                      onChange={(e) => { const v = e.target.value; setValue(`items.${index}.barang_id`, v); handleBarangChange(index, v) }}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                      <option value="">Pilih Barang</option>
                      {barangData.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Specification</label>
                    <Textarea {...register(`items.${index}.specification`)} rows={2} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Justification</label>
                    <Textarea {...register(`items.${index}.justification`)} rows={2} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Image URL</label>
                    <Input {...register(`items.${index}.image_url`)} placeholder="https://..." />
                    {watch(`items.${index}.image_url`) && (
                      <img src={watch(`items.${index}.image_url`)} alt="" className="mt-1 h-12 w-12 object-contain rounded border" />
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Qty <span className="text-destructive">*</span></label>
                    <Input type="number" min="1" {...register(`items.${index}.jumlah`)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium">UoM</label>
                    <Input {...register(`items.${index}.satuan`)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Harga Beli</label>
                    <Input type="number" min="0" step="1" {...register(`items.${index}.harga_beli`)} placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Harga Jual <span className="text-destructive">*</span></label>
                    <Input type="number" min="0" step="1" {...register(`items.${index}.harga_satuan`)} placeholder="0" />
                  </div>
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
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Total Overhead (Rp)</label>
                    <Input type="number" min="0" step="1" {...register('overhead_biaya')} placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Metode Alokasi</label>
                    <select {...register('overhead_metode')}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring">
                      <option value="quantity">Per Quantity (rata per unit)</option>
                      <option value="price">Per Harga Jual (proporsional)</option>
                    </select>
                  </div>
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
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select {...register('status')} disabled
                  className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground cursor-not-allowed">
                  {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
                <p className="text-xs text-muted-foreground">Ubah status di halaman detail quotation</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Masa Berlaku</label>
                <select {...register('masa_berlaku')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring">
                  <option value="">Pilih masa berlaku</option>
                  {masaBerlakuOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">PPN</label>
                <div className="flex items-center gap-3 h-10">
                  <Switch checked={watch('ppn_enabled') ?? true} onCheckedChange={(v) => setValue('ppn_enabled', v)} />
                  <span className="text-sm text-muted-foreground">{watch('ppn_enabled') ? 'PPN 11%' : 'Non-PPN'}</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Keterangan</label>
              <Textarea {...register('keterangan')} rows={2} placeholder="Catatan tambahan..." />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="cancel">
            <Link href="/dashboard/quotation">Batal</Link>
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {submitting ? 'Menyimpan...' : 'Update Quotation'}
          </Button>
        </div>
      </form>
    </div>
  )
}
