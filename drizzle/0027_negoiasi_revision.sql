ALTER TABLE negoiasi ADD COLUMN IF NOT EXISTS revision integer NOT NULL DEFAULT 1;
ALTER TABLE negoiasi_item ADD COLUMN IF NOT EXISTS harga_satuan_lama real;
ALTER TABLE negoiasi_item ADD COLUMN IF NOT EXISTS diskon_lama real;
