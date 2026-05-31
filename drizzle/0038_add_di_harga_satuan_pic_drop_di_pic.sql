ALTER TABLE di_item ADD COLUMN harga_satuan real NOT NULL DEFAULT 0;
ALTER TABLE di ADD COLUMN pic_customer_id text REFERENCES customer_pic(id);
DROP TABLE IF EXISTS di_pic;
