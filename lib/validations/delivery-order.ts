import { z } from 'zod'

// Delivery Order Line Item
export const doLineItemSchema = z.object({
  id: z.string().optional(),
  deliveryOrderId: z.string().optional(),
  productId: z.string().min(1, 'Produk diperlukan'),
  productName: z.string().min(1, 'Nama produk diperlukan'),
  soLineItemId: z.string().optional(),
  quantity: z.coerce
    .number()
    .positive('Kuantitas harus lebih dari 0')
    .min(0.01, 'Kuantitas minimal 0.01'),
  receivedQuantity: z.coerce
    .number()
    .min(0, 'Kuantitas diterima tidak boleh negatif')
    .optional(),
  notes: z.string().optional(),
})

// Document Upload
export const documentUploadSchema = z.object({
  id: z.string().optional(),
  documentType: z.enum(['purchase-order', 'delivery-slip', 'invoice', 'other']),
  filename: z.string().min(1, 'Nama file diperlukan'),
  fileUrl: z.string().url('URL file tidak valid'),
  uploadedAt: z.string().optional(),
  uploadedBy: z.string().optional(),
  notes: z.string().optional(),
})

// Delivery Order Schema
export const deliveryOrderSchema = z.object({
  id: z.string().optional(),
  deliveryOrderNo: z.string().min(1, 'Nomor DO diperlukan').optional(),
  salesOrderId: z.string().min(1, 'Sales Order diperlukan'),
  salesOrderNo: z.string().optional(),
  customerId: z.string().min(1, 'Pelanggan diperlukan'),
  customerName: z.string().min(1, 'Nama pelanggan diperlukan'),
  deliveryDate: z.string().min(1, 'Tanggal pengiriman diperlukan'),
  actualDeliveryDate: z.string().optional(),
  deliveryAddress: z.string().min(1, 'Alamat pengiriman diperlukan'),
  recipient: z.string().optional(),
  recipientPhone: z.string().optional(),
  status: z
    .enum(['draft', 'ready', 'in-transit', 'delivered', 'cancelled'])
    .default('draft'),
  lineItems: z
    .array(doLineItemSchema)
    .min(1, 'Minimal 1 item produk harus ditambahkan'),
  documents: z.array(documentUploadSchema).optional(),
  notes: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

// Delivery Order Filters
export const deliveryOrderFiltersSchema = z.object({
  search: z.string().optional(),
  status: z
    .enum(['draft', 'ready', 'in-transit', 'delivered', 'cancelled'])
    .optional(),
  customerId: z.string().optional(),
  salesOrderId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sortBy: z.enum(['deliveryDate', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().default(1),
  pageSize: z.number().default(10),
})

// Types
export type DOLineItem = z.infer<typeof doLineItemSchema>
export type DocumentUpload = z.infer<typeof documentUploadSchema>
export type DeliveryOrderFormInput = z.infer<typeof deliveryOrderSchema>
export type DeliveryOrderFilters = z.infer<typeof deliveryOrderFiltersSchema>

export interface DeliveryOrderDetail extends DeliveryOrderFormInput {
  id: string
  deliveryOrderNo: string
  createdAt: string
  updatedAt: string
}

export interface DeliveryOrder {
  id: string
  deliveryOrderNo: string
  salesOrderId: string
  salesOrderNo: string
  customerId: string
  customerName: string
  deliveryDate: string
  actualDeliveryDate?: string
  deliveryAddress: string
  recipient?: string
  recipientPhone?: string
  status: 'draft' | 'ready' | 'in-transit' | 'delivered' | 'cancelled'
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface DOLineItemResponse {
  id: string
  deliveryOrderId: string
  productId: string
  productName: string
  soLineItemId: string
  quantity: number
  receivedQuantity?: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface DocumentUploadResponse {
  id: string
  deliveryOrderId?: string
  salesOrderId?: string
  documentType: 'purchase-order' | 'delivery-slip' | 'invoice' | 'other'
  filename: string
  fileUrl: string
  uploadedAt: string
  uploadedBy: string
  notes?: string
}
