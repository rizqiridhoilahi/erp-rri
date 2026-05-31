CREATE TABLE IF NOT EXISTS kendaraan (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  nama text NOT NULL,
  no_polisi text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);
