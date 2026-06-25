"use client"

import { useState, useEffect, useRef } from "react"
import { apiFetch, apiFetchFormData } from "@/lib/api/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Plus, Pencil, Trash2, ArrowUp, ArrowDown, ImageOff } from "lucide-react"
import { toast } from "sonner"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ClientLogo {
  id: string
  alt_text: string
  file_url: string
  urutan: number
  is_active: boolean
  created_at: string
  updated_at: string
}

const breadcrumbItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "System" },
  { label: "Client Logo", href: "/dashboard/system/client-logo" },
]

export default function ClientLogoPage() {
  const [logos, setLogos] = useState<ClientLogo[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [altText, setAltText] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const editFileInputRef = useRef<HTMLInputElement>(null)

  const fetchLogos = async () => {
    try {
      const res = await apiFetch<ClientLogo[]>('/api/v1/system/client-logo')
      setLogos(res.data ?? [])
    } catch {
      toast.error('Gagal memuat logo klien')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLogos()
  }, [])

  const handleAdd = async () => {
    if (!altText.trim()) {
      toast.error('Nama perusahaan harus diisi')
      return
    }
    if (!file) {
      toast.error('File logo harus dipilih')
      return
    }

    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('alt_text', altText.trim())
      await apiFetchFormData<ClientLogo>('/api/v1/system/client-logo', formData)
      toast.success('Logo berhasil ditambahkan')
      setShowDialog(false)
      setAltText("")
      setFile(null)
      await fetchLogos()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menambah logo')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = async () => {
    if (!editId) return
    if (!altText.trim()) {
      toast.error('Nama perusahaan harus diisi')
      return
    }

    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('alt_text', altText.trim())
      if (file) formData.append('file', file)
      await apiFetchFormData<ClientLogo>(`/api/v1/system/client-logo/${editId}`, formData, { method: 'PUT' })
      toast.success('Logo berhasil diupdate')
      setShowDialog(false)
      setEditId(null)
      setAltText("")
      setFile(null)
      await fetchLogos()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal mengupdate logo')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await apiFetch(`/api/v1/system/client-logo/${deleteId}`, { method: 'DELETE' })
      toast.success('Logo berhasil dihapus')
      setDeleteId(null)
      await fetchLogos()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menghapus logo')
    }
  }

  const moveUrutan = async (id: string, direction: 'up' | 'down') => {
    const idx = logos.findIndex(l => l.id === id)
    if (idx === -1) return
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1
    if (targetIdx < 0 || targetIdx >= logos.length) return

    const current = logos[idx]
    const target = logos[targetIdx]

    try {
      const formData = new FormData()
      formData.append('urutan', String(target.urutan))
      await apiFetchFormData(`/api/v1/system/client-logo/${current.id}`, formData, { method: 'PUT' })

      const formData2 = new FormData()
      formData2.append('urutan', String(current.urutan))
      await apiFetchFormData(`/api/v1/system/client-logo/${target.id}`, formData2, { method: 'PUT' })

      await fetchLogos()
    } catch {
      toast.error('Gagal mengubah urutan')
    }
  }

  const openEditDialog = (logo: ClientLogo) => {
    setEditId(logo.id)
    setAltText(logo.alt_text)
    setFile(null)
    setShowDialog(true)
  }

  const openAddDialog = () => {
    setEditId(null)
    setAltText("")
    setFile(null)
    setShowDialog(true)
  }

  return (
    <div className="p-6 space-y-6">
      <BreadcrumbNav items={breadcrumbItems} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Client Logo</h1>
        <Button onClick={openAddDialog}>
          <Plus className="h-4 w-4 mr-2" /> Tambah Logo
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : logos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <ImageOff className="h-12 w-12 mb-4" />
            <p className="text-lg font-medium">Belum ada logo klien</p>
            <p className="text-sm">Klik &ldquo;Tambah Logo&rdquo; untuk menambahkan logo pertama</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {logos.map((logo, idx) => (
            <Card key={logo.id} className="relative group">
              <CardContent className="p-4">
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    disabled={idx === 0}
                    onClick={() => moveUrutan(logo.id, 'up')}
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    disabled={idx === logos.length - 1}
                    onClick={() => moveUrutan(logo.id, 'down')}
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => openEditDialog(logo)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() => setDeleteId(logo.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="h-28 flex items-center justify-center p-3">
                  <img
                    src={logo.file_url}
                    alt={logo.alt_text}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <p className="text-sm font-medium text-center mt-2 truncate">
                  {logo.alt_text}
                </p>
                <p className="text-xs text-muted-foreground text-center">
                  Urutan: {logo.urutan}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={(open) => { if (!open) { setShowDialog(false); setEditId(null); setAltText(""); setFile(null) } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit Logo' : 'Tambah Logo'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Perusahaan</label>
              <Input
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Contoh: PT. BJS"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">File Logo</label>
              <Input
                ref={editId ? editFileInputRef : fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <p className="text-xs text-muted-foreground">
                Maksimal 5MB. Format: JPG, PNG, WebP
              </p>
            </div>
            {editId && (
              <p className="text-xs text-muted-foreground">
                Kosongkan file jika tidak ingin mengganti gambar
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowDialog(false); setEditId(null); setAltText(""); setFile(null) }}>
              Batal
            </Button>
            <Button onClick={editId ? handleEdit : handleAdd} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editId ? 'Simpan' : 'Tambah'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Logo?</AlertDialogTitle>
            <AlertDialogDescription>
              Logo akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
