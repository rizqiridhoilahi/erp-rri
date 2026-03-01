'use client'

import { useState, useCallback } from 'react'
import { Download, FileSpreadsheet, FileText, File, Loader2, CheckCircle, X } from 'lucide-react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { ExportEntityType, ExportFormat, exportColumnHeaders } from '@/lib/validations/import-export'
import { useImportExportStore } from '@/store/importExportStore'

interface ExcelExportModalProps {
  isOpen: boolean
  onClose: () => void
}

const entityTypeLabels: Record<ExportEntityType, string> = {
  products: 'Produk',
  customers: 'Pelanggan',
  suppliers: 'Supplier',
  sales_orders: 'Pesanan Penjualan',
  invoices: 'Faktur',
  quotations: 'Penawaran',
  journal_entries: 'Jurnal Umum',
  trial_balance: 'Neraca Saldo',
}

const formatIcons: Record<ExportFormat, React.ReactNode> = {
  xlsx: <FileSpreadsheet className="h-5 w-5 text-green-600" />,
  csv: <File className="h-5 w-5 text-blue-600" />,
  pdf: <FileText className="h-5 w-5 text-red-600" />,
}

export function ExcelExportModal({ isOpen, onClose }: ExcelExportModalProps) {
  const [entityType, setEntityType] = useState<ExportEntityType>('products')
  const [format, setFormat] = useState<ExportFormat>('xlsx')
  const [selectedColumns, setSelectedColumns] = useState<string[]>([])
  const [filename, setFilename] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [exportComplete, setExportComplete] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  
  const { addExportHistory } = useImportExportStore()

  // Get available columns for selected entity
  const availableColumns = exportColumnHeaders[entityType] || []

  // Handle entity type change - reset columns
  const handleEntityTypeChange = (value: string) => {
    const newEntityType = value as ExportEntityType
    setEntityType(newEntityType)
    setSelectedColumns(exportColumnHeaders[newEntityType] || [])
    setFilename(`export_${newEntityType}_${new Date().toISOString().split('T')[0]}`)
  }

  // Toggle column selection
  const toggleColumn = (column: string) => {
    if (selectedColumns.includes(column)) {
      setSelectedColumns(selectedColumns.filter(c => c !== column))
    } else {
      setSelectedColumns([...selectedColumns, column])
    }
  }

  // Select all columns
  const selectAllColumns = () => {
    setSelectedColumns(availableColumns)
  }

  // Deselect all columns
  const deselectAllColumns = () => {
    setSelectedColumns([])
  }

  // Handle export
  const handleExport = useCallback(async () => {
    if (!entityType || selectedColumns.length === 0) return
    
    setIsExporting(true)
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Create sample CSV content for demo
    const headers = selectedColumns.join(',')
    const rows = [
      headers,
      selectedColumns.map(() => 'sample data').join(','),
      selectedColumns.map(() => 'sample data 2').join(','),
    ]
    const csvContent = rows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    
    // Add to history
    addExportHistory({
      id: Date.now().toString(),
      entityType,
      format,
      filename: `${filename}.${format}`,
      exportedAt: new Date().toISOString(),
      rowCount: 2,
      downloadUrl: url,
    })
    
    setDownloadUrl(url)
    setExportComplete(true)
    setIsExporting(false)
  }, [entityType, format, selectedColumns, filename, addExportHistory])

  // Handle download
  const handleDownload = useCallback(() => {
    if (downloadUrl) {
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `${filename}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }, [downloadUrl, filename, format])

  // Reset and close
  const handleClose = useCallback(() => {
    setExportComplete(false)
    setDownloadUrl(null)
    onClose()
  }, [onClose])

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-blue-600" />
            Ekspor Data Excel
          </DialogTitle>
          <DialogDescription>
            Ekspor data ke format Excel, CSV, atau PDF
          </DialogDescription>
        </DialogHeader>

        {!exportComplete ? (
          <div className="space-y-6">
            {/* Entity Type Selection */}
            <div className="space-y-2">
              <Label>Jenis Data</Label>
              <Select value={entityType} onValueChange={handleEntityTypeChange}>
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

            {/* Format Selection */}
            <div className="space-y-2">
              <Label>Format File</Label>
              <div className="flex gap-4">
                {(['xlsx', 'csv', 'pdf'] as ExportFormat[]).map((fmt) => (
                  <label
                    key={fmt}
                    className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                      format === fmt ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="format"
                      value={fmt}
                      checked={format === fmt}
                      onChange={() => setFormat(fmt)}
                      className="sr-only"
                    />
                    {formatIcons[fmt]}
                    <span className="font-medium uppercase">{fmt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Column Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Kolom yang akan diekspor</Label>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={selectAllColumns}>
                    Pilih Semua
                  </Button>
                  <Button variant="ghost" size="sm" onClick={deselectAllColumns}>
                    Hapus Semua
                  </Button>
                </div>
              </div>
              <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
                <div className="grid grid-cols-3 gap-2">
                  {availableColumns.map((column) => (
                    <label key={column} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={selectedColumns.includes(column)}
                        onCheckedChange={() => toggleColumn(column)}
                      />
                      <span className="text-sm capitalize">{column.replace(/_/g, ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-500">
                {selectedColumns.length} dari {availableColumns.length} kolom dipilih
              </p>
            </div>

            {/* Filename */}
            <div className="space-y-2">
              <Label>Nama File</Label>
              <Input
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="Masukkan nama file"
              />
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <CheckCircle className="h-16 w-16 mx-auto text-green-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Export Selesai!</h3>
            <p className="text-gray-600 mb-4">
              File berhasil dibuat: {filename}.{format}
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={handleDownload} className="gap-2">
                <Download className="h-4 w-4" />
                Download File
              </Button>
              <Button onClick={handleClose}>
                Tutup
              </Button>
            </div>
          </div>
        )}

        {!exportComplete && (
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Batal
            </Button>
            <Button 
              onClick={handleExport} 
              disabled={selectedColumns.length === 0 || isExporting || !filename}
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mengekspor...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Ekspor
                </>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
