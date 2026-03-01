'use client'

import React, { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { MainLayout } from '@/components/common/MainLayout'
import { PageHeader } from '@/components/common/PageHeader'
import { ProductFilters } from '@/components/tables/ProductFilters'
import { ProductTable } from '@/components/tables/ProductTable'
import { PaginationComponent } from '@/components/common/PaginationComponent'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { useProducts } from '@/hooks/useProducts'
import { ProductFiltersInput } from '@/lib/validations/product'
import { Product, ProductListResponse } from '@/types/product'
import { Plus, Loader } from 'lucide-react'

export default function ProductsPage() {
  const router = useRouter()
  const { getProducts, getFilterOptions, deleteProduct, isLoading } = useProducts()

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [brands, setBrands] = useState<string[]>([])
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState<ProductFiltersInput>({
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })
  const [pageLoading, setPageLoading] = useState(false)

  // Load filter options
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const { categories, brands } = await getFilterOptions()
        setCategories(categories)
        setBrands(brands)
      } catch (error) {
        console.error('Failed to load filter options:', error)
      }
    }
    loadFilterOptions()
  }, [getFilterOptions])

  // Load products with filters and pagination
  const loadProducts = useCallback(
    async (page: number = 1, size: number = pageSize, appliedFilters: ProductFiltersInput = filters) => {
      setPageLoading(true)
      try {
        const response: ProductListResponse = await getProducts(page, size, appliedFilters)
        setProducts(response.data)
        setTotalPages(response.totalPages)
        setTotal(response.total)
        setCurrentPage(page)
      } catch (error) {
        console.error('Failed to load products:', error)
      } finally {
        setPageLoading(false)
      }
    },
    [getProducts, pageSize, filters],
  )

  // Load products on mount and when filters change
  useEffect(() => {
    loadProducts(1, pageSize, filters)
  }, [filters, pageSize, loadProducts])

  const handleFilterChange = (newFilters: ProductFiltersInput) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  const handleResetFilters = () => {
    setFilters({
      sortBy: 'createdAt',
      sortOrder: 'desc',
    })
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    loadProducts(page, pageSize, filters)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(1)
  }

  const handleSelectProduct = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    )
  }

  const handleSelectAll = (select: boolean) => {
    setSelectedProducts(select ? products.map((p) => p.id) : [])
  }

  const handleEdit = (product: Product) => {
    router.push(`/master-data/products/${product.id}/edit`)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id)
        await loadProducts(currentPage, pageSize, filters)
      } catch (error) {
        console.error('Failed to delete product:', error)
      }
    }
  }

  const handleView = (product: Product) => {
    router.push(`/master-data/products/${product.id}`)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Products"
          description="Manage your product inventory"
          actions={
            <Link href="/master-data/products/create">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </Link>
          }
        />

        {/* Filters */}
        <ProductFilters
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
          categories={categories}
          brands={brands}
        />

        {/* Products Table */}
        <div className="rounded-lg border border-gray-200 bg-white">
          {pageLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner label="Loading products..." />
            </div>
          ) : (
            <ProductTable
              products={products}
              isLoading={isLoading}
              selectedProducts={selectedProducts}
              onSelectProduct={handleSelectProduct}
              onSelectAll={handleSelectAll}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          )}
        </div>

        {/* No results message */}
        {!pageLoading && products.length === 0 && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 py-8 text-center">
            <p className="text-gray-600">No products found</p>
            <Link href="/master-data/products/create">
              <Button variant="link" className="mt-2">
                Create your first product
              </Button>
            </Link>
          </div>
        )}

        {/* Pagination */}
        {products.length > 0 && (
          <PaginationComponent
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            total={total}
          />
        )}

        {/* Bulk Actions Info */}
        {selectedProducts.length > 0 && (
          <div className="rounded-lg bg-blue-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">
                {selectedProducts.length} product(s) selected
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedProducts([])}
                >
                  Clear Selection
                </Button>
                <Button size="sm" variant="destructive">
                  Delete Selected
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
