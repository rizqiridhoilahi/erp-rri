"use client"

import { useState, useEffect, useRef } from "react"
import { apiFetch, apiFetchFormData } from "@/lib/api/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Loader2, Save, Upload, Plus, Pencil, Trash2, X } from "lucide-react"
import { toast } from "sonner"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"

const breadcrumbItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "System" },
  { label: "Company Profile", href: "/dashboard/system/company" },
]

interface Kendaraan {
  id: string
  nama: string
  no_polisi: string
  is_active: boolean
}

export default function CompanySettingsPage() {
  const [data, setData] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingKey, setUploadingKey] = useState<string | null>(null)

  const [kendaraan, setKendaraan] = useState<Kendaraan[]>([])
  const [kendaraanLoading, setKendaraanLoading] = useState(true)

  const [showKendaraanForm, setShowKendaraanForm] = useState(false)
  const [editKendaraanId, setEditKendaraanId] = useState<string | null>(null)
  const [kendaraanNama, setKendaraanNama] = useState("")
  const [kendaraanNoPolisi, setKendaraanNoPolisi] = useState("")
  const [kendaraanSaving, setKendaraanSaving] = useState(false)

  const logoInputRef = useRef<HTMLInputElement>(null)
  const ttdInputRef = useRef<HTMLInputElement>(null)
  const stempelInputRef = useRef<HTMLInputElement>(null)
  const ttdStempelInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    Promise.all([
      apiFetch<Record<string, string>>('/api/v1/system/company'),
      apiFetch<Kendaraan[]>('/api/v1/system/kendaraan'),
    ])
      .then(([companyRes, kendaraanRes]) => {
        setData(companyRes.data ?? {})
        setKendaraan(kendaraanRes.data ?? [])
      })
      .catch(() => toast.error('Gagal memuat pengaturan'))
      .finally(() => {
        setLoading(false)
        setKendaraanLoading(false)
      })
  }, [])

  const handleChange = (key: string, value: string) => {
    setData(prev => ({ ...prev, [key]: value }))
  }

  const handleUpload = async (file: File, key: string) => {
    setUploadingKey(key)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await apiFetchFormData<{ fileUrl: string; fileName: string }>('/api/v1/system/company/upload', formData)
      setData(prev => ({ ...prev, [key]: res.data.fileUrl }))
      toast.success('Gambar berhasil diupload')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal upload gambar')
    } finally {
      setUploadingKey(null)
    }
  }

  const triggerUpload = (inputRef: React.RefObject<HTMLInputElement | null>) => {
    inputRef.current?.click()
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0]
    if (file) handleUpload(file, key)
    if (e.target) e.target.value = ''
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await apiFetch('/api/v1/system/company', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      toast.success('Pengaturan berhasil disimpan')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan')
    } finally {
      setSaving(false)
    }
  }

  const resetKendaraanForm = () => {
    setShowKendaraanForm(false)
    setEditKendaraanId(null)
    setKendaraanNama("")
    setKendaraanNoPolisi("")
  }

  const openEditKendaraan = (item: Kendaraan) => {
    setEditKendaraanId(item.id)
    setKendaraanNama(item.nama)
    setKendaraanNoPolisi(item.no_polisi)
    setShowKendaraanForm(true)
  }

  const handleSaveKendaraan = async () => {
    if (!kendaraanNama.trim()) return toast.error('Nama kendaraan wajib diisi')
    if (!kendaraanNoPolisi.trim()) return toast.error('No. Polisi wajib diisi')
    setKendaraanSaving(true)
    try {
      if (editKendaraanId) {
        await apiFetch(`/api/v1/system/kendaraan/${editKendaraanId}`, {
          method: 'PUT',
          body: JSON.stringify({ nama: kendaraanNama.trim(), no_polisi: kendaraanNoPolisi.trim() }),
        })
        toast.success('Kendaraan berhasil diupdate')
      } else {
        await apiFetch('/api/v1/system/kendaraan', {
          method: 'POST',
          body: JSON.stringify({ nama: kendaraanNama.trim(), no_polisi: kendaraanNoPolisi.trim() }),
        })
        toast.success('Kendaraan berhasil ditambahkan')
      }
      resetKendaraanForm()
      const res = await apiFetch<Kendaraan[]>('/api/v1/system/kendaraan')
      setKendaraan(res.data ?? [])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan kendaraan')
    } finally {
      setKendaraanSaving(false)
    }
  }

  const handleToggleKendaraan = async (item: Kendaraan) => {
    try {
      await apiFetch(`/api/v1/system/kendaraan/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_active: !item.is_active }),
      })
      const res = await apiFetch<Kendaraan[]>('/api/v1/system/kendaraan')
      setKendaraan(res.data ?? [])
      toast.success(`Kendaraan ${item.is_active ? 'dinonaktifkan' : 'diaktifkan'}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal mengubah status')
    }
  }

  const handleDeleteKendaraan = async (id: string) => {
    if (!confirm('Hapus kendaraan ini?')) return
    try {
      await apiFetch(`/api/v1/system/kendaraan/${id}`, { method: 'DELETE' })
      setKendaraan(prev => prev.filter(k => k.id !== id))
      toast.success('Kendaraan berhasil dihapus')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menghapus')
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <BreadcrumbNav items={breadcrumbItems} />
      <div>
        <h1 className="text-3xl font-heading font-bold">Company Profile</h1>
        <p className="text-muted-foreground mt-1">Informasi perusahaan untuk dokumen PDF</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Informasi Perusahaan</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nama Perusahaan</Label>
            <Input value={data.company_nama ?? ''} onChange={e => handleChange('company_nama', e.target.value)} placeholder="PT. Rizqi Ridho Ilahi" />
          </div>
          <div className="space-y-2">
            <Label>Bidang Usaha</Label>
            <Textarea value={data.company_bidang_usaha ?? ''} onChange={e => handleChange('company_bidang_usaha', e.target.value)} rows={3} placeholder="Furniture, Welding&#10;General Trading&#10;Services" />
          </div>
          <div className="space-y-2">
            <Label>Alamat</Label>
            <Textarea value={data.company_alamat ?? ''} onChange={e => handleChange('company_alamat', e.target.value)} rows={2} placeholder="Jerukwangi - Bangsri, Jepara" />
          </div>
          <div className="space-y-2">
            <Label>NPWP</Label>
            <Input value={data.company_npwp ?? ''} onChange={e => handleChange('company_npwp', e.target.value)} placeholder="00.000.000.0-000.000" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>No. HP</Label>
              <Input value={data.company_no_hp ?? ''} onChange={e => handleChange('company_no_hp', e.target.value)} placeholder="+6281 2607 5500" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={data.company_email ?? ''} onChange={e => handleChange('company_email', e.target.value)} placeholder="mazzjoeq@gmail.com" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Logo</Label>
            <div className="flex gap-2">
              <Input value={data.company_logo_url ?? ''} onChange={e => handleChange('company_logo_url', e.target.value)} placeholder="https://..." className="flex-1" />
              <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFileSelect(e, 'company_logo_url')} />
              <Button type="button" variant="outline" size="icon" onClick={() => triggerUpload(logoInputRef)} disabled={uploadingKey === 'company_logo_url'}>
                {uploadingKey === 'company_logo_url' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              </Button>
            </div>
            {data.company_logo_url && (
              <img src={data.company_logo_url} alt="Logo" className="mt-2 h-16 w-16 object-contain rounded border" />
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Penandatangan</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nama</Label>
              <Input value={data.penandatangan_nama ?? ''} onChange={e => handleChange('penandatangan_nama', e.target.value)} placeholder="Mohamad Marzuqi" />
            </div>
            <div className="space-y-2">
              <Label>Jabatan</Label>
              <Input value={data.penandatangan_jabatan ?? ''} onChange={e => handleChange('penandatangan_jabatan', e.target.value)} placeholder="Direktur" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>No. HP</Label>
            <Input value={data.penandatangan_no_hp ?? ''} onChange={e => handleChange('penandatangan_no_hp', e.target.value)} placeholder="0812-607-5500" />
          </div>
          <div className="space-y-2">
            <Label>Tanda Tangan</Label>
            <div className="flex gap-2">
              <Input value={data.tanda_tangan_url ?? ''} onChange={e => handleChange('tanda_tangan_url', e.target.value)} placeholder="https://..." className="flex-1" />
              <input ref={ttdInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFileSelect(e, 'tanda_tangan_url')} />
              <Button type="button" variant="outline" size="icon" onClick={() => triggerUpload(ttdInputRef)} disabled={uploadingKey === 'tanda_tangan_url'}>
                {uploadingKey === 'tanda_tangan_url' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              </Button>
            </div>
            {data.tanda_tangan_url && (
              <img src={data.tanda_tangan_url} alt="Tanda Tangan" className="mt-2 h-16 object-contain rounded border" />
            )}
          </div>
          <div className="space-y-2">
            <Label>Stempel</Label>
            <div className="flex gap-2">
              <Input value={data.stempel_url ?? ''} onChange={e => handleChange('stempel_url', e.target.value)} placeholder="https://..." className="flex-1" />
              <input ref={stempelInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFileSelect(e, 'stempel_url')} />
              <Button type="button" variant="outline" size="icon" onClick={() => triggerUpload(stempelInputRef)} disabled={uploadingKey === 'stempel_url'}>
                {uploadingKey === 'stempel_url' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              </Button>
            </div>
            {data.stempel_url && (
              <img src={data.stempel_url} alt="Stempel" className="mt-2 h-16 object-contain rounded border" />
            )}
          </div>
          <div className="space-y-2">
            <Label>Tanda Tangan + Stempel (gabungan)</Label>
            <div className="flex gap-2">
              <Input value={data.tanda_tangan_stempel_url ?? ''} onChange={e => handleChange('tanda_tangan_stempel_url', e.target.value)} placeholder="https://..." className="flex-1" />
              <input ref={ttdStempelInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFileSelect(e, 'tanda_tangan_stempel_url')} />
              <Button type="button" variant="outline" size="icon" onClick={() => triggerUpload(ttdStempelInputRef)} disabled={uploadingKey === 'tanda_tangan_stempel_url'}>
                {uploadingKey === 'tanda_tangan_stempel_url' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              </Button>
            </div>
            {data.tanda_tangan_stempel_url && (
              <img src={data.tanda_tangan_stempel_url} alt="Tanda Tangan + Stempel" className="mt-2 h-24 object-contain rounded border" />
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Informasi Bank</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nama Bank</Label>
            <Input value={data.company_bank_name ?? ''} onChange={e => handleChange('company_bank_name', e.target.value)} placeholder="BCA KCP JEPARA" />
          </div>
          <div className="space-y-2">
            <Label>Nama Rekening</Label>
            <Input value={data.company_rekening_nama ?? ''} onChange={e => handleChange('company_rekening_nama', e.target.value)} placeholder="RIZQI RIDHO ILAHI PT" />
          </div>
          <div className="space-y-2">
            <Label>Nomor Rekening</Label>
            <Input value={data.company_rekening_nomor ?? ''} onChange={e => handleChange('company_rekening_nomor', e.target.value)} placeholder="2471266266" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Data Kendaraan</CardTitle>
          {!showKendaraanForm && (
            <Button size="sm" onClick={() => setShowKendaraanForm(true)}>
              <Plus className="h-4 w-4 mr-1" />Tambah
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {showKendaraanForm && (
            <div className="flex items-end gap-2 border rounded-lg p-3 bg-muted/30">
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Nama Kendaraan</Label>
                <Input value={kendaraanNama} onChange={e => setKendaraanNama(e.target.value)} placeholder="Mitsubishi L300" />
              </div>
              <div className="flex-1 space-y-1">
                <Label className="text-xs">No. Polisi</Label>
                <Input value={kendaraanNoPolisi} onChange={e => setKendaraanNoPolisi(e.target.value)} placeholder="B 1234 XYZ" />
              </div>
              <Button size="sm" onClick={handleSaveKendaraan} disabled={kendaraanSaving}>
                {kendaraanSaving && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                Simpan
              </Button>
              <Button size="sm" variant="ghost" onClick={resetKendaraanForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {kendaraanLoading ? (
            <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : kendaraan.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Belum ada data kendaraan</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Kendaraan</TableHead>
                  <TableHead>No. Polisi</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kendaraan.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.nama}</TableCell>
                    <TableCell>{item.no_polisi}</TableCell>
                    <TableCell>
                      <Badge variant={item.is_active ? 'success' : 'secondary'}>
                        {item.is_active ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => openEditKendaraan(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleToggleKendaraan(item)}>
                        {item.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteKendaraan(item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          <Save className="h-4 w-4 mr-2" />
          Simpan Pengaturan
        </Button>
      </div>
    </div>
  )
}
