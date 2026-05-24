import { describe, it, expect } from 'vitest'
import { absensiSchema } from '@/lib/validations/absensi'

describe('absensiSchema', () => {
  it('accepts valid absensi data', () => {
    const result = absensiSchema.safeParse({
      karyawan_id: 'abc-123',
      tanggal: '2026-05-24',
      status: 'hadir',
    })
    expect(result.success).toBe(true)
  })

  it('accepts optional keterangan', () => {
    const result = absensiSchema.safeParse({
      karyawan_id: 'abc-123',
      tanggal: '2026-05-24',
      status: 'sakit',
      keterangan: 'Demam',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.keterangan).toBe('Demam')
    }
  })

  it('rejects empty karyawan_id', () => {
    const result = absensiSchema.safeParse({
      karyawan_id: '',
      tanggal: '2026-05-24',
      status: 'hadir',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid status', () => {
    const result = absensiSchema.safeParse({
      karyawan_id: 'abc-123',
      tanggal: '2026-05-24',
      status: 'invalid_status',
    })
    expect(result.success).toBe(false)
  })

  it('rejects all 5 valid enum values', () => {
    const valid = ['hadir', 'sakit', 'izin', 'alpha', 'cuti'] as const
    for (const s of valid) {
      const result = absensiSchema.safeParse({
        karyawan_id: 'abc-123',
        tanggal: '2026-05-24',
        status: s,
      })
      expect(result.success).toBe(true)
    }
  })

  it('rejects missing tanggal', () => {
    const result = absensiSchema.safeParse({
      karyawan_id: 'abc-123',
      status: 'hadir',
    } as Record<string, unknown>)
    expect(result.success).toBe(false)
  })

  it('rejects null values', () => {
    const result = absensiSchema.safeParse({
      karyawan_id: null,
      tanggal: '2026-05-24',
      status: 'hadir',
    })
    expect(result.success).toBe(false)
  })
})
