'use client'

import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import imageCompression from 'browser-image-compression'

interface ImageUploadFieldProps {
  value?: string
  onChange: (imageUrl: string) => void
  onError?: (error: string) => void
  disabled?: boolean
}

export function ImageUploadField({ value, onChange, onError, disabled = false }: ImageUploadFieldProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [preview, setPreview] = useState<string>(value || '')
  const [dragActive, setDragActive] = useState(false)

  const handleImageCompression = useCallback(
    async (file: File) => {
      try {
        setIsLoading(true)

        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        }

        const compressedFile = await imageCompression(file, options)
        const reader = new FileReader()

        reader.onload = (e) => {
          const result = e.target?.result as string
          setPreview(result)
          onChange(result)
          setIsLoading(false)
        }

        reader.onerror = () => {
          onError?.('Failed to read image file')
          setIsLoading(false)
        }

        reader.readAsDataURL(compressedFile)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to compress image'
        onError?.(message)
        setIsLoading(false)
      }
    },
    [onChange, onError],
  )

  const handleFileSelect = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) {
        onError?.('Please select an image file')
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        onError?.('Image must be less than 10MB')
        return
      }

      handleImageCompression(file)
    },
    [handleImageCompression, onError],
  )

  const handleDropFile = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      const file = e.dataTransfer.files?.[0]
      if (file) {
        handleFileSelect(file)
      }
    },
    [handleFileSelect],
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleFileSelect(file)
      }
    },
    [handleFileSelect],
  )

  const handleClear = useCallback(() => {
    setPreview('')
    onChange('')
  }, [onChange])

  return (
    <div className="space-y-4">
      <div
        className={`relative rounded-lg border-2 border-dashed transition-colors ${
          dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50'
        } ${disabled ? 'opacity-50' : ''}`}
        onDragEnter={() => !disabled && setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDropFile}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          disabled={disabled || isLoading}
          className="hidden"
          id="image-upload"
        />

        <label
          htmlFor="image-upload"
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 py-8 px-4 ${
            disabled || isLoading ? 'cursor-not-allowed' : ''
          }`}
        >
          <Upload className="h-8 w-8 text-gray-400" />
          <div className="text-sm text-gray-700">
            <span className="font-medium text-blue-600 hover:text-blue-700">Click to upload</span>
            {' or drag and drop'}
          </div>
          <div className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB (will be compressed to 1MB)</div>
        </label>

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/50">
            <div className="text-sm font-medium text-gray-700">Compressing image...</div>
          </div>
        )}
      </div>

      {preview && (
        <Card className="p-4">
          <div className="space-y-3">
            <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-100">
              <img src={preview} alt="Preview" className="h-full w-full object-cover" />
              <button
                onClick={handleClear}
                disabled={isLoading}
                className="absolute top-2 right-2 inline-flex items-center justify-center rounded-full bg-red-500 p-2 text-white hover:bg-red-600 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="text-xs text-gray-500">
              ✓ Image ready. Compressed and optimized.
            </div>
          </div>
        </Card>
      )}

      {!preview && (
        <Card className="p-4 text-center">
          <ImageIcon className="mx-auto h-8 w-8 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">No image selected</p>
        </Card>
      )}
    </div>
  )
}
