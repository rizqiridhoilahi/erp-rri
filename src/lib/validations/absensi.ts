import { z } from 'zod'

export const absensiSchema = z.object({
  karyawan_id: z.string().min(1, 'Karyawan harus dipilih'),
  tanggal: z.string().min(1, 'Tanggal harus diisi'),
  status: z.enum(['hadir', 'sakit', 'izin', 'alpha', 'cuti']),
  keterangan: z.string().optional(),
})

export type AbsensiInput = z.infer<typeof absensiSchema>
