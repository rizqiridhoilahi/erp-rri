-- Add missing FK constraint to grn_customer.retur_penjualan_id
-- This enables PostgREST to resolve the retur_penjualan!retur_penjualan_id join
ALTER TABLE grn_customer
  ADD CONSTRAINT fk_grn_customer_retur_penjualan_id
  FOREIGN KEY (retur_penjualan_id) REFERENCES retur_penjualan(id) ON DELETE SET NULL;
