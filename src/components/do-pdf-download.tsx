"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ListOrdered } from 'lucide-react'
import { AturItemsPerPage } from '@/components/atur-items-per-page'
import { computeDefaultDistribution } from '@/lib/pdf/utils'
import { getAuthToken } from '@/lib/api/client'
import { toast } from 'sonner'

interface Props {
  doId: string
  nomor: string
  totalItems: number
}

export function DOPdfDownload({ doId, nomor, totalItems }: Props) {
  const [previewLoading, setPreviewLoading] = useState(false)
  const [downloadLoading, setDownloadLoading] = useState(false)

  const initialDistribution = computeDefaultDistribution(totalItems, 20, 20)

  const fetchPdfBlob = async (itemsPerPageParam?: string) => {
    const token = await getAuthToken()
    const url = itemsPerPageParam
      ? `/api/v1/delivery-order/${doId}/pdf?itemsPerPage=${itemsPerPageParam}`
      : `/api/v1/delivery-order/${doId}/pdf`
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
    <AturItemsPerPage
      trigger={
        <Button variant="outline" size="sm">
          <ListOrdered className="h-3.5 w-3.5 mr-1" />
          Atur Items
        </Button>
      }
      totalItems={totalItems}
      initialDistribution={initialDistribution}
      defaultPageCount={20}
      pageLabel="Halaman"
      startNumber={1}
      title="Atur Items Surat Jalan"
      previewLoading={previewLoading}
      downloadLoading={downloadLoading}
      onPreview={handlePreview}
      onDownload={handleDownload}
    />
  )
}
