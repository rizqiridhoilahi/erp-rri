import { useState, useCallback } from 'react'
import { Product, ProductListResponse, CreateProductInput, UpdateProductInput, ProductFilters } from '@/types/product'
import { ProductFormInput } from '@/lib/validations/product'

// Mock data for now - will be replaced with actual API calls
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    code: 'PRD-001',
    name: 'Samsung Galaxy S21',
    description: 'High-performance smartphone with excellent camera',
    category: 'Electronics',
    brand: 'Samsung',
    price: 8000000,
    cost: 6500000,
    stock: 25,
    unit: 'pcs',
    sku: 'SGS21-001',
    barcode: '8806090849998',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    code: 'PRD-002',
    name: 'Apple iPhone 13 Pro',
    description: 'Premium smartphone with A15 Bionic chip',
    category: 'Electronics',
    brand: 'Apple',
    price: 12000000,
    cost: 9500000,
    stock: 15,
    unit: 'pcs',
    sku: 'IP13P-001',
    barcode: '194252048440',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    code: 'PRD-003',
    name: 'Sony WH-1000XM4 Headphones',
    description: 'Noise-canceling wireless headphones',
    category: 'Audio',
    brand: 'Sony',
    price: 3500000,
    cost: 2500000,
    stock: 42,
    unit: 'pcs',
    sku: 'SXM4-001',
    barcode: '4548736111150',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export function useProducts() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Simulated filter logic
  const filterProducts = useCallback((products: Product[], filters: ProductFilters): Product[] => {
    let filtered = [...products]

    // Text search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.code.toLowerCase().includes(searchLower) ||
          p.sku.toLowerCase().includes(searchLower),
      )
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter((p) => p.category === filters.category)
    }

    // Brand filter
    if (filters.brand) {
      filtered = filtered.filter((p) => p.brand === filters.brand)
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter((p) => p.status === filters.status)
    }

    // Price range
    if (filters.minPrice !== undefined) {
      filtered = filtered.filter((p) => p.price >= filters.minPrice!)
    }
    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter((p) => p.price <= filters.maxPrice!)
    }

    // Sorting
    const sortBy = filters.sortBy || 'createdAt'
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1

    filtered.sort((a, b) => {
      const valA = a[sortBy as keyof Product]
      const valB = b[sortBy as keyof Product]

      if (typeof valA === 'string' && typeof valB === 'string') {
        return valA.localeCompare(valB) * sortOrder
      }
      if (typeof valA === 'number' && typeof valB === 'number') {
        return (valA - valB) * sortOrder
      }
      return 0
    })

    return filtered
  }, [])

  // Get products list with filters and pagination
  const getProducts = useCallback(
    async (
      page: number = 1,
      pageSize: number = 10,
      filters: ProductFilters = {},
    ): Promise<ProductListResponse> => {
      setIsLoading(true)
      setError(null)

      try {
        // TODO: Replace with actual API call
        // const response = await fetch(`/api/products?page=${page}&pageSize=${pageSize}`, {
        //   method: 'GET',
        //   headers: { 'Content-Type': 'application/json' },
        // })

        // Simulated delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        const filtered = filterProducts(MOCK_PRODUCTS, filters)
        const total = filtered.length
        const start = (page - 1) * pageSize
        const data = filtered.slice(start, start + pageSize)

        return {
          data,
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch products'
        setError(message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [filterProducts],
  )

  // Get single product by ID
  const getProduct = useCallback(async (id: string): Promise<Product> => {
    setIsLoading(true)
    setError(null)

    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/products/${id}`)

      await new Promise((resolve) => setTimeout(resolve, 300))

      const product = MOCK_PRODUCTS.find((p) => p.id === id)
      if (!product) {
        throw new Error('Product not found')
      }

      return product
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch product'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Create product
  const createProduct = useCallback(async (data: ProductFormInput): Promise<Product> => {
    setIsLoading(true)
    setError(null)

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/products', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // })

      await new Promise((resolve) => setTimeout(resolve, 500))

      const newProduct: Product = {
        id: String(MOCK_PRODUCTS.length + 1),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Add to mock data
      MOCK_PRODUCTS.push(newProduct)

      return newProduct
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create product'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Update product
  const updateProduct = useCallback(
    async (id: string, data: Partial<ProductFormInput>): Promise<Product> => {
      setIsLoading(true)
      setError(null)

      try {
        // TODO: Replace with actual API call
        // const response = await fetch(`/api/products/${id}`, {
        //   method: 'PUT',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(data),
        // })

        await new Promise((resolve) => setTimeout(resolve, 500))

        const index = MOCK_PRODUCTS.findIndex((p) => p.id === id)
        if (index === -1) {
          throw new Error('Product not found')
        }

        const updated: Product = {
          ...MOCK_PRODUCTS[index],
          ...data,
          updatedAt: new Date().toISOString(),
        }

        MOCK_PRODUCTS[index] = updated
        return updated
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update product'
        setError(message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  // Delete product
  const deleteProduct = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/products/${id}`, {
      //   method: 'DELETE',
      // })

      await new Promise((resolve) => setTimeout(resolve, 300))

      const index = MOCK_PRODUCTS.findIndex((p) => p.id === id)
      if (index === -1) {
        throw new Error('Product not found')
      }

      MOCK_PRODUCTS.splice(index, 1)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete product'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Get unique categories and brands for filters
  const getFilterOptions = useCallback(
    async () => {
      const categories = [...new Set(MOCK_PRODUCTS.map((p) => p.category))].sort()
      const brands = [...new Set(MOCK_PRODUCTS.map((p) => p.brand))].sort()

      return { categories, brands }
    },
    [],
  )

  return {
    isLoading,
    error,
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    getFilterOptions,
  }
}
