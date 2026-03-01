'use client'

import { useState, useCallback } from 'react'
import { Upload, FileSpreadsheet, X, Download, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useImportExportStore } from '@/store/importExportStore'
import { ImportRow, ImportEntityType, importColumnHeaders, templateSampleData } from '@/lib/validations/import-export'
import { ImportPreviewTable } from '@/components/modals/ImportPreviewTable'
import { ImportErrorReport } from '@/components/modals/ImportErrorReport'

interface ExcelImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImport?: (data: ImportRow[]) => Promise<void>
}

export function ExcelImportModal({ isOpen, onClose, onImport }: ExcelImportModalProps) {
  const [entityType, setEntityType] = useState<ImportEntityType>('products')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<ImportRow[]>([])
  const [errors, setErrors] = useState<ImportRow[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [importStep, setImportStep] = useState<'upload' | 'preview' | 'importing' | 'complete'>('upload')
  
  const { addImportHistory } = useImportExportStore()

  // Generate template file for download
  const downloadTemplate = useCallback(() => {
    const sampleData = templateSampleData[entityType]
    if (!sampleData || sampleData.length === 0) return

    // Create CSV content
    const csvContent = sampleData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `template_${entityType}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [entityType])

  // Parse uploaded file (simulated - in real app would use xlsx library)
  const processFile = useCallback(async (file: File) => {
    setIsProcessing(true)
    setSelectedFile(file)
    
    // Simulate file processing with sample data
    // In production, use xlsx library to parse actual file
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Generate sample preview data
    const headers = importColumnHeaders[entityType]
    const sampleRows: ImportRow[] = [
      {
        rowNumber: 1,
        data: {
          sku: 'SKU-001',
          name: 'Produk Contoh 1',
          brand: 'Brand A',
          category: 'Elektronik',
          purchase_price: '100000',
          selling_price: '150000',
          stock: '100',
          unit: 'pcs',
          status: 'active',
        },
        isValid: true,
        errors: [],
      },
      {
        rowNumber: 2,
        data: {
          sku: '',
          name: 'Produk Contoh 2',
          brand: 'Brand B',
          category: 'Furniture',
          purchase_price: '200000',
          selling_price: '300000',
          stock: '50',
          unit: 'unit',
          status: 'active',
        },
        isValid: false,
        errors: ['SKU wajib diisi'],
      },
      {
        rowNumber: 3,
        data: {
          sku: 'SKU-003',
          name: 'Produk Contoh 3',
          brand: 'Brand C',
          category: 'Alat Tulis',
          purchase_price: 'invalid',
          selling_price: '50000',
          stock: '200',
          unit: 'pcs',
          status: 'active',
        },
        isValid: false,
        errors: ['Harga beli harus angka'],
      },
    ]
    
    setPreview(sampleRows.filter(r => r.isValid))
    setErrors(sampleRows.filter(r => !r.isValid))
    setImportStep('preview')
    setIsProcessing(false)
  }, [entityType])

  // Handle file selection
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }, [processFile])

  // Handle actual import
  const handleImport = useCallback(async () => {
    if (!selectedFile) return
    
    setImportStep('importing')
    setIsProcessing(true)
    
    // Simulate import process
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Add to history
    const successCount = preview.length
    const failCount = errors.length
    
    addImportHistory({
      id: Date.now().toString(),
      entityType,
      filename: selectedFile.name,
      uploadedAt: new Date().toISOString(),
      totalRows: successCount + failCount,
      successRows: successCount,
      failedRows: failCount,
      status: failCount > 0 ? 'partial' : 'completed',
    })
    
    setImportStep('complete')
    setIsProcessing(false)
    
    // Call the onImport callback if provided
    if (onImport) {
      await onImport(preview)
    }
  }, [selectedFile, preview, errors, entityType, addImportHistory, onImport])

  // Reset and close
  const handleClose = useCallback(() => {
    setImportStep('upload')
    setSelectedFile(null)
    setPreview([])
    setErrors([])
    onClose()
  }, [onClose])

  const entityTypeLabels: Record<ImportEntityType, string> = {
    products: 'Produk',
    customers: 'Pelanggan',
    suppliers: 'Supplier',
    sales_orders: 'Pesanan Penjualan',
    invoices: 'Faktur',
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-green-600" />
            Impor Data Excel
          </DialogTitle>
          <DialogDescription>
            Unggah file Excel/CSV untuk mengimpor data ke sistem
          </DialogDescription>
        </DialogHeader>

        {importStep === 'upload' && (
          <div className="space-y-6">
            {/* Entity Type Selection */}
            <div className="space-y-2">
              <Label>Jenis Data</Label>
              <Select value={entityType} onValueChange={(v) => setEntityType(v as ImportEntityType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis data" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(entityTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Template Download */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-blue-900">Unduh Template</p>
                    <p className="text-sm text-blue-700">
                      Download template CSV untuk format yang benar
                    </p>
                  </div>
                  <Button variant="outline" onClick={downloadTemplate} className="gap-2">
                    <Download className="h-4 w-4" />
                    Download Template
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* File Upload */}
            <div className="space-y-2">
              <Label>Unggah File</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                <Input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    Klik untuk memilih file atau drag & drop
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Format yang didukung: CSV, XLSX, XLS
                  </p>
                </label>
              </div>
            </div>
          </div>
        )}

        {importStep === 'preview' && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="flex gap-4">
              <Card className="flex-1 bg-green-50 border-green-200">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-lg font-bold text-green-700">{preview.length}</p>
                      <p className="text-sm text-green-600">Baris Valid</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="flex-1 bg-red-50 border-red-200">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-lg font-bold text-red-700">{errors.length}</p>
                      <p className="text-sm text-red-600">Baris dengan Error</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="flex-1 bg-gray-50 border-gray-200">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="text-lg font-bold text-gray-700">{preview.length + errors.length}</p>
                      <p className="text-sm text-gray-600">Total Baris</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Preview Table */}
            {preview.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-green-700">Data Preview (Valid)</h4>
                <ImportPreviewTable data={preview} entityType={entityType} />
              </div>
            )}

            {/* Error Report */}
            {errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-red-700">Error Report</h4>
                <ImportErrorReport data={errors} />
              </div>
            )}

            {/* Import Options */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Opsi Impor</CardTitle>
                <CardDescription>Pilih bagaimana menghandle data yang bermasalah</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      defaultChecked
                    />
                    <span className="text-sm">Lewati baris dengan error</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">Update data yang ada</span>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {importStep === 'importing' && (
          <div className="py-12 text-center">
            <Loader2 className="h-12 w-12 mx-auto text-blue-600 animate-spin mb-4" />
            <p className="text-lg font-medium">Mengimpor data...</p>
            <p className="text-sm text-gray-500">Mohon tunggu, proses ini mungkin memerlukan waktu</p>
          </div>
        )}

        {importStep === 'complete' && (
          <div className="py-8 text-center">
            <CheckCircle className="h-16 w-16 mx-auto text-green-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Import Selesai!</h3>
            <p className="text-gray-600 mb-4">
              {preview.length} berhasil, {errors.length} gagal
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => {
                setImportStep('upload')
                setSelectedFile(null)
                setPreview([])
                setErrors([])
              }}>
                Import Lagi
              </Button>
              <Button onClick={handleClose}>
                Tutup
              </Button>
            </div>
          </div>
        )}

        <DialogFooter>
          {importStep === 'preview' && (
            <>
              <Button variant="outline" onClick={() => setImportStep('upload')}>
                Kembali
              </Button>
              <Button 
                onClick={handleImport} 
                disabled={preview.length === 0 || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mengimpor...
                  </>
                ) : (
                  `Impor ${preview.length} Baris`
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
