import { z } from 'zod'

export const quotationLineItemSchema = z.object({
  id: z.string().optional(),
  quotationId: z.string().optional(),
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

export const quotationSchema = z.object({
  id: z.string().optional(),
  quotationNo: z.string().min(1, 'Nomor quotation diperlukan').optional(),
  customerId: z.string().min(1, 'Pelanggan diperlukan'),
  customerName: z.string().min(1, 'Nama pelanggan diperlukan'),
  quotationDate: z.string().min(1, 'Tanggal quotation diperlukan'),
  validUntil: z.string().min(1, 'Tanggal valid hingga diperlukan'),
  status: z.enum(['draft', 'sent', 'accepted', 'rejected', 'expired']).default('draft'),
  lineItems: z
    .array(quotationLineItemSchema)
    .min(1, 'Minimal 1 item produk harus ditambahkan'),
  notes: z.string().optional(),
  subtotal: z.number().optional(),
  taxAmount: z.number().optional(),
  totalAmount: z.number().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export const quotationFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['draft', 'sent', 'accepted', 'rejected', 'expired']).optional(),
  customerId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sortBy: z.enum(['quotationDate', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().default(1),
  pageSize: z.number().default(10),
})

export type QuotationLineItem = z.infer<typeof quotationLineItemSchema>
export type QuotationFormInput = z.infer<typeof quotationSchema>
export type QuotationFilters = z.infer<typeof quotationFiltersSchema>

// Response types (from API)
export interface QuotationDetail extends QuotationFormInput {
  id: string
  quotationNo: string
  createdAt: string
  updatedAt: string
}

export interface Quotation {
  id: string
  quotationNo: string
  customerId: string
  customerName: string
  quotationDate: string
  validUntil: string
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
  subtotal: number
  taxAmount: number
  totalAmount: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface QuotationLineItemResponse {
  id: string
  quotationId: string
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
