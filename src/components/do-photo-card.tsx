'use client'

import { Button } from '@/components/ui/button'
import { Camera, CheckCircle, Loader2, Trash2 } from 'lucide-react'

interface PhotoState {
  file: File | null
  preview: string
  uploading: boolean
  url: string | null
}

interface PhotoCardProps {
  label: string
  description: string
  state: PhotoState
  inputRef: React.RefObject<HTMLInputElement | null>
  type: 'barang_diterima' | 'surat_jalan'
  onDelete: (type: 'barang_diterima' | 'surat_jalan') => void
  onFileSelect: (type: 'barang_diterima' | 'surat_jalan', file: File) => void
}

export function PhotoCard({
  label, description, state, inputRef, type, onDelete, onFileSelect,
}: PhotoCardProps) {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-sm">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        {state.url && (
          <Button variant="ghost" size="icon" onClick={() => onDelete(type)} disabled={state.uploading}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        )}
      </div>

      {state.preview ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={state.preview} alt={label} className="w-full h-40 object-cover rounded-md" />
          <div className="absolute top-2 right-2">
            <CheckCircle className="h-5 w-5 text-green-500 bg-white rounded-full" />
          </div>
        </div>
      ) : (
        <div
          className="border-2 border-dashed rounded-md h-40 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => inputRef.current?.click()}
        >
          <Camera className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Ketuk untuk upload foto</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onFileSelect(type, f)
          e.target.value = ''
        }}
      />

      {state.uploading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Mengupload...
        </div>
      )}
    </div>
  )
}
