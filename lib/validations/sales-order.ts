import { z } from 'zod'

// Sales Order Line Item
export const soLineItemSchema = z.object({
  id: z.string().optional(),
  salesOrderId: z.string().optional(),
  productId: z.string().min(1, 'Produk diperlukan'),
  productName: z.string().min(1, 'Nama produk diperlukan'),
  quantity: z.coerce
    .number()
    .positive('Kuantitas harus lebih dari 0')
    .min(0.01, 'Kuantitas minimal 0.01'),
  unitPrice: z.coerce
    .number()
    .positive('Harga satuan harus lebih dari 0')
    .min(0, 'Harga satuan tidak boleh negatif'),
  discountPercent: z.coerce
    .number()
    .min(0, 'Diskon tidak boleh negatif')
    .max(100, 'Diskon tidak boleh lebih dari 100%')
    .optional()
    .default(0),
  lineTotal: z.number().optional(),
  notes: z.string().optional(),
})

// Sales Order Schema
export const salesOrderSchema = z.object({
  id: z.string().optional(),
  salesOrderNo: z.string().min(1, 'Nomor SO diperlukan').optional(),
  quotationId: z.string().optional(),
  customerId: z.string().min(1, 'Pelanggan diperlukan'),
  customerName: z.string().min(1, 'Nama pelanggan diperlukan'),
  poNumber: z.string().optional(),
  soDate: z.string().min(1, 'Tanggal SO diperlukan'),
  deliveryDate: z.string().min(1, 'Tanggal pengiriman diperlukan'),
  deliveryAddress: z.string().optional(),
  status: z.enum(['draft', 'confirmed', 'in-production', 'ready', 'cancelled']).default('draft'),
  lineItems: z
    .array(soLineItemSchema)
    .min(1, 'Minimal 1 item produk harus ditambahkan'),
  notes: z.string().optional(),
  subtotal: z.number().optional(),
  taxAmount: z.number().optional(),
  totalAmount: z.number().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

// Sales Order Filters
export const salesOrderFiltersSchema = z.object({
  search: z.string().optional(),
  status: z
    .enum(['draft', 'confirmed', 'in-production', 'ready', 'cancelled'])
    .optional(),
  customerId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sortBy: z.enum(['soDate', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().default(1),
  pageSize: z.number().default(10),
})

// Types
export type SOLineItem = z.infer<typeof soLineItemSchema>
export type SalesOrderFormInput = z.infer<typeof salesOrderSchema>
export type SalesOrderFilters = z.infer<typeof salesOrderFiltersSchema>

export interface SalesOrderDetail extends SalesOrderFormInput {
  id: string
  salesOrderNo: string
  createdAt: string
  updatedAt: string
}

export interface SalesOrder {
  id: string
  salesOrderNo: string
  quotationId?: string
  customerId: string
  customerName: string
  poNumber?: string
  soDate: string
  deliveryDate: string
  deliveryAddress?: string
  status: 'draft' | 'confirmed' | 'in-production' | 'ready' | 'cancelled'
  subtotal: number
  taxAmount: number
  totalAmount: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface SOLineItemResponse {
  id: string
  salesOrderId: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  discountPercent: number
  lineTotal: number
  notes?: string
  createdAt: string
  updatedAt: string
}
