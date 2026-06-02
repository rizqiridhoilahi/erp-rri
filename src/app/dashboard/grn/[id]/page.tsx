"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { apiFetch } from "@/lib/api/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { ArrowLeft, ClipboardList } from "lucide-react"
import { CompactFileUpload, type DocumentFile } from "@/components/compact-file-upload"
import { toast } from "sonner"

const s: Record<string, { label: string; v: "secondary" | "success" | "outline" }> = {
  draft: { label: "Draft", v: "secondary" }, completed: { label: "Selesai", v: "success" },
}

interface Grn {
  id: string
  nomor: string
  purchase_receiving_id: string
  tanggal: string
  status: string
  keterangan: string | null
  purchase_receiving: { nomor: string } | null
}

interface GrnItem {
  id: string
  jumlah: number
  barang: { nama: string; kode: string; satuan: string } | null
}

export default function GrnDetailPage() {
  const router = useRouter()
  const pathname = usePathname()
  const id = pathname.split("/").pop()
  const [grn, setGrn] = useState<Grn | null>(null)
  const [items, setItems] = useState<GrnItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [documents, setDocuments] = useState<DocumentFile[]>([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!id) return
    Promise.all([
      apiFetch<Grn>(`/api/v1/grn/${id}`),
      apiFetch<GrnItem[]>(`/api/v1/grn/${id}/items`),
      apiFetch<DocumentFile[]>(`/api/v1/grn/${id}/documents`),
    ]).then(([grnRes, itemRes, docRes]) => {
      setGrn(grnRes.data)
      setItems(itemRes.data ?? [])
      setDocuments(docRes.data ?? [])
      setLoading(false)
    }).catch((err) => {
      setError(err.message)
      setLoading(false)
    })
  }, [id])

  const handleUpload = async (file: File) => {
    if (!id) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const { apiFetchFormData } = await import("@/lib/api/client")
      const r = await apiFetchFormData(`/api/v1/grn/${id}/documents`, formData)
      setDocuments((prev) => [r.data as DocumentFile, ...prev].filter(Boolean))
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
      await apiFetch(`/api/v1/grn/${id}/documents?docId=${docId}`, { method: "DELETE" })
      setDocuments((prev) => prev.filter((d) => d.id !== docId))
      toast.success("File berhasil dihapus")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal hapus file")
    }
  }

  if (loading) return <div className="text-center py-20 text-muted-foreground">Memuat...</div>
  if (error || !grn) return <div className="text-center py-20 text-muted-foreground">GRN tidak ditemukan</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/grn")}><ArrowLeft className="h-5 w-5" /></Button>
        <div><h1 className="text-3xl font-heading font-bold">Detail GRN</h1><p className="text-muted-foreground mt-1">{grn.nomor}</p></div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Nomor</p>
              <p className="font-medium">{grn.nomor}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={s[grn.status]?.v ?? "outline"}>{s[grn.status]?.label ?? grn.status}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tanggal</p>
              <p className="font-medium">{new Date(grn.tanggal).toLocaleDateString("id-ID")}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Receiving Ref</p>
              <p className="font-medium">{grn.purchase_receiving?.nomor ?? "-"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-muted-foreground">Keterangan</p>
              <p className="font-medium">{grn.keterangan ?? "-"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {!!items.length && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><ClipboardList className="h-4 w-4" />Item Barang</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Barang</TableHead>
                  <TableHead>Kode</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                  <TableHead>Satuan</TableHead>
                  <TableHead>Keterangan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.barang?.nama}</TableCell>
                    <TableCell className="text-muted-foreground">{item.barang?.kode}</TableCell>
                    <TableCell className="text-right">{item.jumlah}</TableCell>
                    <TableCell>{item.barang?.satuan}</TableCell>
                    <TableCell className="text-muted-foreground">-</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Lampiran</h3>
          <CompactFileUpload
            documents={documents}
            onUpload={handleUpload}
            onDelete={handleDeleteDocument}
            uploading={uploading}
          />
        </CardContent>
      </Card>
    </div>
  )
}
