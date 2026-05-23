"use client"
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiFetch } from '@/lib/api/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Loader2, Search } from 'lucide-react'
import { toast } from 'sonner'

interface BarangItem { id: string; nama: string; kode: string; satuan: string }
interface GudangItem { id: string; nama: string }

export default function StokMasukPage() {
  const router = useRouter()
  const [barangList, setBarangList] = useState<BarangItem[]>([])
  const [gudangList, setGudangList] = useState<GudangItem[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedBarang, setSelectedBarang] = useState<BarangItem | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    apiFetch<BarangItem[]>('/api/v1/master/barang').then(r => setBarangList(r.data ?? [])).catch(() => {})
    apiFetch<GudangItem[]>('/api/v1/master/gudang').then(r => setGudangList(r.data ?? [])).catch(() => {})
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowDropdown(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filteredBarang = barangList.filter(b =>
    b.nama.toLowerCase().includes(search.toLowerCase()) ||
    b.kode.toLowerCase().includes(search.toLowerCase())
  )

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedBarang) { toast.error('Pilih barang terlebih dahulu'); return }
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    try {
      await apiFetch('/api/v1/stok', {
        method: 'POST',
        body: JSON.stringify({
          tipe: 'masuk',
          barang_id: selectedBarang.id,
          gudang_id: fd.get('gudang_id') || null,
          jumlah: Number(fd.get('jumlah')),
          keterangan: fd.get('keterangan'),
        }),
      })
      toast.success('Stok masuk dicatat!')
      router.push('/dashboard/inventory/stok')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link href="/dashboard/inventory/stok"><ArrowLeft className="h-5 w-5" /></Link></Button>
        <div><h1 className="text-3xl font-heading font-bold">Stok Masuk</h1><p className="text-muted-foreground mt-1">Catat penerimaan barang</p></div>
      </div>
      <form onSubmit={onSubmit} className="space-y-6">
        <Card><CardHeader><CardTitle className="text-base">Data Penerimaan Barang</CardTitle></CardHeader><CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Barang *</label>
            <div ref={searchRef} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Cari nama atau kode barang..."
                value={selectedBarang ? `[${selectedBarang.kode}] ${selectedBarang.nama}` : search}
                onChange={e => { setSearch(e.target.value); setSelectedBarang(null); setShowDropdown(true) }}
                onFocus={() => setShowDropdown(true)}
                className="pl-9"
              />
              {showDropdown && search.length > 0 && !selectedBarang && (
                <div ref={dropdownRef} className="absolute z-50 top-full mt-1 w-full rounded-md border bg-popover shadow-md max-h-60 overflow-auto">
                  {filteredBarang.length === 0 ? (
                    <div className="p-3 text-sm text-muted-foreground">Barang tidak ditemukan</div>
                  ) : filteredBarang.slice(0, 20).map(b => (
                    <button
                      key={b.id}
                      type="button"
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent text-left"
                      onClick={() => { setSelectedBarang(b); setSearch(''); setShowDropdown(false) }}
                    >
                      <div><div className="font-medium">{b.nama}</div><div className="text-xs text-muted-foreground">{b.kode} — {b.satuan}</div></div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Gudang</label>
              <select name="gudang_id" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Pilih Gudang</option>
                {gudangList.map(g => <option key={g.id} value={g.id}>{g.nama}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Jumlah *</label>
              <Input type="number" name="jumlah" min="1" required placeholder="0" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Keterangan</label>
            <Textarea name="keterangan" rows={2} placeholder="Pembelian dari supplier..." />
          </div>
        </CardContent></Card>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" asChild><Link href="/dashboard/inventory/stok">Batal</Link></Button>
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {submitting ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </form>
    </div>
  )
}
