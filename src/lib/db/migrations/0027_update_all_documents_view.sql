-- Update all_documents view:
-- 1. Add recordId column (parent record ID for PDF generation)
-- 2. Add delivery_order_document, delivery_slip, grn_customer_document, kwitansi_document

CREATE OR REPLACE VIEW all_documents AS

SELECT
  d.id,
  d.file_name AS "fileName",
  d.file_url AS "fileUrl",
  d.drive_file_id AS "driveFileId",
  d.uploaded_at AS "uploadedAt",
  'RFQ Customer' AS modul,
  p.nomor AS "nomorDokumen",
  p.id AS "recordId",
  p.customer_id AS "customerId",
  c.nama AS "customerNama"
FROM rfq_customer_document d
JOIN rfq_customer p ON p.id = d.rfq_customer_id
JOIN customer c ON c.id = p.customer_id

UNION ALL

SELECT
  d.id,
  d.file_name,
  d.file_url,
  d.drive_file_id,
  d.uploaded_at,
  'Quotation',
  p.nomor,
  p.id,
  p.customer_id,
  c.nama
FROM quotation_document d
JOIN quotation p ON p.id = d.quotation_id
JOIN customer c ON c.id = p.customer_id

UNION ALL

SELECT
  d.id,
  d.file_name,
  d.file_url,
  d.drive_file_id,
  d.uploaded_at,
  'Customer PO',
  p.nomor,
  p.id,
  p.customer_id,
  c.nama
FROM customer_po_document d
JOIN customer_po p ON p.id = d.customer_po_id
JOIN customer c ON c.id = p.customer_id

UNION ALL

SELECT
  d.id,
  d.file_name,
  d.file_url,
  d.drive_file_id,
  d.uploaded_at,
  'DI',
  p.nomor,
  p.id,
  p.customer_id,
  c.nama
FROM di_document d
JOIN di p ON p.id = d.di_id
JOIN customer c ON c.id = p.customer_id

UNION ALL

SELECT
  d.id,
  d.file_name,
  d.file_url,
  d.drive_file_id,
  d.uploaded_at,
  'Invoice',
  p.nomor,
  p.id,
  p.customer_id,
  c.nama
FROM invoice_document d
JOIN invoice p ON p.id = d.invoice_id
JOIN customer c ON c.id = p.customer_id

UNION ALL

SELECT
  d.id,
  d.file_name,
  d.file_url,
  d.drive_file_id,
  d.uploaded_at,
  'Retur Penjualan',
  p.nomor,
  p.id,
  p.customer_id,
  c.nama
FROM retur_penjualan_document d
JOIN retur_penjualan p ON p.id = d.retur_penjualan_id
JOIN customer c ON c.id = p.customer_id

UNION ALL

SELECT
  d.id,
  d.file_name,
  d.file_url,
  d.drive_file_id,
  d.uploaded_at,
  'Kontrak',
  COALESCE(p.nomor_kontrak, ''),
  p.id,
  p.customer_id,
  c.nama
FROM kontrak_file d
JOIN kontrak p ON p.id = d.kontrak_id
JOIN customer c ON c.id = p.customer_id

UNION ALL

-- Delivery Order documents
SELECT
  d.id,
  d.file_name,
  d.file_url,
  d.drive_file_id,
  d.uploaded_at,
  'Delivery Order',
  p.nomor,
  p.id,
  COALESCE(cpo.customer_id, di_.customer_id) AS "customerId",
  COALESCE(c1.nama, c2.nama) AS "customerNama"
FROM delivery_order_document d
JOIN delivery_order p ON p.id = d.delivery_order_id
LEFT JOIN sales_order so ON so.id = p.sales_order_id
LEFT JOIN customer_po cpo ON cpo.id = so.customer_po_id
LEFT JOIN customer c1 ON c1.id = cpo.customer_id
LEFT JOIN di di_ ON di_.id = so.di_id
LEFT JOIN customer c2 ON c2.id = di_.customer_id

UNION ALL

-- Delivery Slip (from delivery_order.delivery_slip_file_url)
SELECT
  'dslip-' || p.id AS id,
  'Delivery Slip - ' || COALESCE(p.delivery_slip_nomor, p.nomor) AS "fileName",
  p.delivery_slip_file_url AS "fileUrl",
  NULL AS "driveFileId",
  p.updated_at AS "uploadedAt",
  'Delivery Slip' AS modul,
  p.nomor AS "nomorDokumen",
  p.id AS "recordId",
  COALESCE(cpo.customer_id, di_.customer_id) AS "customerId",
  COALESCE(c1.nama, c2.nama) AS "customerNama"
FROM delivery_order p
LEFT JOIN sales_order so ON so.id = p.sales_order_id
LEFT JOIN customer_po cpo ON cpo.id = so.customer_po_id
LEFT JOIN customer c1 ON c1.id = cpo.customer_id
LEFT JOIN di di_ ON di_.id = so.di_id
LEFT JOIN customer c2 ON c2.id = di_.customer_id
WHERE p.delivery_slip_file_url IS NOT NULL

UNION ALL

-- GRN Customer documents
SELECT
  d.id,
  d.file_name,
  d.file_url,
  d.drive_file_id,
  d.uploaded_at,
  'GRN Customer',
  p.nomor,
  p.id,
  p.customer_id,
  c.nama
FROM grn_customer_document d
JOIN grn_customer p ON p.id = d.grn_customer_id
JOIN customer c ON c.id = p.customer_id

UNION ALL

-- Kwitansi documents
SELECT
  d.id,
  d.file_name,
  d.file_url,
  d.drive_file_id,
  d.uploaded_at,
  'Kwitansi',
  p.nomor,
  p.id,
  i.customer_id AS "customerId",
  c.nama AS "customerNama"
FROM kwitansi_document d
JOIN kwitansi p ON p.id = d.kwitansi_id
LEFT JOIN invoice i ON i.id = p.invoice_id
LEFT JOIN customer c ON c.id = i.customer_id;
