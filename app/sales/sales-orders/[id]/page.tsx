'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Edit, Download, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { SalesOrder, SOLineItemResponse } from '@/lib/validations/sales-order'
import { WorkflowStatusBadge, WorkflowTimeline } from '@/components/sales/WorkflowStatusBadge'
import { QuotationToSOConverter } from '@/components/sales/QuotationToSOConverter'

export default function SalesOrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [salesOrder, setSalesOrder] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showTimeline, setShowTimeline] = useState(false)

  useEffect(() => {
    const fetchSalesOrder = async () => {
      try {
        const response = await fetch(`/api/sales-orders/${id}`)
        if (!response.ok) throw new Error('Failed to fetch')
        const data = await response.json()
        setSalesOrder(data)
      } catch (error) {
        console.error('Error:', error)
        router.push('/sales/sales-orders')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSalesOrder()
  }, [id, router])

  const handleDelete = async () => {
    if (!confirm('Yakin ingin menghapus Sales Order ini?')) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/sales-orders/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete')
      router.push('/sales/sales-orders')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error deleting sales order')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/sales-orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error('Failed to update status')
      const updated = await response.json()
      setSalesOrder(updated)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error updating status')
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Memuat...</div>
        </div>
      </main>
    )
  }

  if (!salesOrder) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Sales Order tidak ditemukan</div>
        </div>
      </main>
    )
  }

  const timeline = [
    {
      label: 'Draft',
      status: salesOrder.status === 'draft' ? 'current' : salesOrder.status ? 'completed' : 'upcoming',
      date: salesOrder.createdAt ? new Date(salesOrder.createdAt).toLocaleDateString('id-ID') : '',
    },
    {
      label: 'Dikonfirmasi',
      status: 
        salesOrder.status === 'confirmed' ? 'current' : 
        ['in-production', 'ready', 'cancelled'].includes(salesOrder.status) ? 'completed' : 'upcoming',
    },
    {
      label: 'Produksi',
      status:
        salesOrder.status === 'in-production' ? 'current' :
        ['ready', 'cancelled'].includes(salesOrder.status) ? 'completed' : 'upcoming',
    },
    {
      label: 'Siap',
      status: salesOrder.status === 'ready' ? 'current' : salesOrder.status === 'ready' ? 'completed' : 'upcoming',
    },
  ]

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/sales/sales-orders">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">
              {salesOrder.salesOrderNo}
            </h1>
            <p className="text-gray-600 mt-1">{salesOrder.customerName}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button
              variant="outline"
              return (
                <main className="min-h-screen bg-gray-50">
                  <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                      <Link href="/sales/sales-orders">
                        <Button variant="ghost" size="sm">
                          <ArrowLeft className="w-4 h-4" />
                        </Button>
                      </Link>
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900">Detail Sales Order</h1>
                        <p className="text-gray-600 mt-1">SO No: {salesOrder?.salesOrderNo}</p>
                      </div>
                    </div>

                    {/* Workflow Status */}
                    {salesOrder && (
                      <div className="mb-4">
                        <WorkflowStatusBadge status={salesOrder.status} variant="sales-order" size="md" showIcon />
                      </div>
                    )}

                    {/* Toast feedback for actions (success/fail) */}
                    {/* ...existing code... */}
                  </div>
                </main>
              )
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange('confirmed')}
                  >
                    Konfirmasi
                  </Button>
                )}
                {salesOrder.status === 'confirmed' && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange('in-production')}
                  >
                    Mulai Produksi
                  </Button>
                )}
                {salesOrder.status === 'in-production' && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange('ready')}
                  >
                    Tandai Siap
                  </Button>
                )}
                {salesOrder.status === 'ready' && (
                  <Button
                    size="sm"
                    onClick={() =>
                      router.push(
                        `/sales/delivery-orders/create?salesOrderId=${id}`
                      )
                    }
                  >
                    Buat DO
                  </Button>
                )}
              </div>

              {/* Timeline */}
              <button
                onClick={() => setShowTimeline(!showTimeline)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {showTimeline ? 'Sembunyikan' : 'Tampilkan'} Timeline
              </button>

              {showTimeline && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <WorkflowTimeline steps={timeline} />
                </div>
              )}
            </Card>

            {/* Details */}
            <Card className="p-6 space-y-4">
              <h3 className="text-lg font-semibold">Informasi SO</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600">Tanggal SO</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(salesOrder.soDate).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Tanggal Pengiriman</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(
                      salesOrder.deliveryDate
                    ).toLocaleDateString('id-ID')}
                  </p>
                </div>
                {salesOrder.poNumber && (
                  <div>
                    <p className="text-xs text-gray-600">No. PO Pelanggan</p>
                    <p className="font-semibold text-gray-900">
                      {salesOrder.poNumber}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-600">Dibuat</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(salesOrder.createdAt).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>
            </Card>

            {/* Line Items */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Daftar Item</h3>
              <div className="space-y-2 mb-4">
                {(salesOrder.lineItems || []).map(
                  (item: SOLineItemResponse, index: number) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-3 bg-gray-50"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.productName}
                          </p>
                          <p className="text-xs text-gray-600">
                            {item.quantity} × Rp{' '}
                            {item.unitPrice.toLocaleString('id-ID')}
                            {item.discountPercent > 0 && (
                              <span className="ml-2">- {item.discountPercent}%</span>
                            )}
                          </p>
                        </div>
                        <p className="font-semibold text-gray-900">
                          Rp {item.lineTotal?.toLocaleString('id-ID')}
                        </p>
                      </div>
                      {item.notes && (
                        <p className="text-xs text-gray-600 mt-1">
                          Catatan: {item.notes}
                        </p>
                      )}
                    </div>
                  )
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Summary */}
            <Card className="p-6 bg-blue-50 border-blue-200">
              <h3 className="text-lg font-semibold mb-4">Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">
                    Rp {salesOrder.subtotal?.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pajak (11%)</span>
                  <span className="font-medium text-gray-900">
                    Rp {salesOrder.taxAmount?.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="border-t border-blue-200 pt-2 flex justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-bold text-lg text-gray-900">
                    Rp {salesOrder.totalAmount?.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </Card>

            {/* Customer Info */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Pelanggan</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600">Nama</p>
                  <p className="font-semibold text-gray-900">
                    {salesOrder.customerName}
                  </p>
                </div>
                {salesOrder.deliveryAddress && (
                  <div>
                    <p className="text-xs text-gray-600">Alamat Pengiriman</p>
                    <p className="text-sm text-gray-900">
                      {salesOrder.deliveryAddress}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
