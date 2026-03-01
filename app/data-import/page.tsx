'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/common/MainLayout'
import { PageHeader } from '@/components/common/PageHeader'
import { ExcelImportModal } from '@/components/modals/ExcelImportModal'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Clock,
  History,
  Trash2,
} from 'lucide-react'
import { useImportExportStore, ImportHistory } from '@/store/importExportStore'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export default function DataImportPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { importHistory, addImportHistory } = useImportExportStore()

  // Calculate stats
  const totalImports = importHistory.length
  const successfulImports = importHistory.filter(i => i.status === 'completed').length
  const partialImports = importHistory.filter(i => i.status === 'partial').length
  const failedImports = importHistory.filter(i => i.status === 'failed').length

  const getStatusBadge = (status: ImportHistory['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="h-3 w-3 mr-1" />Berhasil</Badge>
      case 'partial':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><AlertCircle className="h-3 w-3 mr-1" />Sebagian</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><AlertCircle className="h-3 w-3 mr-1" />Gagal</Badge>
    }
  }

  const getEntityLabel = (type: string) => {
    const labels: Record<string, string> = {
      products: 'Produk',
      customers: 'Pelanggan',
      suppliers: 'Supplier',
      sales_orders: 'Pesanan Penjualan',
      invoices: 'Faktur',
    }
    return labels[type] || type
  }

  return (
    <MainLayout>
      <PageHeader
        title="Impor Data"
        description="Unggah dan impor data dari file Excel atau CSV"
      />

      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalImports}</p>
                  <p className="text-sm text-gray-500">Total Impor</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{successfulImports}</p>
                  <p className="text-sm text-gray-500">Berhasil</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{partialImports}</p>
                  <p className="text-sm text-gray-500">Sebagian</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{failedImports}</p>
                  <p className="text-sm text-gray-500">Gagal</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Import Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Impor Data Baru</CardTitle>
            <CardDescription>
              Unggah file Excel (.xlsx, .xls) atau CSV untuk mengimpor data ke sistem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button onClick={() => setIsModalOpen(true)} className="gap-2">
                <Upload className="h-4 w-4" />
                Pilih File
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Import History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Riwayat Impor
            </CardTitle>
            <CardDescription>
              Daftar riwayat impor data sebelumnya
            </CardDescription>
          </CardHeader>
          <CardContent>
            {importHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileSpreadsheet className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p>Belum ada riwayat impor</p>
                <p className="text-sm text-gray-400">Impor data pertama Anda dengan mengklik tombol di atas</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Jenis Data</TableHead>
                    <TableHead>Nama File</TableHead>
                    <TableHead>Total Baris</TableHead>
                    <TableHead>Berhasil</TableHead>
                    <TableHead>Gagal</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importHistory.map((importItem) => (
                    <TableRow key={importItem.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          {format(new Date(importItem.uploadedAt), 'dd MMM yyyy HH:mm', { locale: id })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{getEntityLabel(importItem.entityType)}</span>
                      </TableCell>
                      <TableCell>{importItem.filename}</TableCell>
                      <TableCell>{importItem.totalRows}</TableCell>
                      <TableCell className="text-green-600">{importItem.successRows}</TableCell>
                      <TableCell className="text-red-600">{importItem.failedRows}</TableCell>
                      <TableCell>{getStatusBadge(importItem.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Import Modal */}
      <ExcelImportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </MainLayout>
  )
}
