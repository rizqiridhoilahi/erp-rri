'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { DocumentUploadField } from '@/components/sales/DocumentUploadField'
import { DeliveryOrderFormInput, DOLineItem, DocumentUpload } from '@/lib/validations/delivery-order'

export default function CreateDeliveryOrderPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const salesOrderId = searchParams?.get('salesOrderId') || ''

  const [isLoading, setIsLoading] = useState(false)
  const [salesOrder, setSalesOrder] = useState<any>(null)
  const [documents, setDocuments] = useState<DocumentUpload[]>([])
  const [formData, setFormData] = useState<DeliveryOrderFormInput>({
    salesOrderId: salesOrderId || '',
    customerId: '',
    customerName: '',
    deliveryDate: new Date().toISOString().split('T')[0],
    deliveryAddress: '',
    status: 'draft',
    lineItems: [],
    documents: [],
  })

  // Load sales order if provided
  useEffect(() => {
    if (salesOrderId) {
      const fetchSalesOrder = async () => {
        try {
          const response = await fetch(`/api/sales-orders/${salesOrderId}`)
          if (response.ok) {
            const so = await response.json()
            setSalesOrder(so)
            setFormData((prev) => ({
              ...prev,
              salesOrderId: so.id,
              customerId: so.customerId,
              customerName: so.customerName,
              deliveryAddress: so.deliveryAddress || '',
              deliveryDate: so.deliveryDate,
              lineItems: so.lineItems.map((item: any) => ({
                productId: item.productId,
                productName: item.productName,
                soLineItemId: item.id,
                quantity: item.quantity,
              })),
            }))
          }
        } catch (error) {
          console.error('Error loading sales order:', error)
        }
      }
      fetchSalesOrder()
    }
  }, [salesOrderId])

  // Handle form change
  const handleFormChange = (field: keyof DeliveryOrderFormInput, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Handle line item change
  const handleLineItemChange = (index: number, field: string, value: any) => {
    const updatedItems = [...formData.lineItems]
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: field === 'quantity' || field === 'receivedQuantity' ? Number(value) : value,
    }
    setFormData((prev) => ({
      ...prev,
      lineItems: updatedItems,
    }))
  }

  // Add line item
  const handleAddLineItem = () => {
    setFormData((prev) => ({
      ...prev,
      lineItems: [
        ...prev.lineItems,
        {
          productId: '',
          productName: '',
          quantity: 0,
          receivedQuantity: 0,
        },
      ],
    }))
  }

  // Remove line item
  const handleRemoveLineItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, i) => i !== index),
    }))
  }

  // Handle document upload
  const handleDocumentsChange = (docs: DocumentUpload[]) => {
    setDocuments(docs)
    setFormData((prev) => ({
      ...prev,
      documents: docs,
    }))
  }

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.salesOrderId) {
      alert('Sales Order harus dipilih')
      return
    }

    if (formData.lineItems.length === 0) {
      alert('Minimal 1 item produk harus ditambahkan')
      return
    }

    if (!formData.deliveryDate) {
      alert('Tanggal pengiriman harus diisi')
      return
    }

    if (!formData.deliveryAddress) {
      alert('Alamat pengiriman harus diisi')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/delivery-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create delivery order')
      }

      const { id } = await response.json()
      router.push(`/sales/delivery-orders/${id}`)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error creating delivery order')
    } finally {
      setIsLoading(false)
    }
  }

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
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Buat Delivery Order</h1>
            <p className="text-gray-600 mt-1">
              {salesOrder ? `Dari SO: ${salesOrder.salesOrderNo}` : 'Buat Delivery Order baru'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sales Order Selection */}
          {!salesOrderId && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Pilih Sales Order</h3>
              <Input
                type="text"
                placeholder="Masukkan ID atau No. Sales Order..."
                disabled={isLoading}
              />
            </Card>
          )}

          {/* Delivery Info */}
          <Card className="p-6 space-y-4">
            <h3 className="text-lg font-semibold">Informasi Pengiriman</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Tanggal Pengiriman *
                </label>
                <Input
                  type="date"
                  value={formData.deliveryDate}
                  onChange={(e) =>
                    handleFormChange('deliveryDate', e.target.value)
                  }
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Penerima (Opsional)
                </label>
                <Input
                  type="text"
                  value={formData.recipient || ''}
                  onChange={(e) =>
                    handleFormChange('recipient', e.target.value)
                  }
                  placeholder="Nama penerima"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Alamat Pengiriman *
              </label>
              <textarea
                value={formData.deliveryAddress}
                onChange={(e) =>
                  handleFormChange('deliveryAddress', e.target.value)
                }
                placeholder="Alamat pengiriman lengkap"
                disabled={isLoading}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
              />
            </div>

            {formData.recipientPhone && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  No. Telepon Penerima (Opsional)
                </label>
                <Input
                  type="tel"
                  value={formData.recipientPhone}
                  onChange={(e) =>
                    handleFormChange('recipientPhone', e.target.value)
                  }
                  placeholder="0812-3456-7890"
                  disabled={isLoading}
                />
              </div>
            )}
          </Card>

          {/* Line Items */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Daftar Item</h3>
              {!salesOrderId && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddLineItem}
                  disabled={isLoading}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Tambah Item
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {formData.lineItems.map((item, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="text-sm font-medium text-gray-900">
                      Item {index + 1}: {item.productName}
                    </div>
                    {!salesOrderId && formData.lineItems.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveLineItem(index)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {!salesOrderId ? (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Nama Produk
                          </label>
                          <Input
                            type="text"
                            value={item.productName}
                            onChange={(e) =>
                              handleLineItemChange(
                                index,
                                'productName',
                                e.target.value
                              )
                            }
                            placeholder="Nama produk"
                            disabled={isLoading}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Kuantitas
                          </label>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              handleLineItemChange(
                                index,
                                'quantity',
                                e.target.value
                              )
                            }
                            min="0"
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Quantity
                        </label>
                        <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm">
                          {item.quantity}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Quantity Diterima
                        </label>
                        <Input
                          type="number"
                          value={item.receivedQuantity || 0}
                          onChange={(e) =>
                            handleLineItemChange(
                              index,
                              'receivedQuantity',
                              e.target.value
                            )
                          }
                          min="0"
                          max={item.quantity}
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Document Upload */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Dokumen Terlampir</h3>
            <DocumentUploadField
              documents={documents}
              onDocumentsChange={handleDocumentsChange}
              disabled={isLoading}
            />
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Link href="/sales/delivery-orders" className="flex-1">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={isLoading}
              >
                Batal
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
              size="lg"
            >
              {isLoading ? 'Menyimpan...' : 'Buat Delivery Order'}
            </Button>
          </div>
        </form>
      </div>
    </main>
  )
}
