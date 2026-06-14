ALTER TABLE kwitansi ADD COLUMN IF NOT EXISTS schedule_id text REFERENCES invoice_payment_schedule(id);
ALTER TABLE kwitansi ADD COLUMN IF NOT EXISTS total numeric(18, 2);
