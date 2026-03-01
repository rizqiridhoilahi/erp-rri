'use client'

import { useState, useCallback } from 'react'
import { Upload, X, File, FileText, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { DocumentUpload } from '@/lib/validations/delivery-order'

interface DocumentUploadFieldProps {
  documents: DocumentUpload[]
  onDocumentsChange: (documents: DocumentUpload[]) => void
  allowedTypes?: string[]
  maxSize?: number // in MB
  disabled?: boolean
  className?: string
}

export function DocumentUploadField({
  documents,
  onDocumentsChange,
  allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'application/msword'],
  maxSize = 10, // 10 MB
  disabled = false,
  className,
}: DocumentUploadFieldProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadError, setUploadError] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)

  // Handle file selection
  const handleFileSelect = useCallback(
    async (files: FileList) => {
      setUploadError('')
      const newDocuments: DocumentUpload[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // Validation
        if (!allowedTypes.includes(file.type)) {
          setUploadError(
            `File ${file.name} memiliki format tidak didukung. Gunakan PDF, PNG, JPEG, atau Word.`
          )
          continue
        }

        if (file.size > maxSize * 1024 * 1024) {
          setUploadError(
            `File ${file.name} terlalu besar. Maksimal ${maxSize}MB.`
          )
          continue
        }

        // In a real app, this would upload to a server/cloud storage
        // For now, we'll create a mock file URL
        try {
          setIsUploading(true)
          const fileUrl = URL.createObjectURL(file)

          newDocuments.push({
            documentType: 'other',
            filename: file.name,
            fileUrl,
            uploadedAt: new Date().toISOString(),
          })
        } catch (error) {
          setUploadError(`Error processing file ${file.name}`)
        }
      }

      setIsUploading(false)

      if (newDocuments.length > 0) {
        onDocumentsChange([...documents, ...newDocuments])
      }
    },
    [documents, onDocumentsChange, allowedTypes, maxSize]
  )

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (!disabled && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(e.target.files)
    }
  }

  // Remove document
  const handleRemoveDocument = (index: number) => {
    const updatedDocuments = documents.filter((_, i) => i !== index)
    onDocumentsChange(updatedDocuments)
  }

  // Update document type
  const handleDocumentTypeChange = (
    index: number,
    type: DocumentUpload['documentType']
  ) => {
    const updatedDocuments = [...documents]
    updatedDocuments[index] = { ...updatedDocuments[index], documentType: type }
    onDocumentsChange(updatedDocuments)
  }

  // Get file icon
  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase()
    if (['pdf'].includes(ext || '')) {
      return <FileText size={16} className="text-red-600" />
    }
    return <File size={16} className="text-blue-600" />
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload area */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 transition-colors',
          isDragging && 'border-blue-500 bg-blue-50',
          !isDragging && 'border-gray-300 bg-gray-50',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input
          type="file"
          multiple
          onChange={handleInputChange}
          disabled={disabled || isUploading}
          className="hidden"
          id="document-upload"
          accept={allowedTypes.join(',')}
        />

        <label
          htmlFor="document-upload"
          className="flex flex-col items-center justify-center cursor-pointer"
        >
          <Upload className="w-8 h-8 text-gray-400 mb-2" />
          <p className="font-medium text-gray-700">Tarik file atau klik untuk upload</p>
          <p className="text-xs text-gray-600 mt-1">
            Mendukung PDF, gambar, dan dokumen Word (maks {maxSize}MB)
          </p>
        </label>
      </div>

      {/* Error message */}
      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {uploadError}
        </div>
      )}

      {/* Document list */}
      {documents.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Dokumen Terupload</h4>
          <div className="space-y-2">
            {documents.map((doc, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-3 bg-gray-50 flex items-center justify-between"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getFileIcon(doc.filename)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {doc.filename}
                    </p>
                    <select
                      value={doc.documentType}
                      onChange={(e) =>
                        handleDocumentTypeChange(
                          index,
                          e.target.value as DocumentUpload['documentType']
                        )
                      }
                      disabled={disabled}
                      className="text-xs text-gray-600 bg-transparent border border-gray-300 rounded px-2 py-1 mt-1"
                    >
                      <option value="purchase-order">Purchase Order</option>
                      <option value="delivery-slip">Surat Jalan</option>
                      <option value="invoice">Invoice</option>
                      <option value="other">Lainnya</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <CheckCircle size={16} className="text-green-600" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveDocument(index)}
                    disabled={disabled}
                    className="h-8 w-8 p-0"
                  >
                    <X size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Document preview component
interface DocumentPreviewProps {
  documents: DocumentUpload[]
  onDownload?: (document: DocumentUpload) => void
  onDelete?: (index: number) => void
  className?: string
}

export function DocumentPreview({
  documents,
  onDownload,
  onDelete,
  className,
}: DocumentPreviewProps) {
  const getDocumentTypeLabel = (type: DocumentUpload['documentType']) => {
    const labels = {
      'purchase-order': 'PO',
      'delivery-slip': 'Surat Jalan',
      invoice: 'Invoice',
      other: 'Dokumen',
    }
    return labels[type]
  }

  if (documents.length === 0) {
    return null
  }

  return (
    <div className={cn('space-y-2', className)}>
      <h4 className="font-medium text-gray-900">Dokumen Terlampir</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {documents.map((doc, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-3 bg-white hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2 flex-1">
                {doc.filename.endsWith('.pdf') ? (
                  <FileText size={20} className="text-red-600 mt-0.5" />
                ) : (
                  <File size={20} className="text-blue-600 mt-0.5" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {doc.filename}
                  </p>
                  <p className="text-xs text-gray-600">
                    {getDocumentTypeLabel(doc.documentType)}
                  </p>
                  {doc.uploadedAt && (
                    <p className="text-xs text-gray-500">
                      {new Date(doc.uploadedAt).toLocaleDateString('id-ID')}
                    </p>
                  )}
                </div>
              </div>
              {onDownload || onDelete ? (
                <div className="flex gap-1 ml-2">
                  {onDownload && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onDownload(doc)}
                      className="h-6 w-6 p-0"
                    >
                      <Upload size={14} />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(index)}
                      className="h-6 w-6 p-0 text-red-600"
                    >
                      <X size={14} />
                    </Button>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
