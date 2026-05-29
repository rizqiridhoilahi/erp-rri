"use client"
import { useState, useEffect } from "react"
import { apiFetch } from "@/lib/api/client"
import { FileUpload, type DocumentFile } from "@/components/file-upload"
import { toast } from "sonner"

export function SoDocuments({ soId }: { soId: string }) {
  const [documents, setDocuments] = useState<DocumentFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch<DocumentFile[]>(`/api/v1/sales-order/${soId}/documents`)
      .then((r) => { setDocuments(r.data ?? []); setLoading(false) })
      .catch(() => { setLoading(false) })
  }, [soId])

  const handleUpload = async (file: File) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const { apiFetchFormData } = await import("@/lib/api/client")
      const r = await apiFetchFormData(`/api/v1/sales-order/${soId}/documents`, formData)
      setDocuments((prev) => [r.data as DocumentFile, ...prev].filter(Boolean))
      toast.success("File berhasil diupload")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal upload file")
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (docId: string) => {
    try {
      await apiFetch(`/api/v1/sales-order/${soId}/documents?docId=${docId}`, { method: "DELETE" })
      setDocuments((prev) => prev.filter((d) => d.id !== docId))
      toast.success("File berhasil dihapus")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal hapus file")
    }
  }

  if (loading) return null

  return (
    <FileUpload
      documents={documents}
      onUpload={handleUpload}
      onDelete={handleDelete}
      uploading={uploading}
    />
  )
}
