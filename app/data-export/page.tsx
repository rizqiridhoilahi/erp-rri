'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/common/MainLayout'
import { PageHeader } from '@/components/common/PageHeader'
import { ExcelExportModal } from '@/components/modals/ExcelExportModal'
import { ExportScheduler } from '@/components/modals/ExportScheduler'
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
  Download,
  FileSpreadsheet,
  Calendar,
  Clock,
  History,
  CheckCircle,
  Mail,
} from 'lucide-react'
import { useImportExportStore, ExportHistory, ScheduledExport } from '@/store/importExportStore'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export default function DataExportPage() {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [isSchedulerModalOpen, setIsSchedulerModalOpen] = useState(false)
  const { exportHistory, scheduledExports } = useImportExportStore()

  // Calculate stats
  const totalExports = exportHistory.length
  const totalScheduled = scheduledExports.length
  const activeSchedules = scheduledExports.filter(s => s.isActive).length

  const getEntityLabel = (type: string) => {
    const labels: Record<string, string> = {
      products: 'Produk',
      customers: 'Pelanggan',
      suppliers: 'Supplier',
      sales_orders: 'Pesanan Penjualan',
      invoices: 'Faktur',
      quotations: 'Penawaran',
      journal_entries: 'Jurnal Umum',
      trial_balance: 'Neraca Saldo',
    }
    return labels[type] || type
  }

  const getFrequencyLabel = (frequency: string) => {
    const labels: Record<string, string> = {
      daily: 'Harian',
      weekly: 'Mingguan',
      monthly: 'Bulanan',
    }
    return labels[frequency] || frequency
  }

  return (
    <MainLayout>
      <PageHeader
        title="Ekspor Data"
        description="Ekspor data ke format Excel, CSV, atau PDF"
      />

      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Download className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalExports}</p>
                  <p className="text-sm text-gray-500">Total Ekspor</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalScheduled}</p>
                  <p className="text-sm text-gray-500">Jadwal Teratur</p>
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
                  <p className="text-2xl font-bold">{activeSchedules}</p>
                  <p className="text-sm text-gray-500">Jadwal Aktif</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-blue-600" />
                Ekspor Manual
              </CardTitle>
              <CardDescription>
                Ekspor data langsung ke file Excel, CSV, atau PDF
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setIsExportModalOpen(true)} className="w-full gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Buka Opsi Ekspor
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                Jadwal Otomatis
              </CardTitle>
              <CardDescription>
                Atur ekspor otomatis ke email secara terjadwal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setIsSchedulerModalOpen(true)} variant="outline" className="w-full gap-2">
                <Clock className="h-4 w-4" />
                Kelola Jadwal
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Export History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Riwayat Ekspor
            </CardTitle>
            <CardDescription>
              Daftar riwayat ekspor data sebelumnya
            </CardDescription>
          </CardHeader>
          <CardContent>
            {exportHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileSpreadsheet className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p>Belum ada riwayat ekspor</p>
                <p className="text-sm text-gray-400">Ekspor data pertama Anda dengan mengklik tombol di atas</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Jenis Data</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Nama File</TableHead>
                    <TableHead>Jumlah Baris</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exportHistory.map((exportItem) => (
                    <TableRow key={exportItem.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          {format(new Date(exportItem.exportedAt), 'dd MMM yyyy HH:mm', { locale: id })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{getEntityLabel(exportItem.entityType)}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{exportItem.format.toUpperCase()}</Badge>
                      </TableCell>
                      <TableCell>{exportItem.filename}</TableCell>
                      <TableCell>{exportItem.rowCount}</TableCell>
                      <TableCell>
                        {exportItem.downloadUrl && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={exportItem.downloadUrl} download={exportItem.filename}>
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </a>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Scheduled Exports */}
        {scheduledExports.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Jadwal Ekspor Teratur
              </CardTitle>
              <CardDescription>
                Daftar jadwal ekspor otomatis yang telah dikonfigurasi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Jenis Data</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Frekuensi</TableHead>
                    <TableHead>Waktu</TableHead>
                    <TableHead>Penerima</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scheduledExports.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell>
                        <span className="font-medium">{getEntityLabel(schedule.entityType)}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{schedule.format.toUpperCase()}</Badge>
                      </TableCell>
                      <TableCell>{getFrequencyLabel(schedule.frequency)}</TableCell>
                      <TableCell>{schedule.time}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span>{schedule.emailRecipients.length} email</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={schedule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {schedule.isActive ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Export Modal */}
      <ExcelExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      {/* Scheduler Modal */}
      <ExportScheduler
        isOpen={isSchedulerModalOpen}
        onClose={() => setIsSchedulerModalOpen(false)}
      />
    </MainLayout>
  )
}
