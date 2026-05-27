ALTER TABLE rfq_customer ADD CONSTRAINT fk_rfq_customer_customer_id
  FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE RESTRICT;
