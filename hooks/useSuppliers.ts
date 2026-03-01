import { useState, useCallback } from 'react'
import type { Supplier } from '@/types/contact'
import type { SupplierFiltersInput } from '@/lib/validations/contact'

// Mock data for suppliers
const mockSuppliers: Supplier[] = [
  {
    id: '1',
    code: 'SUP001',
    name: 'PT Bahan Baku Indonesia',
    type: 'local',
    email: 'sales@bahanbaku.com',
    phone: '021-9876-5432',
    address: 'Jl. Kramat Raya No. 123',
    city: 'Jakarta',
    province: 'DKI Jakarta',
    postalCode: '12120',
    country: 'Indonesia',
    taxId: '21.345.678.9-123.456',
    bankAccount: '1234567890123',
    bankName: 'Bank Mandiri',
    notes: 'Supplier utama, harga kompetitif',
    status: 'active',
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z',
  },
  {
    id: '2',
    code: 'SUP002',
    name: 'CV Tekstil Nusantara',
    type: 'local',
    email: 'contact@tekstilnus.com',
    phone: '0274-555-6666',
    address: 'Jl. Diponegoro No. 456',
    city: 'Yogyakarta',
    province: 'DI Yogyakarta',
    postalCode: '55111',
    country: 'Indonesia',
    taxId: '32.654.321.0-987.654',
    bankAccount: '9876543210987',
    bankName: 'Bank BCA',
    notes: 'Teks ildan produk fashion',
    status: 'active',
    createdAt: '2024-01-18T00:00:00Z',
    updatedAt: '2024-01-18T00:00:00Z',
  },
  {
    id: '3',
    code: 'SUP003',
    name: 'Golden Quality Ltd.',
    type: 'international',
    email: 'export@goldenquality.sg',
    phone: '+65-6123-4567',
    address: '123 Clementi Road',
    city: 'Singapore',
    province: 'Singapore',
    postalCode: '129742',
    country: 'Singapore',
    taxId: '',
    bankAccount: 'SG-12345678-90',
    bankName: 'DBS Bank Singapore',
    notes: 'Supplier internasional, lead time 2 minggu',
    status: 'active',
    createdAt: '2024-01-25T00:00:00Z',
    updatedAt: '2024-01-25T00:00:00Z',
  },
  {
    id: '4',
    code: 'SUP004',
    name: 'PT Elektronik Surya',
    type: 'local',
    email: 'sales@elektroniksurya.co.id',
    phone: '0372-1234-5678',
    address: 'Jl. Bypass Ngurah Rai No. 789',
    city: 'Denpasar',
    province: 'Bali',
    postalCode: '80111',
    country: 'Indonesia',
    taxId: '43.876.543.2-123.456',
    bankAccount: '5432109876543',
    bankName: 'Bank BNI',
    notes: 'Komponen elektronik',
    status: 'active',
    createdAt: '2024-02-05T00:00:00Z',
    updatedAt: '2024-02-05T00:00:00Z',
  },
  {
    id: '5',
    code: 'SUP005',
    name: 'Shanghai Manufacturing Co.',
    type: 'international',
    email: 'business@shanghaimfg.com.cn',
    phone: '+86-21-5555-6666',
    address: '888 Pudong Road',
    city: 'Shanghai',
    province: 'Shanghai',
    postalCode: '200120',
    country: 'China',
    taxId: '',
    bankAccount: 'CN-9876543210',
    bankName: 'Bank of China',
    notes: 'Supplier Tiongkok, harga murah, MOQ tinggi',
    status: 'inactive',
    createdAt: '2024-02-12T00:00:00Z',
    updatedAt: '2024-03-01T00:00:00Z',
  },
]

interface SupplierListResponse {
  data: Supplier[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export function useSuppliers() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getList = useCallback(
    async (
      page: number = 1,
      pageSize: number = 10,
      filters?: SupplierFiltersInput
    ): Promise<SupplierListResponse> => {
      setLoading(true)
      setError(null)

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 300))

        let filtered = [...mockSuppliers]

        // Apply filters
        if (filters?.search) {
          const searchLower = filters.search.toLowerCase()
          filtered = filtered.filter(
            (supplier) =>
              supplier.name.toLowerCase().includes(searchLower) ||
              supplier.code.toLowerCase().includes(searchLower) ||
              supplier.email.toLowerCase().includes(searchLower)
          )
        }

        if (filters?.type) {
          filtered = filtered.filter((supplier) => supplier.type === filters.type)
        }

        if (filters?.city) {
          filtered = filtered.filter((supplier) =>
            supplier.city.toLowerCase().includes(filters.city!.toLowerCase())
          )
        }

        if (filters?.status) {
          filtered = filtered.filter((supplier) => supplier.status === filters.status)
        }

        // Apply sorting
        const sortBy = filters?.sortBy || 'createdAt'
        const sortOrder = filters?.sortOrder || 'desc'

        filtered.sort((a, b) => {
          let aValue: any = a[sortBy as keyof Supplier]
          let bValue: any = b[sortBy as keyof Supplier]

          if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
          if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
          return 0
        })

        // Apply pagination
        const total = filtered.length
        const totalPages = Math.ceil(total / pageSize)
        const start = (page - 1) * pageSize
        const end = start + pageSize
        const data = filtered.slice(start, end)

        return {
          data,
          total,
          page,
          pageSize,
          totalPages,
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Gagal mengambil data supplier'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const getOne = useCallback(async (id: string): Promise<Supplier | null> => {
    setLoading(true)
    setError(null)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 200))

      const supplier = mockSuppliers.find((s) => s.id === id)
      return supplier || null
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal mengambil data supplier'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const create = useCallback(async (data: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true)
    setError(null)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      const newSupplier: Supplier = {
        ...data,
        id: `SUP_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      mockSuppliers.push(newSupplier)
      return newSupplier
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal membuat supplier baru'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const update = useCallback(
    async (id: string, data: Partial<Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>>) => {
      setLoading(true)
      setError(null)

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500))

        const index = mockSuppliers.findIndex((s) => s.id === id)
        if (index === -1) throw new Error('Supplier tidak ditemukan')

        const updated: Supplier = {
          ...mockSuppliers[index],
          ...data,
          updatedAt: new Date().toISOString(),
        }

        mockSuppliers[index] = updated
        return updated
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Gagal memperbarui supplier'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const delete_ = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300))

      const index = mockSuppliers.findIndex((s) => s.id === id)
      if (index === -1) throw new Error('Supplier tidak ditemukan')

      mockSuppliers.splice(index, 1)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menghapus supplier'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getFilterOptions = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 200))

      const cities = Array.from(new Set(mockSuppliers.map((s) => s.city))).sort()
      const types = Array.from(new Set(mockSuppliers.map((s) => s.type)))
      const statuses = Array.from(new Set(mockSuppliers.map((s) => s.status)))

      return {
        cities,
        types: types as Array<'local' | 'international'>,
        statuses: statuses as Array<'active' | 'inactive'>,
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal mengambil opsi filter supplier'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    getList,
    getOne,
    create,
    update,
    delete: delete_,
    getFilterOptions,
  }
}
