'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Loader2, Upload, Save, FileText, Trash2, ExternalLink } from 'lucide-react'
import { apiFetch, apiFetchFormData } from '@/lib/api/client'
import { toast } from 'sonner'

interface Props {
  doId: string
  status: string
  existingNomor: string | null
  existingFileUrl: string | null
}

export function DoDeliverySlip({ doId, status, existingNomor, existingFileUrl }: Props) {
  const [nomor, setNomor] = useState(existingNomor ?? '')
  const [fileUrl, setFileUrl] = useState(existingFileUrl ?? '')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleSaveNomor() {
    setSaving(true)
    try {
      await apiFetch(`/api/v1/delivery-order/${doId}`, {
        method: 'PUT',
        body: JSON.stringify({ delivery_slip_nomor: nomor || null }),
      })
      toast.success('Nomor Delivery Slip disimpan')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal simpan')
    } finally {
      setSaving(false)
    }
  }

  async function handleFileUpload(file: File) {
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 10MB')
      return
    }
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowed.includes(file.type)) {
      toast.error('File harus JPG, PNG, WebP, atau PDF')
      return
    }

    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await apiFetchFormData<{ fileUrl: string }>(
        `/api/v1/delivery-order/${doId}/delivery-slip-file`,
        fd,
      )
      setFileUrl(res.data.fileUrl)
      toast.success('File Delivery Slip berhasil diupload')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal upload file')
    } finally {
      setUploading(false)
    }
  }

  async function handleDeleteFile() {
    setUploading(true)
    try {
      await apiFetch(`/api/v1/delivery-order/${doId}/delivery-slip-file`, { method: 'DELETE' })
      setFileUrl('')
      toast.success('File berhasil dihapus')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal hapus file')
    } finally {
      setUploading(false)
    }
  }

  if (status === 'selesai' || status === 'ditolak') return null

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4" /> Delivery Slip Customer
        </h3>
        <p className="text-sm text-muted-foreground">
          Masukkan nomor Delivery Slip dari customer dan upload dokumen pendukung.
        </p>

        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="text-sm text-muted-foreground block mb-1">Nomor Delivery Slip</label>
            <Input
              placeholder="Input nomor delivery slip dari customer"
              value={nomor}
              onChange={(e) => setNomor(e.target.value)}
            />
          </div>
          <Button onClick={handleSaveNomor} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />{saving ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>

        <div className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-medium text-sm">File Delivery Slip</p>
            {fileUrl && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-1" /> Lihat
                  </a>
                </Button>
                <Button variant="ghost" size="icon" onClick={handleDeleteFile} disabled={uploading}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            )}
          </div>

          {fileUrl ? (
            <div className="relative">
              {fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                <img src={fileUrl} alt="Delivery Slip" className="w-full h-40 object-cover rounded-md" />
              ) : (
                <div className="w-full h-40 bg-muted rounded-md flex items-center justify-center">
                  <FileText className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>
          ) : (
            <div
              className="border-2 border-dashed rounded-md h-40 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Ketuk untuk upload file (PDF/Gambar)</p>
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleFileUpload(f)
              e.target.value = ''
            }}
          />

          {uploading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Mengupload...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
