-- Add missing FK constraint to grn_customer_item.barang_id
-- Both columns are text type (barang.id is text, not uuid)
-- This enables PostgREST to resolve the barang!barang_id join
ALTER TABLE grn_customer_item
  ADD CONSTRAINT fk_grn_customer_item_barang_id
  FOREIGN KEY (barang_id) REFERENCES barang(id) ON DELETE RESTRICT;
