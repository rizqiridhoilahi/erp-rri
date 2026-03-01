'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit2, Trash2, Loader2, Send } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useQuotation } from '@/hooks/useQuotation'
import { Quotation, QuotationLineItemResponse } from '@/lib/validations/quotation'
import { WorkflowStatusBadge } from '@/components/sales/WorkflowStatusBadge'
import { QuotationToSOConverter } from '@/components/sales/QuotationToSOConverter'

interface QuotationDetail extends Quotation {
  quotation_line_items?: QuotationLineItemResponse[]
}

const statusConfig = {
  draft: { label: 'Draft', className: 'bg-gray-100 text-gray-800' },
  sent: { label: 'Dikirim', className: 'bg-blue-100 text-blue-800' },
  accepted: { label: 'Diterima', className: 'bg-green-100 text-green-800' },
  rejected: { label: 'Ditolak', className: 'bg-red-100 text-red-800' },
  expired: { label: 'Expired', className: 'bg-yellow-100 text-yellow-800' },
}

export default function QuotationDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  
  const { getOne, delete: deleteQuotation, isLoading } = useQuotation()
  const [quotation, setQuotation] = useState<QuotationDetail | null>(null)
  const [isFetching, setIsFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isConverting, setIsConverting] = useState(false)

  useEffect(() => {
    if (!id) return
    
    const fetchQuotation = async () => {
      try {
        const data = await getOne(id)
        setQuotation(data as QuotationDetail)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch quotation'
        setError(message)
      } finally {
        setIsFetching(false)
      }
    }

    fetchQuotation()
  }, [id, getOne])

  const handleDelete = async () => {
    if (!id) return
    if (confirm('Apakah Anda yakin ingin menghapus quotation ini?')) {
      try {
        await deleteQuotation(id)
        router.push('/sales/quotations')
      } catch (error) {
        console.error('Error deleting quotation:', error)
      }
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!id) return
    try {
      const response = await fetch(`/api/quotations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error('Failed to update status')
      
      const updated = await response.json()
      setQuotation(updated)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error updating status')
    }
  }

  const handleConvertToSO = async (salesOrderData: any) => {
    if (!id) return
    setIsConverting(true)
    try {
      const response = await fetch('/api/sales-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(salesOrderData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create sales order')
      }

      const { id: soId, salesOrderNo } = await response.json()
      
      // Update quotation status to accepted
      await handleStatusChange('accepted')
      
      // Redirect to the new sales order
      router.push(`/sales/sales-orders/${soId}`)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error converting quotation')
    } finally {
      setIsConverting(false)
    }
  }

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Memuat data quotation...</p>
        </div>
      </div>
    )
  }

  if (error || !quotation) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon">
            <Link href="/sales/quotations">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Quotation tidak ditemukan</h1>
        </div>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error || 'Quotation tidak ditemukan'}</p>
        </div>
      </div>
    )
  }

  const lineItems = quotation.quotation_line_items || []
  const subtotal = lineItems.reduce((sum, item) => sum + ((item as any).line_total || 0), 0)
  const taxAmount = subtotal * 0.11
  const total = subtotal + taxAmount

  // Prepare data for converter
  const quotationWithLineItems = {
    ...quotation,
    lineItems: lineItems.map(item => ({
      ...item,
      lineTotal: (item as any).line_total,
      unitPrice: (item as any).unit_price,
      discountPercent: (item as any).discount_percent || 0,
    })),
    subtotal,
    taxAmount,
    totalAmount: total,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon">
            <Link href="/sales/quotations">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{quotation.quotationNo}</h1>
            <p className="text-gray-600 mt-1">Detail quotation</p>
          </div>
        </div>
        <div className="flex gap-2">
          {/* Status Actions */}
          {quotation.status === 'draft' && (
            <Button
              onClick={() => handleStatusChange('sent')}
              variant="outline"
            >
              <Send className="w-4 h-4 mr-2" />
              Kirim ke Pelanggan
            </Button>
          )}
          {quotation.status === 'sent' && (
            <>
              <Button
                onClick={() => handleStatusChange('accepted')}
                className="bg-green-600 hover:bg-green-700"
              >
                Terima Quotation
              </Button>
              <Button
                onClick={() => handleStatusChange('rejected')}
                variant="destructive"
              >
                Tolak
              </Button>
            </>
          )}
          <Button asChild variant="outline">
            <Link href={`/sales/quotations/${id}/edit`}>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button
            onClick={handleDelete}
            variant="destructive"
            disabled={isLoading}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Quotation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Pelanggan</p>
                  <p className="text-lg font-medium">{quotation.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <WorkflowStatusBadge 
                    status={quotation.status} 
                    variant="quotation" 
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tanggal Quotation</p>
                  <p className="text-lg font-medium">
                    {format(new Date(quotation.quotationDate), 'dd MMMM yyyy', {
                      locale: idLocale,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Berlaku Hingga</p>
                  <p className="text-lg font-medium">
                    {format(new Date(quotation.validUntil), 'dd MMMM yyyy', {
                      locale: idLocale,
                    })}
                  </p>
                </div>
              </div>

              {quotation.notes && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600">Catatan</p>
                  <p className="text-base text-gray-900 mt-2">{quotation.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle>Item Produk</CardTitle>
              <CardDescription>Produk yang termasuk dalam quotation ini</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produk</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Harga/Unit</TableHead>
                    <TableHead className="text-right">Diskon %</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          {item.notes && <p className="text-xs text-gray-500 mt-1">{item.notes}</p>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        {(item as any).unit_price.toLocaleString('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          maximumFractionDigits: 0,
                        })}
                      </TableCell>
                      <TableCell className="text-right">{(item as any).discount_percent}%</TableCell>
                      <TableCell className="text-right font-medium">
                        {((item as any).line_total || 0).toLocaleString('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          maximumFractionDigits: 0,
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Totals */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2 max-w-xs ml-auto">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">
                    {subtotal.toLocaleString('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">PPN (11%):</span>
                  <span className="font-medium">
                    {taxAmount.toLocaleString('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-lg border-t pt-2">
                  <span className="font-semibold">Total:</span>
                  <span className="font-bold text-green-600">
                    {total.toLocaleString('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quotation to SO Converter */}
          <QuotationToSOConverter 
            quotation={quotationWithLineItems}
            onConvert={handleConvertToSO}
            isLoading={isConverting}
          />

          {/* Related Sales Orders */}
          {quotation.status === 'accepted' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Dokumen Terkait</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Quotation telah diterima. Sales Order dapat dibuat dari converter di atas.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
