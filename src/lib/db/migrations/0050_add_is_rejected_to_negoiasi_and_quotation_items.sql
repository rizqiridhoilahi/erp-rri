ALTER TABLE negoiasi_item ADD COLUMN is_rejected boolean NOT NULL DEFAULT false;
ALTER TABLE quotation_item ADD COLUMN is_rejected boolean NOT NULL DEFAULT false;
