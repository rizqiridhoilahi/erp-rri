-- Add urutan column for item sequencing in invoice PDF
ALTER TABLE invoice_item ADD COLUMN urutan integer;

-- Backfill existing rows with sequential numbering per invoice
UPDATE invoice_item AS t
SET urutan = sub.seq
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY invoice_id ORDER BY created_at, id) AS seq
  FROM invoice_item
) sub
WHERE t.id = sub.id;

-- Make urutan NOT NULL after backfill
ALTER TABLE invoice_item ALTER COLUMN urutan SET NOT NULL;
