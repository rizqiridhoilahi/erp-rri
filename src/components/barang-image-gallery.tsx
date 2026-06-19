'use client'

import { useState, useEffect } from 'react'
import { apiFetch, apiFetchFormData } from '@/lib/api/client'
import { ImageLightbox } from '@/components/image-lightbox'
import { Loader2, Upload, X, GripVertical, Star } from 'lucide-react'
import { toast } from 'sonner'
import imageCompression from 'browser-image-compression'

interface BarangImage {
  id: string
  url: string
  urutan: number
  is_primary: boolean
}

interface Props {
  barangId: string
}

export function BarangImageGallery({ barangId }: Props) {
  const [images, setImages] = useState<BarangImage[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [fetchKey, setFetchKey] = useState(0)

  const loadImages = async () => {
    try {
      const { data } = await apiFetch<BarangImage[]>(`/api/v1/master/barang/${barangId}/gambar`)
      setImages(data ?? [])
    } catch {
      toast.error('Gagal memuat gambar')
    }
  }

  useEffect(() => {
    ;(async () => {
      await loadImages()
      setLoading(false)
    })()
  }, [barangId, fetchKey])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) { toast.error('Hanya JPG, PNG, atau WebP'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('Maksimal 5MB'); return }

    setUploading(true)
    const toastId = toast.loading('Mengupload gambar...')
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/webp',
      })
      const formData = new FormData()
      formData.append('file', compressed, 'foto.webp')
      if (images.length === 0) formData.append('is_primary', 'true')
      await apiFetchFormData(`/api/v1/master/barang/${barangId}/gambar`, formData)
      toast.success('Gambar berhasil diupload', { id: toastId })
      setFetchKey(k => k + 1)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal upload', { id: toastId })
    } finally {
      setUploading(false)
      if (e.target) e.target.value = ''
    }
  }

  const handleSetPrimary = async (gambarId: string) => {
    const toastId = toast.loading('Mengatur gambar utama...')
    try {
      await apiFetch(`/api/v1/master/barang/${barangId}/gambar`, {
        method: 'PUT',
        body: JSON.stringify({ gambar_id: gambarId, is_primary: true }),
      })
      toast.success('Gambar utama diperbarui', { id: toastId })
      setFetchKey(k => k + 1)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal', { id: toastId })
    }
  }

  const handleDelete = async (gambarId: string) => {
    const toastId = toast.loading('Menghapus gambar...')
    try {
      await apiFetch(`/api/v1/master/barang/${barangId}/gambar?gambar_id=${gambarId}`, {
        method: 'DELETE',
      })
      toast.success('Gambar berhasil dihapus', { id: toastId })
      setFetchKey(k => k + 1)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal hapus', { id: toastId })
    }
  }

  const handleReorder = async (gambarId: string, newUrutan: number) => {
    try {
      await apiFetch(`/api/v1/master/barang/${barangId}/gambar`, {
        method: 'PUT',
        body: JSON.stringify({ gambar_id: gambarId, urutan: newUrutan }),
      })
      setFetchKey(k => k + 1)
    } catch {
      toast.error('Gagal mengatur urutan')
    }
  }

  const moveUp = (index: number) => {
    if (index <= 0) return
    const img = images[index]
    const prev = images[index - 1]
    handleReorder(img.id, prev.urutan)
    handleReorder(prev.id, img.urutan)
  }

  const moveDown = (index: number) => {
    if (index >= images.length - 1) return
    const img = images[index]
    const next = images[index + 1]
    handleReorder(img.id, next.urutan)
    handleReorder(next.id, img.urutan)
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Memuat gambar...</span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((img, idx) => (
          <div key={img.id} className="relative group rounded-lg border overflow-hidden bg-background">
            <ImageLightbox src={img.url} alt={`Gambar ${idx + 1}`}>
              <img
                src={img.url}
                alt={`Gambar ${idx + 1}`}
                className="h-28 w-full object-contain cursor-pointer"
              />
            </ImageLightbox>
            {img.is_primary && (
              <div className="absolute top-1 left-1 bg-[#0000ff] text-white rounded-full p-0.5">
                <Star className="h-3 w-3" />
              </div>
            )}
            <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => handleDelete(img.id)}
                className="bg-destructive/90 text-destructive-foreground rounded-full p-1 hover:bg-destructive"
                title="Hapus"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <div className="flex items-center justify-between px-2 py-1 bg-muted/50">
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => moveUp(idx)}
                  disabled={idx === 0}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                  title="Naik"
                >
                  <GripVertical className="h-3 w-3 rotate-90" />
                </button>
                <button
                  type="button"
                  onClick={() => moveDown(idx)}
                  disabled={idx === images.length - 1}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                  title="Turun"
                >
                  <GripVertical className="h-3 w-3 -rotate-90" />
                </button>
              </div>
              {!img.is_primary && (
                <button
                  type="button"
                  onClick={() => handleSetPrimary(img.id)}
                  className="text-xs text-[#0000ff] hover:underline"
                  title="Jadikan utama"
                >
                  Utama
                </button>
              )}
            </div>
          </div>
        ))}
        <div
          className="relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 h-28 cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors"
          onClick={() => document.getElementById(`gallery-upload-${barangId}`)?.click()}
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          ) : (
            <>
              <Upload className="h-6 w-6 mb-1 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Tambah</span>
            </>
          )}
          <input
            id={`gallery-upload-${barangId}`}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        {images.length} gambar &bull; Klik gambar untuk lihat &bull; Urutkan dengan tombol panah &bull; Tandai gambar utama
      </p>
    </div>
  )
}
