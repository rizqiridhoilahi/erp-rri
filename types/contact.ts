export type CustomerType = 'perorangan' | 'bisnis'
export type SupplierType = 'local' | 'international'
export type ContactStatus = 'active' | 'inactive'

// ============ CUSTOMER TYPES ============
export interface Customer {
  id: string
  code: string
  name: string
  type: CustomerType
  // Contact Info - used for individual or primary contact
  email: string
  phone: string
  address: string
  city: string
  province: string
  postalCode: string
  country?: string
  taxId?: string
  taxName?: string
  taxAddress?: string
  companyName?: string
  // PIC (Person In Charge) - for business type only
  picName?: string
  picEmail?: string
  picPhone?: string
  // Storage Addresses - for business type only (up to 5 addresses)
  storageAddress1?: string
  storageAddress2?: string
  storageAddress3?: string
  storageAddress4?: string
  storageAddress5?: string
  // Contract Info - for business type only
  hasContract?: boolean
  contractId?: string
  contractNumber?: string
  contractFileUrl?: string
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
  taxName?: string
  taxAddress?: string
  companyName?: string
  // PIC (Person In Charge) - for business type only
  picName?: string
  picEmail?: string
  picPhone?: string
  // Storage Addresses - for business type only
  storageAddress1?: string
  storageAddress2?: string
  storageAddress3?: string
  storageAddress4?: string
  storageAddress5?: string
  // Contract Info - for business type only
  hasContract?: boolean
  contractNumber?: string
  contractFileUrl?: string
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
  sortBy?: 'name' | 'created_at'
  sortOrder?: 'asc' | 'desc'
}

export interface SupplierFilters {
  search?: string
  type?: SupplierType
  city?: string
  status?: ContactStatus
  sortBy?: 'name' | 'created_at'
  sortOrder?: 'asc' | 'desc'
}

// ============ CONTRACT TYPES ============
export interface CustomerContract {
  id: string
  customerId: string
  contractNumber: string
  contractDate: string
  startDate: string
  endDate: string
  description: string
  fileUrl: string
  status: 'active' | 'expired' | 'terminated'
  notes: string
  createdAt: string
  updatedAt: string
}

export interface CustomerProductContract {
  id: string
  customerId: string
  contractId: string
  productId: string
  contractPrice: number
  startDate: string
  endDate: string
  notes: string
  createdAt: string
  updatedAt: string
}
