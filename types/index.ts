// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Master Data Types
export interface Product {
  id: string
  code: string
  name: string
  description?: string
  category: string
  price: number
  cost: number
  unit: string
  stock: number
  status: 'active' | 'inactive'
  createdAt: Date
  updatedAt: Date
}

export interface Customer {
  id: string
  code: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  province: string
  postalCode: string
  country: string
  type: 'individual' | 'company'
  status: 'active' | 'inactive'
  createdAt: Date
  updatedAt: Date
}

export interface Supplier {
  id: string
  code: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  province: string
  postalCode: string
  country: string
  paymentTerms: string
  status: 'active' | 'inactive'
  createdAt: Date
  updatedAt: Date
}

// Sales Types
export interface Quotation {
  id: string
  number: string
  customerId: string
  date: Date
  expiryDate: Date
  items: QuotationItem[]
  subtotal: number
  tax: number
  total: number
  status: 'draft' | 'sent' | 'accepted' | 'rejected'
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface QuotationItem {
  id: string
  productId: string
  quantity: number
  unitPrice: number
  discount: number
  subtotal: number
}

// Finance Types
export interface Invoice {
  id: string
  number: string
  customerId: string
  date: Date
  dueDate: Date
  items: InvoiceItem[]
  subtotal: number
  tax: number
  total: number
  paidAmount: number
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface InvoiceItem {
  id: string
  productId: string
  quantity: number
  unitPrice: number
  tax: number
  subtotal: number
}

// Pagination
export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
