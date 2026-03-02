'use client'

import React, { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { MainLayout } from '@/components/common/MainLayout'
import { PageHeader } from '@/components/common/PageHeader'
import { CustomerFilters } from '@/components/tables/CustomerFilters'
import { CustomerTable } from '@/components/tables/CustomerTable'
import { PaginationComponent } from '@/components/common/PaginationComponent'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { useCustomers } from '@/hooks/useCustomers'
import { CustomerFiltersInput } from '@/lib/validations/contact'
import { Customer } from '@/types/contact'
import { Plus } from 'lucide-react'

export default function CustomersPage() {
  const router = useRouter()
  const { getList, getFilterOptions, delete: deleteCustomer, loading: isLoading } = useCustomers()

  const [customers, setCustomers] = useState<Customer[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState<CustomerFiltersInput>({
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

  // Load customers with filters and pagination
  const loadCustomers = useCallback(
    async (page: number = 1, size: number = pageSize, appliedFilters: CustomerFiltersInput = filters) => {
      setPageLoading(true)
      try {
        const response = await getList(page, size, appliedFilters)
        setCustomers(response.data)
        setTotalPages(response.totalPages)
        setTotal(response.total)
        setCurrentPage(page)
      } catch (error) {
        console.error('Failed to load customers:', error)
      } finally {
        setPageLoading(false)
      }
    },
    [getList, pageSize, filters],
  )

  // Load customers on mount and when filters change
  useEffect(() => {
    loadCustomers(1, pageSize, filters)
  }, [filters, pageSize, loadCustomers])

  const handleFilterChange = (newFilters: CustomerFiltersInput) => {
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
    loadCustomers(page, pageSize, filters)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(1)
  }

  const handleSelectCustomer = (id: string) => {
    setSelectedCustomers((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    )
  }

  const handleSelectAll = (select: boolean) => {
    setSelectedCustomers(select ? customers.map((c) => c.id) : [])
  }

  const handleEdit = (customer: Customer) => {
    router.push(`/master-data/customers/${customer.id}/edit`)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus pelanggan ini?')) {
      try {
        await deleteCustomer(id)
        await loadCustomers(currentPage, pageSize, filters)
      } catch (error) {
        console.error('Failed to delete customer:', error)
      }
    }
  }

  const handleView = (customer: Customer) => {
    router.push(`/master-data/customers/${customer.id}`)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Daftar Pelanggan"
          description="Kelola data pelanggan Anda"
          actions={
            <Link href="/master-data/customers/create">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Customer
              </Button>
            </Link>
          }
        />

        {/* Filters */}
        <CustomerFilters
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
          cities={cities}
        />

        {/* Customers Table */}
        <div className="rounded-lg border border-gray-200 bg-white">
          {pageLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner label="Memuat pelanggan..." />
            </div>
          ) : (
            <CustomerTable
              customers={customers}
              isLoading={isLoading}
              selectedCustomers={selectedCustomers}
              onSelectCustomer={handleSelectCustomer}
              onSelectAll={handleSelectAll}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          )}
        </div>

        {/* No results message */}
        {!pageLoading && customers.length === 0 && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 py-8 text-center">
            <p className="text-gray-600">Tidak ada pelanggan ditemukan</p>
            <Link href="/master-data/customers/create">
              <Button variant="link" className="mt-2">
                Buat pelanggan pertama Anda
              </Button>
            </Link>
          </div>
        )}

        {/* Pagination */}
        {customers.length > 0 && (
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
        {selectedCustomers.length > 0 && (
          <div className="rounded-lg bg-blue-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">
                {selectedCustomers.length} pelanggan terpilih
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedCustomers([])}
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
