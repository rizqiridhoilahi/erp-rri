-- Create email_log table for tracking email deliveries
CREATE TABLE IF NOT EXISTS email_log (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  to_email TEXT NOT NULL,
  to_nama TEXT,
  subject TEXT NOT NULL,
  body TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  reference_type TEXT,
  reference_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
