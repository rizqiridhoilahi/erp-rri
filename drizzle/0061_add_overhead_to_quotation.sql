ALTER TABLE quotation ADD COLUMN IF NOT EXISTS overhead_biaya real DEFAULT 0;
ALTER TABLE quotation ADD COLUMN IF NOT EXISTS overhead_metode text DEFAULT 'quantity';
ALTER TABLE quotation_item ADD COLUMN IF NOT EXISTS harga_beli real DEFAULT 0;
ALTER TABLE quotation_item ADD COLUMN IF NOT EXISTS overhead_per_unit real DEFAULT 0;
