'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MainLayout } from '@/components/common/MainLayout'
import { PageHeader } from '@/components/common/PageHeader'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useProducts } from '@/hooks/useProducts'
import { Product } from '@/types/product'
import { ArrowLeft, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function ProductDetailPage() {
  const router = useRouter()
  const params = useParams()
  const productId = (params?.id as string) || ''

  const { getProduct, deleteProduct } = useProducts()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true)
        const data = await getProduct(productId)
        setProduct(data)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load product'
        setError(message)
      } finally {
        setLoading(false)
      }
    }
    loadProduct()
  }, [productId, getProduct])

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        await deleteProduct(productId)
        router.push('/master-data/products')
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete product'
        setError(message)
      }
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner label="Loading product..." />
        </div>
      </MainLayout>
    )
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <PageHeader title="Product Not Found" />
          <div className="text-center">
            <p className="text-gray-600">The product you're looking for doesn't exist.</p>
            <Link href="/master-data/products">
              <Button variant="link" className="mt-4">
                Back to Products
              </Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const profit = product.price - product.cost
  const profitMargin = ((profit / product.price) * 100).toFixed(2)

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      inactive: 'secondary',
      discontinued: 'destructive',
    }
    const labels: Record<string, string> = {
      active: 'Active',
      inactive: 'Inactive',
      discontinued: 'Discontinued',
    }
    return (
      <Badge variant={variants[status] || 'outline'}>
        {labels[status] || status}
      </Badge>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/master-data/products">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Products
              </Button>
            </Link>
          </div>
          <div className="flex gap-2">
            <Link href={`/master-data/products/${productId}/edit`}>
              <Button className="gap-2">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            </Link>
            <Button variant="destructive" onClick={handleDelete} className="gap-2">
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <PageHeader title={product.name} description={product.code} />

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Product Image & Basic Info */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              {product.image && (
                <div className="mb-4 aspect-square overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <div className="text-xs font-medium uppercase text-gray-500">Status</div>
                  <div className="mt-1">{getStatusBadge(product.status)}</div>
                </div>

                <div>
                  <div className="text-xs font-medium uppercase text-gray-500">Category</div>
                  <div className="mt-1 text-sm font-medium text-gray-900">{product.category}</div>
                </div>

                <div>
                  <div className="text-xs font-medium uppercase text-gray-500">Brand</div>
                  <div className="mt-1 text-sm font-medium text-gray-900">{product.brand}</div>
                </div>

                <div>
                  <div className="text-xs font-medium uppercase text-gray-500">Unit</div>
                  <div className="mt-1 text-sm font-medium text-gray-900">{product.unit}</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Details */}
          <div className="space-y-6 lg:col-span-2">
            {/* Identification */}
            <Card className="p-6">
              <h3 className="mb-4 font-semibold text-gray-900">Identification</h3>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="text-xs font-medium uppercase text-gray-500">Product Code</div>
                    <div className="mt-1 font-mono text-sm font-medium text-gray-900">{product.code}</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium uppercase text-gray-500">SKU</div>
                    <div className="mt-1 font-mono text-sm font-medium text-gray-900">{product.sku}</div>
                  </div>
                </div>
                {product.barcode && (
                  <div>
                    <div className="text-xs font-medium uppercase text-gray-500">Barcode</div>
                    <div className="mt-1 font-mono text-sm text-gray-900">{product.barcode}</div>
                  </div>
                )}
              </div>
            </Card>

            {/* Pricing */}
            <Card className="p-6">
              <h3 className="mb-4 font-semibold text-gray-900">Pricing</h3>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="text-xs font-medium uppercase text-gray-500">Cost Price</div>
                    <div className="mt-1 text-lg font-semibold text-gray-900">
                      {formatPrice(product.cost)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium uppercase text-gray-500">Selling Price</div>
                    <div className="mt-1 text-lg font-semibold text-blue-600">
                      {formatPrice(product.price)}
                    </div>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 border-t border-gray-200 pt-4">
                  <div>
                    <div className="text-xs font-medium uppercase text-gray-500">Profit per Unit</div>
                    <div className="mt-1 text-lg font-semibold text-green-600">
                      {formatPrice(profit)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium uppercase text-gray-500">Profit Margin</div>
                    <div className="mt-1 text-lg font-semibold text-green-600">
                      {profitMargin}%
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Stock */}
            <Card className="p-6">
              <h3 className="mb-4 font-semibold text-gray-900">Stock</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-medium uppercase text-gray-500">Current Stock</div>
                  <div className={`mt-1 text-3xl font-bold ${product.stock < 10 ? 'text-red-600' : 'text-gray-900'}`}>
                    {product.stock} {product.unit}
                  </div>
                  {product.stock < 10 && (
                    <div className="mt-2 text-sm text-red-600">⚠️ Low stock alert</div>
                  )}
                </div>
              </div>
            </Card>

            {/* Description */}
            {product.description && (
              <Card className="p-6">
                <h3 className="mb-4 font-semibold text-gray-900">Description</h3>
                <p className="text-sm text-gray-700">{product.description}</p>
              </Card>
            )}

            {/* Metadata */}
            <Card className="p-6">
              <h3 className="mb-4 font-semibold text-gray-900">Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Created:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(product.createdAt).toLocaleDateString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Last Updated:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(product.updatedAt).toLocaleDateString('id-ID')}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
