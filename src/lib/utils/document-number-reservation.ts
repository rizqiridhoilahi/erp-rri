import { supabase } from '@/lib/db/client';

export interface ReservationResult {
  reserveId: string;
  nomor: string;
  expiresAt: string;
}

/**
 * Reserve nomor dokumen untuk form creation
 * @param kodeDokumen - Kode dokumen (e.g., 'RFQC', 'SPH', 'DI')
 * @param modul - Nama modul (e.g., 'rfq-customer', 'quotation', 'di')
 * @param userId - User ID yang melakukan reserve
 * @param ttlMinutes - TTL dalam menit (default: 15)
 * @returns Reservation result dengan reserve_id, nomor, dan expires_at
 */
export async function reserveDocumentNumber(
  kodeDokumen: string,
  modul: string,
  userId: string,
  ttlMinutes: number = 15
): Promise<ReservationResult> {
  const now = new Date();
  const tahun = now.getFullYear();
  const bulan = now.getMonth() + 1;

  const { data, error } = await supabase.rpc('reserve_document_number', {
    p_kode_dokumen: kodeDokumen,
    p_tahun: tahun,
    p_bulan: bulan,
    p_user_id: userId,
    p_modul: modul,
    p_ttl_minutes: ttlMinutes,
  });

  if (error) {
    throw new Error(`Failed to reserve document number: ${error.message}`);
  }

  const row = data?.[0];
  if (!row) {
    throw new Error('No reservation created');
  }

  return {
    reserveId: row.reserve_id,
    nomor: row.nomor,
    expiresAt: row.expires_at,
  };
}

/**
 * Gunakan nomor yang sudah di-reserve saat submit form
 * @param reserveId - Reservation ID dari reserveDocumentNumber
 * @param userId - User ID yang melakukan reserve
 * @returns Result: { success, nomor, message }
 */
export async function useReservedNumber(
  reserveId: string,
  userId: string
): Promise<{ success: boolean; nomor: string | null; message: string }> {
  const { data, error } = await supabase.rpc('use_reserved_number', {
    p_reserve_id: reserveId,
    p_user_id: userId,
  });

  if (error) {
    throw new Error(`Failed to use reserved number: ${error.message}`);
  }

  const row = data?.[0];
  return {
    success: row.success,
    nomor: row.nomor,
    message: row.message,
  };
}