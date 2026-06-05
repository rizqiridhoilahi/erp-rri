CREATE TABLE IF NOT EXISTS payment_term (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  nama text NOT NULL UNIQUE,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS payment_term_item (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  payment_term_id text NOT NULL REFERENCES payment_term(id) ON DELETE CASCADE,
  urutan integer NOT NULL,
  deskripsi text NOT NULL,
  persentase numeric(5,2) NOT NULL,
  due_days integer NOT NULL DEFAULT 0,
  created_at timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS invoice_payment_schedule (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  invoice_id text NOT NULL REFERENCES invoice(id) ON DELETE CASCADE,
  urutan integer NOT NULL,
  deskripsi text NOT NULL,
  persentase numeric(5,2) NOT NULL,
  jumlah numeric(18,2) NOT NULL,
  due_date timestamp,
  status text DEFAULT 'pending' NOT NULL,
  paid_amount numeric(18,2) DEFAULT 0,
  created_at timestamp DEFAULT now() NOT NULL
);

ALTER TABLE customer ADD COLUMN IF NOT EXISTS payment_term_id text REFERENCES payment_term(id);
ALTER TABLE customer_po ADD COLUMN IF NOT EXISTS payment_term_id text REFERENCES payment_term(id);
ALTER TABLE di ADD COLUMN IF NOT EXISTS payment_term_id text REFERENCES payment_term(id);

CREATE INDEX IF NOT EXISTS idx_payment_term_item_term_id ON payment_term_item(payment_term_id);
CREATE INDEX IF NOT EXISTS idx_invoice_payment_schedule_invoice_id ON invoice_payment_schedule(invoice_id);
