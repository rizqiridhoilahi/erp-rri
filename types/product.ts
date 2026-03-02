export type ProductStatus = 'stocked' | 'indent'

export interface Product {
  id: string
  code: string
  name: string
  description?: string
  category: string
  brand: string
  price: number
  cost: number
  stock: number
  unit: string
  sku: string
  barcode?: string
  image?: string
  status: ProductStatus
  createdAt: string
  updatedAt: string
}

export interface CreateProductInput {
  code: string
  name: string
  description?: string
  category: string
  brand: string
  price: number
  cost: number
  stock: number
  unit: string
  sku: string
  barcode?: string
  image?: string
  status?: ProductStatus
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  id: string
}

export interface ProductFilters {
  search?: string
  category?: string
  brand?: string
  status?: ProductStatus
  minPrice?: number
  maxPrice?: number
  sortBy?: 'name' | 'price' | 'stock' | 'created_at'
  sortOrder?: 'asc' | 'desc'
}

export interface ProductListResponse {
  data: Product[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ProductResponse {
  data: Product
  success: boolean
}

export interface DeleteProductResponse {
  success: boolean
  message: string
}
