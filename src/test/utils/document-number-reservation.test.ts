import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock Supabase client
vi.mock('@/lib/db/client', () => ({
  supabase: {
    rpc: vi.fn(),
  },
}))

import { supabase } from '@/lib/db/client'
import { reserveDocumentNumber, useReservedNumber } from '@/lib/utils/document-number-reservation'

describe('Document Number Reservation System', () => {
  const mockUserId = '123e4567-e89b-12d3-a456-426614174000'
  const mockReserveId = '987fcdeb-51d2-43ab-9876-543210fedcba'
  const mockExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('reserveDocumentNumber', () => {
    it('should successfully reserve a document number', async () => {
      const mockResponse = {
        data: [{ reserve_id: mockReserveId, nomor: 'RRI-RFQC-26-06-0001', expires_at: mockExpiresAt }],
        error: null,
        count: null,
        success: true,
        status: 200,
        statusText: 'OK',
      }

      vi.mocked(supabase.rpc).mockResolvedValue(mockResponse as any)

      const result = await reserveDocumentNumber('RFQC', 'rfq-customer', mockUserId, 15)

      expect(result).toEqual({
        reserveId: mockReserveId,
        nomor: 'RRI-RFQC-26-06-0001',
        expiresAt: mockExpiresAt,
      })

      expect(supabase.rpc).toHaveBeenCalledWith('reserve_document_number', {
        p_kode_dokumen: 'RFQC',
        p_tahun: expect.any(Number),
        p_bulan: expect.any(Number),
        p_user_id: mockUserId,
        p_modul: 'rfq-customer',
        p_ttl_minutes: 15,
      })
    })

    it('should use default TTL of 15 minutes', async () => {
      const mockResponse = {
        data: [{ reserve_id: mockReserveId, nomor: 'RRI-SPH-26-06-0001', expires_at: mockExpiresAt }],
        error: null,
        count: null,
        success: true,
        status: 200,
        statusText: 'OK',
      }

      vi.mocked(supabase.rpc).mockResolvedValue(mockResponse as any)

      await reserveDocumentNumber('SPH', 'quotation', mockUserId)

      expect(supabase.rpc).toHaveBeenCalledWith('reserve_document_number', expect.objectContaining({
        p_ttl_minutes: 15,
      }))
    })

    it('should throw error when RPC fails', async () => {
      const mockError = {
        data: null,
        error: { message: 'Database connection failed' },
        count: null,
        success: false,
        status: 500,
        statusText: 'Internal Server Error',
      }

      vi.mocked(supabase.rpc).mockResolvedValue(mockError as any)

      await expect(reserveDocumentNumber('DI', 'di', mockUserId)).rejects.toThrow(
        'Failed to reserve document number: Database connection failed'
      )
    })

    it('should throw error when no reservation is created', async () => {
      const mockResponse = {
        data: [],
        error: null,
        count: null,
        success: true,
        status: 200,
        statusText: 'OK',
      }

      vi.mocked(supabase.rpc).mockResolvedValue(mockResponse as any)

      await expect(reserveDocumentNumber('CPO', 'customer-po', mockUserId)).rejects.toThrow(
        'No reservation created'
      )
    })
  })

  describe('useReservedNumber', () => {
    it('should successfully use a valid reservation', async () => {
      const mockResponse = {
        data: [{ success: true, nomor: 'RRI-RFQC-26-06-0001', message: 'Success' }],
        error: null,
        count: null,
        success: true,
        status: 200,
        statusText: 'OK',
      }

      vi.mocked(supabase.rpc).mockResolvedValue(mockResponse as any)

      const result = await useReservedNumber(mockReserveId, mockUserId)

      expect(result).toEqual({
        success: true,
        nomor: 'RRI-RFQC-26-06-0001',
        message: 'Success',
      })

      expect(supabase.rpc).toHaveBeenCalledWith('use_reserved_number', {
        p_reserve_id: mockReserveId,
        p_user_id: mockUserId,
      })
    })

    it('should return failure when reservation not found', async () => {
      const mockResponse = {
        data: [{ success: false, nomor: null, message: 'Reservation not found' }],
        error: null,
        count: null,
        success: true,
        status: 200,
        statusText: 'OK',
      }

      vi.mocked(supabase.rpc).mockResolvedValue(mockResponse as any)

      const result = await useReservedNumber('invalid-uuid', mockUserId)

      expect(result).toEqual({
        success: false,
        nomor: null,
        message: 'Reservation not found',
      })
    })

    it('should return failure when reservation expired', async () => {
      const mockResponse = {
        data: [{ success: false, nomor: null, message: 'Reservation expired' }],
        error: null,
        count: null,
        success: true,
        status: 200,
        statusText: 'OK',
      }

      vi.mocked(supabase.rpc).mockResolvedValue(mockResponse as any)

      const result = await useReservedNumber(mockReserveId, mockUserId)

      expect(result).toEqual({
        success: false,
        nomor: null,
        message: 'Reservation expired',
      })
    })
  })

  describe('Integration Scenarios', () => {
    it('should handle complete reservation flow: reserve → use', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: [{ reserve_id: mockReserveId, nomor: 'RRI-DI-26-06-0001', expires_at: mockExpiresAt }],
        error: null,
        count: null,
        success: true,
        status: 200,
        statusText: 'OK',
      } as any)

      const reserveResult = await reserveDocumentNumber('DI', 'di', mockUserId)
      expect(reserveResult.reserveId).toBe(mockReserveId)
      expect(reserveResult.nomor).toBe('RRI-DI-26-06-0001')

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: [{ success: true, nomor: 'RRI-DI-26-06-0001', message: 'Success' }],
        error: null,
        count: null,
        success: true,
        status: 200,
        statusText: 'OK',
      } as any)

      const useResult = await useReservedNumber(mockReserveId, mockUserId)
      expect(useResult.success).toBe(true)
      expect(useResult.nomor).toBe('RRI-DI-26-06-0001')
    })
  })
})