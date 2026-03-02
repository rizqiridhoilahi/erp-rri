-- =====================================================
-- ERP RRI Database Migration Script (Idempotent Version)
-- PT. Rizqi Ridho Ilahi
-- Version: 1.1
-- Last Updated: 2 Maret 2026
-- =====================================================

-- NOTE: Script ini aman dijalankan berkali-kali karena menggunakan IF NOT EXISTS dan ON CONFLICT

-- =====================================================
-- SECTION 1: EXTENSIONS
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgvector for AI semantic search
CREATE EXTENSION IF NOT EXISTS "vector";

-- Enable pgcrypto for password hashing if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- =====================================================
-- SECTION 2: MASTER DATA TABLES
-- =====================================================

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    brand TEXT,
    category TEXT,
    description TEXT,
    purchase_price NUMERIC(15, 2) DEFAULT 0,
    selling_price NUMERIC(15, 2) DEFAULT 0,
    stock INT DEFAULT 0,
    unit TEXT DEFAULT 'pcs',
    status TEXT DEFAULT 'stocked' CHECK (status IN ('stocked', 'indent')),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Services Table
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT,
    description TEXT,
    selling_price NUMERIC(15, 2) DEFAULT 0,
    unit TEXT DEFAULT 'pcs',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Customers Table (Check if exists, if not create with new fields)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customers') THEN
        CREATE TABLE customers (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            code TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            type TEXT NOT NULL CHECK (type IN ('perorangan', 'bisnis')),
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            address TEXT NOT NULL,
            city TEXT NOT NULL,
            province TEXT,
            postal_code TEXT,
            country TEXT DEFAULT 'Indonesia',
            tax_id TEXT,
            tax_name TEXT,
            tax_address TEXT,
            company_name TEXT,
            pic_name TEXT,
            pic_email TEXT,
            pic_phone TEXT,
            storage_address_1 TEXT,
            storage_address_2 TEXT,
            storage_address_3 TEXT,
            storage_address_4 TEXT,
            storage_address_5 TEXT,
            has_contract BOOLEAN DEFAULT FALSE,
            contract_id UUID,
            contract_number TEXT,
            contract_file_url TEXT,
            notes TEXT,
            status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            created_by UUID REFERENCES auth.users(id),
            deleted_at TIMESTAMP WITH TIME ZONE
        );
    END IF;
END $$;

-- Add new columns to existing customers table if they don't exist
DO $$ 
BEGIN
    -- Add missing columns one by one
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'code') THEN
        ALTER TABLE customers ADD COLUMN code TEXT UNIQUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'province') THEN
        ALTER TABLE customers ADD COLUMN province TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'postal_code') THEN
        ALTER TABLE customers ADD COLUMN postal_code TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'country') THEN
        ALTER TABLE customers ADD COLUMN country TEXT DEFAULT 'Indonesia';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'tax_name') THEN
        ALTER TABLE customers ADD COLUMN tax_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'tax_address') THEN
        ALTER TABLE customers ADD COLUMN tax_address TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'company_name') THEN
        ALTER TABLE customers ADD COLUMN company_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'pic_name') THEN
        ALTER TABLE customers ADD COLUMN pic_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'pic_email') THEN
        ALTER TABLE customers ADD COLUMN pic_email TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'pic_phone') THEN
        ALTER TABLE customers ADD COLUMN pic_phone TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'storage_address_1') THEN
        ALTER TABLE customers ADD COLUMN storage_address_1 TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'storage_address_2') THEN
        ALTER TABLE customers ADD COLUMN storage_address_2 TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'storage_address_3') THEN
        ALTER TABLE customers ADD COLUMN storage_address_3 TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'storage_address_4') THEN
        ALTER TABLE customers ADD COLUMN storage_address_4 TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'storage_address_5') THEN
        ALTER TABLE customers ADD COLUMN storage_address_5 TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'has_contract') THEN
        ALTER TABLE customers ADD COLUMN has_contract BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'contract_id') THEN
        ALTER TABLE customers ADD COLUMN contract_id UUID;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'contract_number') THEN
        ALTER TABLE customers ADD COLUMN contract_number TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'contract_file_url') THEN
        ALTER TABLE customers ADD COLUMN contract_file_url TEXT;
    END IF;
END $$;

-- Customers Contracts Table (NEW)
CREATE TABLE IF NOT EXISTS customers_contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    contract_number TEXT UNIQUE,
    contract_date DATE,
    start_date DATE,
    end_date DATE,
    description TEXT,
    file_url TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'terminated')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id)
);

-- Add FK constraint for contract_id if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_customers_contract'
    ) THEN
        ALTER TABLE customers 
        ADD CONSTRAINT fk_customers_contract 
        FOREIGN KEY (contract_id) REFERENCES customers_contracts(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Customer Product Contracts Table
CREATE TABLE IF NOT EXISTS customer_product_contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    contract_id UUID REFERENCES customers_contracts(id) ON DELETE SET NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    contract_price NUMERIC(15, 2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id)
);

-- Suppliers Table
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    province TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'Indonesia',
    type TEXT DEFAULT 'local' CHECK (type IN ('local', 'international')),
    bank_info TEXT,
    notes TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Add missing columns to suppliers if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'suppliers' AND column_name = 'code') THEN
        ALTER TABLE suppliers ADD COLUMN code TEXT UNIQUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'suppliers' AND column_name = 'province') THEN
        ALTER TABLE suppliers ADD COLUMN province TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'suppliers' AND column_name = 'postal_code') THEN
        ALTER TABLE suppliers ADD COLUMN postal_code TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'suppliers' AND column_name = 'country') THEN
        ALTER TABLE suppliers ADD COLUMN country TEXT DEFAULT 'Indonesia';
    END IF;
END $$;


-- =====================================================
-- SECTION 3: SALES MODULE TABLES
-- =====================================================

-- Quotations Table
CREATE TABLE IF NOT EXISTS quotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_number TEXT UNIQUE NOT NULL,
    quotation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_days INT DEFAULT 30,
    delivery_days INT DEFAULT 7,
    rfq_number TEXT,
    rfq_subject TEXT,
    customer_id UUID REFERENCES customers(id),
    subtotal NUMERIC(15, 2) DEFAULT 0,
    tax_amount NUMERIC(15, 2) DEFAULT 0,
    total_amount NUMERIC(15, 2) DEFAULT 0,
    use_tax BOOLEAN DEFAULT FALSE,
    use_attachment BOOLEAN DEFAULT FALSE,
    notes TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
    rfq_document_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Quotation Items Table
CREATE TABLE IF NOT EXISTS quotation_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_id UUID REFERENCES quotations(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price_per_unit NUMERIC(15, 2) NOT NULL DEFAULT 0,
    total_price NUMERIC(15, 2) NOT NULL DEFAULT 0,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sales Orders Table
CREATE TABLE IF NOT EXISTS sales_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    so_number TEXT UNIQUE NOT NULL,
    quotation_id UUID REFERENCES quotations(id) ON DELETE SET NULL,
    sales_order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    customer_id UUID REFERENCES customers(id),
    subtotal NUMERIC(15, 2) DEFAULT 0,
    tax_amount NUMERIC(15, 2) DEFAULT 0,
    total_amount NUMERIC(15, 2) DEFAULT 0,
    use_tax BOOLEAN DEFAULT FALSE,
    notes TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    is_contract_based BOOLEAN DEFAULT FALSE,
    customer_po_number TEXT,
    customer_po_url TEXT,
    customer_delivery_slip_url TEXT,
    signed_po_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Sales Order Items Table
CREATE TABLE IF NOT EXISTS sales_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sales_order_id UUID REFERENCES sales_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price_per_unit NUMERIC(15, 2) NOT NULL DEFAULT 0,
    total_price NUMERIC(15, 2) NOT NULL DEFAULT 0,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Delivery Orders Table
CREATE TABLE IF NOT EXISTS delivery_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    do_number TEXT UNIQUE NOT NULL,
    sales_order_id UUID REFERENCES sales_orders(id) ON DELETE CASCADE,
    shipping_date DATE NOT NULL DEFAULT CURRENT_DATE,
    recipient_name TEXT,
    recipient_address TEXT,
    recipient_phone TEXT,
    notes TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'shipped', 'delivered', 'cancelled')),
    signed_do_url TEXT,
    customer_grn_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Delivery Order Items Table
CREATE TABLE IF NOT EXISTS delivery_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    delivery_order_id UUID REFERENCES delivery_orders(id) ON DELETE CASCADE,
    sales_order_item_id UUID REFERENCES sales_order_items(id) ON DELETE CASCADE,
    quantity_shipped INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- =====================================================
-- SECTION 4: FINANCE MODULE TABLES
-- =====================================================

-- Chart of Accounts Table
CREATE TABLE IF NOT EXISTS chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_code TEXT UNIQUE NOT NULL,
    account_name TEXT NOT NULL,
    account_type TEXT NOT NULL CHECK (account_type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
    parent_id UUID REFERENCES chart_of_accounts(id) ON DELETE SET NULL,
    level INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    is_posting BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id)
);

-- General Ledger Table
CREATE TABLE IF NOT EXISTS general_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    transaction_type TEXT NOT NULL,
    transaction_id UUID NOT NULL,
    transaction_number TEXT NOT NULL,
    account_id UUID REFERENCES chart_of_accounts(id),
    debit NUMERIC(15, 2) DEFAULT 0,
    credit NUMERIC(15, 2) DEFAULT 0,
    description TEXT,
    reference TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Journal Entries Table
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journal_number TEXT UNIQUE NOT NULL,
    journal_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    total_debit NUMERIC(15, 2) DEFAULT 0,
    total_credit NUMERIC(15, 2) DEFAULT 0,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'void')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Journal Entry Lines Table
CREATE TABLE IF NOT EXISTS journal_entry_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journal_entry_id UUID REFERENCES journal_entries(id) ON DELETE CASCADE,
    account_id UUID REFERENCES chart_of_accounts(id),
    debit NUMERIC(15, 2) DEFAULT 0,
    credit NUMERIC(15, 2) DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number TEXT UNIQUE NOT NULL,
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    sales_order_id UUID REFERENCES sales_orders(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES customers(id),
    subtotal NUMERIC(15, 2) DEFAULT 0,
    tax_amount NUMERIC(15, 2) DEFAULT 0,
    total_amount NUMERIC(15, 2) DEFAULT 0,
    amount_paid NUMERIC(15, 2) DEFAULT 0,
    notes TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'partial', 'paid', 'overdue', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Invoice Payments Table
CREATE TABLE IF NOT EXISTS invoice_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount NUMERIC(15, 2) NOT NULL,
    payment_method TEXT,
    reference_number TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- =====================================================
-- SECTION 5: AI MODULE TABLES
-- =====================================================

-- AI Conversations Table
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    conversation_name TEXT,
    mode TEXT DEFAULT 'personal' CHECK (mode IN ('personal', 'shared')),
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI Messages Table
CREATE TABLE IF NOT EXISTS ai_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    prompt TEXT NOT NULL,
    response TEXT,
    tokens_used INT DEFAULT 0,
    temperature NUMERIC(3, 2) DEFAULT 0.7,
    context_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI Knowledge Base Table
CREATE TABLE IF NOT EXISTS ai_knowledge_base (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_name TEXT NOT NULL,
    document_type TEXT DEFAULT 'CUSTOM' CHECK (document_type IN ('SOP', 'FAQ', 'CUSTOM')),
    content TEXT NOT NULL,
    embedding VECTOR(1536),
    file_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI Analysis Cache Table
CREATE TABLE IF NOT EXISTS ai_analysis_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_type TEXT NOT NULL CHECK (analysis_type IN ('sales_trend', 'inventory', 'customer_churn', 'forecast')),
    result_json JSONB NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
);


-- =====================================================
-- SECTION 6: SYSTEM TABLES
-- =====================================================

-- Transaction Sequences Table
CREATE TABLE IF NOT EXISTS transaction_sequences (
    year INT NOT NULL,
    prefix TEXT NOT NULL,
    last_sequence INT DEFAULT 0,
    PRIMARY KEY (year, prefix)
);

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    role TEXT DEFAULT 'sales' CHECK (role IN ('admin', 'sales', 'finance', 'warehouse', 'customer_service')),
    avatar_url TEXT,
    preferences JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    old_value JSONB,
    new_value JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP WITH TIME ZONE
);


-- =====================================================
-- SECTION 7: TRIGGERS
-- =====================================================

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables (will not fail if trigger exists)
CREATE OR REPLACE FUNCTION create_trigger_if_not_exists()
RETURNS VOID AS $$
DECLARE
    trigger_name TEXT;
    table_name TEXT;
BEGIN
    -- Products
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_products_updated_at') THEN
        CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Services
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_services_updated_at') THEN
        CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Customers
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_customers_updated_at') THEN
        CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Customers Contracts
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_customers_contracts_updated_at') THEN
        CREATE TRIGGER update_customers_contracts_updated_at BEFORE UPDATE ON customers_contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Customer Product Contracts
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_customer_product_contracts_updated_at') THEN
        CREATE TRIGGER update_customer_product_contracts_updated_at BEFORE UPDATE ON customer_product_contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Suppliers
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_suppliers_updated_at') THEN
        CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Quotations
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_quotations_updated_at') THEN
        CREATE TRIGGER update_quotations_updated_at BEFORE UPDATE ON quotations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Sales Orders
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_sales_orders_updated_at') THEN
        CREATE TRIGGER update_sales_orders_updated_at BEFORE UPDATE ON sales_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Delivery Orders
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_delivery_orders_updated_at') THEN
        CREATE TRIGGER update_delivery_orders_updated_at BEFORE UPDATE ON delivery_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Chart of Accounts
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_chart_of_accounts_updated_at') THEN
        CREATE TRIGGER update_chart_of_accounts_updated_at BEFORE UPDATE ON chart_of_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- General Ledger
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_general_ledger_updated_at') THEN
        CREATE TRIGGER update_general_ledger_updated_at BEFORE UPDATE ON general_ledger FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Journal Entries
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_journal_entries_updated_at') THEN
        CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON journal_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Invoices
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_invoices_updated_at') THEN
        CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- AI Conversations
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_ai_conversations_updated_at') THEN
        CREATE TRIGGER update_ai_conversations_updated_at BEFORE UPDATE ON ai_conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- AI Knowledge Base
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_ai_knowledge_base_updated_at') THEN
        CREATE TRIGGER update_ai_knowledge_base_updated_at BEFORE UPDATE ON ai_knowledge_base FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- User Profiles
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_user_profiles_updated_at') THEN
        CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END;
$$ LANGUAGE plpgsql;

SELECT create_trigger_if_not_exists();


-- =====================================================
-- SECTION 8: RPC FUNCTIONS
-- =====================================================

-- Generate Transaction Number
CREATE OR REPLACE FUNCTION generate_transaction_number(
  p_prefix TEXT,
  p_year INT
)
RETURNS TEXT AS $$
DECLARE
  v_sequence INT;
  v_number TEXT;
BEGIN
  INSERT INTO transaction_sequences (year, prefix, last_sequence)
  VALUES (p_year, p_prefix, 1)
  ON CONFLICT (year, prefix) 
  DO UPDATE SET last_sequence = transaction_sequences.last_sequence + 1
  RETURNING transaction_sequences.last_sequence INTO v_sequence;

  v_number := p_prefix || '-' || RIGHT(p_year::TEXT, 2) || '-' || LPAD(v_sequence::TEXT, 5, '0');
  
  RETURN v_number;
END;
$$ LANGUAGE plpgsql;

-- Get Product Price with Contract
CREATE OR REPLACE FUNCTION get_product_price(
  p_customer_id UUID,
  p_product_id UUID
)
RETURNS NUMERIC AS $$
DECLARE
  v_price NUMERIC;
  v_contract_price NUMERIC;
BEGIN
  SELECT contract_price INTO v_contract_price
  FROM customer_product_contracts
  WHERE customer_id = p_customer_id
    AND product_id = p_product_id
    AND start_date <= CURRENT_DATE
    AND end_date >= CURRENT_DATE
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_contract_price IS NOT NULL THEN
    RETURN v_contract_price;
  END IF;

  SELECT selling_price INTO v_price
  FROM products
  WHERE id = p_product_id;

  RETURN COALESCE(v_price, 0);
END;
$$ LANGUAGE plpgsql;

-- Calculate Quotation Total
CREATE OR REPLACE FUNCTION calculate_quotation_total(
  p_quotation_id UUID,
  p_use_tax BOOLEAN
)
RETURNS TABLE(
  subtotal NUMERIC,
  tax_amount NUMERIC,
  total_amount NUMERIC
) AS $$
DECLARE
  v_subtotal NUMERIC;
  v_tax NUMERIC;
  v_total NUMERIC;
BEGIN
  SELECT COALESCE(SUM(quantity * price_per_unit), 0)
  INTO v_subtotal
  FROM quotation_items
  WHERE quotation_id = p_quotation_id;

  IF p_use_tax THEN
    v_tax := v_subtotal * 0.11;
  ELSE
    v_tax := 0;
  END IF;

  v_total := v_subtotal + v_tax;

  RETURN QUERY SELECT v_subtotal, v_tax, v_total;
END;
$$ LANGUAGE plpgsql;


-- =====================================================
-- SECTION 9: ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables (if not already enabled)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_product_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE general_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entry_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;


-- =====================================================
-- SECTION 10: STORAGE BUCKETS
-- =====================================================

-- Insert storage buckets (will not fail if exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('products', 'products', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('documents', 'documents', false, 52428800, NULL),
  ('quotations', 'quotations', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
  ('sales-orders', 'sales-orders', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
  ('delivery-orders', 'delivery-orders', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
  ('invoices', 'invoices', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
  ('contracts', 'contracts', false, 52428800, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO NOTHING;


-- =====================================================
-- SECTION 11: SEED DATA
-- =====================================================

-- Insert default transaction sequences
INSERT INTO transaction_sequences (year, prefix, last_sequence)
VALUES 
  (2026, 'RRI-SPH', 0),
  (2026, 'RRI-SO', 0),
  (2026, 'RRI-DO', 0),
  (2026, 'RRI-INV', 0),
  (2026, 'RRI-JE', 0)
ON CONFLICT (year, prefix) DO NOTHING;

-- Insert default chart of accounts (will not fail if exists)
INSERT INTO chart_of_accounts (id, account_code, account_name, account_type, level, is_active, is_posting)
VALUES 
  (uuid_generate_v4(), '1-1000', 'Kas', 'asset', 1, true, true),
  (uuid_generate_v4(), '1-1100', 'Piutang Dagang', 'asset', 1, true, true),
  (uuid_generate_v4(), '1-1200', 'Persediaan', 'asset', 1, true, true),
  (uuid_generate_v4(), '1-1300', 'Aset Tetap', 'asset', 1, true, true),
  (uuid_generate_v4(), '2-1000', 'Utang Dagang', 'liability', 1, true, true),
  (uuid_generate_v4(), '2-2000', 'Utang Pajak', 'liability', 1, true, true),
  (uuid_generate_v4(), '3-1000', 'Modal', 'equity', 1, true, true),
  (uuid_generate_v4(), '4-1000', 'Pendapatan Penjualan', 'revenue', 1, true, true),
  (uuid_generate_v4(), '4-2000', 'Pendapatan Jasa', 'revenue', 1, true, true),
  (uuid_generate_v4(), '5-1000', 'Harga Pokok Penjualan', 'expense', 1, true, true),
  (uuid_generate_v4(), '5-2000', 'Beban Operasional', 'expense', 1, true, true),
  (uuid_generate_v4(), '5-3000', 'Beban Pajak', 'expense', 1, true, true)
ON CONFLICT (account_code) DO NOTHING;


-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

SELECT 'Database migration completed successfully!' AS message;

-- List all tables
SELECT 
    table_name,
    table_type 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
