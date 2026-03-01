'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Loader2, Plus, Trash2, ArrowLeft, Home } from 'lucide-react'
import { QuotationFilterComponent } from '@/components/tables/QuotationFilters'
import { QuotationTable } from '@/components/tables/QuotationTable'
import { useQuotation } from '@/hooks/useQuotation'
import { Quotation, QuotationFilters } from '@/lib/validations/quotation'

export default function QuotationsPage() {
  const router = useRouter()
  const { getList, delete: deleteQuotation, isLoading } = useQuotation()

  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0, totalPages: 0 })
  const [filters, setFilters] = useState<Partial<QuotationFilters>>({})
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isFetching, setIsFetching] = useState(false)

  const fetchQuotations = useCallback(async () => {
    setIsFetching(true)
    try {
      const response = await getList({
        ...filters,
        page: pagination.page,
        pageSize: pagination.pageSize,
      })
      setQuotations(response.data)
      setPagination(response.pagination)
    } catch (error) {
      console.error('Error fetching quotations:', error)
    } finally {
      setIsFetching(false)
    }
  }, [filters, pagination.page, pagination.pageSize, getList])

  useEffect(() => {
    fetchQuotations()
  }, [fetchQuotations])

  const handleFilterChange = (newFilters: Partial<QuotationFilters>) => {
    setFilters(newFilters)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleView = (id: string) => {
    router.push(`/sales/quotations/${id}`)
  }

  const handleEdit = (id: string) => {
    router.push(`/sales/quotations/${id}/edit`)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus quotation ini?')) {
      try {
        await deleteQuotation(id)
        fetchQuotations()
      } catch (error) {
        console.error('Error deleting quotation:', error)
      }
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return
    if (
      confirm(
        `Apakah Anda yakin ingin menghapus ${selectedIds.length} quotation yang dipilih?`
      )
    ) {
      try {
        for (const id of selectedIds) {
          await deleteQuotation(id)
        }
        setSelectedIds([])
        fetchQuotations()
      } catch (error) {
        console.error('Error deleting quotations:', error)
      }
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center gap-2 mb-8">
          <Button
            asChild
            variant="default"
            size="sm"
            className="gap-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Link href="/dashboard">
              <Home className="w-4 h-4" />
            </Link>
          </Button>
          <Button
            onClick={() => router.back()}
            variant="default"
            size="sm"
            className="gap-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Daftar Quotation</h1>
            <p className="text-gray-600 mt-1">Kelola semua quotation penjualan Anda</p>
          </div>
          <Button asChild className="gap-2">
            <Link href="/sales/quotations/create">
              <Plus className="w-4 h-4" />
              Buat Quotation Baru
            </Link>
          </Button>
        </div>

      {/* Filters */}
      <QuotationFilterComponent
        onFilterChange={handleFilterChange}
        isLoading={isFetching}
      />

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-sm font-medium text-blue-900">
            {selectedIds.length} quotation dipilih
          </span>
          <Button
            onClick={handleBulkDelete}
            variant="destructive"
            size="sm"
            className="gap-2"
            disabled={isLoading}
          >
            <Trash2 className="w-4 h-4" />
            Hapus
          </Button>
        </div>
      )}

      {/* Table */}
      <QuotationTable
        quotations={quotations}
        isLoading={isFetching}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSelectionChange={setSelectedIds}
      />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Total: <span className="font-semibold">{pagination.total}</span> quotation
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))
              }
              disabled={pagination.page === 1 || isFetching}
              variant="outline"
            >
              Previous
            </Button>
            <div className="flex items-center gap-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  onClick={() => setPagination((prev) => ({ ...prev, page }))}
                  variant={pagination.page === page ? 'default' : 'outline'}
                  size="sm"
                  disabled={isFetching}
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  page: Math.min(prev.totalPages, prev.page + 1),
                }))
              }
              disabled={pagination.page === pagination.totalPages || isFetching}
              variant="outline"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
    </main>
  )
}
