"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, X, Eye, Download, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react'

interface Props {
  trigger: React.ReactNode
  totalItems: number
  initialDistribution: number[]
  defaultPageCount?: number
  pageLabel?: string
  startNumber?: number
  title?: string
  previewLoading?: boolean
  downloadLoading?: boolean
  onPreview: (itemsPerPage: number[]) => void
  onDownload: (itemsPerPage: number[]) => void
}

export function AturItemsPerPage({
  trigger,
  totalItems,
  initialDistribution,
  defaultPageCount = 24,
  pageLabel = 'Halaman',
  startNumber = 1,
  title = 'Atur Jumlah Item per Halaman',
  previewLoading = false,
  downloadLoading = false,
  onPreview,
  onDownload,
}: Props) {
  const [open, setOpen] = useState(false)
  const [pages, setPages] = useState<number[]>(initialDistribution)

  function handleOpenChange(newOpen: boolean) {
    setOpen(newOpen)
    if (newOpen) {
      setPages([...initialDistribution])
    }
  }

  const shownTotal = pages.reduce((a, b) => a + b, 0)
  const hasWarning = shownTotal < totalItems

  function handlePageChange(index: number, value: string) {
    const num = parseInt(value, 10)
    if (isNaN(num) || num < 1) return
    setPages(prev => {
      const next = [...prev]
      next[index] = num
      return next
    })
  }

  function addPage() {
    setPages(prev => [...prev, defaultPageCount])
  }

  function removePage(index: number) {
    if (pages.length <= 1) return
    setPages(prev => prev.filter((_, i) => i !== index))
  }

  function handlePreview() {
    onPreview(pages)
    setOpen(false)
  }

  function handleDownload() {
    onDownload(pages)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Tentukan jumlah item barang yang muncul di setiap halaman.
          </p>

          <div className="space-y-2">
            {pages.map((count, i) => (
              <div key={i} className="flex items-center gap-2">
                <label className="text-sm font-medium w-28 shrink-0">
                  {pageLabel} {startNumber + i}
                </label>
                <Input
                  type="number"
                  min={1}
                  value={count}
                  onChange={e => handlePageChange(i, e.target.value)}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">item</span>
                {pages.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => removePage(i)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button variant="outline" size="sm" onClick={addPage} className="w-full">
            <Plus className="h-3.5 w-3.5 mr-1" />
            Tambah Halaman
          </Button>

          <div className={`flex items-center gap-2 text-sm rounded-md p-2 ${
            hasWarning ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
          }`}>
            {hasWarning ? (
              <AlertTriangle className="h-4 w-4 shrink-0" />
            ) : (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            )}
            {hasWarning ? (
              <span>Menampilkan {shownTotal} dari {totalItems} item ({totalItems - shownTotal} item terakhir tidak tampil)</span>
            ) : (
              <span>Menampilkan semua {totalItems} item</span>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button
              className="bg-primary text-primary-foreground hover:opacity-95"
              onClick={handlePreview}
              disabled={previewLoading}
            >
              {previewLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Eye className="h-4 w-4 mr-2" />}
              Preview
            </Button>
            <Button
              onClick={handleDownload}
              disabled={downloadLoading}
            >
              {downloadLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
