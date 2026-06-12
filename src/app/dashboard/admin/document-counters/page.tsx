"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Loader2, RefreshCw, Pencil, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/hooks/use-auth'

interface CounterRow {
  kode_dokumen: string
  tahun: number
  bulan: number
  counter: number
  created_at: string | null
  updated_at: string | null
}

export default function DocumentCountersPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [rows, setRows] = useState<CounterRow[]>([])
  const [loading, setLoading] = useState(true)
  const [resetting, setResetting] = useState(false)
  const [editRow, setEditRow] = useState<CounterRow | null>(null)
  const [editCounter, setEditCounter] = useState('')
  const [editBulan, setEditBulan] = useState('')
  const [saving, setSaving] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [addKode, setAddKode] = useState('GLOBAL')
  const [addTahun, setAddTahun] = useState(new Date().getFullYear().toString())
  const [addBulan, setAddBulan] = useState('')
  const [addCounter, setAddCounter] = useState('')

  const role = user?.role

  function refetch() {
    apiFetch<CounterRow[]>('/api/v1/document-counters')
      .then(res => setRows(res.data ?? []))
      .catch(() => toast.error('Gagal memuat data counter'))
  }

  useEffect(() => {
    if (authLoading) return
    apiFetch<CounterRow[]>('/api/v1/document-counters')
      .then(res => setRows(res.data ?? []))
      .catch(() => toast.error('Gagal memuat data counter'))
      .finally(() => setLoading(false))
  }, [authLoading])

  const handleReset = async () => {
    if (!confirm('Reset GLOBAL counter ke nomor aktual terakhir dari dokumen RFQC/DI?')) return
    setResetting(true)
    try {
      const res = await apiFetch<{ message: string }>('/api/v1/document-counters/reset', { method: 'POST' })
      toast.success(res.data.message)
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal reset counter')
    } finally {
      setResetting(false)
    }
  }

  const openEdit = (row: CounterRow) => {
    setEditRow(row)
    setEditCounter(String(row.counter))
    setEditBulan(String(row.bulan))
  }

  const handleSave = async () => {
    if (!editRow) return
    const newCounter = parseInt(editCounter)
    if (isNaN(newCounter) || newCounter < 0) {
      toast.error('Counter harus berupa angka positif')
      return
    }
    const newBulan = parseInt(editBulan)
    if (isNaN(newBulan) || newBulan < 1 || newBulan > 12) {
      toast.error('Bulan harus antara 1-12')
      return
    }
    setSaving(true)
    try {
      await apiFetch('/api/v1/document-counters', {
        method: 'PATCH',
        body: JSON.stringify({
          kode_dokumen: editRow.kode_dokumen,
          tahun: editRow.tahun,
          bulan: newBulan,
          counter: newCounter,
        }),
      })
      toast.success(`Counter ${editRow.kode_dokumen} (${editRow.tahun}-${String(newBulan).padStart(2, '0')}) diupdate ke ${newCounter}`)
      setEditRow(null)
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal update counter')
    } finally {
      setSaving(false)
    }
  }

  const handleAdd = async () => {
    const tahun = parseInt(addTahun)
    const bulan = parseInt(addBulan)
    const counter = parseInt(addCounter)
    if (!addKode.trim()) { toast.error('Kode dokumen wajib diisi'); return }
    if (isNaN(tahun) || tahun < 2000) { toast.error('Tahun tidak valid'); return }
    if (isNaN(bulan) || bulan < 1 || bulan > 12) { toast.error('Bulan harus antara 1-12'); return }
    if (isNaN(counter) || counter < 0) { toast.error('Counter harus angka positif'); return }
    setSaving(true)
    try {
      await apiFetch('/api/v1/document-counters', {
        method: 'PATCH',
        body: JSON.stringify({
          kode_dokumen: addKode.trim(),
          tahun,
          bulan,
          counter,
        }),
      })
      toast.success(`Baris ${addKode.trim()} (${tahun}-${String(bulan).padStart(2, '0')}) ditambahkan dengan counter ${counter}`)
      setShowAddDialog(false)
      setAddKode('GLOBAL')
      setAddTahun(new Date().getFullYear().toString())
      setAddBulan('')
      setAddCounter('')
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menambah baris')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  }

  if (role !== 'owner' && role !== 'admin') {
    if (typeof window !== 'undefined') {
      router.push('/dashboard')
    }
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Document Counter</h1>
          <p className="text-muted-foreground mt-1">Kelola nomor counter dokumen global</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Baris
          </Button>
          <Button variant="outline" onClick={refetch} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="default" onClick={handleReset} disabled={resetting}>
            {resetting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {resetting ? 'Mereset...' : 'Reset ke Aktual'}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Daftar Counter ({rows.length} baris)
            {rows.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                — Next number = counter + 1
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : rows.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Belum ada data counter</p>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode Dokumen</TableHead>
                    <TableHead className="w-24 text-right">Tahun</TableHead>
                    <TableHead className="w-20 text-right">Bulan</TableHead>
                    <TableHead className="w-24 text-right">Counter</TableHead>
                    <TableHead className="w-24 text-right">Next Number</TableHead>
                    <TableHead className="w-20 text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={`${row.kode_dokumen}-${row.tahun}-${row.bulan}`}>
                      <TableCell className="font-mono text-sm">{row.kode_dokumen}</TableCell>
                      <TableCell className="text-right">{row.tahun}</TableCell>
                      <TableCell className="text-right">{String(row.bulan).padStart(2, '0')}</TableCell>
                      <TableCell className="text-right font-semibold">{row.counter}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{row.counter + 1}</TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(row)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAddDialog} onOpenChange={(open) => { if (!open) { setShowAddDialog(false); setSaving(false) } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Baris Counter Baru</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Kode Dokumen</Label>
                <Input
                  value={addKode}
                  onChange={(e) => setAddKode(e.target.value)}
                  className="mt-1 font-mono"
                  placeholder="GLOBAL"
                />
              </div>
              <div>
                <Label>Tahun</Label>
                <Input
                  type="number"
                  min="2020"
                  max="2100"
                  value={addTahun}
                  onChange={(e) => setAddTahun(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Bulan</Label>
                <Input
                  type="number"
                  min="1"
                  max="12"
                  value={addBulan}
                  onChange={(e) => setAddBulan(e.target.value)}
                  className="mt-1"
                  placeholder="1-12"
                />
              </div>
              <div>
                <Label>Counter</Label>
                <Input
                  type="number"
                  min="0"
                  value={addCounter}
                  onChange={(e) => setAddCounter(e.target.value)}
                  className="mt-1"
                  placeholder="0"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="cancel" onClick={() => { setShowAddDialog(false); setSaving(false) }}>Batal</Button>
              <Button onClick={handleAdd} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Simpan
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editRow} onOpenChange={(open) => { if (!open) setEditRow(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Counter</DialogTitle>
          </DialogHeader>
          {editRow && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Kode Dokumen</Label>
                  <p className="font-mono text-sm mt-1">{editRow.kode_dokumen}</p>
                </div>
                <div>
                  <Label>Tahun</Label>
                  <p className="text-sm mt-1">{editRow.tahun}</p>
                </div>
                <div>
                  <Label>Bulan</Label>
                  <Input
                    type="number"
                    min="1"
                    max="12"
                    value={editBulan}
                    onChange={(e) => setEditBulan(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label>Counter Value</Label>
                <Input
                  type="number"
                  min="0"
                  value={editCounter}
                  onChange={(e) => setEditCounter(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Next document number: {parseInt(editCounter) + 1 || ''}
                </p>
              </div>
              <DialogFooter>
                <Button variant="cancel" onClick={() => setEditRow(null)}>Batal</Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Simpan
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
