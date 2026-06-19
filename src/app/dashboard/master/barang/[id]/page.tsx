"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { supabase } from "@/lib/db/client"
import { Button } from "@/components/ui/button"
import { ImageLightbox } from "@/components/image-lightbox"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table"
import { Loader2, ShoppingBag, FileText } from "lucide-react"
import { apiFetch } from "@/lib/api/client"
import { BreadcrumbNav, BreadcrumbItem } from "@/components/breadcrumb-nav"
import { PageHeader } from "@/components/page-header"
import { EmptyState } from "@/components/empty-state"
const breadcrumbItems: BreadcrumbItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Master Data" },
  { label: "Barang", href: "/dashboard/master/barang" },
  { label: "Detail Barang" },
]

interface HistoryItem {
  invoice_id: string
  invoice_nomor: string
  invoice_tanggal: string
  invoice_status: string
  customer_nama: string | null
  customer_kode: string | null
  so_nomor: string
  di_nomor: string | null
  di_nomor_customer: string | null
  kontrak_nomor: string | null
  cpo_nomor: string | null
  cpo_nomor_customer: string | null
  harga_satuan: number
  jumlah: number
  diskon: number
  total: number
  path: string | null
}

interface NegoHistoryItem {
  nego_id: string
  nego_nomor: string
  nego_tanggal: string
  nego_status: string
  nego_revision: number
  quotation_nomor: string | null
  customer_nama: string | null
  customer_kode: string | null
  harga_satuan_lama: number | null
  diskon_lama: number | null
  harga_satuan_baru: number | null
  diskon_baru: number | null
  alasan: string | null
  is_rejected: boolean
}

interface BarangImage {
  id: string
  url: string
  urutan: number
  is_primary: boolean
}

interface Barang {
  id: string
  nama: string
  kode: string
  barcode: string | null
  kategori_barang: { nama: string }[]
  satuan: string | null
  spesifikasi: string | null
  justification: string | null
  image_url: string | null
  link_produk: string | null
  harga_beli_default: number | null
  harga_jual_default: number | null
  stok_minimum: number | null
  is_active: boolean
  is_published_to_catalog: boolean | null
  deskripsi_katalog: string | null
  spesifikasi_teknis: Record<string, unknown> | null
  created_at: string
  kontrak: { nomor_kontrak: string; nama: string; tanggal_mulai: string | null; tanggal_selesai: string | null }[]
}

export default function DetailBarangPage() {
  const router = useRouter()
  const pathname = usePathname()
  const id = pathname.split("/").pop()
  const [data, setData] = useState<Barang | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [negoHistory, setNegoHistory] = useState<NegoHistoryItem[]>([])
  const [negoHistoryLoading, setNegoHistoryLoading] = useState(true)
  const [gambar, setGambar] = useState<BarangImage[]>([])
  const [gambarLoading, setGambarLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    ;(async () => {
      const { data: result, error: err } = await supabase
        .from("barang")
        .select(`
          id,
          nama,
          kode,
          barcode,
          kategori_barang!inner(nama),
          satuan,
          spesifikasi,
          justification,
          image_url,
          harga_beli_default,
          harga_jual_default,
          stok_minimum,
          is_active,
          is_published_to_catalog,
          deskripsi_katalog,
          spesifikasi_teknis,
          created_at
        `)
        .eq("id", id)
        .single()

      if (err) { setError(err.message); setLoading(false); return }

      const { data: kontrakItems } = await supabase
        .from('kontrak_item')
        .select('kontrak!kontrak_id(nomor_kontrak, nama, tanggal_mulai, tanggal_selesai)')
        .eq('barang_id', id)

      const kontraks: Barang['kontrak'] = []
      for (const ki of kontrakItems ?? []) {
        const k = (ki as { kontrak: unknown }).kontrak as { nomor_kontrak: string; nama: string; tanggal_mulai: string | null; tanggal_selesai: string | null } | null
        if (k) kontraks.push(k)
      }

      const { data: gambarData } = await supabase
        .from('barang_gambar')
        .select('id, url, urutan, is_primary')
        .eq('barang_id', id)
        .order('urutan', { ascending: true })

      setGambar(gambarData ?? [])
      setGambarLoading(false)
      setData({ ...result, kontrak: kontraks } as Barang)
      setLoading(false)
    })()
  }, [id])

  useEffect(() => {
    if (!id) return
    apiFetch<HistoryItem[]>(`/api/v1/master/barang/${id}/history`)
      .then((r) => { setHistory(r.data ?? []); setHistoryLoading(false) })
      .catch(() => setHistoryLoading(false))
  }, [id])

  useEffect(() => {
    if (!id) return
    apiFetch<NegoHistoryItem[]>(`/api/v1/master/barang/${id}/negoiasi-history`)
      .then((r) => { setNegoHistory(r.data ?? []); setNegoHistoryLoading(false) })
      .catch(() => setNegoHistoryLoading(false))
  }, [id])

  const formatCurrency = (value: number | null) => {
    if (value === null) return "-"
    return `Rp ${Number(value).toLocaleString("id-ID")}`
  }

  const statusBadge = (isActive: boolean) => (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
      isActive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
    }`}>
      {isActive ? "Active" : "Non-Active"}
    </span>
  )

  if (loading) return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      <BreadcrumbNav items={breadcrumbItems} />
      <div className="min-h-[200px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-3 text-muted-foreground">Memuat data...</p>
      </div>
    </div>
  )

  if (error || !data) return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      <BreadcrumbNav items={breadcrumbItems} />
      <EmptyState title="Gagal memuat data" description={error || "Data tidak ditemukan"} />
    </div>
  )

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      <BreadcrumbNav items={breadcrumbItems} />
      <PageHeader
        title={data.nama || "Detail Barang"}
        description="Informasi lengkap"
        actions={
          <div className="flex gap-2">
            <Button variant="back" onClick={() => router.push("/dashboard/master/barang")}>
              Kembali
            </Button>
            <Button onClick={() => router.push(`/dashboard/master/barang/${id}/edit`)}>
              Edit
            </Button>
          </div>
        }
      />
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Kode</label>
              <p className="text-sm font-medium">{data.kode}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Barcode</label>
              <p className="text-sm font-medium">{data.barcode || "-"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Nama Barang</label>
              <p className="text-sm font-medium">{data.nama}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Kategori</label>
              <p className="text-sm font-medium">{data.kategori_barang?.[0]?.nama || "-"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Satuan</label>
              <p className="text-sm font-medium">{data.satuan || "-"}</p>
            </div>
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-muted-foreground mb-1">Spesifikasi</label>
              <p className="text-sm font-medium">{data.spesifikasi || "-"}</p>
            </div>
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-muted-foreground mb-1">Justification</label>
              <p className="text-sm font-medium">{data.justification || "-"}</p>
            </div>
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-muted-foreground mb-1">Link Produk</label>
              <p className="text-sm font-medium">
                {data.link_produk
                  ? <a href={data.link_produk} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{data.link_produk}</a>
                  : "-"}
              </p>
            </div>
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-muted-foreground mb-2">Galeri Foto</label>
              {gambarLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-xs">Memuat...</span>
                </div>
              ) : gambar.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {gambar.map((g) => (
                    <div key={g.id} className="relative">
                      <ImageLightbox src={g.url} alt={data.nama}>
                        <img src={g.url} alt={data.nama} className="h-20 w-20 object-contain rounded border cursor-pointer hover:opacity-80 transition-opacity" />
                      </ImageLightbox>
                      {g.is_primary && (
                        <span className="absolute -top-1 -right-1 bg-[#0000ff] text-white text-[10px] rounded-full px-1 leading-tight">★</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Tidak ada gambar</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Harga Beli Default</label>
              <p className="text-sm font-medium">{formatCurrency(data.harga_beli_default)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Harga Jual Default</label>
              <p className="text-sm font-medium">{formatCurrency(data.harga_jual_default)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Stok Minimum</label>
              <p className="text-sm font-medium">{data.stok_minimum ?? "-"}</p>
            </div>
            {(() => {
              const kontraks = data.kontrak ?? []
              if (kontraks.length === 0) return null
              return (
                <div className="lg:col-span-3 space-y-2">
                  <label className="block text-sm font-medium text-muted-foreground">Kontrak</label>
                  {kontraks.map((k, idx) => {
                    const tglMulai = k.tanggal_mulai ? new Date(k.tanggal_mulai).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-"
                    const tglSelesai = k.tanggal_selesai ? new Date(k.tanggal_selesai).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-"
                    return (
                      <div key={k.nomor_kontrak} className={idx < kontraks.length - 1 ? "border-b border-border pb-2 mb-2" : ""}>
                        <p className="text-sm font-medium">{k.nama || k.nomor_kontrak}</p>
                        <p className="text-xs text-muted-foreground">{tglMulai} — {tglSelesai}</p>
                      </div>
                    )
                  })}
                </div>
              )
            })()}
            {data.is_published_to_catalog && (
              <div className="lg:col-span-3 border-t pt-4 mt-2">
                <label className="block text-sm font-medium text-muted-foreground mb-2">Info Katalog Publik</label>
                <div className="space-y-3">
                  {data.deskripsi_katalog && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Deskripsi Katalog</p>
                      <p className="text-sm">{data.deskripsi_katalog}</p>
                    </div>
                  )}
                  {data.spesifikasi_teknis && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Spesifikasi Teknis</p>
                      <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
                        {JSON.stringify(data.spesifikasi_teknis, null, 2)}
                      </pre>
                    </div>
                  )}
                  <div>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-[#0000ff]/10 text-[#0000ff]">
                      Ditampilkan di Katalog Publik
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Status</label>
              <p className="text-sm">{statusBadge(data.is_active)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Dibuat Pada</label>
              <p className="text-sm font-medium">
                {new Date(data.created_at).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><ShoppingBag className="h-4 w-4" />Riwayat Pembelian</h3>
          {historyLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />Memuat riwayat...
            </div>
          ) : history.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Belum ada riwayat pembelian.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Jalur</TableHead>
                    <TableHead>Invoice</TableHead>
                    <TableHead>DI / CPO</TableHead>
                    <TableHead>Kontrak</TableHead>
                    <TableHead className="text-right">Harga Satuan</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Margin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((h, i) => {
                    const margin = data.harga_beli_default != null ? h.harga_satuan - data.harga_beli_default : null
                    const ref = h.di_nomor ?? h.cpo_nomor ?? '-'
                    const kontrak = h.kontrak_nomor ?? '-'
                    return (
                      <TableRow key={`${h.invoice_id}-${i}`}>
                        <TableCell className="whitespace-nowrap">
                          {new Date(h.invoice_tanggal).toLocaleDateString('id-ID')}
                        </TableCell>
                        <TableCell className="font-medium">{h.customer_nama ?? '-'}</TableCell>
                        <TableCell>
                          {h.path ? (
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              h.path === 'Kontrak → DI'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                            }`}>
                              {h.path}
                            </span>
                          ) : '-'}
                        </TableCell>
                        <TableCell>{h.invoice_nomor}</TableCell>
                        <TableCell className="font-mono text-xs">{ref}</TableCell>
                        <TableCell className="font-mono text-xs">{kontrak}</TableCell>
                        <TableCell className="text-right">{h.harga_satuan.toLocaleString('id-ID')}</TableCell>
                        <TableCell className="text-right">{h.jumlah}</TableCell>
                        <TableCell className="text-right font-medium">{h.total.toLocaleString('id-ID')}</TableCell>
                        <TableCell className="text-right">
                          {margin != null ? (
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              margin >= 0
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {margin >= 0 ? '+' : ''}{margin.toLocaleString('id-ID')}
                            </span>
                          ) : '-'}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><FileText className="h-4 w-4" />Riwayat Negosiasi</h3>
          {negoHistoryLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />Memuat riwayat...
            </div>
          ) : negoHistory.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Belum ada riwayat negosiasi.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>No. Negosiasi</TableHead>
                    <TableHead>No. Quotation</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status Nego</TableHead>
                    <TableHead className="text-right">Harga Lama</TableHead>
                    <TableHead className="text-right">Harga Baru</TableHead>
                    <TableHead className="text-right">Diskon Baru</TableHead>
                    <TableHead>Alasan</TableHead>
                    <TableHead>Hasil</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {negoHistory.map((h, i) => {
                    const statusNegoLabel: Record<string, string> = { draft: 'Draft', approved: 'Disetujui', rejected: 'Ditolak' }
                    return (
                      <TableRow key={`${h.nego_id}-${i}`}>
                        <TableCell className="whitespace-nowrap">
                          {new Date(h.nego_tanggal).toLocaleDateString('id-ID')}
                        </TableCell>
                        <TableCell className="font-medium">{h.nego_nomor}</TableCell>
                        <TableCell>{h.quotation_nomor ?? '-'}</TableCell>
                        <TableCell>{h.customer_nama ?? '-'}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            h.nego_status === 'draft' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : h.nego_status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {statusNegoLabel[h.nego_status] ?? h.nego_status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">{h.harga_satuan_lama != null ? `Rp ${Number(h.harga_satuan_lama).toLocaleString('id-ID')}` : '-'}</TableCell>
                        <TableCell className="text-right">{h.harga_satuan_baru != null ? `Rp ${Number(h.harga_satuan_baru).toLocaleString('id-ID')}` : '-'}</TableCell>
                        <TableCell className="text-right">{h.diskon_baru != null ? `${h.diskon_baru}%` : '-'}</TableCell>
                        <TableCell className="max-w-[200px] truncate" title={h.alasan ?? ''}>{h.alasan ?? '-'}</TableCell>
                        <TableCell>
                          {h.is_rejected ? (
                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                              Ditolak
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              Disetujui
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
