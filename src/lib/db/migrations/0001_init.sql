-- Create tables for ERP RRI System

-- Users and Roles
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL, -- admin, manager, sales, procurement, gudang, finance, hr
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- admin, manager, sales, procurement, gudang, finance, hr
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Master Data
CREATE TABLE kategori_barang (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  keterangan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE barang (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  kode TEXT NOT NULL UNIQUE,
  kategori_id UUID NOT NULL REFERENCES kategori_barang(id) ON DELETE RESTRICT,
  satuan TEXT NOT NULL,
  spesifikasi TEXT,
  harga_beli_default DOUBLE PRECISION,
  harga_jual_default DOUBLE PRECISION,
  stok_minimum INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE supplier (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  kode TEXT NOT NULL UNIQUE,
  nama_toko TEXT, -- for marketplace
  link_toko TEXT, -- for marketplace
  no_rekening TEXT,
  kontak TEXT,
  terms_of_payment TEXT, -- e.g., Net 30, Net 60, Cash, Custom
  is_marketplace BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE customer (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  kode TEXT NOT NULL UNIQUE,
  alamat TEXT,
  kontak TEXT,
  terms_of_payment TEXT, -- e.g., Net 30, Net 60, Cash, Custom
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE customer_pic (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customer(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  jabatan TEXT,
  no_hp TEXT,
  email TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE customer_top (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customer(id) ON DELETE CASCADE,
  top TEXT NOT NULL, -- Net 30, Net 60, Cash, Custom
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE jabatan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  keterangan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE karyawan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nik TEXT NOT NULL UNIQUE,
  nama TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  no_hp TEXT,
  jabatan_id UUID NOT NULL REFERENCES jabatan(id) ON DELETE RESTRICT,
  gaji_pokok DOUBLE PRECISION,
  tanggal_masuk TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE coa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kode TEXT NOT NULL UNIQUE,
  nama TEXT NOT NULL,
  tipe TEXT NOT NULL, -- e.g., Asset, Liability, Equity, Revenue, Expense
  induk_id UUID REFERENCES coa(id) ON DELETE SET NULL, -- for hierarchical structure
  keterangan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE kontrak (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customer(id) ON DELETE RESTRICT,
  nama TEXT NOT NULL, -- contract name or reference
  tanggal_mulai DATE,
  tanggal_selesai DATE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE kontrak_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kontrak_id UUID NOT NULL REFERENCES kontrak(id) ON DELETE CASCADE,
  barang_id UUID NOT NULL REFERENCES barang(id) ON DELETE RESTRICT,
  harga_satuan DOUBLE PRECISION NOT NULL,
  ppn_include BOOLEAN NOT NULL DEFAULT TRUE, -- whether the price includes PPN
  keterangan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE kontrak_file (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kontrak_id UUID NOT NULL REFERENCES kontrak(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE rfq (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customer(id) ON DELETE RESTRICT,
  tanggal DATE NOT NULL,
  keterangan TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE rfq_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id UUID NOT NULL REFERENCES rfq(id) ON DELETE CASCADE,
  barang_id UUID NOT NULL REFERENCES barang(id) ON DELETE RESTRICT,
  jumlah INTEGER NOT NULL,
  keterangan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE rfq_pic (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id UUID NOT NULL REFERENCES rfq(id) ON DELETE CASCADE,
  customer_pic_id UUID NOT NULL REFERENCES customer_pic(id) ON DELETE RESTRICT,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE quotation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customer(id) ON DELETE RESTRICT,
  tanggal DATE NOT NULL,
  ppn_rate DOUBLE PRECISION NOT NULL DEFAULT 0.11, -- 11% PPN
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE quotation_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID NOT NULL REFERENCES quotation(id) ON DELETE CASCADE,
  barang_id UUID NOT NULL REFERENCES barang(id) ON DELETE RESTRICT,
  harga_satuan DOUBLE PRECISION NOT NULL,
  diskon DOUBLE PRECISION DEFAULT 0,
  ppn_per_item DOUBLE PRECISION, -- calculated as (harga_satuan * (1 - diskon/100)) * ppn_rate
  jumlah INTEGER NOT NULL,
  keterangan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE quotation_pic (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID NOT NULL REFERENCES quotation(id) ON DELETE CASCADE,
  customer_pic_id UUID NOT NULL REFERENCES customer_pic(id) ON DELETE RESTRICT,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE negoiasi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID NOT NULL REFERENCES quotation(id) ON DELETE CASCADE,
  tanggal DATE NOT NULL,
  keterangan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE negoiasi_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  negoiasi_id UUID NOT NULL REFERENCES negoiasi(id) ON DELETE CASCADE,
  quotation_item_id UUID NOT NULL REFERENCES quotation_item(id) ON DELETE RESTRICT,
  harga_satuan_baru DOUBLE PRECISION NOT NULL,
  diskon_baru DOUBLE PRECISION DEFAULT 0,
  alasan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE customer_po (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customer(id) ON DELETE RESTRICT,
  quotation_id UUID REFERENCES quotation(id) ON DELETE SET NULL,
  tanggal DATE NOT NULL,
  terms_of_payment TEXT, -- copied from customer_top at PO creation
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE customer_po_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_po_id UUID NOT NULL REFERENCES customer_po(id) ON DELETE CASCADE,
  barang_id UUID NOT NULL REFERENCES barang(id) ON DELETE RESTRICT,
  jumlah INTEGER NOT NULL,
  harga_satuan DOUBLE PRECISION NOT NULL, -- from quotation or negotiated
  keterangan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE customer_po_pic (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_po_id UUID NOT NULL REFERENCES customer_po(id) ON DELETE CASCADE,
  customer_pic_id UUID NOT NULL REFERENCES customer_pic(id) ON DELETE RESTRICT,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE di (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customer(id) ON DELETE RESTRICT,
  kontrak_id UUID REFERENCES kontrak(id) ON DELETE SET NULL,
  tanggal DATE NOT NULL,
  keterangan TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE di_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  di_id UUID NOT NULL REFERENCES di(id) ON DELETE CASCADE,
  barang_id UUID NOT NULL REFERENCES barang(id) ON DELETE RESTRICT,
  jumlah INTEGER NOT NULL,
  keterangan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE di_pic (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  di_id UUID NOT NULL REFERENCES di(id) ON DELETE CASCADE,
  customer_pic_id UUID NOT NULL REFERENCES customer_pic(id) ON DELETE RESTRICT,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE sales_order (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_po_id UUID REFERENCES customer_po(id) ON DELETE SET NULL,
  di_id UUID REFERENCES di(id) ON DELETE SET NULL,
  tanggal DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE sales_order_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sales_order_id UUID NOT NULL REFERENCES sales_order(id) ON DELETE CASCADE,
  barang_id UUID NOT NULL REFERENCES barang(id) ON DELETE RESTRICT,
  jumlah INTEGER NOT NULL,
  harga_satuan DOUBLE PRECISION NOT NULL,
  keterangan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE delivery_order (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sales_order_id UUID NOT NULL REFERENCES sales_order(id) ON DELETE RESTRICT,
  tanggal DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, awaiting_pickup, dikirim, selesai
  keterangan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE delivery_order_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_order_id UUID NOT NULL REFERENCES delivery_order(id) ON DELETE CASCADE,
  barang_id UUID NOT NULL REFERENCES barang(id) ON DELETE RESTRICT,
  jumlah INTEGER NOT NULL,
  keterangan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE grn (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_receiving_id UUID REFERENCES purchase_receiving(id) ON DELETE SET NULL,
  di_id UUID REFERENCES di(id) ON DELETE SET NULL, -- for GRN from DI (customer)
  tanggal DATE NOT NULL,
  keterangan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE grn_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grn_id UUID NOT NULL REFERENCES grn(id) ON DELETE CASCADE,
  barang_id UUID NOT NULL REFERENCES barang(id) ON DELETE RESTRICT,
  jumlah INTEGER NOT NULL,
  keterangan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE retur_penjualan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_order_id UUID REFERENCES delivery_order(id) ON DELETE SET NULL,
  customer_id UUID NOT NULL REFERENCES customer(id) ON DELETE RESTRICT,
  tanggal DATE NOT NULL,
  keterangan TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE retur_penjualan_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retur_penjualan_id UUID NOT NULL REFERENCES retur_penjualan(id) ON DELETE CASCADE,
  barang_id UUID NOT NULL REFERENCES barang(id) ON DELETE RESTRICT,
  jumlah INTEGER NOT NULL,
  keterangan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE retur_penjualan_document (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retur_penjualan_id UUID NOT NULL REFERENCES retur_penjualan(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE retur_pembelian (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID REFERENCES purchase_order(id) ON DELETE SET NULL,
  supplier_id UUID NOT NULL REFERENCES supplier(id) ON DELETE RESTRICT,
  tanggal DATE NOT NULL,
  keterangan TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE retur_pembelian_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retur_pembelian_id UUID NOT NULL REFERENCES retur_pembelian(id) ON DELETE CASCADE,
  barang_id UUID NOT NULL REFERENCES barang(id) ON DELETE RESTRICT,
  jumlah INTEGER NOT NULL,
  keterangan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE retur_pembelian_document (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retur_pembelian_id UUID NOT NULL REFERENCES retur_pembelian(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE purchase_request (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sales_order_id UUID REFERENCES sales_order(id) ON DELETE SET NULL,
  tanggal DATE NOT NULL,
  keterangan TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE purchase_request_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_request_id UUID NOT NULL REFERENCES purchase_request(id) ON DELETE CASCADE,
  barang_id UUID NOT NULL REFERENCES barang(id) ON DELETE RESTRICT,
  jumlah INTEGER NOT NULL,
  keterangan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE purchase_order (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES supplier(id) ON DELETE RESTRICT,
  purchase_request_id UUID REFERENCES purchase_request(id) ON DELETE SET NULL,
  tanggal DATE NOT NULL,
  terms_of_payment TEXT, -- from supplier
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE purchase_order_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_order(id) ON DELETE CASCADE,
  barang_id UUID NOT NULL REFERENCES barang(id) ON DELETE RESTRICT,
  jumlah INTEGER NOT NULL,
  harga_satuan DOUBLE PRECISION NOT NULL,
  link_produk TEXT, -- for marketplace
  nama_toko TEXT, -- for marketplace
  marketplace TEXT, -- e.g., Shopee, Tokopedia
  no_resi TEXT, -- shipping receipt number
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE purchase_receiving (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_order(id) ON DELETE RESTRICT,
  tanggal DATE NOT NULL,
  keterangan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE purchase_receiving_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_receiving_id UUID NOT NULL REFERENCES purchase_receiving(id) ON DELETE CASCADE,
  barang_id UUID NOT NULL REFERENCES barang(id) ON DELETE RESTRICT,
  jumlah INTEGER NOT NULL,
  keterangan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE invoice (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sales_order_id UUID NOT NULL REFERENCES sales_order(id) ON DELETE RESTRICT,
  customer_id UUID NOT NULL REFERENCES customer(id) ON DELETE RESTRICT,
  tanggal DATE NOT NULL,
  top TEXT NOT NULL, -- terms of payment from customer
  ppn_rate DOUBLE PRECISION NOT NULL DEFAULT 0.11, -- 11% PPN
  pph_rate DOUBLE PRECISION, -- optional, e.g., 0.02 for 2%
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE invoice_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoice(id) ON DELETE CASCADE,
  barang_id UUID NOT NULL REFERENCES barang(id) ON DELETE RESTRICT,
  harga DOUBLE PRECISION NOT NULL,
  diskon DOUBLE PRECISION DEFAULT 0,
  ppn DOUBLE PRECISION, -- calculated as harga * (1 - diskon/100) * ppn_rate
  pph DOUBLE PRECISION, -- calculated as harga * (1 - diskon/100) * pph_rate
  jumlah INTEGER NOT NULL,
  keterangan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE invoice_document (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoice(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- e.g., PO, DI, DO, GRN
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE faktur_pajak (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoice(id) ON DELETE RESTRICT,
  nomor_faktur TEXT NOT NULL, -- according to Dirjen Pajak regulations
  tanggal DATE NOT NULL,
  dpp DOUBLE PRECISION NOT NULL, -- Dasar Pengenaan Pajak
  ppn DOUBLE PRECISION NOT NULL,
  pph DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE faktur_pajak_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faktur_pajak_id UUID NOT NULL REFERENCES faktur_pajak(id) ON DELETE CASCADE,
  invoice_item_id UUID NOT NULL REFERENCES invoice_item(id) ON DELETE RESTRICT,
  harga DOUBLE PRECISION NOT NULL,
  dpp DOUBLE PRECISION NOT NULL,
  ppn DOUBLE PRECISION NOT NULL,
  pph DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE kwitansi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoice(id) ON DELETE RESTRICT,
  tanggal DATE NOT NULL,
  keterangan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE kwitansi_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kwitansi_id UUID NOT NULL REFERENCES kwitansi(id) ON DELETE CASCADE,
  invoice_item_id UUID NOT NULL REFERENCES invoice_item(id) ON DELETE RESTRICT,
  jumlah DOUBLE PRECISION NOT NULL, -- amount paid for this item
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE gudang (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  lokasi TEXT,
  keterangan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE stok (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barang_id UUID NOT NULL REFERENCES barang(id) ON DELETE RESTRICT,
  gudang_id UUID REFERENCES gudang(id) ON DELETE SET NULL,
  jumlah INTEGER NOT NULL,
  last_mutasi TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  keterangan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE jurnal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal DATE NOT NULL,
  keterangan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE jurnal_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jurnal_id UUID NOT NULL REFERENCES jurnal(id) ON DELETE CASCADE,
  akun_id UUID NOT NULL REFERENCES coa(id) ON DELETE RESTRICT,
  debit DOUBLE PRECISION NOT NULL DEFAULT 0,
  credit DOUBLE PRECISION NOT NULL DEFAULT 0,
  keterangan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE absensi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  karyawan_id UUID NOT NULL REFERENCES karyawan(id) ON DELETE RESTRICT,
  tanggal DATE NOT NULL,
  status TEXT NOT NULL, -- hadir, sakit, izin, alpha
  keterangan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE penggajian (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  karyawan_id UUID NOT NULL REFERENCES karyawan(id) ON DELETE RESTRICT,
  bulan INTEGER NOT NULL, -- 1-12
  tahun INTEGER NOT NULL, -- e.g., 2026
  gaji_pokok DOUBLE PRECISION NOT NULL,
  tunjangan DOUBLE PRECISION DEFAULT 0,
  potongan DOUBLE PRECISION DEFAULT 0,
  gaji_bersih DOUBLE PRECISION NOT NULL,
  tanggal_pembayaran DATE,
  keterangan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE document_counter (
  kode_dokumen TEXT NOT NULL, -- SPH, SJ, INV, KWT, PO, GRN, RTJ, RTB
  tahun INTEGER NOT NULL, -- e.g., 2026
  bulan INTEGER NOT NULL, -- 1-12
  counter INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (kode_dokumen, tahun, bulan)
);

CREATE TABLE ai_search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE ai_search_result (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ai_search_history_id UUID NOT NULL REFERENCES ai_search_history(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  harga DOUBLE PRECISION NOT NULL,
  toko TEXT NOT NULL,
  link TEXT NOT NULL,
  marketplace TEXT NOT NULL, -- e.g., Shopee, Tokopedia
  rating DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE ai_ocr_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  extracted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  keterangan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL, -- null if system action
  action TEXT NOT NULL, -- e.g., CREATE, UPDATE, DELETE
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  changes JSONB, -- store the changes as JSONB
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE whatsapp_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  recipient TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL, -- sent, failed, delivered
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_barang_kategori_id ON barang(kategori_id);
CREATE INDEX idx_barang_kode ON barang(kode);
CREATE INDEX idx_supplier_kode ON supplier(kode);
CREATE INDEX idx_customer_kode ON customer(kode);
CREATE INDEX idx_customer_pic_customer_id ON customer_pic(customer_id);
CREATE INDEX idx_customer_top_customer_id ON customer_top(customer_id);
CREATE INDEX idx_karyawan_jabatan_id ON karyawan(jabatan_id);
CREATE INDEX idx_kontrak_customer_id ON kontrak(customer_id);
CREATE INDEX idx_kontrak_item_brg_id ON kontrak_item(barang_id);
CREATE INDEX idx_kontrak_item_kontrak_id ON kontrak_item(kontrak_id);
CREATE INDEX idx_rfq_customer_id ON rfq(customer_id);
CREATE INDEX idx_rfq_item_rfq_id ON rfq_item(rfq_id);
CREATE INDEX idx_rfq_item_brg_id ON rfq_item(barang_id);
CREATE INDEX idx_quotation_customer_id ON quotation(customer_id);
CREATE INDEX idx_quotation_item_qt_id ON quotation_item(quotation_id);
CREATE INDEX idx_quotation_item_brg_id ON quotation_item(barang_id);
CREATE INDEX idx_customer_po_customer_id ON customer_po(customer_id);
CREATE INDEX idx_customer_po_item_po_id ON customer_po_item(customer_po_id);
CREATE INDEX idx_customer_po_item_brg_id ON customer_po_item(barang_id);
CREATE INDEX idx_di_customer_id ON di(customer_id);
CREATE INDEX idx_di_item_di_id ON di_item(di_id);
CREATE INDEX idx_di_item_brg_id ON di_item(barang_id);
CREATE INDEX idx_sales_order_po_id ON sales_order(customer_po_id);
CREATE INDEX idx_sales_order_di_id ON sales_order(di_id);
CREATE INDEX idx_sales_order_item_so_id ON sales_order_item(sales_order_id);
CREATE INDEX idx_sales_order_item_brg_id ON sales_order_item(barang_id);
CREATE INDEX idx_delivery_order_so_id ON delivery_order(sales_order_id);
CREATE INDEX idx_delivery_order_item_do_id ON delivery_order_item(delivery_order_id);
CREATE INDEX idx_delivery_order_item_brg_id ON delivery_order_item(barang_id);
CREATE INDEX idx_grn_pr_id ON grn(purchase_receiving_id);
CREATE INDEX idx_grn_di_id ON grn(di_id);
CREATE INDEX idx_grn_item_grn_id ON grn_item(grn_id);
CREATE INDEX idx_grn_item_brg_id ON grn_item(barang_id);
CREATE INDEX idx_retur_penjualan_do_id ON retur_penjualan(delivery_order_id);
CREATE INDEX idx_retur_penjualan_customer_id ON retur_penjualan(customer_id);
CREATE INDEX idx_retur_penjualan_item_rpj_id ON retur_penjualan_item(retur_penjualan_id);
CREATE INDEX idx_retur_penjualan_item_brg_id ON retur_penjualan_item(barang_id);
CREATE INDEX idx_retur_pembelian_po_id ON retur_pembelian(purchase_order_id);
CREATE INDEX idx_retur_pembelian_supplier_id ON retur_pembelian(supplier_id);
CREATE INDEX idx_retur_pembelian_item_rpb_id ON retur_pembelian_item(retur_pembelian_id);
CREATE INDEX idx_retur_pembelian_item_brg_id ON retur_pembelian_item(barang_id);
CREATE INDEX idx_purchase_request_so_id ON purchase_request(sales_order_id);
CREATE INDEX idx_purchase_order_supplier_id ON purchase_order(supplier_id);
CREATE INDEX idx_purchase_order_pr_id ON purchase_order(purchase_request_id);
CREATE INDEX idx_purchase_order_item_po_id ON purchase_order_item(purchase_order_id);
CREATE INDEX idx_purchase_order_item_brg_id ON purchase_order_item(barang_id);
CREATE INDEX idx_purchase_receiving_po_id ON purchase_receiving(purchase_order_id);
CREATE INDEX idx_purchase_receiving_item_pr_id ON purchase_receiving_item(purchase_receiving_id);
CREATE INDEX idx_purchase_receiving_item_brg_id ON purchase_receiving_item(barang_id);
CREATE INDEX idx_invoice_so_id ON invoice(sales_order_id);
CREATE INDEX idx_invoice_customer_id ON invoice(customer_id);
CREATE INDEX idx_invoice_item_inv_id ON invoice_item(invoice_id);
CREATE INDEX idx_invoice_item_brg_id ON invoice_item(barang_id);
CREATE INDEX idx_faktur_pajak_inv_id ON faktur_pajak(invoice_id);
CREATE INDEX idx_faktur_pajak_item_fpj_id ON faktur_pajak_item(faktur_pajak_id);
CREATE INDEX idx_faktur_pajak_item_inv_itm_id ON faktur_pajak_item(invoice_item_id);
CREATE INDEX idx_kwitansi_inv_id ON kwitansi(invoice_id);
CREATE INDEX idx_kwitansi_item_kwt_id ON kwitansi_item(kwitansi_id);
CREATE INDEX idx_kwitansi_item_inv_itm_id ON kwitansi_item(invoice_item_id);
CREATE INDEX idx_stok_brg_id ON stok(barang_id);
CREATE INDEX idx_stok_gdg_id ON stok(gudang_id);
CREATE INDEX idx_jurnal_item_jrn_id ON jurnal_item(jurnal_id);
CREATE INDEX idx_jurnal_item_acc_id ON jurnal_item(akun_id);
CREATE INDEX idx_absensi_krw_id ON absensi(karyawan_id);
CREATE INDEX idx_penggajian_krw_id ON penggajian(karyawan_id);