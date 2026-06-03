"use client"

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { ArrowLeft, Pencil, Plus, Search, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'

interface BarangInfo { id: string; nama: string; kode: string; satuan: string }

interface OpnameItem {
  id?: string
  barang_id: string
  stok_sistem: number
  stok_fisik: number | null
  selisih: number
  keterangan: string | null
  barang?: BarangInfo | null
}

interface OpnameData {
  id: string
  nomor: string
  gudang_id: string | null
  petugas: string
  status: string
  keterangan: string | null
  created_at: string
  stock_opname_item: OpnameItem[]
}

interface Gudang { id: string; nama: string }
interface StokItem { barang_id: string; jumlah: number; barang: BarangInfo }

const statusColor: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'secondary',
  selesai: 'default',
  dibatalkan: 'destructive',
}

const statusLabel: Record<string, string> = { draft: 'Draft', selesai: 'Selesai', dibatalkan: 'Dibatalkan' }

export default function StockOpnameDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState('')
  const [data, setData] = useState<OpnameData | null>(null)
  const [gudangMap, setGudangMap] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [searchBarang, setSearchBarang] = useState('')
  const [stokList, setStokList] = useState<StokItem[]>([])
  const [showAddPanel, setShowAddPanel] = useState(false)

  useEffect(() => {
    params.then(p => setId(p.id))
  }, [params])

  useEffect(() => {
    if (!id) return
    apiFetch<OpnameData>(`/api/v1/inventory/stock-opname/${id}`)
      .then(r => { setData(r.data); setLoading(false) })
      .catch(e => { setError(e instanceof Error ? e.message : 'Gagal memuat data'); setLoading(false) })

    apiFetch<Gudang[]>('/api/v1/master/gudang')
      .then(r => {
        const m: Record<string, string> = {}
        ;(r.data ?? []).forEach(g => { m[g.id] = g.nama })
        setGudangMap(m)
      })
      .catch(() => {})

    apiFetch<StokItem[]>('/api/v1/stok')
      .then(r => setStokList(r.data ?? []))
      .catch(() => {})
  }, [id])

  const refresh = () => {
    apiFetch<OpnameData>(`/api/v1/inventory/stock-opname/${id}`)
      .then(r => setData(r.data))
      .catch(() => toast.error('Gagal refresh data'))
  }

  const filteredStok = stokList.filter(s =>
    !data?.stock_opname_item.some(i => i.barang_id === s.barang_id) &&
    (s.barang.nama.toLowerCase().includes(searchBarang.toLowerCase()) ||
     s.barang.kode.toLowerCase().includes(searchBarang.toLowerCase()))
  )

  const handleAddItem = async (stok: StokItem) => {
    if (!data) return
    const newItems = [
      ...data.stock_opname_item,
      { barang_id: stok.barang_id, stok_sistem: stok.jumlah, stok_fisik: null, selisih: 0, keterangan: null },
    ]
    setSaving(true)
    try {
      await apiFetch(`/api/v1/inventory/stock-opname/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          items: newItems.map(i => ({
            barangId: i.barang_id,
            stokSistem: i.stok_sistem,
            stokFisik: i.stok_fisik,
            selisih: i.selisih,
            keterangan: i.keterangan || undefined,
          })),
        }),
      })
      toast.success(`${stok.barang.nama} ditambahkan`)
      setSearchBarang('')
      setShowAddPanel(false)
      refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menambah item')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateFisik = async (barangId: string, stokFisik: number | null) => {
    if (!data) return
    const items = data.stock_opname_item.map(i => {
      if (i.barang_id !== barangId) return i
      const fisik = stokFisik ?? 0
      return { ...i, stok_fisik: stokFisik, selisih: fisik - i.stok_sistem }
    })
    setSaving(true)
    try {
      await apiFetch(`/api/v1/inventory/stock-opname/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          items: items.map(i => ({
            barangId: i.barang_id,
            stokSistem: i.stok_sistem,
            stokFisik: i.stok_fisik,
            selisih: i.selisih,
            keterangan: i.keterangan || undefined,
          })),
        }),
      })
      refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal update stok fisik')
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveItem = async (barangId: string) => {
    if (!data) return
    const items = data.stock_opname_item.filter(i => i.barang_id !== barangId)
    setSaving(true)
    try {
      await apiFetch(`/api/v1/inventory/stock-opname/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          items: items.map(i => ({
            barangId: i.barang_id,
            stokSistem: i.stok_sistem,
            stokFisik: i.stok_fisik,
            selisih: i.selisih,
            keterangan: i.keterangan || undefined,
          })),
        }),
      })
      toast.success('Item dihapus')
      refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal hapus item')
    } finally {
      setSaving(false)
    }
  }

  const handleChangeStatus = async (status: string) => {
    if (!data) return
    setSaving(true)
    try {
      await apiFetch(`/api/v1/inventory/stock-opname/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      })
      toast.success(`Status diubah ke ${statusLabel[status] ?? status}`)
      refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal ubah status')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin mr-2" />Memuat...</div>
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild><Link href="/dashboard/inventory/stock-opname"><ArrowLeft className="h-5 w-5" /></Link></Button>
          <div><h1 className="text-3xl font-heading font-bold">Stock Opname</h1></div>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            {error ? (
              <div className="space-y-2">
                <p className="text-destructive font-medium">{error}</p>
                <Button variant="outline" size="sm" onClick={() => { setLoading(true); setError(null); apiFetch<OpnameData>(`/api/v1/inventory/stock-opname/${id}`).then(r => { setData(r.data); setLoading(false) }).catch(e => { setError(e instanceof Error ? e.message : 'Gagal memuat data'); setLoading(false) }) }}>
                  Coba Lagi
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground">Sesi opname tidak ditemukan.</p>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  const gudangNama = data.gudang_id ? gudangMap[data.gudang_id] : 'Semua Gudang'
  const totalSelisih = data.stock_opname_item.reduce((s, i) => s + i.selisih, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild><Link href="/dashboard/inventory/stock-opname"><ArrowLeft className="h-5 w-5" /></Link></Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-heading font-bold">{data.nomor}</h1>
              <Badge variant={statusColor[data.status] ?? 'secondary'}>{statusLabel[data.status] ?? data.status}</Badge>
            </div>
            <p className="text-muted-foreground mt-1">Opname stok fisik</p>
          </div>
        </div>
        <div className="flex gap-2">
          {data.status === 'draft' && (
            <>
              <Button variant="outline" asChild>
                <Link href={`/dashboard/inventory/stock-opname/${id}/edit`}><Pencil className="h-4 w-4 mr-2" />Edit</Link>
              </Button>
              <Button className="bg-[#22C55E] text-white hover:bg-[#16A34A]" disabled={saving || data.stock_opname_item.length === 0} onClick={() => handleChangeStatus('selesai')}>
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                Selesaikan
              </Button>
              <Button variant="destructive" disabled={saving} onClick={() => handleChangeStatus('dibatalkan')}>
                <XCircle className="h-4 w-4 mr-2" />Batalkan
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Petugas</p>
              <p className="font-medium">{data.petugas}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gudang</p>
              <p className="font-medium">{gudangNama}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={statusColor[data.status] ?? 'secondary'}>{statusLabel[data.status] ?? data.status}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Dibuat</p>
              <p className="font-medium">{new Date(data.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            {data.keterangan && (
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Keterangan</p>
                <p className="font-medium">{data.keterangan}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Item Opname</h3>
            {data.status === 'draft' && (
              <Button variant="outline" size="sm" onClick={() => setShowAddPanel(!showAddPanel)} disabled={saving}>
                <Plus className="h-4 w-4 mr-1" />Tambah Barang
              </Button>
            )}
          </div>

          {showAddPanel && data.status === 'draft' && (
            <Card className="mb-4 bg-muted/30">
              <CardContent className="pt-4 pb-4">
                <div className="relative w-full mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Cari barang..." value={searchBarang} onChange={e => setSearchBarang(e.target.value)} className="pl-9" />
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {filteredStok.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2 text-center">Tidak ada barang tersedia</p>
                  ) : (
                    filteredStok.slice(0, 20).map(s => (
                      <div key={s.barang_id} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted">
                        <div>
                          <p className="text-sm font-medium">{s.barang.nama}</p>
                          <p className="text-xs text-muted-foreground">{s.barang.kode} (stok: {s.jumlah})</p>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => handleAddItem(s)} disabled={saving}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Barang</TableHead>
                  <TableHead>Kode</TableHead>
                  <TableHead className="text-right">Stok Sistem</TableHead>
                  <TableHead className="text-right">Stok Fisik</TableHead>
                  <TableHead className="text-right">Selisih</TableHead>
                  <TableHead>Keterangan</TableHead>
                  {data.status === 'draft' && <TableHead className="text-right">Aksi</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.stock_opname_item.map((item, i) => {
                  const b = item.barang
                  return (
                    <TableRow key={item.id ?? item.barang_id}>
                      <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="font-medium">{b?.nama ?? '-'}</TableCell>
                      <TableCell className="text-muted-foreground">{b?.kode ?? '-'}</TableCell>
                      <TableCell className="text-right">{item.stok_sistem}</TableCell>
                      <TableCell className="text-right">
                        {data.status === 'draft' ? (
                          <Input
                            type="number"
                            className="w-24 h-8 text-right"
                            value={item.stok_fisik ?? ''}
                            onChange={e => {
                              const val = e.target.value === '' ? null : parseInt(e.target.value, 10)
                              handleUpdateFisik(item.barang_id, val)
                            }}
                          />
                        ) : (
                          item.stok_fisik ?? '-'
                        )}
                      </TableCell>
                      <TableCell className={`text-right font-bold ${item.selisih !== 0 ? 'text-destructive' : ''}`}>
                        {item.selisih > 0 ? '+' : ''}{item.selisih}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                        {item.keterangan ?? '-'}
                      </TableCell>
                      {data.status === 'draft' && (
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="text-destructive h-8" onClick={() => handleRemoveItem(item.barang_id)} disabled={saving}>
                            <XCircle className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })}
                {data.stock_opname_item.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      Belum ada item. Tambahkan barang untuk memulai opname.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {data.stock_opname_item.length > 0 && (
            <div className="flex justify-end mt-4 pt-4 border-t">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Selisih</p>
                <p className={`text-lg font-bold ${totalSelisih !== 0 ? 'text-destructive' : ''}`}>
                  {totalSelisih > 0 ? '+' : ''}{totalSelisih}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
