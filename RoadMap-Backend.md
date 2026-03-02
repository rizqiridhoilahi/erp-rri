# Backend Development Roadmap - ERP RRI
## PT. Rizqi Ridho Ilahi (dengan RRI AI Chatbot)

**Version:** 1.0  
**Last Updated:** 2 Maret 2026  
**Stack:** Supabase (PostgreSQL), Edge Functions, RPC, pgvector

---

## 📋 Daftar Isi
1. [Arsitektur Database](#arsitektur-database)
2. [Struktur Tabel](#struktur-tabel)
3. [Phase-by-Phase Development Roadmap](#phase-by-phase-development-roadmap)
4. [API Endpoints](#api-endpoints)
5. [RPC Functions](#rpc-functions)
6. [Triggers & Automation](#triggers--automation)
7. [Security & RLS](#security--rls)
8. [Storage & Files](#storage--files)

---

## 🏗️ Arsitektur Database

### Technology Stack
```
Database:           PostgreSQL (Supabase)
AI Vector Store:    pgvector (Supabase)
Auth:               Supabase Auth
Storage:            Supabase Storage
Edge Functions:     Deno (Supabase Edge Functions)
API:                REST via Supabase REST API + Custom Edge Functions
```

### Design Principles
- **Normalized**: 3NF database design for data integrity
- **Audit Trail**: All tables have created_at, updated_at, created_by
- **Soft Delete**: deleted_at column for recoverable deletes
- **UUID Primary Keys**: All tables use UUID for IDs
- **Vector Embeddings**: pgvector for AI semantic search

---

## 📁 Struktur Tabel

### Core Tables

#### 1. Master Data
```
products
├── id (UUID, PK)
├── sku (TEXT, UNIQUE)
├── name (TEXT)
├── brand (TEXT)
├── category (TEXT)
├── description (TEXT)
├── purchase_price (NUMERIC)
├── selling_price (NUMERIC)
├── stock (INT)
├── unit (TEXT)
├── status (TEXT: 'stocked'|'indent')
├── image_url (TEXT)
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
├── created_by (UUID)
└── deleted_at (TIMESTAMP)

services
├── id (UUID, PK)
├── code (TEXT, UNIQUE)
├── name (TEXT)
├── category (TEXT)
├── description (TEXT)
├── selling_price (NUMERIC)
├── unit (TEXT)
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
├── created_by (UUID)
└── deleted_at (TIMESTAMP)

customers
├── id (UUID, PK)
├── code (TEXT, UNIQUE)
├── name (TEXT)
├── type (TEXT: 'perorangan'|'bisnis')
├── email (TEXT)
├── phone (TEXT)
├── address (TEXT)
├── city (TEXT)
├── province (TEXT)
├── postal_code (TEXT)
├── country (TEXT)
├── tax_id (TEXT)
├── tax_name (TEXT)
├── tax_address (TEXT)
├── company_name (TEXT)
├── -- Business Type Only Fields --
├── pic_name (TEXT)
├── pic_email (TEXT)
├── pic_phone (TEXT)
├── storage_address_1 (TEXT)
├── storage_address_2 (TEXT)
├── storage_address_3 (TEXT)
├── storage_address_4 (TEXT)
├── storage_address_5 (TEXT)
├── has_contract (BOOLEAN)
├── contract_id (UUID, FK, NULLABLE) -- ref to customers_contracts
├── contract_number (TEXT)
├── contract_file_url (TEXT)
├── notes (TEXT)
├── status (TEXT: 'active'|'inactive')
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
├── created_by (UUID)
└── deleted_at (TIMESTAMP)

-- NEW: Contract header table for business customers
customers_contracts
├── id (UUID, PK)
├── customer_id (UUID, FK)
├── contract_number (TEXT, UNIQUE)
├── contract_date (DATE)
├── start_date (DATE)
├── end_date (DATE)
├── description (TEXT)
├── file_url (TEXT)
├── status (TEXT: 'active'|'expired'|'terminated')
├── notes (TEXT)
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
└── created_by (UUID)

-- Product contracts: prices for specific products in a contract
customer_product_contracts
├── id (UUID, PK)
├── customer_id (UUID, FK)
├── contract_id (UUID, FK, NULLABLE) -- ref to customers_contracts
├── product_id (UUID, FK)
├── contract_price (NUMERIC)
├── start_date (DATE)
├── end_date (DATE)
├── notes (TEXT)
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
└── created_by (UUID)

suppliers
├── id (UUID, PK)
├── name (TEXT)
├── email (TEXT)
├── phone (TEXT)
├── address (TEXT)
├── city (TEXT)
├── province (TEXT)
├── postal_code (TEXT)
├── country (TEXT)
├── type (TEXT: 'local'|'international')
├── bank_info (TEXT)
├── status (TEXT: 'active'|'inactive')
├── notes (TEXT)
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
├── created_by (UUID)
└── deleted_at (TIMESTAMP)
```

#### 2. Sales Module
```
quotations
├── id (UUID, PK)
├── quotation_number (TEXT, UNIQUE)
├── quotation_date (DATE)
├── expiry_days (INT)
├── delivery_days (INT)
├── rfq_number (TEXT)
├── rfq_subject (TEXT)
├── customer_id (UUID, FK)
├── subtotal (NUMERIC)
├── tax_amount (NUMERIC)
├── total_amount (NUMERIC)
├── use_tax (BOOLEAN)
├── use_attachment (BOOLEAN)
├── notes (TEXT)
├── status (TEXT: 'draft'|'sent'|'accepted'|'rejected'|'expired')
├── rfq_document_url (TEXT)
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
├── created_by (UUID)
└── deleted_at (TIMESTAMP)

quotation_items
├── id (UUID, PK)
├── quotation_id (UUID, FK)
├── product_id (UUID, FK, NULLABLE)
├── service_id (UUID, FK, NULLABLE)
├── description (TEXT)
├── quantity (INT)
├── price_per_unit (NUMERIC)
├── total_price (NUMERIC)
├── remarks (TEXT)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

customer_product_contracts
├── id (UUID, PK)
├── customer_id (UUID, FK)
├── product_id (UUID, FK)
├── contract_price (NUMERIC)
├── start_date (DATE)
├── end_date (DATE)
├── notes (TEXT)
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
└── created_by (UUID)

sales_orders
├── id (UUID, PK)
├── so_number (TEXT, UNIQUE)
├── quotation_id (UUID, FK, NULLABLE)
├── sales_order_date (DATE)
├── customer_id (UUID, FK)
├── subtotal (NUMERIC)
├── tax_amount (NUMERIC)
├── total_amount (NUMERIC)
├── use_tax (BOOLEAN)
├── notes (TEXT)
├── status (TEXT: 'draft'|'confirmed'|'processing'|'shipped'|'delivered'|'cancelled')
├── is_contract_based (BOOLEAN)
├── customer_po_number (TEXT)
├── customer_po_url (TEXT)
├── customer_delivery_slip_url (TEXT)
├── signed_po_url (TEXT)
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
├── created_by (UUID)
└── deleted_at (TIMESTAMP)

sales_order_items
├── id (UUID, PK)
├── sales_order_id (UUID, FK)
├── product_id (UUID, FK, NULLABLE)
├── service_id (UUID, FK, NULLABLE)
├── description (TEXT)
├── quantity (INT)
├── price_per_unit (NUMERIC)
├── total_price (NUMERIC)
├── remarks (TEXT)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

delivery_orders
├── id (UUID, PK)
├── do_number (TEXT, UNIQUE)
├── sales_order_id (UUID, FK)
├── shipping_date (DATE)
├── recipient_name (TEXT)
├── recipient_address (TEXT)
├── recipient_phone (TEXT)
├── notes (TEXT)
├── status (TEXT: 'pending'|'preparing'|'shipped'|'delivered'|'cancelled')
├── signed_do_url (TEXT)
├── customer_grn_url (TEXT)
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
├── created_by (UUID)
└── deleted_at (TIMESTAMP)

delivery_order_items
├── id (UUID, PK)
├── delivery_order_id (UUID, FK)
├── sales_order_item_id (UUID, FK)
├── quantity_shipped (INT)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

#### 3. Finance Module
```
chart_of_accounts
├── id (UUID, PK)
├── account_code (TEXT, UNIQUE)
├── account_name (TEXT)
├── account_type (TEXT: 'asset'|'liability'|'equity'|'revenue'|'expense')
├── parent_id (UUID, FK, NULLABLE)
├── level (INT)
├── is_active (BOOLEAN)
├── is_posting (BOOLEAN)
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
└── created_by (UUID)

general_ledger
├── id (UUID, PK)
├── transaction_date (DATE)
├── transaction_type (TEXT)
├── transaction_id (UUID)
├── transaction_number (TEXT)
├── account_id (UUID, FK)
├── debit (NUMERIC)
├── credit (NUMERIC)
├── description (TEXT)
├── reference (TEXT)
├── created_at (TIMESTAMP)
├── created_by (UUID)
└── updated_at (TIMESTAMP)

journal_entries
├── id (UUID, PK)
├── journal_number (TEXT, UNIQUE)
├── journal_date (DATE)
├── description (TEXT)
├── total_debit (NUMERIC)
├── total_credit (NUMERIC)
├── status (TEXT: 'draft'|'posted'|'void')
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
├── created_by (UUID)
└── deleted_at (TIMESTAMP)

journal_entry_lines
├── id (UUID, PK)
├── journal_entry_id (UUID, FK)
├── account_id (UUID, FK)
├── debit (NUMERIC)
├── credit (NUMERIC)
├── description (TEXT)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

invoices
├── id (UUID, PK)
├── invoice_number (TEXT, UNIQUE)
├── invoice_date (DATE)
├── due_date (DATE)
├── sales_order_id (UUID, FK)
├── customer_id (UUID, FK)
├── subtotal (NUMERIC)
├── tax_amount (NUMERIC)
├── total_amount (NUMERIC)
├── amount_paid (NUMERIC)
├── notes (TEXT)
├── status (TEXT: 'draft'|'sent'|'partial'|'paid'|'overdue'|'cancelled')
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
├── created_by (UUID)
└── deleted_at (TIMESTAMP)

invoice_payments
├── id (UUID, PK)
├── invoice_id (UUID, FK)
├── payment_date (DATE)
├── amount (NUMERIC)
├── payment_method (TEXT)
├── reference_number (TEXT)
├── notes (TEXT)
├── created_at (TIMESTAMP)
├── created_by (UUID)
└── updated_at (TIMESTAMP)
```

#### 4. AI Module
```
ai_conversations
├── id (UUID, PK)
├── user_id (UUID, FK)
├── conversation_name (TEXT)
├── mode (TEXT: 'personal'|'shared')
├── is_pinned (BOOLEAN)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

ai_messages
├── id (UUID, PK)
├── conversation_id (UUID, FK)
├── role (TEXT: 'user'|'assistant')
├── prompt (TEXT)
├── response (TEXT)
├── tokens_used (INT)
├── temperature (NUMERIC)
├── context_data (JSONB)
├── created_at (TIMESTAMP)

ai_knowledge_base
├── id (UUID, PK)
├── document_name (TEXT)
├── document_type (TEXT: 'SOP'|'FAQ'|'CUSTOM')
├── content (TEXT)
├── embedding (VECTOR)
├── file_url (TEXT)
├── is_active (BOOLEAN)
├── created_by (UUID)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

ai_analysis_cache
├── id (UUID, PK)
├── analysis_type (TEXT: 'sales_trend'|'inventory'|'customer_churn'|'forecast')
├── result_json (JSONB)
├── generated_at (TIMESTAMP)
└── expires_at (TIMESTAMP)
```

#### 5. System Tables
```
transaction_sequences
├── year (INT, PK)
├── prefix (TEXT, PK)
└── last_sequence (INT)

user_profiles
├── id (UUID, PK)
├── user_id (UUID, FK)
├── full_name (TEXT)
├── phone (TEXT)
├── role (TEXT: 'admin'|'sales'|'finance'|'warehouse'|'customer_service')
├── avatar_url (TEXT)
├── preferences (JSONB)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

audit_logs
├── id (UUID, PK)
├── user_id (UUID, FK)
├── action (TEXT)
├── table_name (TEXT)
├── record_id (UUID)
├── old_value (JSONB)
├── new_value (JSONB)
├── ip_address (TEXT)
├── user_agent (TEXT)
└── created_at (TIMESTAMP)

notifications
├── id (UUID, PK)
├── user_id (UUID, FK)
├── type (TEXT)
├── title (TEXT)
├── message (TEXT)
├── is_read (BOOLEAN)
├── link (TEXT)
├── created_at (TIMESTAMP)
└── read_at (TIMESTAMP)
```

---

## 🚀 Phase-by-Phase Development Roadmap

### **PHASE 1: MVP (Bulan 1-2)**

#### Week 1-2: Database Setup & Core Infrastructure
- [ ] Create Supabase project
- [ ] Enable pgvector extension
- [ ] Setup authentication (email/password)
- [ ] Create storage buckets (products, documents)
- [ ] Setup RLS policies
- [ ] Create core tables (products, customers, suppliers)

#### Week 3-4: Master Data Tables
- [ ] Create products table with triggers
- [ ] Create services table
- [ ] Create customers table
- [ ] Create suppliers table
- [ ] Implement CRUD functions
- [ ] Setup image upload handling

#### Week 5-6: Sales Module - Part 1
- [ ] Create quotations table
- [ ] Create quotation_items table
- [ ] Create customer_product_contracts table
- [ ] Implement price calculation logic
- [ ] Create sales_orders table
- [ ] Implement SO from Quotation conversion

#### Week 7-8: Sales Module - Part 2 & Finance Init
- [ ] Create delivery_orders table
- [ ] Implement DO from SO workflow
- [ ] Create chart_of_accounts table
- [ ] Create general_ledger table
- [ ] Setup automatic GL posting

#### Week 9-10: Financial Module
- [ ] Create journal_entries table
- [ ] Create invoices table
- [ ] Implement payment tracking
- [ ] Create transaction_sequences table
- [ ] Implement auto-numbering RPC

#### Week 11-12: AI Module & Integration
- [ ] Create ai_conversations table
- [ ] Create ai_messages table
- [ ] Create ai_knowledge_base table with vectors
- [ ] Setup OpenRouter integration
- [ ] Implement basic chat functionality

---

### **PHASE 2: Enhancement (Bulan 3-4)**

#### Week 1-2: Advanced Search & Filters
- [ ] Full-text search across tables
- [ ] Advanced query functions
- [ ] Search history storage
- [ ] Saved filters functionality

#### Week 3-4: Sales Workflow Enhancement
- [ ] Document upload fields
- [ ] File storage management
- [ ] Workflow status tracking
- [ ] Automatic notifications

#### Week 5-6: Notifications System
- [ ] Create notifications table
- [ ] Email notification setup
- [ ] Notification preferences
- [ ] Alert rules engine

#### Week 7-8: Dashboard Analytics
- [ ] Create ai_analysis_cache table
- [ ] Cached analytics queries
- [ ] Performance optimization
- [ ] Real-time KPI calculations

#### Week 9-10: Financial Statements
- [ ] Income statement queries
- [ ] Balance sheet queries
- [ ] Trial balance queries
- [ ] Period management

#### Week 11-12: Data Import/Export
- [ ] Excel import functions
- [ ] Excel export functions
- [ ] Bulk operations
- [ ] Validation rules

---

### **PHASE 3: Advanced Features (Bulan 5-6)**

#### Week 1-2: Supplier Management & RFQ
- [ ] RFQ tables
- [ ] Quote comparison logic
- [ ] Supplier scorecard data

#### Week 3-4: Approval Workflow
- [ ] Approval rules table
- [ ] Approval history
- [ ] Multi-level authorization

#### Week 5-6: Customer Portal
- [ ] Portal access tables
- [ ] Customer document access
- [ ] Payment proof upload

---

## 🔌 API Endpoints

### REST API (via Supabase)

```
# Products
GET    /products          - List products with filters
GET    /products/:id       - Get product detail
POST   /products           - Create product
PUT    /products/:id       - Update product
DELETE /products/:id       - Delete product

# Customers
GET    /customers         - List customers with filters
GET    /customers/:id      - Get customer detail
POST   /customers          - Create customer
PUT    /customers/:id      - Update customer
DELETE /customers/:id      - Delete customer

# Suppliers
GET    /suppliers          - List suppliers with filters
GET    /suppliers/:id      - Get supplier detail
POST   /suppliers          - Create supplier
PUT    /suppliers/:id      - Update supplier
DELETE /suppliers/:id      - Delete supplier

# Quotations
GET    /quotations         - List quotations
GET    /quotations/:id     - Get quotation detail
POST   /quotations         - Create quotation
PUT    /quotations/:id     - Update quotation
DELETE /quotations/:id     - Delete quotation

# Sales Orders
GET    /sales_orders       - List sales orders
GET    /sales_orders/:id   - Get sales order detail
POST   /sales_orders       - Create sales order
PUT    /sales_orders/:id   - Update sales order
POST   /sales_orders/from_quotation - Convert from quotation

# Delivery Orders
GET    /delivery_orders    - List delivery orders
GET    /delivery_orders/:id - Get DO detail
POST   /delivery_orders    - Create DO
PUT    /delivery_orders/:id - Update DO
POST   /delivery_orders/from_so - Convert from SO

# Invoices
GET    /invoices           - List invoices
GET    /invoices/:id       - Get invoice detail
POST   /invoices           - Create invoice
PUT    /invoices/:id       - Update invoice
POST   /invoices/:id/payments - Add payment

# Finance
GET    /chart_of_accounts  - List COA
GET    /general_ledger     - List GL entries
GET    /journal_entries    - List journal entries
POST   /journal_entries    - Create journal entry

# AI
GET    /ai_conversations   - List conversations
POST   /ai_conversations   - Create conversation
GET    /ai_messages/:conversation_id - Get messages
POST   /ai/chat            - Send chat message

# System
GET    /audit_logs         - List audit logs
GET    /notifications      - List notifications
PUT    /notifications/:id/read - Mark as read
```

### Edge Functions

```
/functions/v1/generate-number     - Generate transaction numbers
/functions/v1/generate-pdf        - Generate PDF documents
/functions/v1/ai-chat             - AI chat processing
/functions/v1/ai-search          - AI semantic search
/functions/v1/analytics          - Analytics calculations
/functions/v1/import-excel       - Excel import processing
/functions/v1/export-excel       - Excel export processing
/functions/v1/send-email         - Send email notifications
/functions/v1/webhook            - Webhook handler
```

---

## ⚙️ RPC Functions

```sql
-- Transaction Number Generation
CREATE OR REPLACE FUNCTION generate_transaction_number(
  p_prefix TEXT,
  p_year INT
)
RETURNS TEXT AS $$
DECLARE
  v_sequence INT;
  v_number TEXT;
BEGIN
  -- Get and increment sequence
  INSERT INTO transaction_sequences (year, prefix, last_sequence)
  VALUES (p_year, p_prefix, 1)
  ON CONFLICT (year, prefix) 
  DO UPDATE SET last_sequence = transaction_sequences.last_sequence + 1
  RETURNING last_sequence INTO v_sequence;

  -- Format: PREFIX-YY-SEQUENCE (e.g., RRI-SPH-26-00001)
  v_number := p_prefix || '-' || RIGHT(p_year::TEXT, 2) || '-' || LPAD(v_sequence::TEXT, 5, '0');
  
  RETURN v_number;
END;
$$ LANGUAGE plpgsql;

-- Price Calculation with Contract
CREATE OR REPLACE FUNCTION get_product_price(
  p_customer_id UUID,
  p_product_id UUID
)
RETURNS NUMERIC AS $$
DECLARE
  v_price NUMERIC;
  v_contract_price NUMERIC;
BEGIN
  -- Check for active contract
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

  -- Return default selling price
  SELECT selling_price INTO v_price
  FROM products
  WHERE id = p_product_id;

  RETURN v_price;
END;
$$ LANGUAGE plpgsql;

-- Quotation Total Calculation
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
  -- Calculate subtotal
  SELECT COALESCE(SUM(quantity * price_per_unit), 0)
  INTO v_subtotal
  FROM quotation_items
  WHERE quotation_id = p_quotation_id;

  -- Calculate tax (11%)
  IF p_use_tax THEN
    v_tax := v_subtotal * 0.11;
  ELSE
    v_tax := 0;
  END IF;

  -- Calculate total
  v_total := v_subtotal + v_tax;

  RETURN QUERY SELECT v_subtotal, v_tax, v_total;
END;
$$ LANGUAGE plpgsql;

-- GL Balance Calculation
CREATE OR REPLACE FUNCTION get_account_balance(
  p_account_id UUID,
  p_as_of_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(
  debit_total NUMERIC,
  credit_total NUMERIC,
  balance NUMERIC
) AS $$
DECLARE
  v_debit NUMERIC;
  v_credit NUMERIC;
  v_balance NUMERIC;
BEGIN
  SELECT 
    COALESCE(SUM(debit), 0),
    COALESCE(SUM(credit), 0)
  INTO v_debit, v_credit
  FROM general_ledger
  WHERE account_id = p_account_id
    AND transaction_date <= p_as_of_date;

  v_balance := v_debit - v_credit;

  RETURN QUERY SELECT v_debit, v_credit, v_balance;
END;
$$ LANGUAGE plpgsql;

-- Search Products
CREATE OR REPLACE FUNCTION search_products(
  p_search TEXT DEFAULT '',
  p_category TEXT DEFAULT NULL,
  p_brand TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_sort_by TEXT DEFAULT 'created_at',
  p_sort_order TEXT DEFAULT 'desc',
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  sku TEXT,
  name TEXT,
  brand TEXT,
  category TEXT,
  selling_price NUMERIC,
  stock INT,
  status TEXT,
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.sku,
    p.name,
    p.brand,
    p.category,
    p.selling_price,
    p.stock,
    p.status,
    p.created_at
  FROM products p
  WHERE p.deleted_at IS NULL
    AND (
      p_search = '' 
      OR p.name ILIKE '%' || p_search || '%'
      OR p.sku ILIKE '%' || p_search || '%'
      OR p.brand ILIKE '%' || p_search || '%'
    )
    AND (p_category IS NULL OR p.category = p_category)
    AND (p_brand IS NULL OR p.brand = p_brand)
    AND (p_status IS NULL OR p.status = p_status)
  ORDER BY 
    CASE WHEN p_sort_by = 'name' AND p_sort_order = 'asc' THEN p.name END ASC,
    CASE WHEN p_sort_by = 'name' AND p_sort_order = 'desc' THEN p.name END DESC,
    CASE WHEN p_sort_by = 'selling_price' AND p_sort_order = 'asc' THEN p.selling_price END ASC,
    CASE WHEN p_sort_by = 'selling_price' AND p_sort_order = 'desc' THEN p.selling_price END DESC,
    CASE WHEN p_sort_by = 'stock' AND p_sort_order = 'asc' THEN p.stock END ASC,
    CASE WHEN p_sort_by = 'stock' AND p_sort_order = 'desc' THEN p.stock END DESC,
    CASE WHEN p_sort_by = 'created_at' AND p_sort_order = 'asc' THEN p.created_at END ASC,
    CASE WHEN p_sort_by = 'created_at' AND p_sort_order = 'desc' THEN p.created_at END DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Search Customers
CREATE OR REPLACE FUNCTION search_customers(
  p_search TEXT DEFAULT '',
  p_type TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_sort_by TEXT DEFAULT 'created_at',
  p_sort_order TEXT DEFAULT 'desc',
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  email TEXT,
  phone TEXT,
  city TEXT,
  type TEXT,
  status TEXT,
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.email,
    c.phone,
    c.city,
    c.type,
    c.status,
    c.created_at
  FROM customers c
  WHERE c.deleted_at IS NULL
    AND (
      p_search = '' 
      OR c.name ILIKE '%' || p_search || '%'
      OR c.email ILIKE '%' || p_search || '%'
      OR c.phone ILIKE '%' || p_search || '%'
    )
    AND (p_type IS NULL OR c.type = p_type)
    AND (p_city IS NULL OR c.city = p_city)
    AND (p_status IS NULL OR c.status = p_status)
  ORDER BY 
    CASE WHEN p_sort_by = 'name' AND p_sort_order = 'asc' THEN c.name END ASC,
    CASE WHEN p_sort_by = 'name' AND p_sort_order = 'desc' THEN c.name END DESC,
    CASE WHEN p_sort_by = 'created_at' AND p_sort_order = 'asc' THEN c.created_at END ASC,
    CASE WHEN p_sort_by = 'created_at' AND p_sort_order = 'desc' THEN c.created_at END DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Search Suppliers
CREATE OR REPLACE FUNCTION search_suppliers(
  p_search TEXT DEFAULT '',
  p_type TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_sort_by TEXT DEFAULT 'created_at',
  p_sort_order TEXT DEFAULT 'desc',
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  email TEXT,
  phone TEXT,
  city TEXT,
  type TEXT,
  status TEXT,
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.name,
    s.email,
    s.phone,
    s.city,
    s.type,
    s.status,
    s.created_at
  FROM suppliers s
  WHERE s.deleted_at IS NULL
    AND (
      p_search = '' 
      OR s.name ILIKE '%' || p_search || '%'
      OR s.email ILIKE '%' || p_search || '%'
      OR s.phone ILIKE '%' || p_search || '%'
    )
    AND (p_type IS NULL OR s.type = p_type)
    AND (p_city IS NULL OR s.city = p_city)
    AND (p_status IS NULL OR s.status = p_status)
  ORDER BY 
    CASE WHEN p_sort_by = 'name' AND p_sort_order = 'asc' THEN s.name END ASC,
    CASE WHEN p_sort_by = 'name' AND p_sort_order = 'desc' THEN s.name END DESC,
    CASE WHEN p_sort_by = 'created_at' AND p_sort_order = 'asc' THEN s.created_at END ASC,
    CASE WHEN p_sort_by = 'created_at' AND p_sort_order = 'desc' THEN s.created_at END DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;
```

---

## 🔄 Triggers & Automation

```sql
-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Similar triggers for all other tables

-- Auto-generate quotation number on insert
CREATE OR REPLACE FUNCTION set_quotation_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quotation_number IS NULL THEN
    NEW.quotation_number := generate_transaction_number('RRI-SPH', EXTRACT(YEAR FROM CURRENT_DATE));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER quotation_number_trigger
  BEFORE INSERT ON quotations
  FOR EACH ROW
  EXECUTE FUNCTION set_quotation_number();

-- Auto-generate SO number
CREATE OR REPLACE FUNCTION set_so_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.so_number IS NULL THEN
    NEW.so_number := generate_transaction_number('RRI-SO', EXTRACT(YEAR FROM CURRENT_DATE));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate DO number
CREATE OR REPLACE FUNCTION set_do_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.do_number IS NULL THEN
    NEW.do_number := generate_transaction_number('RRI-DO', EXTRACT(YEAR FROM CURRENT_DATE));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate invoice number
CREATE OR REPLACE FUNCTION set_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL THEN
    NEW.invoice_number := generate_transaction_number('RRI-INV', EXTRACT(YEAR FROM CURRENT_DATE));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-update invoice status based on payments
CREATE OR REPLACE FUNCTION update_invoice_status()
RETURNS TRIGGER AS $$
DECLARE
  v_total_amount NUMERIC;
  v_amount_paid NUMERIC;
BEGIN
  SELECT total_amount, amount_paid 
  INTO v_total_amount, v_amount_paid
  FROM invoices
  WHERE id = NEW.invoice_id;

  IF v_amount_paid >= v_total_amount THEN
    UPDATE invoices SET status = 'paid', updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.invoice_id;
  ELSIF v_amount_paid > 0 THEN
    UPDATE invoices SET status = 'partial', updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.invoice_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER invoice_payment_trigger
  AFTER INSERT ON invoice_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_invoice_status();

-- Audit trail trigger
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, new_value, created_at)
    VALUES (COALESCE(current_setting('app.current_user_id', true), auth.uid()), 
            'INSERT', TG_TABLE_NAME, NEW.id, to_jsonb(NEW), CURRENT_TIMESTAMP);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_value, new_value, created_at)
    VALUES (COALESCE(current_setting('app.current_user_id', true), auth.uid()),
            'UPDATE', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW), CURRENT_TIMESTAMP);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_value, created_at)
    VALUES (COALESCE(current_setting('app.current_user_id', true), auth.uid()),
            'DELETE', TG_TABLE_NAME, OLD.id, to_jsonb(OLD), CURRENT_TIMESTAMP);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

---

## 🔒 Security & RLS

### Row Level Security Policies

```sql
-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
-- ... etc

-- Products: All authenticated users can read, only owner can modify
CREATE POLICY "Products are viewable by authenticated users"
  ON products FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "Users can insert their own products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own products"
  ON products FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own products"
  ON products FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Similar policies for all other tables
-- For admin role, add bypass policies
```

---

## 📦 Storage & Files

### Supabase Storage Buckets

```
products/           - Product images
documents/           - General documents
quotations/         - Quotation PDFs
sales_orders/       - SO documents (PO, etc)
delivery_orders/    - DO documents (Signed DO, GRN)
invoices/           - Invoice documents
knowledge-base/    - AI knowledge base files
```

### Storage Policies
- Public read for product images
- Authenticated read/write for user documents
- Admin full access

---

## 📝 Notes

<!-- TAMBAHKAN KOMENTAR DISINI UNTUK KOLOM TAMBAHAN YANG DIINGINKAN -->
<!-- Contoh:
 Products: <!-- TAMBAHKAN KOLOM: min_stock_level (INT) - untuk low stock alert -->
<!-- Customers: <!-- TAMBAHKAN KOLOM: credit_limit (NUMERIC) - untuk batasan kredit -->
<!-- Quotations: <!-- TAMBAHKAN KOLOM: sales_person (TEXT) - untuk tracking salesman -->
-->

