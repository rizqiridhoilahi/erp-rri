'use client'

import React, { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { MainLayout } from '@/components/common/MainLayout'
import { PageHeader } from '@/components/common/PageHeader'
import { SupplierFilters } from '@/components/tables/SupplierFilters'
import { SupplierTable } from '@/components/tables/SupplierTable'
import { PaginationComponent } from '@/components/common/PaginationComponent'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { useSuppliers } from '@/hooks/useSuppliers'
import { SupplierFiltersInput } from '@/lib/validations/contact'
import { Supplier } from '@/types/contact'
import { Plus } from 'lucide-react'

export default function SuppliersPage() {
  const router = useRouter()
  const { getList, getFilterOptions, delete: deleteSupplier, loading: isLoading } = useSuppliers()

  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState<SupplierFiltersInput>({
    sortBy: 'created_at',
    sortOrder: 'desc',
  })
  const [pageLoading, setPageLoading] = useState(false)

  // Load filter options
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const { cities } = await getFilterOptions()
        setCities(cities)
      } catch (error) {
        console.error('Failed to load filter options:', error)
      }
    }
    loadFilterOptions()
  }, [getFilterOptions])

  // Load suppliers with filters and pagination
  const loadSuppliers = useCallback(
    async (page: number = 1, size: number = pageSize, appliedFilters: SupplierFiltersInput = filters) => {
      setPageLoading(true)
      try {
        const response = await getList(page, size, appliedFilters)
        setSuppliers(response.data)
        setTotalPages(response.totalPages)
        setTotal(response.total)
        setCurrentPage(page)
      } catch (error) {
        console.error('Failed to load suppliers:', error)
      } finally {
        setPageLoading(false)
      }
    },
    [getList, pageSize, filters],
  )

  // Load suppliers on mount and when filters change
  useEffect(() => {
    loadSuppliers(1, pageSize, filters)
  }, [filters, pageSize, loadSuppliers])

  const handleFilterChange = (newFilters: SupplierFiltersInput) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  const handleResetFilters = () => {
    setFilters({
      sortBy: 'created_at',
      sortOrder: 'desc',
    })
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    loadSuppliers(page, pageSize, filters)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(1)
  }

  const handleSelectSupplier = (id: string) => {
    setSelectedSuppliers((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    )
  }

  const handleSelectAll = (select: boolean) => {
    setSelectedSuppliers(select ? suppliers.map((s) => s.id) : [])
  }

  const handleEdit = (supplier: Supplier) => {
    router.push(`/master-data/suppliers/${supplier.id}/edit`)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus supplier ini?')) {
      try {
        await deleteSupplier(id)
        await loadSuppliers(currentPage, pageSize, filters)
      } catch (error) {
        console.error('Failed to delete supplier:', error)
      }
    }
  }

  const handleView = (supplier: Supplier) => {
    router.push(`/master-data/suppliers/${supplier.id}`)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Daftar Supplier"
          description="Kelola data supplier Anda"
          actions={
            <Link href="/master-data/suppliers/create">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Supplier
              </Button>
            </Link>
          }
        />

        {/* Filters */}
        <SupplierFilters
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
          cities={cities}
        />

        {/* Suppliers Table */}
        <div className="rounded-lg border border-gray-200 bg-white">
          {pageLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner label="Memuat supplier..." />
            </div>
          ) : (
            <SupplierTable
              suppliers={suppliers}
              isLoading={isLoading}
              selectedSuppliers={selectedSuppliers}
              onSelectSupplier={handleSelectSupplier}
              onSelectAll={handleSelectAll}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          )}
        </div>

        {/* No results message */}
        {!pageLoading && suppliers.length === 0 && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 py-8 text-center">
            <p className="text-gray-600">Tidak ada supplier ditemukan</p>
            <Link href="/master-data/suppliers/create">
              <Button variant="link" className="mt-2">
                Buat supplier pertama Anda
              </Button>
            </Link>
          </div>
        )}

        {/* Pagination */}
        {suppliers.length > 0 && (
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
        {selectedSuppliers.length > 0 && (
          <div className="rounded-lg bg-blue-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">
                {selectedSuppliers.length} supplier terpilih
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedSuppliers([])}
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
