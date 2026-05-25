"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { apiFetch } from "@/lib/api/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { BreadcrumbNav, BreadcrumbItem } from "@/components/breadcrumb-nav"
import { PageHeader } from "@/components/page-header"
import { EmptyState } from "@/components/empty-state"
import { FileUpload, type DocumentFile } from "@/components/file-upload"
import { toast } from "sonner"

const breadcrumbItems: BreadcrumbItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Master Data" },
  { label: "Kontrak", href: "/dashboard/master/kontrak" },
  { label: "Detail Kontrak" },
]

interface Kontrak {
  id: string
  nama: string
  customer: { nama: string }[]
  tanggal_mulai: string | null
  tanggal_selesai: string | null
  is_active: boolean
  created_at: string
}

export default function DetailKontrakPage() {
  const router = useRouter()
  const pathname = usePathname()
  const id = pathname.split("/").pop()
  const [data, setData] = useState<Kontrak | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [documents, setDocuments] = useState<DocumentFile[]>([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!id) return
    apiFetch<Kontrak>(`/api/v1/master/kontrak/${id}`)
      .then((res) => { setData(res.data); setLoading(false) })
      .catch((err) => { setError(err.message); setLoading(false) })
  }, [id])

  useEffect(() => {
    if (!id) return
    apiFetch<DocumentFile[]>(`/api/v1/master/kontrak/${id}/documents`)
      .then((res) => setDocuments(res.data ?? []))
      .catch(() => {})
  }, [id])

  const handleUpload = async (file: File) => {
    if (!id) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const { apiFetchFormData } = await import("@/lib/api/client")
      const r = await apiFetchFormData(`/api/v1/master/kontrak/${id}/documents`, formData)
      setDocuments((prev) => [r.data as DocumentFile, ...prev])
      toast.success("File berhasil diupload")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal upload file")
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteDocument = async (docId: string) => {
    if (!id) return
    try {
      await apiFetch(`/api/v1/master/kontrak/${id}/documents?docId=${docId}`, { method: "DELETE" })
      setDocuments((prev) => prev.filter((d) => d.id !== docId))
      toast.success("File berhasil dihapus")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal hapus file")
    }
  }

  const formatDate = (date: string | null) => {
    if (!date) return "-"
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  const statusBadge = (isActive: boolean) => (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
      isActive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
    }`}>
      {isActive ? "Active" : "Non-Active"}
    </span>
  )

  if (loading) return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <BreadcrumbNav items={breadcrumbItems} />
      <div className="min-h-[200px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-3 text-muted-foreground">Memuat data...</p>
      </div>
    </div>
  )

  if (error || !data) return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <BreadcrumbNav items={breadcrumbItems} />
      <EmptyState title="Gagal memuat data" description={error || "Data tidak ditemukan"} />
    </div>
  )

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <BreadcrumbNav items={breadcrumbItems} />
      <PageHeader
        title={data.nama || "Detail Kontrak"}
        description="Informasi lengkap"
        actions={
          <div className="flex gap-2">
            <Button variant="back" onClick={() => router.push("/dashboard/master/kontrak")}>
              Kembali
            </Button>
            <Button onClick={() => router.push(`/dashboard/master/kontrak/${id}/edit`)}>
              Edit
            </Button>
          </div>
        }
      />
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-muted-foreground mb-1">Nama Kontrak</label>
              <p className="text-sm font-medium">{data.nama}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Customer</label>
              <p className="text-sm font-medium">{data.customer?.[0]?.nama || "-"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Status</label>
              <p className="text-sm">{statusBadge(data.is_active)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Tanggal Mulai</label>
              <p className="text-sm font-medium">{formatDate(data.tanggal_mulai)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Tanggal Selesai</label>
              <p className="text-sm font-medium">{formatDate(data.tanggal_selesai)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Dibuat Pada</label>
              <p className="text-sm font-medium">
                {new Date(data.created_at).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="mt-6">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Lampiran</h3>
            <FileUpload
              documents={documents}
              onUpload={handleUpload}
              onDelete={handleDeleteDocument}
              uploading={uploading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
