"use client"

import { Button } from '@/components/ui/button'
import { FileDown, FileText } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

interface ExportButtonProps {
  hrefPrefix: string
  variant?: 'outline' | 'default'
  label?: string
}

export function ExportPdfButton({ hrefPrefix, variant = 'outline', label = 'Export PDF' }: ExportButtonProps) {
  const searchParams = useSearchParams()
  const params = searchParams.toString()
  const href = `${hrefPrefix}${params ? '?' + params : ''}`

  return (
    <Button variant={variant} asChild>
      <a href={href} download target="_blank" rel="noopener noreferrer">
        <FileDown className="h-4 w-4 mr-2" />{label}
      </a>
    </Button>
  )
}

export function PreviewPdfButton({ hrefPrefix, label = 'Preview PDF' }: Omit<ExportButtonProps, 'variant'>) {
  const searchParams = useSearchParams()
  const params = searchParams.toString()
  const href = `${hrefPrefix}${params ? '?' + params : ''}`

  return (
    <Button variant="outline" asChild>
      <a href={href} target="_blank" rel="noopener noreferrer">
        <FileText className="h-4 w-4 mr-2" />{label}
      </a>
    </Button>
  )
}