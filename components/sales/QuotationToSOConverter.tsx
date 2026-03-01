'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, AlertCircle, CheckCircle } from 'lucide-react'
import { Quotation, QuotationLineItemResponse } from '@/lib/validations/quotation'
import { SalesOrderFormInput } from '@/lib/validations/sales-order'
import { WorkflowStatusBadge } from './WorkflowStatusBadge'
import { Tooltip } from '@/components/ui/tooltip'

interface QuotationToSOConverterProps {
  quotation: Quotation & { lineItems: QuotationLineItemResponse[] }
  onConvert?: (salesOrderData: SalesOrderFormInput) => Promise<void>
  isLoading?: boolean
  disabled?: boolean
  className?: string
}

export function QuotationToSOConverter({
  quotation,
  onConvert,
  isLoading = false,
  disabled = false,
  className,
}: QuotationToSOConverterProps) {
  const [showConverter, setShowConverter] = useState(false)
  const [poNumber, setPoNumber] = useState('')
  const [soDate, setSoDate] = useState(new Date().toISOString().split('T')[0])
  const [deliveryDate, setDeliveryDate] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [convertError, setConvertError] = useState<string>('')
  const [convertSuccess, setConvertSuccess] = useState(false)

  // Handle conversion
  const handleConvert = async () => {
    setConvertError('')

    // Validation
    if (!deliveryDate) {
      setConvertError('Tanggal pengiriman harus diisi. Harap isi tanggal pengiriman sebelum melanjutkan.')
      return
    }

    if (!deliveryAddress) {
      setConvertError('Alamat pengiriman harus diisi. Harap isi alamat pengiriman sebelum melanjutkan.')
      return
    }

    if (onConvert) {
      try {
        const salesOrderData: SalesOrderFormInput = {
          quotationId: quotation.id,
          customerId: quotation.customerId,
          customerName: quotation.customerName,
          poNumber,
          soDate,
          deliveryDate,
          deliveryAddress,
          status: 'draft',
          lineItems: quotation.lineItems.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discountPercent: item.discountPercent,
            notes: item.notes,
          })),
          notes: quotation.notes,
          subtotal: quotation.subtotal,
          taxAmount: quotation.taxAmount,
          totalAmount: quotation.totalAmount,
        }

        await onConvert(salesOrderData)
        setConvertSuccess(true)
        toast.success('Quotation berhasil dikonversi ke Sales Order!')
        setShowConverter(false)

        // Reset form after 2 seconds
        setTimeout(() => {
          setConvertSuccess(false)
        }, 2000)
      } catch (error) {
        setConvertError(
          error instanceof Error ? error.message : 'Gagal mengkonversi ke Sales Order'
        )
      }
    }
  }

  // Check if quotation can be converted
  const canConvert = quotation.status === 'accepted'

  if (!showConverter) {
    return (
      <div className={className}>
        {convertSuccess && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle size={18} className="text-green-600" />
            <span className="text-green-800">
              Quotation berhasil dikonversi ke Sales Order
            </span>
          </div>
        )}

        <Button
          onClick={() => setShowConverter(true)}
          disabled={disabled || !canConvert}
          size="lg"
          className="w-full"
        >
          <Tooltip content="Convert this quotation to a Sales Order">
            <ArrowRight className="w-4 h-4 mr-2" />
          </Tooltip>
          Konversi ke Sales Order
        </Button>

        {!canConvert && (
          <div className="flex items-center gap-2 mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle size={18} className="text-yellow-600" />
            <span className="text-sm text-yellow-800">
              Quotation harus diterima (Accepted) untuk dapat dikonversi
            </span>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className={className}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Konversi ke Sales Order</h3>
          <p className="text-sm text-gray-600 mt-1">
            Buat Sales Order baru dari Quotation #{quotation.quotationNo}
          </p>
        </div>

        {/* Quotation Summary */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600">Quotation Number</p>
              <p className="font-semibold text-gray-900">{quotation.quotationNo}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Status</p>
              <div className="mt-1">
                <WorkflowStatusBadge
                  status={quotation.status}
                  variant="quotation"
                  size="sm"
                />
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-600">Pelanggan</p>
              <p className="font-semibold text-gray-900">{quotation.customerName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Total</p>
              <p className="font-semibold text-gray-900">
                Rp {quotation.totalAmount.toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        </div>

        {/* Conversion Form */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                No. PO Pelanggan (Opsional)
              </label>
              <Input
                type="text"
                placeholder="PO-2026-001"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Tanggal SO
              </label>
              <Input
                type="date"
                value={soDate}
                onChange={(e) => setSoDate(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Tanggal Pengiriman *
            </label>
            <Input
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              disabled={isLoading}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Alamat Pengiriman *
            </label>
            <textarea
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              disabled={isLoading}
              placeholder="Masukkan alamat pengiriman lengkap"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              rows={3}
            />
          </div>
        </div>

        {/* Line Items Summary */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">Daftar Item</h4>
          <div className="space-y-2">
            {quotation.lineItems.map((item, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-3 bg-gray-50"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{item.productName}</p>
                    <p className="text-xs text-gray-600">
                      {item.quantity} × Rp {item.unitPrice.toLocaleString('id-ID')}
                      {item.discountPercent > 0 && (
                        <span className="ml-2">
                          - {item.discountPercent}%
                        </span>
                      )}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900">
                    Rp {item.lineTotal?.toLocaleString('id-ID') || '0'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {convertError && (
          <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle size={18} className="text-red-600 mt-0.5" />
            <p className="text-sm text-red-800">{convertError}</p>
          </div>
        )}

        {/* Summary */}
        <div className="bg-blue-50 rounded-lg p-4 space-y-2">
          <p className="text-sm text-gray-600">Ringkasan Konversi</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900">
                Rp {quotation.subtotal.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pajak (11%)</span>
              <span className="text-gray-900">
                Rp {quotation.taxAmount.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="border-t border-blue-200 pt-1 flex justify-between font-semibold">
              <span className="text-gray-900">Total</span>
              <span className="text-gray-900">
                Rp {quotation.totalAmount.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setShowConverter(false)
              setConvertError('')
            }}
            disabled={isLoading}
            className="flex-1"
          >
            Batal
          </Button>
          <Button
            onClick={handleConvert}
            disabled={isLoading || !deliveryDate || !deliveryAddress}
            className="flex-1"
          >
            {isLoading ? 'Memproses...' : 'Konversi ke Sales Order'}
          </Button>
        </div>
      </div>
    </Card>
  )
}
