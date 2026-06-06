-- Migration: Create customer_prompt table
-- Description: Stores Gemini AI prompt templates per customer for PO import feature

CREATE TABLE IF NOT EXISTS customer_prompt (
  customer_id TEXT PRIMARY KEY REFERENCES customer(id) ON DELETE CASCADE,
  prompt_template TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE customer_prompt ENABLE ROW LEVEL SECURITY;

-- Grant access
GRANT ALL ON customer_prompt TO authenticated, service_role;

-- Create index for active prompts
CREATE INDEX idx_customer_prompt_active ON customer_prompt(is_active)
WHERE is_active = TRUE;
