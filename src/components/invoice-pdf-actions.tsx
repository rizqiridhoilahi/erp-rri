"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import { AturItemsPerPage } from '@/components/atur-items-per-page'
import { computeDefaultDistribution } from '@/lib/pdf/utils'
import { getAuthToken } from '@/lib/api/client'
import { toast } from 'sonner'

interface Props {
  invId: string
  nomor: string
  totalItems: number
}

export function InvoicePdfActions({ invId, nomor, totalItems }: Props) {
  const [previewLoading, setPreviewLoading] = useState(false)
  const [downloadLoading, setDownloadLoading] = useState(false)

  const initialDistribution = computeDefaultDistribution(totalItems, 16, 24)

  const fetchPdfBlob = async (itemsPerPageParam?: string) => {
    const token = await getAuthToken()
    const url = itemsPerPageParam
      ? `/api/v1/invoice/${invId}/pdf?itemsPerPage=${itemsPerPageParam}`
      : `/api/v1/invoice/${invId}/pdf`
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!res.ok) {
      const err = await res.json().catch(() => null)
      throw new Error(err?.error || 'Gagal memuat PDF')
    }
    return res.blob()
  }

  const handlePreview = async (itemsPerPage: number[]) => {
    setPreviewLoading(true)
    try {
      const param = itemsPerPage.join(',')
      const blob = await fetchPdfBlob(param)
      window.open(URL.createObjectURL(blob), '_blank')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal memuat PDF')
    } finally {
      setPreviewLoading(false)
    }
  }

  const handleDownload = async (itemsPerPage: number[]) => {
    setDownloadLoading(true)
    try {
      const param = itemsPerPage.join(',')
      const blob = await fetchPdfBlob(param)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${nomor}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal download PDF')
    } finally {
      setDownloadLoading(false)
    }
  }

  return (
    <div className="flex gap-2">
      <AturItemsPerPage
        trigger={
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Preview Invoice
          </Button>
        }
        totalItems={totalItems}
        initialDistribution={initialDistribution}
        defaultPageCount={24}
        pageLabel="Halaman"
        startNumber={1}
        title="Atur Items Invoice"
        previewLoading={previewLoading}
        downloadLoading={downloadLoading}
        onPreview={handlePreview}
        onDownload={handleDownload}
      />
    </div>
  )
}
