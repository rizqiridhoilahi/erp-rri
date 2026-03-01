import { z } from 'zod'

// Import Types
export type ImportEntityType = 'products' | 'customers' | 'suppliers' | 'sales_orders' | 'invoices'

export interface ImportRow {
  rowNumber: number
  data: Record<string, string>
  isValid: boolean
  errors: string[]
}

export interface ImportResult {
  totalRows: number
  successRows: number
  failedRows: number
  results: ImportRow[]
}

// Product import schema
export const productImportSchema = z.object({
  sku: z.string().min(1, 'SKU wajib diisi'),
  name: z.string().min(1, 'Nama produk wajib diisi'),
  brand: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  purchase_price: z.string().refine((val) => !isNaN(Number(val)), 'Harga beli harus angka'),
  selling_price: z.string().refine((val) => !isNaN(Number(val)), 'Harga jual harus angka'),
  stock: z.string().refine((val) => !isNaN(Number(val)), 'Stok harus angka'),
  unit: z.string().min(1, 'Satuan wajib diisi'),
  status: z.enum(['active', 'inactive', 'indent']).optional(),
})

export type ProductImportRow = z.infer<typeof productImportSchema>

// Customer import schema
export const customerImportSchema = z.object({
  name: z.string().min(1, 'Nama customer wajib diisi'),
  email: z.string().email('Email tidak valid').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  tax_id: z.string().optional(),
  contact_person: z.string().optional(),
})

export type CustomerImportRow = z.infer<typeof customerImportSchema>

// Supplier import schema
export const supplierImportSchema = z.object({
  name: z.string().min(1, 'Nama supplier wajib diisi'),
  email: z.string().email('Email tidak valid').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  bank_name: z.string().optional(),
  bank_account: z.string().optional(),
  bank_holder: z.string().optional(),
  contact_person: z.string().optional(),
})

export type SupplierImportRow = z.infer<typeof supplierImportSchema>

// Import template schema
export const importTemplateSchema = z.object({
  entityType: z.enum(['products', 'customers', 'suppliers', 'sales_orders', 'invoices']),
  file: z.instanceof(File).refine((file) => file.size > 0, 'File tidak boleh kosong'),
})

export type ImportTemplateInput = z.infer<typeof importTemplateSchema>

// Export Types
export type ExportEntityType = 'products' | 'customers' | 'suppliers' | 'sales_orders' | 'invoices' | 'quotations' | 'journal_entries' | 'trial_balance'

export type ExportFormat = 'xlsx' | 'csv' | 'pdf'

export interface ExportConfig {
  entityType: ExportEntityType
  format: ExportFormat
  filters?: Record<string, unknown>
  columns?: string[]
  filename?: string
}

// Export scheduler schema
export const exportSchedulerSchema = z.object({
  entityType: z.enum(['products', 'customers', 'suppliers', 'sales_orders', 'invoices', 'quotations', 'journal_entries', 'trial_balance']),
  format: z.enum(['xlsx', 'csv', 'pdf']),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  time: z.string(),
  emailRecipients: z.array(z.string().email('Email tidak valid')),
  isActive: z.boolean(),
})

export type ExportSchedulerInput = z.infer<typeof exportSchedulerSchema>

// Get column headers for each entity type
export const importColumnHeaders: Record<ImportEntityType, string[]> = {
  products: ['sku', 'name', 'brand', 'category', 'description', 'purchase_price', 'selling_price', 'stock', 'unit', 'status'],
  customers: ['name', 'email', 'phone', 'address', 'city', 'province', 'tax_id', 'contact_person'],
  suppliers: ['name', 'email', 'phone', 'address', 'city', 'province', 'bank_name', 'bank_account', 'bank_holder', 'contact_person'],
  sales_orders: [],
  invoices: [],
}

export const exportColumnHeaders: Record<ExportEntityType, string[]> = {
  products: ['sku', 'name', 'brand', 'category', 'purchase_price', 'selling_price', 'stock', 'unit', 'status'],
  customers: ['name', 'email', 'phone', 'address', 'city', 'province', 'tax_id', 'contact_person'],
  suppliers: ['name', 'email', 'phone', 'address', 'city', 'province', 'bank_name', 'bank_account', 'contact_person'],
  sales_orders: ['so_number', 'customer_name', 'so_date', 'total_amount', 'status'],
  invoices: ['invoice_number', 'customer_name', 'invoice_date', 'due_date', 'total_amount', 'amount_paid', 'status'],
  quotations: ['quotation_number', 'customer_name', 'quotation_date', 'total_amount', 'status'],
  journal_entries: ['entry_date', 'description', 'account_code', 'account_name', 'debit', 'credit'],
  trial_balance: ['account_code', 'account_name', 'debit', 'credit'],
}

// Get sample data for template download
export const templateSampleData: Record<ImportEntityType, string[][]> = {
  products: [
    ['sku', 'name', 'brand', 'category', 'description', 'purchase_price', 'selling_price', 'stock', 'unit', 'status'],
    ['SKU-001', 'Produk A', 'Brand X', 'Elektronik', 'Deskripsi produk A', '100000', '150000', '100', 'pcs', 'active'],
    ['SKU-002', 'Produk B', 'Brand Y', 'Furniture', 'Deskripsi produk B', '200000', '300000', '50', 'unit', 'active'],
  ],
  customers: [
    ['name', 'email', 'phone', 'address', 'city', 'province', 'tax_id', 'contact_person'],
    ['PT ABC', 'abc@example.com', '021-1234567', 'Jl. Jalan No. 1', 'Jakarta', 'DKI Jakarta', '01.234.567.8-999.000', 'Budi'],
    ['PT DEF', 'def@example.com', '021-7654321', 'Jl. Jalan No. 2', 'Surabaya', 'Jawa Timur', '02.345.678.9-000.111', 'Ani'],
  ],
  suppliers: [
    ['name', 'email', 'phone', 'address', 'city', 'province', 'bank_name', 'bank_account', 'bank_holder', 'contact_person'],
    ['Supplier X', 'supplierx@example.com', '021-1111111', 'Jl. Supplier 1', 'Jakarta', 'DKI Jakarta', 'BCA', '1234567890', 'Supplier X', 'Budi'],
    ['Supplier Y', 'suppliery@example.com', '021-2222222', 'Jl. Supplier 2', 'Bandung', 'Jawa Barat', 'Mandiri', '0987654321', 'Supplier Y', 'Ani'],
  ],
  sales_orders: [],
  invoices: [],
}
