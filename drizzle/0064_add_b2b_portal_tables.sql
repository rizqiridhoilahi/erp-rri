-- Add B2B Portal fields to barang table
ALTER TABLE barang ADD COLUMN IF NOT EXISTS is_published_to_catalog boolean DEFAULT false;
ALTER TABLE barang ADD COLUMN IF NOT EXISTS deskripsi_katalog text;
ALTER TABLE barang ADD COLUMN IF NOT EXISTS spesifikasi_teknis jsonb;

-- Create barang_gambar table for multiple product images
CREATE TABLE IF NOT EXISTS barang_gambar (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  barang_id text NOT NULL REFERENCES barang(id) ON DELETE CASCADE,
  url text NOT NULL,
  urutan integer NOT NULL DEFAULT 0,
  is_primary boolean DEFAULT false,
  created_at timestamp DEFAULT now()
);

-- Create customer_profiles table for client registration
CREATE TABLE IF NOT EXISTS customer_profiles (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  auth_user_id text,
  customer_id text REFERENCES customers(id) ON DELETE SET NULL,
  nama_perusahaan varchar(255) NOT NULL,
  penanggung_jawab_pic varchar(150) NOT NULL,
  no_whatsapp_pic varchar(20) NOT NULL,
  alamat_perusahaan text NOT NULL,
  npwp_perusahaan varchar(25),
  status_verifikasi varchar(50) DEFAULT 'pending',
  role_internal_client varchar(50) DEFAULT 'manager',
  parent_company_id text,
  created_at timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customer_profiles_customer_id ON customer_profiles(customer_id);

-- Create customer_inquiry_cart table for temporary inquiry items
CREATE TABLE IF NOT EXISTS customer_inquiry_cart (
  id bigserial PRIMARY KEY,
  auth_user_id text,
  barang_id text REFERENCES barang(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  catatan_spesifik text,
  created_at timestamp DEFAULT now()
);
