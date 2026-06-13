-- Migration 0056: Backfill rfq_customer status to match linked quotation
-- Fixes cases where quotation.status = 'closed' but rfq_customer.status
-- was not cascaded (e.g., status changed via PUT edit route before cascade was added)

UPDATE rfq_customer rc
SET status = 'closed', updated_at = NOW()
FROM quotation q
WHERE q.rfq_id = rc.id
  AND q.status = 'closed'
  AND rc.status NOT IN ('closed', 'Dibatalkan');

COMMENT ON TABLE rfq_customer IS 'Customer RFQ entries with status synced to linked quotation via PUT cascade';

