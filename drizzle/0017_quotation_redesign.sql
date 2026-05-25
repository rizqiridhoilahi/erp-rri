-- Add justification & image_url to barang
ALTER TABLE barang ADD COLUMN IF NOT EXISTS justification text;
ALTER TABLE barang ADD COLUMN IF NOT EXISTS image_url text;

-- Add columns to quotation
ALTER TABLE quotation ADD COLUMN IF NOT EXISTS rfq_id text;
ALTER TABLE quotation ADD COLUMN IF NOT EXISTS referensi text;
ALTER TABLE quotation ADD COLUMN IF NOT EXISTS lampiran text;
ALTER TABLE quotation ADD COLUMN IF NOT EXISTS perihal text NOT NULL DEFAULT 'Penawaran Harga';
ALTER TABLE quotation ADD COLUMN IF NOT EXISTS pic_customer_id text;
ALTER TABLE quotation ADD COLUMN IF NOT EXISTS alamat text;
ALTER TABLE quotation ADD COLUMN IF NOT EXISTS masa_berlaku text;
ALTER TABLE quotation ADD COLUMN IF NOT EXISTS tanggal_berlaku_sampai date;
ALTER TABLE quotation ADD COLUMN IF NOT EXISTS ppn_enabled boolean NOT NULL DEFAULT true;
ALTER TABLE quotation ADD COLUMN IF NOT EXISTS total_harga real;
ALTER TABLE quotation ADD COLUMN IF NOT EXISTS keterangan text;

-- Add columns to quotation_item
ALTER TABLE quotation_item ADD COLUMN IF NOT EXISTS specification text;
ALTER TABLE quotation_item ADD COLUMN IF NOT EXISTS justification text;
ALTER TABLE quotation_item ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE quotation_item ADD COLUMN IF NOT EXISTS satuan text;
ALTER TABLE quotation_item ADD COLUMN IF NOT EXISTS total_harga real;
