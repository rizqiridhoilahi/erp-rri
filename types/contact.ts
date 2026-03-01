export type CustomerType = 'individual' | 'business'
export type SupplierType = 'local' | 'international'
export type ContactStatus = 'active' | 'inactive'

// ============ CUSTOMER TYPES ============
export interface Customer {
  id: string
  code: string
  name: string
  type: CustomerType
  email: string
  phone: string
  address: string
  city: string
  province: string
  postalCode: string
  country?: string
  taxId?: string
  companyName?: string
  notes?: string
  status: ContactStatus
  createdAt: string
  updatedAt: string
}

export interface CreateCustomerInput {
  code: string
  name: string
  type: CustomerType
  email: string
  phone: string
  address: string
  city: string
  province: string
  postalCode: string
  country?: string
  taxId?: string
  companyName?: string
  notes?: string
  status?: ContactStatus
}

export interface UpdateCustomerInput extends Partial<CreateCustomerInput> {
  id: string
}

export interface CustomerListResponse {
  data: Customer[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ============ SUPPLIER TYPES ============
export interface Supplier {
  id: string
  code: string
  name: string
  type: SupplierType
  email: string
  phone: string
  address: string
  city: string
  province: string
  postalCode: string
  country?: string
  taxId?: string
  bankAccount?: string
  bankName?: string
  notes?: string
  status: ContactStatus
  createdAt: string
  updatedAt: string
}

export interface CreateSupplierInput {
  code: string
  name: string
  type: SupplierType
  email: string
  phone: string
  address: string
  city: string
  province: string
  postalCode: string
  country?: string
  taxId?: string
  bankAccount?: string
  bankName?: string
  notes?: string
  status?: ContactStatus
}

export interface UpdateSupplierInput extends Partial<CreateSupplierInput> {
  id: string
}

export interface SupplierListResponse {
  data: Supplier[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ============ FILTER TYPES ============
export interface CustomerFilters {
  search?: string
  type?: CustomerType
  city?: string
  status?: ContactStatus
  sortBy?: 'name' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export interface SupplierFilters {
  search?: string
  type?: SupplierType
  city?: string
  status?: ContactStatus
  sortBy?: 'name' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}
