"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileText, Download, Loader2 } from "lucide-react"
import { getAuthToken } from "@/lib/api/client"

interface Props {
  fpId: string
  nomor: string
}

export function FakturPajakPdfActions({ fpId, nomor }: Props) {
  const [previewLoading, setPreviewLoading] = useState(false)
  const [downloadLoading, setDownloadLoading] = useState(false)

  const fetchPdfBlob = async () => {
    const token = await getAuthToken()
    const res = await fetch(`/api/v1/faktur-pajak/${fpId}/pdf`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!res.ok) {
      const err = await res.json().catch(() => null)
      throw new Error(err?.error || "Gagal memuat PDF")
    }
    return res.blob()
  }

  const handlePreview = async () => {
    setPreviewLoading(true)
    try {
      const blob = await fetchPdfBlob()
      window.open(URL.createObjectURL(blob), "_blank")
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal memuat PDF")
    } finally {
      setPreviewLoading(false)
    }
  }

  const handleDownload = async () => {
    setDownloadLoading(true)
    try {
      const blob = await fetchPdfBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `FP-${nomor}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal mendownload PDF")
    } finally {
      setDownloadLoading(false)
    }
  }

  return (
    <>
      <Button variant="outline" onClick={handlePreview} disabled={previewLoading}>
        {previewLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
        Preview PDF
      </Button>
      <Button variant="outline" onClick={handleDownload} disabled={downloadLoading}>
        {downloadLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
        Download PDF
      </Button>
    </>
  )
}
