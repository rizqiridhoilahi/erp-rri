ALTER TABLE rfq_customer_item ADD COLUMN urutan integer;
ALTER TABLE quotation_item ADD COLUMN urutan integer;
ALTER TABLE customer_po_item ADD COLUMN urutan integer;
ALTER TABLE sales_order_item ADD COLUMN urutan integer;

UPDATE rfq_customer_item SET urutan = t.urutan FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY rfq_customer_id ORDER BY created_at, id) AS urutan
  FROM rfq_customer_item
) t WHERE rfq_customer_item.id = t.id;

UPDATE quotation_item SET urutan = t.urutan FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY quotation_id ORDER BY created_at, id) AS urutan
  FROM quotation_item
) t WHERE quotation_item.id = t.id;

UPDATE customer_po_item SET urutan = t.urutan FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY customer_po_id ORDER BY created_at, id) AS urutan
  FROM customer_po_item
) t WHERE customer_po_item.id = t.id;

UPDATE sales_order_item SET urutan = t.urutan FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY sales_order_id ORDER BY created_at, id) AS urutan
  FROM sales_order_item
) t WHERE sales_order_item.id = t.id;
