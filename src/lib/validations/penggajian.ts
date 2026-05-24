import { z } from 'zod'

export const penggajianSchema = z.object({
  karyawan_id: z.string().min(1, 'Karyawan harus dipilih'),
  bulan: z.coerce.number().int().min(1, 'Bulan minimal 1').max(12, 'Bulan maksimal 12'),
  tahun: z.coerce.number().int().min(2020, 'Tahun minimal 2020').max(2100, 'Tahun maksimal 2100'),
  gaji_pokok: z.coerce.number().positive('Gaji pokok harus positif'),
  tunjangan: z.coerce.number().optional().default(0),
  potongan: z.coerce.number().optional().default(0),
  keterangan: z.string().optional(),
})

export type PenggajianInput = z.infer<typeof penggajianSchema>
