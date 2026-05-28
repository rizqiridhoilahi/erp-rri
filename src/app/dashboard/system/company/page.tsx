"use client"

import { useState, useEffect, useRef } from "react"
import { apiFetch, apiFetchFormData } from "@/lib/api/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, Save, Upload } from "lucide-react"
import { toast } from "sonner"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"

const breadcrumbItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "System" },
  { label: "Company Profile", href: "/dashboard/system/company" },
]

export default function CompanySettingsPage() {
  const [data, setData] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingKey, setUploadingKey] = useState<string | null>(null)

  const logoInputRef = useRef<HTMLInputElement>(null)
  const ttdInputRef = useRef<HTMLInputElement>(null)
  const stempelInputRef = useRef<HTMLInputElement>(null)
  const ttdStempelInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    apiFetch<Record<string, string>>('/api/v1/system/company')
      .then((res) => setData(res.data ?? {}))
      .catch(() => toast.error('Gagal memuat pengaturan'))
      .finally(() => setLoading(false))
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
