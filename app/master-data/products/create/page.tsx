'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/common/MainLayout'
import { PageHeader } from '@/components/common/PageHeader'
import { ProductForm } from '@/components/forms/ProductForm'
import { useProducts } from '@/hooks/useProducts'
import { ProductFormInput } from '@/lib/validations/product'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function CreateProductPage() {
  const router = useRouter()
  const { createProduct, getFilterOptions, isLoading } = useProducts()
  const [categories, setCategories] = useState<string[]>([])
  const [brands, setBrands] = useState<string[]>([])
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const { categories, brands } = await getFilterOptions()
        setCategories(categories)
        setBrands(brands)
      } catch (err) {
        console.error('Failed to load options:', err)
      }
    }
    loadOptions()
  }, [getFilterOptions])

  const handleSubmit = async (data: ProductFormInput) => {
    try {
      setError('')
      await createProduct(data)
      router.push('/master-data/products')
      // TODO: Show success toast notification
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create product'
      setError(message)
    }
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
          title="Create Product"
          description="Add a new product to your inventory"
        />

        <ProductForm
          isLoading={isLoading}
          error={error}
          onSubmit={handleSubmit}
          categories={categories.length > 0 ? categories : ['Electronics', 'Audio', 'Accessories']}
          brands={brands.length > 0 ? brands : ['Samsung', 'Apple', 'Sony']}
        />
      </div>
    </MainLayout>
  )
}
