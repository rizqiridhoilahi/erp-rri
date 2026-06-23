"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { apiFetch, getAuthToken } from '@/lib/api/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { PageHeader } from '@/components/page-header'
import { StatusWorkflow } from '@/components/status-workflow'
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog'
import { Loader2, ArrowLeft, CheckCircle, XCircle, Pencil, ExternalLink, ShoppingCart, AlertTriangle, Trash2, Undo2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatDateTime } from '@/lib/utils/date'

const statusLabel: Record<string, { label: string; variant: 'secondary' | 'warning' | 'success' | 'destructive' | 'outline' }> = {
  draft: { label: 'Draft', variant: 'secondary' },
  sent: { label: 'Dikirim', variant: 'warning' },
  approved: { label: 'Disetujui', variant: 'success' },
  rejected: { label: 'Ditolak', variant: 'destructive' },
}

const workflowSteps = [
  { key: 'draft', label: 'Draft' },
  { key: 'sent', label: 'Dikirim' },
  { key: 'approved', label: 'Disetujui' },
]

interface BarangData {
  id: string
  nama: string
  kode: string
  satuan: string | null
  image_url: string | null
}

interface QuotationItemData {
  id: string
  harga_satuan: number
  diskon: number
  jumlah: number
  image_url: string | null
  satuan: string | null
  barang: BarangData | null
  nama_barang: string | null
}

interface NegoItemData {
  id: string
  quotation_item_id: string
  harga_satuan_lama: number | null
  diskon_lama: number | null
  harga_satuan_baru: number
  diskon_baru: number
  alasan: string | null
  is_rejected: boolean
  quotation_item: QuotationItemData | null
}

interface QuotationBrief {
  id: string
  nomor: string
  status: string
  customer_id: string
}

interface NegoData {
  id: string
  nomor: string
  quotation_id: string
  tanggal: string
  status: string
  revision: number
  keterangan: string | null
  created_at: string
  updated_at: string
  quotation: QuotationBrief | null
  items: NegoItemData[]
}

function formatCurrency(v: number | null | undefined) {
  if (v == null) return '-'
  return `Rp ${Number(v).toLocaleString('id-ID')}`
}

function itemDisplayName(item: QuotationItemData | null) {
  if (!item) return 'Item tidak ditemukan'
  if (item.nama_barang) return item.nama_barang
  if (item.barang) return `[${item.barang.kode}] ${item.barang.nama}`
  return 'Item #' + item.id.slice(0, 8)
}

function itemImage(item: QuotationItemData | null) {
  if (!item) return null
  return item.image_url || item.barang?.image_url || null
}

export default function NegoiasiDetailPage() {
  const router = useRouter()
  const pathname = usePathname()
  const id = pathname.split('/').pop()
  const [data, setData] = useState<NegoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusLoading, setStatusLoading] = useState(false)
  const [poList, setPoList] = useState<Array<{ id: string; nomor: string; status: string }>>([])
  const [poLoading, setPoLoading] = useState(true)

  const fetchNego = useCallback(() => {
    if (!id) return
    apiFetch<NegoData>(`/api/v1/negoiasi/${id}`)
      .then((res) => { setData(res.data); setLoading(false) })
      .catch((err) => { toast.error(err.message); setLoading(false) })
  }, [id])

  useEffect(() => { fetchNego() }, [fetchNego])

  useEffect(() => {
    if (data) {
      apiFetch<Array<{ id: string; nomor: string; status: string; quotation_id: string }>>('/api/v1/customer-po')
        .then((res) => {
          const filtered = (res.data ?? []).filter((p) => p.quotation_id === data.quotation_id)
          setPoList(filtered)
        })
        .catch(() => {})
    }
  }, [data?.quotation_id])

  const handleApprove = async () => {
    if (!id) return
    setStatusLoading(true)
    try {
      await apiFetch(`/api/v1/negoiasi/${id}`, { method: 'PUT', body: JSON.stringify({ status: 'approved' }) })
      toast.success('Negosiasi disetujui! Harga quotation telah diperbarui.')
      fetchNego()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyetujui negosiasi')
    } finally {
      setStatusLoading(false)
    }
  }

  const handleSent = async () => {
    if (!id) return
    setStatusLoading(true)
    try {
      await apiFetch(`/api/v1/negoiasi/${id}`, { method: 'PUT', body: JSON.stringify({ status: 'sent' }) })
      toast.success('Negosiasi telah dikirim! Nomor quotation akan ditandai revisi.')
      fetchNego()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal mengirim negosiasi')
    } finally {
      setStatusLoading(false)
    }
  }

  const handleReject = async () => {
    if (!id) return
    setStatusLoading(true)
    try {
      await apiFetch(`/api/v1/negoiasi/${id}`, { method: 'PUT', body: JSON.stringify({ status: 'rejected' }) })
      toast.success('Negosiasi ditolak.')
      fetchNego()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menolak negosiasi')
    } finally {
      setStatusLoading(false)
    }
  }

  const handleToggleRejectItem = async (itemId: string, currentRejected: boolean) => {
    try {
      await apiFetch(`/api/v1/negoiasi/${id}/items/${itemId}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_rejected: !currentRejected }),
      })
      toast.success(currentRejected ? 'Item dikembalikan' : 'Item ditolak')
      fetchNego()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal mengubah status item')
    }
  }

  const handleDelete = async () => {
    if (!id) return
    await apiFetch(`/api/v1/negoiasi/${id}`, { method: 'DELETE' })
    toast.success('Negosiasi berhasil dihapus')
    router.push('/dashboard/negoiasi')
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        <div className="min-h-[200px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="ml-3 text-muted-foreground">Memuat data...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        <div className="text-center py-20 text-muted-foreground">Negosiasi tidak ditemukan</div>
      </div>
    )
  }

  const isQtnStatusValid = data.quotation?.status === 'sent' || data.quotation?.status === 'proses_negosiasi'
  const confirmedPO = poList.find((p) => p.status === 'confirmed')
  const allItemsRejected = data.items?.length > 0 && data.items.every(i => i.is_rejected)

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-6">
      <PageHeader
        title="Detail Negosiasi"
        description={data.nomor}
        actions={
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/negoiasi"><ArrowLeft className="h-5 w-5" /></Link>
            </Button>
            {data.status === 'draft' && (
              <>
                <Button
                  variant="default"
                  onClick={handleSent}
                  disabled={statusLoading || !isQtnStatusValid || !!confirmedPO}
                >
                  {statusLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                  Kirim
                </Button>
                <Button
                  variant="default"
                  onClick={handleApprove}
                  disabled={statusLoading || !isQtnStatusValid || !!confirmedPO || allItemsRejected}
                  title={allItemsRejected ? 'Semua item ditolak, tidak ada yang bisa disetujui' : ''}
                >
                  {statusLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                  Setujui
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={statusLoading || !isQtnStatusValid || !!confirmedPO}
                >
                  {statusLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
                  Tolak
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/dashboard/negoiasi/${id}/edit`}>
                    <Pencil className="h-4 w-4 mr-2" />Edit
                  </Link>
                </Button>
              </>
            )}
            {data.status === 'rejected' && (
              <Button variant="outline" asChild>
                <Link href={`/dashboard/negoiasi/${id}/edit`}>
                  <Pencil className="h-4 w-4 mr-2" />Edit
                </Link>
              </Button>
            )}
            {data.status === 'approved' && (
              <>
                <Button variant="default" asChild>
                  <Link href={`/dashboard/customer-po/tambah?quotation_id=${data.quotation_id}`}>
                    <ShoppingCart className="h-4 w-4 mr-2" />Buat PO Customer
                  </Link>
                </Button>
              </>
            )}
            <DeleteConfirmationDialog
              onConfirm={handleDelete}
              itemName={`Negosiasi ${data.nomor}`}
              trigger={<Button variant="outline" className="text-destructive hover:text-destructive"><Pencil className="h-4 w-4 mr-2" />Hapus</Button>}
            />
          </div>
        }
      />

      {!!confirmedPO && (
        <div className="rounded-lg border border-warning/50 bg-warning/10 p-4 flex items-center gap-3 text-sm">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
          <span>
            Quotation ini sudah memiliki PO Customer{' '}
            <Link href={`/dashboard/customer-po/${confirmedPO.id}`} className="font-medium underline underline-offset-2">
              {confirmedPO.nomor}
            </Link>{' '}
            yang sudah dikonfirmasi. Tidak bisa mengubah status negosiasi.
          </span>
        </div>
      )}

      {!isQtnStatusValid && data.status === 'draft' && (
        <div className="rounded-lg border border-warning/50 bg-warning/10 p-4 flex items-center gap-3 text-sm">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
          <span>
            Status quotation saat ini adalah{' '}
            <Badge variant="outline" className="mx-1">{data.quotation?.status ?? '-'}</Badge>.
            Negosiasi hanya bisa disetujui/ditolak jika quotation berstatus <Badge variant="outline">sent</Badge> atau{' '}
            <Badge variant="outline">proses_negosiasi</Badge>.
          </span>
        </div>
      )}

      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold font-mono">{data.nomor}</h2>
            </div>
            <Badge variant={statusLabel[data.status]?.variant ?? 'outline'}>
              {statusLabel[data.status]?.label ?? data.status}
            </Badge>
          </div>
          <StatusWorkflow steps={workflowSteps} current={data.status} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Informasi</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Tanggal</p>
              <p className="font-medium">{new Date(data.tanggal).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Revision</p>
              <p className="font-medium">#{data.revision}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Quotation</p>
              {data.quotation ? (
                <Link href={`/dashboard/quotation/${data.quotation.id}`} className="font-medium text-primary hover:underline inline-flex items-center gap-1">
                  {data.quotation.nomor}{data.revision > 0 ? `-R${data.revision}` : ''} <Badge variant="outline" className="text-[10px] px-1.5 py-0">{statusLabel[data.quotation.status]?.label ?? data.quotation.status}</Badge>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              ) : <p className="font-medium text-muted-foreground">-</p>}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Dibuat</p>
              <p className="font-medium">{formatDateTime(data.created_at, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <p className="text-sm text-muted-foreground">Keterangan</p>
              <p className="font-medium">{data.keterangan ?? '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            Item Negosiasi
            <span className="text-sm font-normal text-muted-foreground">
              {data.items?.filter(i => !i.is_rejected).length || 0} deal
              {data.items?.some(i => i.is_rejected) && (
                <span className="text-destructive">, {data.items.filter(i => i.is_rejected).length} ditolak</span>
              )}
            </span>
          </h3>

          {!data.items?.length ? (
            <p className="text-sm text-muted-foreground text-center py-4">Tidak ada item</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">#</TableHead>
                    <TableHead>Nama Barang</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                    <TableHead className="text-right">Harga Lama</TableHead>
                    <TableHead className="text-right">Diskon Lama</TableHead>
                    <TableHead className="text-right">Harga Baru</TableHead>
                    <TableHead className="text-right">Diskon Baru</TableHead>
                    <TableHead className="text-right">Selisih</TableHead>
                    <TableHead>Alasan</TableHead>
                    <TableHead className="w-12">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((item, i) => {
                    const qi = item.quotation_item
                    const imgUrl = qi ? itemImage(qi) : null
                    const hargaLama = item.harga_satuan_lama ?? qi?.harga_satuan ?? 0
                    const diskonLama = item.diskon_lama ?? qi?.diskon ?? 0
                    const diff = item.harga_satuan_baru - hargaLama
                    const diffAbs = Math.abs(diff)
                    const isLower = diff < 0
                    const isHigher = diff > 0
                    const isRejected = item.is_rejected

                    return (
                      <TableRow key={item.id} className={isRejected ? 'bg-muted/50' : ''}>
                        <TableCell className="text-muted-foreground text-xs align-top pt-4">{i + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {imgUrl && (
                              <img
                                src={imgUrl}
                                alt=""
                                className={`w-10 h-10 object-cover rounded border shrink-0 ${isRejected ? 'opacity-50' : ''}`}
                              />
                            )}
                            <div>
                              <p className={`font-medium text-sm ${isRejected ? 'line-through text-muted-foreground' : ''}`}>
                                {itemDisplayName(qi)}
                              </p>
                              {isRejected && (
                                <Badge variant="destructive" className="mt-0.5 text-[10px] px-1.5 py-0">Ditolak</Badge>
                              )}
                              {qi?.barang?.satuan && (
                                <p className="text-xs text-muted-foreground">{qi.barang.satuan}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className={`text-right align-top pt-4 ${isRejected ? 'text-muted-foreground' : ''}`}>
                          {qi ? `${qi.jumlah} ${qi.satuan || qi?.barang?.satuan || ''}` : '-'}
                        </TableCell>
                        <TableCell className="text-right align-top pt-4">{formatCurrency(hargaLama)}</TableCell>
                        <TableCell className="text-right align-top pt-4">{diskonLama > 0 ? `${diskonLama}%` : '-'}</TableCell>
                        <TableCell className="text-right align-top pt-4 font-semibold">{formatCurrency(item.harga_satuan_baru)}</TableCell>
                        <TableCell className="text-right align-top pt-4">{item.diskon_baru > 0 ? `${item.diskon_baru}%` : '-'}</TableCell>
                        <TableCell className="text-right align-top pt-4">
                          <span className={`inline-flex items-center gap-1 text-sm font-medium ${isLower ? 'text-destructive' : isHigher ? 'text-green-600' : 'text-muted-foreground'}`}>
                            {isLower ? '▼' : isHigher ? '▲' : '—'}
                            {diff !== 0 && formatCurrency(diffAbs)}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm align-top pt-4 max-w-[160px]">
                          {item.alasan || '-'}
                        </TableCell>
                        <TableCell className="align-top pt-4">
                          {data.status === 'draft' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className={isRejected ? 'h-7 w-7 text-green-600' : 'h-7 w-7 text-destructive'}
                              onClick={() => handleToggleRejectItem(item.id, isRejected)}
                              title={isRejected ? 'Kembalikan item' : 'Tolak item'}
                            >
                              {isRejected ? <Undo2 className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                            </Button>
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

      {data.status === 'sent' && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Tindakan Selanjutnya</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Negosiasi telah dikirim ke customer. Nomor quotation <strong>{data.quotation?.nomor ?? '-'}</strong> telah ditandai dengan revisi di PDF. Silakan setujui atau tolak setelah mendapat respons customer.
            </p>
            <div className="flex gap-3">
              <Button variant="default" onClick={handleApprove} disabled={statusLoading || allItemsRejected}>
                {statusLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                Setujui
              </Button>
              <Button variant="destructive" onClick={handleReject} disabled={statusLoading}>
                {statusLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
                Tolak
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {data.status === 'approved' && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Tindakan Selanjutnya</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Negosiasi telah disetujui. Harga pada quotation <strong>{data.quotation?.nomor ?? '-'}</strong> telah diperbarui dengan hasil negosiasi.
            </p>
            <div className="flex gap-3">
              <Button variant="default" asChild>
                <Link href={`/dashboard/customer-po/tambah?quotation_id=${data.quotation_id}`}>
                  <ShoppingCart className="h-4 w-4 mr-2" />Buat PO Customer
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/dashboard/quotation/${data.quotation_id}`}>
                  <ExternalLink className="h-4 w-4 mr-2" />Lihat Quotation
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
