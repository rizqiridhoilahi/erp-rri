-- 0024: Fix GRN-Invoice relationship + add Delivery Slip fields to DO

-- Add invoice_id to grn table
ALTER TABLE grn ADD COLUMN invoice_id text REFERENCES invoice(id);

-- Remove nomor_grn from invoice table
ALTER TABLE invoice DROP COLUMN nomor_grn;

-- Add delivery slip fields to delivery_order
ALTER TABLE delivery_order ADD COLUMN delivery_slip_nomor text;
ALTER TABLE delivery_order ADD COLUMN delivery_slip_file_url text;
