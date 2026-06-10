-- Migration: add_email_attachments_table
-- Created: 2026-06-09

CREATE TABLE IF NOT EXISTS email_attachments (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email_id text NOT NULL REFERENCES email_log(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_size integer,
  mime_type text,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS email_attachments_email_id_idx ON email_attachments(email_id);