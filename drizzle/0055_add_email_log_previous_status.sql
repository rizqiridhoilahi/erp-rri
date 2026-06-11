-- Migration 0055: Add previous_status column to email_log
-- Stores original status before trashing, used for proper restore

ALTER TABLE email_log ADD COLUMN IF NOT EXISTS previous_status TEXT;

COMMENT ON COLUMN email_log.previous_status IS 'Original status before trashing, used to restore email to its prior status';