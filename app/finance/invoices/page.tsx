'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MainLayout } from '@/components/common/MainLayout'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Plus, 
  Search, 
  Download, 
  Eye, 
  FileText,
  Receipt,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

// Invoice data type
interface Invoice {
  id: string
  invoice_number: string
  customer_name: string
  so_number: string
  invoice_date: string
  due_date: string
  total_amount: number
  amount_paid: number
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'partial'
}

// Sample data
const sampleInvoices: Invoice[] = [
  {
    id: '1',
    invoice_number: 'INV-25-00001',
    customer_name: 'PT ABC',
    so_number: 'SO-25-00001',
    invoice_date: '2025-01-15',
    due_date: '2025-02-15',
    total_amount: 15000000,
    amount_paid: 15000000,
    status: 'paid'
  },
  {
    id: '2',
    invoice_number: 'INV-25-00002',
    customer_name: 'PT DEF',
    so_number: 'SO-25-00002',
    invoice_date: '2025-01-20',
    due_date: '2025-02-20',
    total_amount: 25000000,
    amount_paid: 10000000,
    status: 'partial'
  },
  {
    id: '3',
    invoice_number: 'INV-25-00003',
    customer_name: 'PT GHI',
    so_number: 'SO-25-00003',
    invoice_date: '2025-02-01',
    due_date: '2025-03-01',
    total_amount: 18000000,
    amount_paid: 0,
    status: 'sent'
  },
  {
    id: '4',
    invoice_number: 'INV-25-00004',
    customer_name: 'PT JKL',
    so_number: 'SO-25-00004',
    invoice_date: '2024-12-01',
    due_date: '2025-01-01',
    total_amount: 5000000,
    amount_paid: 0,
    status: 'overdue'
  },
]

export default function InvoicesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [invoices, setInvoices] = useState<Invoice[]>(sampleInvoices)

  // Filter invoices
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.so_number.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Calculate totals
  const totalInvoices = invoices.length
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.total_amount, 0)
  const totalPaid = invoices.reduce((sum, inv) => sum + inv.amount_paid, 0)
  const totalOutstanding = totalAmount - totalPaid
  const overdueCount = invoices.filter(inv => inv.status === 'overdue').length

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Get status badge
  const getStatusBadge = (status: Invoice['status']) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>
      case 'sent':
        return <Badge className="bg-blue-100 text-blue-800">Terkirim</Badge>
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Lunas</Badge>
      case 'partial':
        return <Badge className="bg-yellow-100 text-yellow-800">Sebagian</Badge>
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">Jatuh Tempo</Badge>
    }
  }

  // Calculate progress percentage
  const getPaymentProgress = (invoice: Invoice) => {
    if (invoice.total_amount === 0) return 0
    return Math.round((invoice.amount_paid / invoice.total_amount) * 100)
  }

  return (
    <MainLayout>
      <PageHeader
        title="Invoices"
        description="Kelola faktur penjualan dan pembayaran"
      />

      <div className="space-y-6">
        {/* Stats Cards - 1 Row with compact sizing */}
        <div className="grid grid-cols-5 gap-2">
          <Card className="min-w-0">
            <CardContent className="py-2 px-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1 bg-blue-100 rounded shrink-0">
                  <FileText className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate">{totalInvoices}</p>
                  <p className="text-xs text-gray-500 truncate">Total Faktur</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="min-w-0">
            <CardContent className="py-2 px-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1 bg-green-100 rounded shrink-0">
                  <DollarSign className="h-3.5 w-3.5 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate">{formatCurrency(totalAmount)}</p>
                  <p className="text-xs text-gray-500 truncate">Total Tagihan</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="min-w-0">
            <CardContent className="py-2 px-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1 bg-emerald-100 rounded shrink-0">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate">{formatCurrency(totalPaid)}</p>
                  <p className="text-xs text-gray-500 truncate">Terbayar</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="min-w-0">
            <CardContent className="py-2 px-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1 bg-yellow-100 rounded shrink-0">
                  <Clock className="h-3.5 w-3.5 text-yellow-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate">{formatCurrency(totalOutstanding)}</p>
                  <p className="text-xs text-gray-500 truncate">Outstanding</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="min-w-0">
            <CardContent className="py-2 px-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1 bg-red-100 rounded shrink-0">
                  <AlertCircle className="h-3.5 w-3.5 text-red-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate">{overdueCount}</p>
                  <p className="text-xs text-gray-500 truncate">Jatuh Tempo</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Cari invoice, customer, atau SO..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Terkirim</SelectItem>
                  <SelectItem value="partial">Sebagian</SelectItem>
                  <SelectItem value="paid">Lunas</SelectItem>
                  <SelectItem value="overdue">Jatuh Tempo</SelectItem>
                </SelectContent>
              </Select>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Buat Faktur
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Faktur</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Faktur</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>No. SO</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Jatuh Tempo</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Terbayar</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      {invoice.invoice_number}
                    </TableCell>
                    <TableCell>{invoice.customer_name}</TableCell>
                    <TableCell>
                      <Link 
                        href={`/sales/sales-orders?id=${invoice.so_number}`}
                        className="text-blue-600 hover:underline"
                      >
                        {invoice.so_number}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {format(new Date(invoice.invoice_date), 'dd MMM yyyy', { locale: id })}
                    </TableCell>
                    <TableCell>
                      {format(new Date(invoice.due_date), 'dd MMM yyyy', { locale: id })}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(invoice.total_amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <span>{formatCurrency(invoice.amount_paid)}</span>
                        <span className="text-xs text-gray-500">
                          {getPaymentProgress(invoice)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" title="Lihat Detail">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Download PDF">
                          <Download className="h-4 w-4" />
                        </Button>
                        {invoice.status === 'paid' && (
                          <Button variant="ghost" size="sm" title="Cetak Kwitansi">
                            <Receipt className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
