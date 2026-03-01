'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MainLayout } from '@/components/common/MainLayout'
import { PageHeader } from '@/components/common/PageHeader'
import { ProductForm } from '@/components/forms/ProductForm'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { useProducts } from '@/hooks/useProducts'
import { ProductFormInput } from '@/lib/validations/product'
import { Product } from '@/types/product'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = (params?.id as string) || ''

  const { getProduct, updateProduct, getFilterOptions, isLoading } = useProducts()
  const [product, setProduct] = useState<Product | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [brands, setBrands] = useState<string[]>([])
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [loadedProduct, { categories, brands }] = await Promise.all([
          getProduct(productId),
          getFilterOptions(),
        ])
        setProduct(loadedProduct)
        setCategories(categories)
        setBrands(brands)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load product'
        setError(message)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [productId, getProduct, getFilterOptions])

  const handleSubmit = async (data: ProductFormInput) => {
    try {
      setError('')
      await updateProduct(productId, data)
      router.push('/master-data/products')
      // TODO: Show success toast notification
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update product'
      setError(message)
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

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/master-data/products">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Products
            </Button>
          </Link>
        </div>

        <PageHeader
          title="Edit Product"
          description={`Update details for ${product.name}`}
        />

        <ProductForm
          product={product}
          isLoading={isLoading}
          error={error}
          onSubmit={handleSubmit}
          categories={categories}
          brands={brands}
        />
      </div>
    </MainLayout>
  )
}
