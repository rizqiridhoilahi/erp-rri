"use client"

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { ArrowLeft, Loader2, Plus, Search, XCircle } from 'lucide-react'
import { toast } from 'sonner'

interface BarangInfo { id: string; nama: string; kode: string; satuan: string }
interface StokItem { barang_id: string; jumlah: number; barang: BarangInfo }

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
  stock_opname_item: OpnameItem[]
}

export default function EditStockOpnamePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [id, setId] = useState('')
  const [data, setData] = useState<OpnameData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [items, setItems] = useState<OpnameItem[]>([])
  const [keterangan, setKeterangan] = useState('')

  const [stokList, setStokList] = useState<StokItem[]>([])
  const [searchBarang, setSearchBarang] = useState('')
  const [showAddPanel, setShowAddPanel] = useState(false)

  useEffect(() => {
    params.then(p => setId(p.id))
  }, [params])

  useEffect(() => {
    if (!id) return
    Promise.all([
      apiFetch<OpnameData>(`/api/v1/inventory/stock-opname/${id}`),
      apiFetch<StokItem[]>('/api/v1/stok'),
    ]).then(([opname, stok]) => {
      if (opname.data) {
        setData(opname.data)
        setItems(opname.data.stock_opname_item)
        setKeterangan(opname.data.keterangan ?? '')
      }
      setStokList(stok.data ?? [])
      setLoading(false)
    }).catch(() => { toast.error('Gagal memuat data'); setLoading(false) })
  }, [id])

  const updateItem = (barangId: string, field: 'stok_fisik' | 'keterangan', value: unknown) => {
    setItems(prev => prev.map(i => {
      if (i.barang_id !== barangId) return i
      const updated = { ...i, [field]: value }
      if (field === 'stok_fisik') {
        const fisik = (value as number) ?? 0
        updated.selisih = fisik - i.stok_sistem
      }
      return updated
    }))
  }

  const removeItem = (barangId: string) => {
    setItems(prev => prev.filter(i => i.barang_id !== barangId))
  }

  const addItem = (stok: StokItem) => {
    if (items.some(i => i.barang_id === stok.barang_id)) {
      toast.error('Barang sudah ada')
      return
    }
    setItems(prev => [...prev, {
      barang_id: stok.barang_id,
      stok_sistem: stok.jumlah,
      stok_fisik: null,
      selisih: 0,
      keterangan: null,
      barang: stok.barang,
    }])
    setSearchBarang('')
    setShowAddPanel(false)
  }

  const handleSave = async () => {
    if (!data) return
    setSaving(true)
    try {
      await apiFetch(`/api/v1/inventory/stock-opname/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          keterangan: keterangan || undefined,
          items: items.map(i => ({
            barangId: i.barang_id,
            stokSistem: i.stok_sistem,
            stokFisik: i.stok_fisik,
            selisih: i.selisih,
            keterangan: i.keterangan || undefined,
          })),
        }),
      })
      toast.success('Perubahan disimpan')
      router.push(`/dashboard/inventory/stock-opname/${id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan')
    } finally {
      setSaving(false)
    }
  }

  const filteredStok = stokList.filter(s =>
    !items.some(i => i.barang_id === s.barang_id) &&
    (s.barang.nama.toLowerCase().includes(searchBarang.toLowerCase()) ||
     s.barang.kode.toLowerCase().includes(searchBarang.toLowerCase()))
  )

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin mr-2" />Memuat...</div>
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="icon" asChild><Link href="/dashboard/inventory/stock-opname"><ArrowLeft className="h-5 w-5" /></Link></Button>
        <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">Sesi opname tidak ditemukan.</p></CardContent></Card>
      </div>
    )
  }

  const totalSelisih = items.reduce((s, i) => s + i.selisih, 0)

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link href={`/dashboard/inventory/stock-opname/${id}`}><ArrowLeft className="h-5 w-5" /></Link></Button>
        <div><h1 className="text-3xl font-heading font-bold">Edit Opname</h1><p className="text-muted-foreground">{data.nomor}</p></div>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Petugas</Label>
              <Input value={data.petugas} disabled />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Input value={data.status === 'draft' ? 'Draft' : data.status === 'selesai' ? 'Selesai' : 'Dibatalkan'} disabled />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Keterangan</Label>
            <Input value={keterangan} onChange={e => setKeterangan(e.target.value)} placeholder="Catatan opname" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Item Opname</h3>
            {data.status === 'draft' && (
              <Button variant="outline" size="sm" onClick={() => setShowAddPanel(!showAddPanel)}>
                <Plus className="h-4 w-4 mr-1" />Tambah Barang
              </Button>
            )}
          </div>

          {showAddPanel && (
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
                        <Button size="sm" variant="ghost" onClick={() => addItem(s)}>
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
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, i) => {
                  const b = item.barang
                  return (
                    <TableRow key={item.id ?? item.barang_id}>
                      <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="font-medium">{b?.nama ?? '-'}</TableCell>
                      <TableCell className="text-muted-foreground">{b?.kode ?? '-'}</TableCell>
                      <TableCell className="text-right">{item.stok_sistem}</TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          className="w-24 h-8 text-right"
                          value={item.stok_fisik ?? ''}
                          onChange={e => updateItem(item.barang_id, 'stok_fisik', e.target.value === '' ? null : parseInt(e.target.value, 10))}
                        />
                      </TableCell>
                      <TableCell className={`text-right font-bold ${item.selisih !== 0 ? 'text-destructive' : ''}`}>
                        {item.selisih > 0 ? '+' : ''}{item.selisih}
                      </TableCell>
                      <TableCell>
                        <Input
                          className="w-36 h-8"
                          value={item.keterangan ?? ''}
                          onChange={e => updateItem(item.barang_id, 'keterangan', e.target.value || null)}
                          placeholder="Catatan"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="text-destructive h-8" onClick={() => removeItem(item.barang_id)}>
                          <XCircle className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      Belum ada item. Tambahkan barang untuk memulai opname.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end mt-4 pt-4 border-t">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Selisih</p>
              <p className={`text-lg font-bold ${totalSelisih !== 0 ? 'text-destructive' : ''}`}>
                {totalSelisih > 0 ? '+' : ''}{totalSelisih}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Simpan Perubahan
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/dashboard/inventory/stock-opname/${id}`}>Batal</Link>
        </Button>
      </div>
    </div>
  )
}
