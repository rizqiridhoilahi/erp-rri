'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Download, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { DOLineItemResponse } from '@/lib/validations/delivery-order'
import { WorkflowStatusBadge, WorkflowTimeline } from '@/components/sales/WorkflowStatusBadge'
import { DocumentPreview } from '@/components/sales/DocumentUploadField'

export default function DeliveryOrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [deliveryOrder, setDeliveryOrder] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showTimeline, setShowTimeline] = useState(false)

  useEffect(() => {
    if (!id) return
    
    const fetchDeliveryOrder = async () => {
      try {
        const response = await fetch(`/api/delivery-orders/${id}`)
        if (!response.ok) throw new Error('Failed to fetch')
        const data = await response.json()
        setDeliveryOrder(data)
      } catch (error) {
        console.error('Error:', error)
        router.push('/sales/delivery-orders')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDeliveryOrder()
  }, [id, router])

  const handleDelete = async () => {
    if (!id) return
    if (!confirm('Yakin ingin menghapus Delivery Order ini?')) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/delivery-orders/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete')
      router.push('/sales/delivery-orders')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error deleting delivery order')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/delivery-orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error('Failed to update status')
      const updated = await response.json()
      setDeliveryOrder(updated)
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

  if (!deliveryOrder) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Delivery Order tidak ditemukan</div>
        </div>
      </main>
    )
  }

  const timeline = [
    {
      label: 'Draft',
      status: (deliveryOrder.status === 'draft' ? 'current' : ['ready', 'in-transit', 'delivered'].includes(deliveryOrder.status) ? 'completed' : 'upcoming') as 'completed' | 'current' | 'upcoming',
    },
    {
      label: 'Siap Kirim',
      status: (deliveryOrder.status === 'ready' ? 'current' : ['in-transit', 'delivered'].includes(deliveryOrder.status) ? 'completed' : 'upcoming') as 'completed' | 'current' | 'upcoming',
    },
    {
      label: 'Dalam Pengiriman',
      status: (deliveryOrder.status === 'in-transit' ? 'current' : deliveryOrder.status === 'delivered' ? 'completed' : 'upcoming') as 'completed' | 'current' | 'upcoming',
    },
    {
      label: 'Diterima',
      status: (deliveryOrder.status === 'delivered' ? 'current' : 'upcoming') as 'completed' | 'current' | 'upcoming',
    },
  ]

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/sales/delivery-orders">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">
              {deliveryOrder.deliveryOrderNo}
            </h1>
            <p className="text-gray-600 mt-1">
              {deliveryOrder.customerName} • SO: {deliveryOrder.salesOrderNo}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            {deliveryOrder.status === 'draft' && (
              <Button
                size="sm"
                onClick={() => handleStatusChange('ready')}
              >
                Tandai Siap Kirim
              </Button>
            )}
            {deliveryOrder.status === 'ready' && (
              <Button
                size="sm"
                onClick={() => handleStatusChange('in-transit')}
              >
                Kirim Sekarang
              </Button>
            )}
            {deliveryOrder.status === 'in-transit' && (
              <Button
                size="sm"
                onClick={() => handleStatusChange('delivered')}
              >
                Tandai Diterima
              </Button>
            )}
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status & Timeline */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Status</p>
                  <WorkflowStatusBadge 
                    status={deliveryOrder.status} 
                    variant="delivery-order" 
                    size="md" 
                  />
                </div>
                <button
                  onClick={() => setShowTimeline(!showTimeline)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {showTimeline ? 'Sembunyikan' : 'Tampilkan'} Timeline
                </button>
              </div>

              {showTimeline && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <WorkflowTimeline steps={timeline} />
                </div>
              )}
            </Card>

            {/* Details */}
            <Card className="p-6 space-y-4">
              <h3 className="text-lg font-semibold">Informasi Pengiriman</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600">Tanggal Pengiriman</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(deliveryOrder.deliveryDate).toLocaleDateString(
                      'id-ID'
                    )}
                  </p>
                </div>
                {deliveryOrder.actualDeliveryDate && (
                  <div>
                    <p className="text-xs text-gray-600">Tanggal Diterima</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(
                        deliveryOrder.actualDeliveryDate
                      ).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                )}
                {deliveryOrder.recipient && (
                  <div>
                    <p className="text-xs text-gray-600">Penerima</p>
                    <p className="font-semibold text-gray-900">
                      {deliveryOrder.recipient}
                    </p>
                  </div>
                )}
              </div>
              {deliveryOrder.deliveryAddress && (
                <div>
                  <p className="text-xs text-gray-600">Alamat Pengiriman</p>
                  <p className="text-sm text-gray-900 mt-1">
                    {deliveryOrder.deliveryAddress}
                  </p>
                </div>
              )}
            </Card>

            {/* Line Items */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Daftar Item</h3>
              <div className="space-y-2 mb-4">
                {(deliveryOrder.lineItems || []).map(
                  (item: DOLineItemResponse, index: number) => (
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
                            Quantity: {item.quantity}
                            {item.receivedQuantity && (
                              <span className="ml-2">
                                (Diterima: {item.receivedQuantity})
                              </span>
                            )}
                          </p>
                        </div>
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

            {/* Documents */}
            {deliveryOrder.documents && deliveryOrder.documents.length > 0 && (
              <Card className="p-6">
                <DocumentPreview documents={deliveryOrder.documents} />
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Pelanggan</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600">Nama</p>
                  <p className="font-semibold text-gray-900">
                    {deliveryOrder.customerName}
                  </p>
                </div>
                {deliveryOrder.deliveryAddress && (
                  <div>
                    <p className="text-xs text-gray-600">Alamat Pengiriman</p>
                    <p className="text-sm text-gray-900">
                      {deliveryOrder.deliveryAddress}
                    </p>
                  </div>
                )}
                {deliveryOrder.recipientPhone && (
                  <div>
                    <p className="text-xs text-gray-600">No. Telepon Penerima</p>
                    <p className="font-semibold text-gray-900">
                      {deliveryOrder.recipientPhone}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Related Orders */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Dokumen Terkait</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-600">Sales Order</p>
                  <Link
                    href={`/sales/sales-orders/${deliveryOrder.salesOrderId}`}
                    className="text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    {deliveryOrder.salesOrderNo}
                  </Link>
                </div>
              </div>
            </Card>

            {/* Timeline Info */}
            <Card className="p-6 bg-blue-50 border-blue-200">
              <h3 className="text-lg font-semibold mb-4">Info Tambahan</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Dibuat</span>
                  <span className="text-gray-900">
                    {new Date(deliveryOrder.createdAt).toLocaleDateString(
                      'id-ID'
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Diperbarui</span>
                  <span className="text-gray-900">
                    {new Date(deliveryOrder.updatedAt).toLocaleDateString(
                      'id-ID'
                    )}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
