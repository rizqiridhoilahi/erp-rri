"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, FileText, ExternalLink, Trash2, Loader2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export interface DocumentFile {
  id: string
  file_name: string
  file_url: string
  drive_file_id?: string | null
  uploaded_at: string
}

interface CompactFileUploadProps {
  documents: DocumentFile[]
  onUpload: (file: File) => void
  onDelete: (docId: string) => Promise<void>
  uploading?: boolean
  accept?: string
  label?: string
}

export function CompactFileUpload({
  documents,
  onUpload,
  onDelete,
  uploading = false,
  accept = ".pdf,.jpg,.jpeg,.png,.webp",
  label = "Dokumen:",
}: CompactFileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (e.target) e.target.value = ""
    onUpload(file)
  }

  return (
    <div className="flex items-center rounded-lg border bg-card px-4 w-full py-2">
      {label && <span className="text-sm font-medium shrink-0 mr-2">{label}</span>}
      <div className="flex flex-wrap items-center gap-1.5 min-w-0 w-[100pt]">
        {documents.length === 0 && !uploading && (
          <span className="text-xs text-muted-foreground">Belum ada file</span>
        )}
        {documents.map((doc) => (
          <span
            key={doc.id}
            className="inline-flex items-center gap-1.5 rounded-md border border-primary bg-background px-2.5 py-2 text-xs w-[1250px] group"
          >
            <FileText className="h-4 w-4 shrink-0 text-primary" />
            <span className="flex-1 truncate text-primary">{doc.file_name}</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-green-600 hover:text-green-700 p-0.5"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </TooltipTrigger>
                <TooltipContent>Buka file</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <button
              onClick={() => onDelete(doc.id)}
              className="shrink-0 text-red-600 hover:text-red-700 p-0.5"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </span>
        ))}
        {uploading && (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" /> Mengupload...
          </span>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        variant="default"
        size="sm"
        onClick={() => inputRef.current?.click()}
        className="shrink-0 ml-auto bg-success text-white hover:bg-[#16A34A]"
      >
        <Upload className="h-3 w-3 mr-1" /> Upload
      </Button>
    </div>
  )
}
