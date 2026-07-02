"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileText, Loader2 } from 'lucide-react'
import { getAuthToken } from '@/lib/api/client'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface Props {
  doId: string
  nomor: string
}

const POSITIONS = [
  { row: 0, col: 0, label: 'Baris 1 · Kolom 1' },
  { row: 0, col: 1, label: 'Baris 1 · Kolom 2' },
  { row: 1, col: 0, label: 'Baris 2 · Kolom 1' },
  { row: 1, col: 1, label: 'Baris 2 · Kolom 2' },
  { row: 2, col: 0, label: 'Baris 3 · Kolom 1' },
  { row: 2, col: 1, label: 'Baris 3 · Kolom 2' },
  { row: 3, col: 0, label: 'Baris 4 · Kolom 1' },
  { row: 3, col: 1, label: 'Baris 4 · Kolom 2' },
] as const

export function DOLabelPengirimanDownload({ doId, nomor }: Props) {
  const [selectedPos, setSelectedPos] = useState<{ row: number; col: number } | null>(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function fetchPDF(row?: number, col?: number) {
    if (loading) return
    setLoading(true)
    setOpen(false)
    setSelectedPos(null)
    try {
      const token = await getAuthToken()
      const params = row !== undefined && col !== undefined ? `?row=${row}&col=${col}` : ''
      const res = await fetch(`/api/v1/delivery-order/${doId}/label-pengiriman${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok) throw new Error('Gagal memuat label')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const win = window.open(url, '_blank')
      if (!win) {
        const a = document.createElement('a')
        a.href = url
        a.download = `${nomor}-label-pengiriman.pdf`
        a.click()
      }
      setTimeout(() => URL.revokeObjectURL(url), 60000)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  function isSelected(r: number, c: number) {
    return selectedPos?.row === r && selectedPos?.col === c
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" disabled={loading}>
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
          ) : (
            <FileText className="h-3.5 w-3.5 mr-1" />
          )}
          Label Pengiriman
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="p-1">
          <h3 className="font-medium text-sm mb-3">Pilih Posisi Cetak</h3>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {POSITIONS.map((p) => (
              <button
                key={`${p.row}-${p.col}`}
                type="button"
                onClick={() =>
                  setSelectedPos(
                    isSelected(p.row, p.col) ? null : { row: p.row, col: p.col },
                  )
                }
                className={cn(
                  'border rounded-lg p-2.5 transition-all flex flex-col items-center gap-1.5 cursor-pointer',
                  isSelected(p.row, p.col)
                    ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-sm'
                    : 'border-border hover:border-muted-foreground/30 hover:bg-muted/30',
                )}
              >
                <div className="w-12 aspect-[1/1.414] border border-muted-foreground/20 rounded-sm relative overflow-hidden bg-card">
                  <div
                    className={cn(
                      'absolute w-1/2 h-1/4 transition-colors',
                      isSelected(p.row, p.col) ? 'bg-primary/20' : 'bg-primary/10',
                    )}
                    style={{ top: `${p.row * 25}%`, left: `${p.col * 50}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground leading-tight">
                  {p.label}
                </span>
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1"
              disabled={!selectedPos}
              onClick={() => selectedPos && fetchPDF(selectedPos.row, selectedPos.col)}
            >
              Cetak 1 Label
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => fetchPDF()}
            >
              Cetak 8
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
