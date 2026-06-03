-- Document Number Reservation System
-- Migration: 0033_document_number_reservation.sql

-- Tabel untuk reserve nomor dokumen
CREATE TABLE document_number_reservation (
  reserve_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kode_dokumen TEXT NOT NULL,
  nomor TEXT NOT NULL,
  tahun INTEGER NOT NULL,
  bulan INTEGER NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  modul TEXT NOT NULL, -- 'rfq-customer', 'quotation', 'di', dll
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used BOOLEAN NOT NULL DEFAULT FALSE
);

-- Index untuk cleanup & lookup
CREATE INDEX idx_reservation_expires ON document_number_reservation(expires_at);
CREATE INDEX idx_reservation_user ON document_number_reservation(user_id);
CREATE INDEX idx_reservation_kode ON document_number_reservation(kode_dokumen, tahun, bulan, used);

-- Function: Reserve nomor dengan TTL
CREATE OR REPLACE FUNCTION reserve_document_number(
  p_kode_dokumen TEXT,
  p_tahun INTEGER,
  p_bulan INTEGER,
  p_user_id UUID,
  p_modul TEXT,
  p_ttl_minutes INTEGER DEFAULT 15
) RETURNS TABLE (
  reserve_id UUID,
  nomor TEXT,
  expires_at TIMESTAMPTZ
) AS $$
DECLARE
  v_counter INTEGER;
  v_nomor TEXT;
  v_reserve_id UUID;
  v_expires_at TIMESTAMPTZ;
BEGIN
  -- Get & increment counter (atomic upsert)
  INSERT INTO document_counter (kode_dokumen, tahun, bulan, counter)
  VALUES (p_kode_dokumen, p_tahun, p_bulan, 1)
  ON CONFLICT (kode_dokumen, tahun, bulan)
  DO UPDATE SET counter = document_counter.counter + 1
  RETURNING counter INTO v_counter;
  
  -- Format nomor
  v_nomor := format('RRI-%s-%s-%s-%s',
    p_kode_dokumen,
    lpad(p_tahun::text, 2, '0'),
    lpad(p_bulan::text, 2, '0'),
    lpad(v_counter::text, 4, '0')
  );
  
  -- Set expiry
  v_expires_at := NOW() + (p_ttl_minutes || ' minutes')::INTERVAL;
  
  -- Create reservation
  INSERT INTO document_number_reservation
    (kode_dokumen, nomor, tahun, bulan, user_id, modul, expires_at)
  VALUES
    (p_kode_dokumen, v_nomor, p_tahun, p_bulan, p_user_id, p_modul, v_expires_at)
  RETURNING reserve_id INTO v_reserve_id;
  
  RETURN QUERY SELECT v_reserve_id, v_nomor, v_expires_at;
END;
$$ LANGUAGE plpgsql;

-- Function: Validasi & gunakan reservation
CREATE OR REPLACE FUNCTION use_reserved_number(
  p_reserve_id UUID,
  p_user_id UUID
) RETURNS TABLE (
  success BOOLEAN,
  nomor TEXT,
  message TEXT
) AS $$
DECLARE
  v_reservation RECORD;
  v_is_expired BOOLEAN;
BEGIN
  -- Fetch reservation
  SELECT * INTO v_reservation
  FROM document_number_reservation
  WHERE reserve_id = p_reserve_id
    AND user_id = p_user_id;
  
  -- Check if exists
  IF v_reservation IS NULL THEN
    RETURN QUERY SELECT false, NULL::TEXT, 'Reservation not found';
    RETURN;
  END IF;
  
  -- Check if already used
  IF v_reservation.used THEN
    RETURN QUERY SELECT false, NULL::TEXT, 'Reservation already used';
    RETURN;
  END IF;
  
  -- Check expiry
  v_is_expired := v_reservation.expires_at < NOW();
  
  IF v_is_expired THEN
    -- Release reservation (mark as used so it's not reused)
    UPDATE document_number_reservation
    SET used = TRUE
    WHERE reserve_id = p_reserve_id;
    
    RETURN QUERY SELECT false, NULL::TEXT, 'Reservation expired';
    RETURN;
  END IF;
  
  -- Mark as used
  UPDATE document_number_reservation
  SET used = TRUE
  WHERE reserve_id = p_reserve_id;
  
  RETURN QUERY SELECT true, v_reservation.nomor, 'Success'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Function: Cleanup expired reservations (dipanggil via cron)
CREATE OR REPLACE FUNCTION cleanup_expired_reservations()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Mark expired as used (release nomor)
  UPDATE document_number_reservation
  SET used = TRUE
  WHERE used = FALSE AND expires_at < NOW();
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- View untuk monitoring expired reservations
CREATE OR REPLACE VIEW expired_reservations AS
SELECT *
FROM document_number_reservation
WHERE used = FALSE AND expires_at < NOW();

-- Comment untuk dokumentasi
COMMENT ON TABLE document_number_reservation IS 'Reservation nomor dokumen - TTL 15 menit, cleanup setiap 6 jam';
COMMENT ON FUNCTION reserve_document_number IS 'Reserve nomor dokumen dengan TTL, return reserve_id, nomor, expires_at';
COMMENT ON FUNCTION use_reserved_number IS 'Validasi reservation dan mark as used, return success status';
COMMENT ON FUNCTION cleanup_expired_reservations IS 'Cleanup expired reservations - dipanggil via cron setiap 6 jam';