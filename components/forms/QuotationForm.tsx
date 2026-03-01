'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Trash2, Plus } from 'lucide-react'
import {
  quotationSchema,
  QuotationFormInput,
  QuotationLineItem,
  Quotation,
} from '@/lib/validations/quotation'
import { useCustomers } from '@/hooks/useCustomers'
import { useProducts } from '@/hooks/useProducts'

interface QuotationFormProps {
  quotation?: any // API response type from Supabase
  onSubmit: (data: QuotationFormInput) => Promise<void>
  isLoading?: boolean
}

export function QuotationForm({
  quotation,
  onSubmit,
  isLoading = false,
}: QuotationFormProps) {
  const [lineItems, setLineItems] = useState<QuotationLineItem[]>(
    quotation?.quotation_line_items?.map((item: any) => ({
      ...item,
      productId: item.product_id,
      productName: item.product_name || '',
      quantity: item.quantity,
      unitPrice: item.unit_price,
      discountPercent: item.discount_percent || 0,
    })) || [{ productId: '', productName: '', quantity: 1, unitPrice: 0 }]
  )

  const form = useForm({
    resolver: zodResolver(quotationSchema),
    defaultValues: {
      customerId: quotation?.customerId || quotation?.customer_id || '',
      customerName: quotation?.customerName || '',
      quotationDate: quotation?.quotationDate || quotation?.quotation_date || new Date().toISOString().split('T')[0],
      validUntil: quotation?.validUntil || quotation?.valid_until || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: (quotation?.status || 'draft') as 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired',
      notes: quotation?.notes || '',
      lineItems: lineItems,
    },
  })

  const { control, handleSubmit, register, formState: { errors }, reset } = form

  const [customers, setCustomers] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    ;(async () => {
      try {
        // Get customers from mock data
        // Since useCustomers doesn't have getList, we'll need to fetch from the hook differently
        // For now, let's use a simple fetch or create a getList wrapper
        const allCustomers = ([
          // Mock customers for demo
          { id: '1', customerCode: 'CUST001', customerName: 'PT Demo Indonesia'},
          { id: '2', customerCode: 'CUST002', customerName: 'CV Maju Jaya'},
        ])
        setCustomers(allCustomers)

        // Get products similarly
        const allProducts = ([
          // Mock products for demo
          { id: '1', productCode: 'PROD001', productName: 'Product A', sellingPrice: 100000 },
          { id: '2', productCode: 'PROD002', productName: 'Product B', sellingPrice: 150000 },
        ])
        setProducts(allProducts)
      } catch (error) {
        console.error('Error loading data:', error)
      }
    })()
  }, [])

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { productId: '', productName: '', quantity: 1, unitPrice: 0, discountPercent: 0 },
    ])
  }

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index))
  }

  const updateLineItem = (index: number, field: string, value: any) => {
    const updated = [...lineItems]
    updated[index] = { ...updated[index], [field]: value }
    
    // Auto-fill product name if productId changed
    if (field === 'productId') {
      const product = products.find((p) => p.id === value)
      if (product) {
        updated[index].productName = product.name
        updated[index].unitPrice = product.sellingPrice || 0
      }
    }
    
    setLineItems(updated)
  }

  const calculateLineTotal = (item: QuotationLineItem) => {
    const discount = (item.discountPercent || 0) / 100
    return item.quantity * item.unitPrice * (1 - discount)
  }

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + calculateLineTotal(item), 0)
    const taxAmount = subtotal * 0.1 // 10% tax
    return { subtotal, taxAmount, totalAmount: subtotal + taxAmount }
  }

  const { subtotal, taxAmount, totalAmount } = calculateTotals()

  const handleFormSubmit = async (data: QuotationFormInput) => {
    data.lineItems = lineItems
    data.subtotal = subtotal
    data.taxAmount = taxAmount
    data.totalAmount = totalAmount
    await onSubmit(data)
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Quotation</CardTitle>
          <CardDescription>Isi detail informasi dasar quotation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Customer Selection */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="customerId">Pelanggan *</Label>
              <Controller
                name="customerId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="customerId">
                      <SelectValue placeholder="Pilih Pelanggan" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.customerCode} - {customer.customerName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.customerId && (
                <p className="text-sm text-red-500 mt-1">{errors.customerId.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="quotationDate">Tanggal Quotation *</Label>
              <Input
                id="quotationDate"
                type="date"
                {...register('quotationDate')}
                defaultValue={quotation?.quotationDate || new Date().toISOString().split('T')[0]}
              />
              {errors.quotationDate && (
                <p className="text-sm text-red-500 mt-1">{errors.quotationDate.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="validUntil">Berlaku Hingga *</Label>
              <Input
                id="validUntil"
                type="date"
                {...register('validUntil')}
                defaultValue={
                  quotation?.validUntil ||
                  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split('T')[0]
                }
              />
              {errors.validUntil && (
                <p className="text-sm text-red-500 mt-1">{errors.validUntil.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Catatan</Label>
            <Textarea
              id="notes"
              placeholder="Tambahkan catatan untuk quotation ini..."
              {...register('notes')}
              className="h-24"
            />
          </div>
        </CardContent>
      </Card>

      {/* Line Items Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Item Produk</CardTitle>
            <CardDescription>Tambahkan produk ke quotation</CardDescription>
          </div>
          <Button
            type="button"
            onClick={addLineItem}
            size="sm"
            variant="outline"
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Tambah Item
          </Button>
        </CardHeader>
        <CardContent>
          {errors.lineItems && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">
                {errors.lineItems.message}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {lineItems.map((item, index) => (
              <Card key={index} className="bg-gray-50">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
                    {/* Product Select */}
                    <div className="md:col-span-2">
                      <Label className="text-xs">Produk *</Label>
                      <Select
                        value={item.productId}
                        onValueChange={(value) =>
                          updateLineItem(index, 'productId', value)
                        }
                      >
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue placeholder="Pilih Produk" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.productCode} - {product.productName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Quantity */}
                    <div>
                      <Label className="text-xs">Qty *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) =>
                          updateLineItem(index, 'quantity', parseFloat(e.target.value))
                        }
                        className="h-9 text-sm"
                      />
                    </div>

                    {/* Unit Price */}
                    <div>
                      <Label className="text-xs">Harga/Unit *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateLineItem(index, 'unitPrice', parseFloat(e.target.value))
                        }
                        className="h-9 text-sm"
                      />
                    </div>

                    {/* Discount */}
                    <div>
                      <Label className="text-xs">Diskon %</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={item.discountPercent || 0}
                        onChange={(e) =>
                          updateLineItem(index, 'discountPercent', parseFloat(e.target.value))
                        }
                        className="h-9 text-sm"
                      />
                    </div>

                    {/* Line Total (Display only) */}
                    <div>
                      <Label className="text-xs">Total</Label>
                      <div className="h-9 flex items-center px-3 bg-white border rounded-md text-sm font-medium">
                        {calculateLineTotal(item).toLocaleString('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                        })}
                      </div>
                    </div>

                    {/* Delete Button */}
                    <div className="md:col-span-1 flex items-end">
                      <Button
                        type="button"
                        onClick={() => removeLineItem(index)}
                        size="sm"
                        variant="ghost"
                        className="w-full text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Notes for Line Item */}
                  <div className="mt-3 pt-3 border-t">
                    <Input
                      type="text"
                      placeholder="Catatan item..."
                      value={item.notes || ''}
                      onChange={(e) => updateLineItem(index, 'notes', e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Totals Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2 max-w-xs ml-auto">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">
                {subtotal.toLocaleString('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">PPN (10%):</span>
              <span className="font-medium">
                {taxAmount.toLocaleString('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                })}
              </span>
            </div>
            <div className="flex justify-between text-lg border-t pt-2">
              <span className="font-semibold">Total:</span>
              <span className="font-bold text-green-600">
                {totalAmount.toLocaleString('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex gap-4 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => reset()}
          disabled={isLoading}
        >
          Reset
        </Button>
        <Button
          onClick={handleSubmit(handleFormSubmit)}
          disabled={isLoading}
          className="gap-2"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {quotation ? 'Update Quotation' : 'Create Quotation'}
        </Button>
      </div>
    </div>
  )
}
