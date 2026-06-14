ALTER TABLE invoice_payment ADD COLUMN IF NOT EXISTS schedule_id text REFERENCES invoice_payment_schedule(id);
