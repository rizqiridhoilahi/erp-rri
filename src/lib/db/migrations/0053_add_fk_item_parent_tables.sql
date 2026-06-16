ALTER TABLE rfq_customer_item
  ADD CONSTRAINT fk_rfq_customer_item_rfq_customer
  FOREIGN KEY (rfq_customer_id) REFERENCES rfq_customer(id) ON DELETE CASCADE;

ALTER TABLE quotation_item
  ADD CONSTRAINT fk_quotation_item_quotation
  FOREIGN KEY (quotation_id) REFERENCES quotation(id) ON DELETE CASCADE;
