-- Add snapshot columns to retur_penjualan_item for consistency with grn_customer_item
ALTER TABLE retur_penjualan_item ADD COLUMN nama_barang text;
ALTER TABLE retur_penjualan_item ADD COLUMN kode_barang text;
ALTER TABLE retur_penjualan_item ADD COLUMN satuan text;
