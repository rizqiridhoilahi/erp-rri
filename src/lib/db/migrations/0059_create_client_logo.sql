CREATE TABLE IF NOT EXISTS client_logo (
  id         text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  alt_text   text NOT NULL,
  file_url   text NOT NULL,
  urutan     integer NOT NULL DEFAULT 0,
  is_active  boolean NOT NULL DEFAULT true,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);
