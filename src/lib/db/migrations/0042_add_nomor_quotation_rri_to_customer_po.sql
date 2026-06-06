-- Migration: Add nomor_quotation_rri to customer_po table
ALTER TABLE customer_po ADD COLUMN IF NOT EXISTS nomor_quotation_rri TEXT;
