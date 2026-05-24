import { describe, it, expect } from 'vitest'
import { penggajianSchema } from '@/lib/validations/penggajian'

describe('penggajianSchema', () => {
  it('accepts valid penggajian data', () => {
    const result = penggajianSchema.safeParse({
      karyawan_id: 'abc-123',
      bulan: 5,
      tahun: 2026,
      gaji_pokok: 5000000,
    })
    expect(result.success).toBe(true)
  })

  it('coerces string number to number', () => {
    const result = penggajianSchema.safeParse({
      karyawan_id: 'abc-123',
      bulan: '5',
      tahun: '2026',
      gaji_pokok: '5000000',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.bulan).toBe(5)
      expect(result.data.gaji_pokok).toBe(5000000)
    }
  })

  it('applies default values for tunjangan and potongan', () => {
    const result = penggajianSchema.safeParse({
      karyawan_id: 'abc-123',
      bulan: 5,
      tahun: 2026,
      gaji_pokok: 5000000,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.tunjangan).toBe(0)
      expect(result.data.potongan).toBe(0)
    }
  })

  it('rejects bulan < 1', () => {
    const result = penggajianSchema.safeParse({
      karyawan_id: 'abc-123',
      bulan: 0,
      tahun: 2026,
      gaji_pokok: 5000000,
    })
    expect(result.success).toBe(false)
  })

  it('rejects bulan > 12', () => {
    const result = penggajianSchema.safeParse({
      karyawan_id: 'abc-123',
      bulan: 13,
      tahun: 2026,
      gaji_pokok: 5000000,
    })
    expect(result.success).toBe(false)
  })

  it('rejects negative gaji_pokok', () => {
    const result = penggajianSchema.safeParse({
      karyawan_id: 'abc-123',
      bulan: 5,
      tahun: 2026,
      gaji_pokok: -1000,
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty karyawan_id', () => {
    const result = penggajianSchema.safeParse({
      karyawan_id: '',
      bulan: 5,
      tahun: 2026,
      gaji_pokok: 5000000,
    })
    expect(result.success).toBe(false)
  })
})
