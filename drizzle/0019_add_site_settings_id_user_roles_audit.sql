-- L4: Add id + createdAt to site_settings; make key unique
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS id text DEFAULT gen_random_uuid()::text;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE site_settings DROP CONSTRAINT IF EXISTS site_settings_pkey CASCADE;
ALTER TABLE site_settings ADD PRIMARY KEY (id);
ALTER TABLE site_settings ADD CONSTRAINT site_settings_key_unique UNIQUE (key);

-- L5: Add updatedAt + isActive to user_roles
ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true NOT NULL;
