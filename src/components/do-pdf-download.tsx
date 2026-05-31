"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import { getAuthToken } from '@/lib/api/client'
import { toast } from 'sonner'

interface Props {
  doId: string
}

export function DOPdfDownload({ doId }: Props) {
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    setLoading(true)
    try {
      const token = await getAuthToken()
      const res = await fetch(`/api/v1/delivery-order/${doId}/pdf`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.error || 'Gagal memuat PDF')
      }
      const blob = await res.blob()
      window.open(URL.createObjectURL(blob), '_blank')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal memuat PDF')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="default" onClick={handleDownload} disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
      PDF Surat Jalan
    </Button>
  )
}
