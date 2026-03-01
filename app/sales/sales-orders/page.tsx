'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, Eye } from 'lucide-react'
import { WorkflowStatusBadge } from '@/components/sales/WorkflowStatusBadge'
import { SalesOrder, SalesOrderFilters } from '@/lib/validations/sales-order'

export default function SalesOrdersPage() {
  const router = useRouter()

  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  })
  const [filters, setFilters] = useState<Partial<SalesOrderFilters>>({})
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isFetching, setIsFetching] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch sales orders
  const fetchSalesOrders = useCallback(async () => {
    setIsFetching(true)
    try {
      const query = new URLSearchParams({
        ...Object.entries(filters).reduce(
          (acc, [key, value]) => {
            if (value !== undefined && value !== '') {
              acc[key] = String(value)
            }
            return acc
          },
          {} as Record<string, string>
        ),
        page: String(pagination.page),
        pageSize: String(pagination.pageSize),
      })

      const response = await fetch(`/api/sales-orders?${query}`)
      if (!response.ok) throw new Error('Failed to fetch sales orders')

      const data = await response.json()
      setSalesOrders(data.data)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching sales orders:', error)
    } finally {
      setIsFetching(false)
    }
  }, [filters, pagination.page, pagination.pageSize])

  useEffect(() => {
    fetchSalesOrders()
  }, [fetchSalesOrders])

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus Sales Order ini?')) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/sales-orders/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete')
      setSalesOrders((prev) => prev.filter((so) => so.id !== id))
    } catch (error) {
      console.error('Error deleting sales order:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterChange = (newFilters: Partial<SalesOrderFilters>) => {
    setFilters(newFilters)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleView = (id: string) => {
    router.push(`/sales/sales-orders/${id}`)
  }

  const handleCreate = () => {
    router.push('/sales/sales-orders/create')
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sales Orders</h1>
            <p className="text-gray-600 mt-1">Kelola pesanan penjualan Anda</p>
          </div>
          <Button onClick={handleCreate} size="lg">
            <Plus className="w-4 h-4 mr-2" />
            Buat Sales Order
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Cari No. SO..."
              onChange={(e) =>
                handleFilterChange({
                  ...filters,
                  search: e.target.value || undefined,
                })
              }
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <select
              value={filters.status || ''}
              onChange={(e) =>
                handleFilterChange({
                  ...filters,
                  status: (e.target.value as any) || undefined,
                })
              }
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Semua Status</option>
              <option value="draft">Draft</option>
              <option value="confirmed">Dikonfirmasi</option>
              <option value="in-production">Produksi</option>
              <option value="ready">Siap</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
            <input
              type="date"
              onChange={(e) =>
                handleFilterChange({
                  ...filters,
                  dateFrom: e.target.value || undefined,
                })
              }
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <Button variant="outline" onClick={refreshTable}>
              Refresh
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isFetching ? (
            <div className="p-8 text-center text-gray-500">Memuat...</div>
          ) : salesOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Tidak ada Sales Order ditemukan
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">
                        No. SO
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">
                        Pelanggan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">
                        Tanggal SO
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">
                        Tanggal Kirim
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-900">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-900">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {salesOrders.map((so) => (
                      <tr key={so.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {so.salesOrderNo}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {so.customerName}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600">
                            {new Date(so.soDate).toLocaleDateString('id-ID')}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600">
                            {new Date(so.deliveryDate).toLocaleDateString('id-ID')}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="text-sm font-semibold text-gray-900">
                            Rp {so.totalAmount.toLocaleString('id-ID')}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <WorkflowStatusBadge
                            status={so.status}
                            variant="sales-order"
                            size="sm"
                          />
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => handleView(so.id)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(so.id)}
                            disabled={isLoading}
                            className="text-red-600 hover:text-red-800 disabled:opacity-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="text-sm text-gray-600">
                  Total {pagination.total} Sales Order
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={pagination.page === 1}
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: Math.max(1, prev.page - 1),
                      }))
                    }
                  >
                    Sebelumnya
                  </Button>
                  <Button
                    variant="outline"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: Math.min(prev.totalPages, prev.page + 1),
                      }))
                    }
                  >
                    Selanjutnya
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )

  function refreshTable() {
    fetchSalesOrders()
  }
}
