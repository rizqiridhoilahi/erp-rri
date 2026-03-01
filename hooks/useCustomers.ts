import { useState, useCallback } from 'react'
import type { Customer } from '@/types/contact'
import type { CustomerFiltersInput } from '@/lib/validations/contact'

// Mock data for customers
const mockCustomers: Customer[] = [
  {
    id: '1',
    code: 'CUST001',
    name: 'PT Maju Jaya Indonesia',
    type: 'business',
    email: 'info@majujaya.com',
    phone: '021-1234-5678',
    address: 'Jl. Sudirman No. 123',
    city: 'Jakarta',
    province: 'DKI Jakarta',
    postalCode: '12190',
    country: 'Indonesia',
    taxId: '12.345.678.9-123.456',
    companyName: 'PT Maju Jaya Indonesia',
    notes: 'Pelanggan reguler, pembayaran tepat waktu',
    status: 'active',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: '2',
    code: 'CUST002',
    name: 'Budi Santoso',
    type: 'individual',
    email: 'budi.santoso@email.com',
    phone: '0812-3456-7890',
    address: 'Jl. Gatot Subroto No. 456',
    city: 'Surabaya',
    province: 'Jawa Timur',
    postalCode: '60188',
    country: 'Indonesia',
    taxId: '',
    companyName: '',
    notes: 'Pembelian untuk kebutuhan pribadi',
    status: 'active',
    createdAt: '2024-01-20T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z',
  },
  {
    id: '3',
    code: 'CUST003',
    name: 'CV Gemilang Usaha',
    type: 'business',
    email: 'contact@gemilang.com',
    phone: '0274-987-6543',
    address: 'Jl. Malioboro No. 789',
    city: 'Yogyakarta',
    province: 'DI Yogyakarta',
    postalCode: '55271',
    country: 'Indonesia',
    taxId: '98.765.432.1-987.654',
    companyName: 'CV Gemilang Usaha',
    notes: 'Klien korporat, kontrak jangka panjang',
    status: 'active',
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z',
  },
  {
    id: '4',
    code: 'CUST004',
    name: 'Siti Nurhaliza',
    type: 'individual',
    email: 'siti.nurhaliza@email.com',
    phone: '0856-1234-5678',
    address: 'Jl. Ahmad Yani No. 321',
    city: 'Bandung',
    province: 'Jawa Barat',
    postalCode: '40172',
    country: 'Indonesia',
    taxId: '',
    companyName: '',
    notes: 'Pelanggan baru, dari referensi',
    status: 'active',
    createdAt: '2024-02-10T00:00:00Z',
    updatedAt: '2024-02-10T00:00:00Z',
  },
  {
    id: '5',
    code: 'CUST005',
    name: 'PT Sentosa Maju',
    type: 'business',
    email: 'sales@sentosa.co.id',
    phone: '0341-555-6666',
    address: 'Jl. Raya Pandaan No. 654',
    city: 'Pandaan',
    province: 'Jawa Timur',
    postalCode: '67156',
    country: 'Indonesia',
    taxId: '11.222.333.4-555.666',
    companyName: 'PT Sentosa Maju',
    notes: 'Distributor regional, volume tinggi',
    status: 'inactive',
    createdAt: '2024-02-15T00:00:00Z',
    updatedAt: '2024-03-01T00:00:00Z',
  },
]

interface CustomerListResponse {
  data: Customer[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export function useCustomers() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getList = useCallback(
    async (
      page: number = 1,
      pageSize: number = 10,
      filters?: CustomerFiltersInput
    ): Promise<CustomerListResponse> => {
      setLoading(true)
      setError(null)

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 300))

        let filtered = [...mockCustomers]

        // Apply filters
        if (filters?.search) {
          const searchLower = filters.search.toLowerCase()
          filtered = filtered.filter(
            (customer) =>
              customer.name.toLowerCase().includes(searchLower) ||
              customer.code.toLowerCase().includes(searchLower) ||
              customer.email.toLowerCase().includes(searchLower)
          )
        }

        if (filters?.type) {
          filtered = filtered.filter((customer) => customer.type === filters.type)
        }

        if (filters?.city) {
          filtered = filtered.filter((customer) =>
            customer.city.toLowerCase().includes(filters.city!.toLowerCase())
          )
        }

        if (filters?.status) {
          filtered = filtered.filter((customer) => customer.status === filters.status)
        }

        // Apply sorting
        const sortBy = filters?.sortBy || 'createdAt'
        const sortOrder = filters?.sortOrder || 'desc'

        filtered.sort((a, b) => {
          let aValue: any = a[sortBy as keyof Customer]
          let bValue: any = b[sortBy as keyof Customer]

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
        const message = err instanceof Error ? err.message : 'Gagal mengambil data pelanggan'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const getOne = useCallback(async (id: string): Promise<Customer | null> => {
    setLoading(true)
    setError(null)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 200))

      const customer = mockCustomers.find((c) => c.id === id)
      return customer || null
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal mengambil data pelanggan'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const create = useCallback(async (data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true)
    setError(null)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      const newCustomer: Customer = {
        ...data,
        id: `CUST_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      mockCustomers.push(newCustomer)
      return newCustomer
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal membuat pelanggan baru'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const update = useCallback(
    async (id: string, data: Partial<Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>>) => {
      setLoading(true)
      setError(null)

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500))

        const index = mockCustomers.findIndex((c) => c.id === id)
        if (index === -1) throw new Error('Pelanggan tidak ditemukan')

        const updated: Customer = {
          ...mockCustomers[index],
          ...data,
          updatedAt: new Date().toISOString(),
        }

        mockCustomers[index] = updated
        return updated
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Gagal memperbarui pelanggan'
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

      const index = mockCustomers.findIndex((c) => c.id === id)
      if (index === -1) throw new Error('Pelanggan tidak ditemukan')

      mockCustomers.splice(index, 1)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menghapus pelanggan'
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

      const cities = Array.from(new Set(mockCustomers.map((c) => c.city))).sort()
      const types = Array.from(new Set(mockCustomers.map((c) => c.type)))
      const statuses = Array.from(new Set(mockCustomers.map((c) => c.status)))

      return {
        cities,
        types: types as Array<'individual' | 'business'>,
        statuses: statuses as Array<'active' | 'inactive'>,
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Gagal mengambil opsi filter pelanggan'
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
