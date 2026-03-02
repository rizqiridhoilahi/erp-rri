import { z } from 'zod'

// ============ CUSTOMER SCHEMAS ============
// Common fields for all customer types
const commonFields = {
  code: z
    .string()
    .min(1, 'Kode pelanggan harus diisi')
    .max(50, 'Kode pelanggan maksimal 50 karakter'),
  name: z
    .string()
    .min(2, 'Nama pelanggan minimal 2 karakter')
    .max(255, 'Nama pelanggan maksimal 255 karakter'),
  type: z.enum(['perorangan', 'bisnis']),
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
  taxName: z
    .string()
    .max(255, 'Nama pajak maksimal 255 karakter')
    .optional(),
  taxAddress: z
    .string()
    .max(500, 'Alamat pajak maksimal 500 karakter')
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
}

// Business type specific fields
const businessFields = {
  // PIC (Person In Charge)
  picName: z
    .string()
    .max(255, 'Nama PIC maksimal 255 karakter')
    .optional(),
  picEmail: z
    .string()
    .email('Email PIC harus valid')
    .max(255, 'Email PIC maksimal 255 karakter')
    .optional(),
  picPhone: z
    .string()
    .max(20, 'Nomor telepon PIC maksimal 20 karakter')
    .optional(),
  // Storage Addresses (up to 5)
  storageAddress1: z
    .string()
    .max(500, 'Alamat penyimpanan 1 maksimal 500 karakter')
    .optional(),
  storageAddress2: z
    .string()
    .max(500, 'Alamat penyimpanan 2 maksimal 500 karakter')
    .optional(),
  storageAddress3: z
    .string()
    .max(500, 'Alamat penyimpanan 3 maksimal 500 karakter')
    .optional(),
  storageAddress4: z
    .string()
    .max(500, 'Alamat penyimpanan 4 maksimal 500 karakter')
    .optional(),
  storageAddress5: z
    .string()
    .max(500, 'Alamat penyimpanan 5 maksimal 500 karakter')
    .optional(),
  // Contract Info
  hasContract: z.boolean().optional(),
  contractNumber: z
    .string()
    .max(100, 'Nomor kontrak maksimal 100 karakter')
    .optional(),
  contractFileUrl: z
    .string()
    .max(500, 'URL file kontrak maksimal 500 karakter')
    .optional(),
}

export const customerSchema = z.object({
  ...commonFields,
  ...businessFields,
}).superRefine((data, ctx) => {
  // If type is bisnis, PIC fields become required
  if (data.type === 'bisnis') {
    if (!data.picName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Nama PIC harus diisi untuk customer bisnis',
        path: ['picName'],
      })
    }
    if (!data.picEmail) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Email PIC harus diisi untuk customer bisnis',
        path: ['picEmail'],
      })
    }
    if (!data.picPhone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Nomor telepon PIC harus diisi untuk customer bisnis',
        path: ['picPhone'],
      })
    }
  }
})

export type CustomerFormInput = z.infer<typeof customerSchema>

export const customerFiltersSchema = z.object({
  search: z.string().max(255).optional(),
  type: z.enum(['perorangan', 'bisnis']).optional(),
  city: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  sortBy: z.enum(['name', 'created_at']).default('created_at'),
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
  sortBy: z.enum(['name', 'created_at']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export type SupplierFiltersInput = z.infer<typeof supplierFiltersSchema>
