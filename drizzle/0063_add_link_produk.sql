-- Add link_produk column to barang table
ALTER TABLE barang ADD COLUMN IF NOT EXISTS link_produk text;

-- Add link_produk column to quotation_item table
ALTER TABLE quotation_item ADD COLUMN IF NOT EXISTS link_produk text;
