'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { SalesOrderFormInput, SOLineItem } from '@/lib/validations/sales-order'

export default function CreateSalesOrderPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [quotationId, setQuotationId] = useState('')
  const [quotations, setQuotations] = useState<any[]>([])
  const [formData, setFormData] = useState<SalesOrderFormInput>({
    customerId: '',
    customerName: '',
    poNumber: '',
    soDate: new Date().toISOString().split('T')[0],
    deliveryDate: '',
    deliveryAddress: '',
    status: 'draft',
    lineItems: [
      {
        productId: '',
        productName: '',
        quantity: 1,
        unitPrice: 0,
        discountPercent: 0,
      },
    ],
  })

  // Load quotations
  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        const response = await fetch('/api/quotations')
        if (response.ok) {
          const data = await response.json()
          setQuotations(data.data)
        }
      } catch (error) {
        console.error('Error fetching quotations:', error)
      }
    }
    fetchQuotations()
  }, [])

  // Load quotation data
  const handleLoadQuotation = async (qId: string) => {
    setQuotationId(qId)
    try {
      const response = await fetch(`/api/quotations/${qId}`)
      if (response.ok) {
        const quotation = await response.json()
        setFormData((prev) => ({
          ...prev,
          quotationId: quotation.id,
          customerId: quotation.customerId,
          customerName: quotation.customerName,
          deliveryDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          lineItems: quotation.lineItems.map((item: any) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discountPercent: item.discountPercent || 0,
            notes: item.notes,
          })),
          subtotal: quotation.subtotal,
          taxAmount: quotation.taxAmount,
          totalAmount: quotation.totalAmount,
        }))
      }
    } catch (error) {
      console.error('Error loading quotation:', error)
    }
  }

  // Handle form change
  const handleFormChange = (field: keyof SalesOrderFormInput, value: any) => {
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
      [field]: field === 'quantity' || field === 'unitPrice' || field === 'discountPercent'
        ? Number(value)
        : value,
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
          quantity: 1,
          unitPrice: 0,
          discountPercent: 0,
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

  // Calculate totals
  const subtotal = formData.lineItems.reduce((sum, item) => {
    const lineTotal = item.quantity * item.unitPrice
    const discounted = lineTotal * (1 - (item.discountPercent || 0) / 100)
    return sum + discounted
  }, 0)

  const tax = subtotal * 0.11
  const total = subtotal + tax

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.customerId) {
      alert('Pelanggan harus dipilih')
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

    setIsLoading(true)
    try {
      const response = await fetch('/api/sales-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          subtotal,
          taxAmount: tax,
          totalAmount: total,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create sales order')
      }

      const { id } = await response.json()
      router.push(`/sales/sales-orders/${id}`)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error creating sales order')
    } finally {
      setIsLoading(false)
    }
  }

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
            <h1 className="text-3xl font-bold text-gray-900">Buat Sales Order</h1>
            <p className="text-gray-600 mt-1">Buat Sales Order baru atau dari Quotation</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Quick Load from Quotation */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Muat dari Quotation (Opsional)</h3>
            <select
              value={quotationId}
              onChange={(e) => handleLoadQuotation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Pilih Quotation untuk mempercepat pengisian...</option>
              {quotations.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.quotationNo} - {q.customerName}
                </option>
              ))}
            </select>
          </Card>

          {/* Customer Info */}
          <Card className="p-6 space-y-4">
            <h3 className="text-lg font-semibold">Informasi Pelanggan</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Pelanggan *
                </label>
                <Input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) =>
                    handleFormChange('customerName', e.target.value)
                  }
                  placeholder="Nama pelanggan"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  No. PO Pelanggan (Opsional)
                </label>
                <Input
                  type="text"
                  value={formData.poNumber || ''}
                  onChange={(e) => handleFormChange('poNumber', e.target.value)}
                  placeholder="PO-2026-001"
                  disabled={isLoading}
                />
              </div>
            </div>
          </Card>

          {/* Dates */}
          <Card className="p-6 space-y-4">
            <h3 className="text-lg font-semibold">Tanggal & Pengiriman</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Tanggal SO
                </label>
                <Input
                  type="date"
                  value={formData.soDate}
                  onChange={(e) => handleFormChange('soDate', e.target.value)}
                  disabled={isLoading}
                />
              </div>
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
                  min={new Date().toISOString().split('T')[0]}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Alamat Pengiriman
              </label>
              <textarea
                value={formData.deliveryAddress || ''}
                onChange={(e) =>
                  handleFormChange('deliveryAddress', e.target.value)
                }
                placeholder="Alamat pengiriman lengkap"
                disabled={isLoading}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
              />
            </div>
          </Card>

          {/* Line Items */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Daftar Item</h3>
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
            </div>

            <div className="space-y-3">
              {formData.lineItems.map((item, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="text-sm font-medium text-gray-900">
                      Item {index + 1}
                    </div>
                    {formData.lineItems.length > 1 && (
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
                        min="0.01"
                        step="0.01"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Harga Satuan
                      </label>
                      <Input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) =>
                          handleLineItemChange(
                            index,
                            'unitPrice',
                            e.target.value
                          )
                        }
                        min="0"
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Diskon (%)
                      </label>
                      <Input
                        type="number"
                        value={item.discountPercent || 0}
                        onChange={(e) =>
                          handleLineItemChange(
                            index,
                            'discountPercent',
                            e.target.value
                          )
                        }
                        min="0"
                        max="100"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="text-right text-sm text-gray-600">
                    Subtotal:{' '}
                    <span className="font-semibold text-gray-900">
                      Rp{' '}
                      {(
                        item.quantity *
                        item.unitPrice *
                        (1 - (item.discountPercent || 0) / 100)
                      ).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Summary */}
          <Card className="p-6 bg-blue-50 border-blue-200">
            <h3 className="text-lg font-semibold mb-4">Ringkasan</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900 font-medium">
                  Rp {subtotal.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pajak (11%)</span>
                <span className="text-gray-900 font-medium">
                  Rp {tax.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="border-t border-blue-200 pt-2 flex justify-between">
                <span className="text-gray-900 font-semibold">Total</span>
                <span className="text-gray-900 font-bold text-lg">
                  Rp {total.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Link href="/sales/sales-orders" className="flex-1">
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
              {isLoading ? 'Menyimpan...' : 'Buat Sales Order'}
            </Button>
          </div>
        </form>
      </div>
    </main>
  )
}
