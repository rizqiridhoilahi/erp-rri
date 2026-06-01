-- Add grn_customer_nomor column to invoice table for customer GRN reference
ALTER TABLE invoice ADD COLUMN grn_customer_nomor text;
