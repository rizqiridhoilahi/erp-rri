import { z } from 'zod'

// ============ CUSTOMER SCHEMAS ============
export const customerSchema = z.object({
  code: z
    .string()
    .min(1, 'Kode pelanggan harus diisi')
    .max(50, 'Kode pelanggan maksimal 50 karakter'),
  name: z
    .string()
    .min(2, 'Nama pelanggan minimal 2 karakter')
    .max(255, 'Nama pelanggan maksimal 255 karakter'),
  type: z.enum(['individual', 'business']),
  email: z
    .string()
    .email('Email harus valid')
    .min(1, 'Email harus diisi'),
  phone: z
    .string()
    .min(10, 'Nomor telepon minimal 10 karakter')
    .max(20, 'Nomor telepon maksimal 20 karakter'),
  address: z
    .string()
    .min(5, 'Alamat minimal 5 karakter')
    .max(500, 'Alamat maksimal 500 karakter'),
  city: z
    .string()
    .min(2, 'Kota minimal 2 karakter')
    .max(100, 'Kota maksimal 100 karakter'),
  province: z
    .string()
    .min(2, 'Provinsi minimal 2 karakter')
    .max(100, 'Provinsi maksimal 100 karakter'),
  postalCode: z
    .string()
    .min(1, 'Kode pos harus diisi')
    .max(20, 'Kode pos maksimal 20 karakter'),
  country: z
    .string()
    .max(100, 'Negara maksimal 100 karakter')
    .optional(),
  taxId: z
    .string()
    .max(50, 'NPWP maksimal 50 karakter')
    .optional(),
  companyName: z
    .string()
    .max(255, 'Nama perusahaan maksimal 255 karakter')
    .optional(),
  notes: z
    .string()
    .max(2000, 'Catatan maksimal 2000 karakter')
    .optional(),
  status: z.enum(['active', 'inactive']).default('active'),
})

export type CustomerFormInput = z.infer<typeof customerSchema>

export const customerFiltersSchema = z.object({
  search: z.string().max(255).optional(),
  type: z.enum(['individual', 'business']).optional(),
  city: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  sortBy: z.enum(['name', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export type CustomerFiltersInput = z.infer<typeof customerFiltersSchema>

// ============ SUPPLIER SCHEMAS ============
export const supplierSchema = z.object({
  code: z
    .string()
    .min(1, 'Kode supplier harus diisi')
    .max(50, 'Kode supplier maksimal 50 karakter'),
  name: z
    .string()
    .min(2, 'Nama supplier minimal 2 karakter')
    .max(255, 'Nama supplier maksimal 255 karakter'),
  type: z.enum(['local', 'international']),
  email: z
    .string()
    .email('Email harus valid')
    .min(1, 'Email harus diisi'),
  phone: z
    .string()
    .min(10, 'Nomor telepon minimal 10 karakter')
    .max(20, 'Nomor telepon maksimal 20 karakter'),
  address: z
    .string()
    .min(5, 'Alamat minimal 5 karakter')
    .max(500, 'Alamat maksimal 500 karakter'),
  city: z
    .string()
    .min(2, 'Kota minimal 2 karakter')
    .max(100, 'Kota maksimal 100 karakter'),
  province: z
    .string()
    .min(2, 'Provinsi minimal 2 karakter')
    .max(100, 'Provinsi maksimal 100 karakter'),
  postalCode: z
    .string()
    .min(1, 'Kode pos harus diisi')
    .max(20, 'Kode pos maksimal 20 karakter'),
  country: z
    .string()
    .max(100, 'Negara maksimal 100 karakter')
    .optional(),
  taxId: z
    .string()
    .max(50, 'NPWP maksimal 50 karakter')
    .optional(),
  bankAccount: z
    .string()
    .max(50, 'Nomor rekening maksimal 50 karakter')
    .optional(),
  bankName: z
    .string()
    .max(100, 'Nama bank maksimal 100 karakter')
    .optional(),
  notes: z
    .string()
    .max(2000, 'Catatan maksimal 2000 karakter')
    .optional(),
  status: z.enum(['active', 'inactive']).default('active'),
})

export type SupplierFormInput = z.infer<typeof supplierSchema>

export const supplierFiltersSchema = z.object({
  search: z.string().max(255).optional(),
  type: z.enum(['local', 'international']).optional(),
  city: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  sortBy: z.enum(['name', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export type SupplierFiltersInput = z.infer<typeof supplierFiltersSchema>
