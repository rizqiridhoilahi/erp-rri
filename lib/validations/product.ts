import { z } from 'zod'

export const productSchema = z.object({
  code: z
    .string()
    .min(1, 'Product code is required')
    .max(50, 'Product code must be less than 50 characters'),
  name: z
    .string()
    .min(2, 'Product name must be at least 2 characters')
    .max(255, 'Product name must be less than 255 characters'),
  description: z.string().max(2000, 'Description must be less than 2000 characters').optional(),
  category: z.string().min(1, 'Category is required'),
  brand: z.string().min(1, 'Brand is required'),
  price: z
    .number()
    .positive('Price must be a positive number')
    .refine((val) => val > 0, 'Price must be greater than 0'),
  cost: z
    .number()
    .min(0, 'Cost cannot be negative')
    .refine((val) => val >= 0, 'Cost cannot be negative'),
  stock: z
    .number()
    .int('Stock must be a whole number')
    .min(0, 'Stock cannot be negative'),
  unit: z.string().min(1, 'Unit is required').max(20, 'Unit must be less than 20 characters'),
  sku: z
    .string()
    .min(1, 'SKU is required')
    .max(100, 'SKU must be less than 100 characters'),
  barcode: z.string().max(100, 'Barcode must be less than 100 characters').optional(),
  image: z.string().url('Image must be a valid URL').optional().or(z.literal('')),
  status: z.enum(['active', 'inactive', 'discontinued']).default('active'),
})

export type ProductFormInput = z.infer<typeof productSchema>

// Product filters schema for search/filter forms
export const productFiltersSchema = z.object({
  search: z.string().max(255).optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  status: z.enum(['active', 'inactive', 'discontinued']).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  sortBy: z.enum(['name', 'price', 'stock', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export type ProductFiltersInput = z.infer<typeof productFiltersSchema>
