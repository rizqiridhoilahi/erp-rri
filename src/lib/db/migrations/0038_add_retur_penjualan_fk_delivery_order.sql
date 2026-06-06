-- Add missing FK constraint to retur_penjualan.delivery_order_id
-- This enables PostgREST to resolve the delivery_order!delivery_order_id join
ALTER TABLE retur_penjualan
  ADD CONSTRAINT fk_retur_penjualan_delivery_order_id
  FOREIGN KEY (delivery_order_id) REFERENCES delivery_order(id) ON DELETE SET NULL;
