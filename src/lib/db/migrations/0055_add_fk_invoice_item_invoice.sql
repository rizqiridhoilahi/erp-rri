ALTER TABLE invoice_item
  ADD CONSTRAINT fk_invoice_item_invoice
  FOREIGN KEY (invoice_id) REFERENCES invoice(id) ON DELETE CASCADE;
