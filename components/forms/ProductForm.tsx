'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ImageUploadField } from './ImageUploadField'
import { ProductFormInput, productSchema } from '@/lib/validations/product'
import { Product } from '@/types/product'
import { AlertCircle } from 'lucide-react'

interface ProductFormProps {
  product?: Product
  isLoading?: boolean
  error?: string
  onSubmit: (data: ProductFormInput) => Promise<void>
  categories: string[]
  brands: string[]
}

export function ProductForm({
  product,
  isLoading = false,
  error: formError,
  onSubmit,
  categories,
  brands,
}: ProductFormProps) {
  const [submitError, setSubmitError] = React.useState<string>(formError || '')
  const [imageError, setImageError] = React.useState<string>('')

  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          code: product.code,
          name: product.name,
          description: product.description,
          category: product.category,
          brand: product.brand,
          price: product.price,
          cost: product.cost,
          stock: product.stock,
          unit: product.unit,
          sku: product.sku,
          barcode: product.barcode,
          image: product.image,
          status: product.status,
        }
      : {
          code: '',
          name: '',
          description: '',
          category: '',
          brand: '',
          price: 0,
          cost: 0,
          stock: 0,
          unit: 'pcs',
          sku: '',
          barcode: '',
          image: '',
          status: 'active',
        },
  })

  const handleFormSubmit = async (data: ProductFormInput) => {
    setSubmitError('')
    try {
      await onSubmit(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save product'
      setSubmitError(message)
    }
  }

  const profit = form.watch('price') - form.watch('cost')
  const profitMargin = form.watch('price') > 0 ? (profit / form.watch('price')) * 100 : 0

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="space-y-6">
      {submitError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Image Upload */}
        <Card className="p-6">
          <h3 className="mb-4 font-semibold text-gray-900">Product Image</h3>
          <ImageUploadField
            value={form.watch('image')}
            onChange={(val) => form.setValue('image', val)}
            onError={setImageError}
            disabled={isLoading}
          />
          {imageError && <div className="mt-2 text-sm text-red-600">{imageError}</div>}
        </Card>

        {/* Basic Information */}
        <Card className="p-6">
          <h3 className="mb-4 font-semibold text-gray-900">Basic Information</h3>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Product Code *</label>
                <Input
                  placeholder="PRD-001"
                  {...form.register('code')}
                  disabled={isLoading}
                />
                {form.formState.errors.code && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.code.message}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">SKU *</label>
                <Input
                  placeholder="SKU-001"
                  {...form.register('sku')}
                  disabled={isLoading}
                />
                {form.formState.errors.sku && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.sku.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Product Name *</label>
              <Input
                placeholder="e.g., Samsung Galaxy S21"
                {...form.register('name')}
                disabled={isLoading}
              />
              {form.formState.errors.name && (
                <p className="mt-1 text-sm text-red-600">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Description</label>
              <Textarea
                placeholder="Product description..."
                rows={3}
                {...form.register('description')}
                disabled={isLoading}
              />
              {form.formState.errors.description && (
                <p className="mt-1 text-sm text-red-600">{form.formState.errors.description.message}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Category *</label>
                <Select
                  value={form.watch('category')}
                  onValueChange={(val) => form.setValue('category', val)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.category && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.category.message}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Brand *</label>
                <Select
                  value={form.watch('brand')}
                  onValueChange={(val) => form.setValue('brand', val)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand} value={brand}>
                        {brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.brand && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.brand.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Barcode</label>
                <Input
                  placeholder="Optional barcode"
                  {...form.register('barcode')}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Unit *</label>
                <Select
                  value={form.watch('unit')}
                  onValueChange={(val) => form.setValue('unit', val)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pcs">Piece (pcs)</SelectItem>
                    <SelectItem value="box">Box</SelectItem>
                    <SelectItem value="carton">Carton</SelectItem>
                    <SelectItem value="kg">Kilogram (kg)</SelectItem>
                    <SelectItem value="liter">Liter</SelectItem>
                    <SelectItem value="meter">Meter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* Pricing & Stock */}
        <Card className="p-6">
          <h3 className="mb-4 font-semibold text-gray-900">Pricing & Stock</h3>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Cost Price (Rp) *</label>
                <Input
                  type="number"
                  placeholder="0"
                  {...form.register('cost', { valueAsNumber: true })}
                  disabled={isLoading}
                />
                {form.formState.errors.cost && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.cost.message}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Selling Price (Rp) *</label>
                <Input
                  type="number"
                  placeholder="0"
                  {...form.register('price', { valueAsNumber: true })}
                  disabled={isLoading}
                />
                {form.formState.errors.price && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.price.message}</p>
                )}
              </div>
            </div>

            {/* Profit Summary */}
            {(form.watch('price') || form.watch('cost')) > 0 && (
              <div className="rounded-lg bg-blue-50 p-3">
                <div className="grid gap-4 text-sm md:grid-cols-3">
                  <div>
                    <div className="text-gray-600">Profit per Unit</div>
                    <div className="font-semibold text-blue-600">{formatPrice(profit)}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Profit Margin</div>
                    <div className="font-semibold text-blue-600">{profitMargin.toFixed(2)}%</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Selling Price</div>
                    <div className="font-semibold text-blue-600">{formatPrice(form.watch('price'))}</div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Stock Quantity *</label>
              <Input
                type="number"
                placeholder="0"
                {...form.register('stock', { valueAsNumber: true })}
                disabled={isLoading}
              />
              {form.formState.errors.stock && (
                <p className="mt-1 text-sm text-red-600">{form.formState.errors.stock.message}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Status */}
        <Card className="p-6">
          <h3 className="mb-4 font-semibold text-gray-900">Status</h3>
          <Select
            value={form.watch('status')}
            onValueChange={(val) => form.setValue('status', val as any)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="discontinued">Discontinued</SelectItem>
            </SelectContent>
          </Select>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading && <LoadingSpinner />}
            {product ? 'Update Product' : 'Create Product'}
          </Button>
          <Button type="button" variant="outline" disabled={isLoading}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
