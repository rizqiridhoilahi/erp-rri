PROJECT REQUIREMENT DOCUMENT (PRD) - REVISED v2.0
Sistem ERP RRI - PT. Rizqi Ridho Ilahi (dengan RRI AI Chatbot)
1. Informasi Umum & Lingkungan Teknologi
 * Nama Aplikasi: ERP RRI
 * Nama Perusahaan: PT. Rizqi Ridho Ilahi
 * Lingkungan Kerja: GitHub Codespaces (Lokal/Cloud IDE).
 * Manajemen Kode: Git & GitHub (Repositori Publik: erp-rri | https://github.com/rizqiridhoilahi/erp-rri.git).
 * Runtime: Node.js (Versi 24 Latest).
 * Framework Frontend: Next.js (Pages Router) dengan TypeScript.
 * Styling & UI Components: Tailwind CSS dikombinasikan dengan komponen shadcn/ui.
 * Backend, Database & Storage: Supabase (PostgreSQL).
 * Autentikasi: Supabase Auth (Email/Password & Session Management).
 * Hosting / Deployment: Vercel.
 * AI & Machine Learning: OpenRouter API (Model: StepFun Free), Langchain.js untuk orchestration, Supabase Vector (pgvector) untuk semantic search & RAG (Retrieval-Augmented Generation).
2. Arsitektur Fungsional & Logika UI
A. Master Data (Pusat Data Utama)
Setiap halaman Master Data wajib memiliki fitur:
 * Pencarian Pintar (Full-Text Search): Pencarian di beberapa kolom sekaligus dengan debounce 300-500ms (menggunakan ILike di Supabase).
 * Filter Dinamis: Berdasarkan Kategori, Merek, Pemasok, dan Status Stok.
 * Pemuatan Data (Pagination): Penomoran halaman konvensional dengan opsi memuat 10, 20, atau 50 baris per halaman.
 * Pengurutan (Sorting): Pengurutan tabel secara interaktif dengan kriteria default:
   * Nama (A-Z / Z-A)
   * Harga (Terendah - Tertinggi)
   * Stok (Terbanyak - Sedikit)
Detail Entitas Master Data:
 * Produk: SKU, Foto, Nama, Merek, Kategori, Deskripsi, Harga Beli, Harga Jual, Stok, Satuan, Status (Stocked/Indent), Link Referensi.
 * Jasa: Kode Jasa, Nama, Kategori, Deskripsi, Satuan, Harga Jual.
 * Pelanggan (CRM): Detail perusahaan, kontak person, alamat lengkap, dan informasi pajak (NPWP).
 * Pemasok (Supplier): Detail vendor, kontak, alamat, dan informasi rekening bank.
B. Modul Penjualan (Sales) - Fokus Utama
 * Quotation (Penawaran SPH):
   * Form Dinamis: Input item produk/jasa yang bisa ditambah/dihapus, kalkulasi subtotal otomatis.
   * Data Pendukung: Input No. RFQ pelanggan, Subjek RFQ, Masa Berlaku (dalam hari), Estimasi Pengiriman (dalam hari), dan Catatan tambahan.
   * PPN 11%: Toggle / Checkbox untuk mengaktifkan PPN. Jika aktif, Grand Total = Subtotal + (Subtotal * 11%).
 * Jalur Cepat Kontrak (Delivery Instruction / DI):
   * Kemampuan melewati tahap Quotation dan langsung membuat Sales Order (SO) bagi pelanggan yang memiliki kontrak harga, cukup dengan memasukkan nomor referensi DI.
 * Sales Order (SO) & Delivery Order (DO):
   * Konversi otomatis dari Quotation yang disetujui, mewariskan nomor urut transaksi.
   * Fitur unggah dokumen pelanggan (PO Pelanggan, Delivery Slip).
   * Pembuatan Surat Jalan (DO) dengan pelacakan status pengiriman dan unggah bukti GRN (Goods Receipt Note) dari pelanggan.
C. Modul Pembelian (Purchasing) & Keuangan (Finance)
 * Purchase Order (PO): Pemesanan barang ke Supplier untuk memenuhi Sales Order atau sekadar menambah stok.
 * Invoicing (Faktur) & Piutang: Faktur penjualan yang memantau total terbayar (amount_paid) vs total tagihan. Jika lunas, status otomatis menjadi Paid dan fitur cetak Kwitansi terbuka.
D. Modul RRI AI Chatbot - Asisten Cerdas untuk Admin
 * Nama Fitur: RRI AI (Powered by StepFun via OpenRouter).
 * Posisi UI: Widget floating chat di sudut bawah kanan aplikasi dengan opsi minimize/expand full-screen.
 * Fitur Utama RRI AI:
   * Pertanyaan Transaksi & Data: Admin dapat menanyakan "Berapa total penjualan bulan ini?", "Siapa customer dengan KPI tertinggi?", "Stok produk mana yang kritis?", dan sistem akan meng-query database secara real-time dengan query AI-generated untuk memberikan jawaban akurat dan kontekstual.
   * Smart Form Assistant: Saat admin membuat Quotation atau Sales Order, RRI AI dapat menyarankan harga berdasarkan riwayat kontrak, margin mapping, dan historical pricing patterns menggunakan data warehouse internal.
   * Rekomendasi Bisnis: Analisis tren penjualan, identifikasi customer churn risk, prediksi demand stok menggunakan historical data dan AI inference.
   * Guided Workflow: Memandu admin step-by-step dalam membuat dokumen komplek (DI -> SO -> DO -> Invoice) dengan checklist dan validasi otomatis.
   * Natural Language to SQL: Menerjemahkan pertanyaan natural language admin menjadi query SQL yang aman dan optimized menggunakan RAG (Retrieval-Augmented Generation) dengan knowledge base schema database.
   * Laporan Cepat (Text-to-Report): Admin cukup berkata "Buat laporan invoices pending bulan lalu", sistem akan generate laporan PDF dengan tabel, chart, dan summary otomatis.
   * Troubleshooting & Help: RRI AI dilengkapi knowledge base SOP & FAQ internal yang dapat dijawab secara instant dengan konteks sistem yang sedang digunakan user.
 * Integrasi Data Context:
   * Setiap percakapan disisipi context_awareness berupa: halaman aktif user, data terakhir yang dilihat, customer/product yang sedang dikerjakan, sehingga RRI AI memahami intent user dengan lebih akurat (contoh: user di halaman Quotation -> RRI AI tahu user mau buat penawaran).
   * Logging & Audit: Setiap interaksi chat tersimpan di tabel ai_conversations dengan metadata: user_id, timestamp, prompt, response, tokens_used, mode (personal/shared), untuk compliance & learning feedback loop.
 * Konfigurasi Admin:
   * Preset Persona: Admin dapat memilih personality RRI AI antara Professional/Formal, Casual/Friendly, atau Technical Detail-Oriented.
   * Knowledge Base Management: Admin dapat upload internal SOP documents, FAQ, atau custom knowledge base (PDF, TXT) yang akan di-embed & indexed di Pinecone vector DB untuk dipublikasikan ke RRI AI tanpa code changes.
 * Keamanan & Batasan:
   * RRI AI hanya dapat mengakses data yang user tersebut memiliki permission (Row-Level Security terintegrasi).
   * Sensitive data (password, full tax_id) di-mask dalam prompt sebelum dikirim ke OpenRouter API.
   * Rate limiting: Max 100 chat per hari per user untuk mencegah abuse & high API costs.
3. Mekanisme File, Gambar, dan Cetak PDF
A. Optimasi Storage & Manajemen Gambar
 * Resize & Kompresi: Semua gambar produk/bukti transfer wajib di-resize dan dikompresi di sisi client (menggunakan library seperti browser-image-compression) sebelum diunggah ke Supabase Storage. Tujuannya untuk menghemat ruang (storage).
 * Replace / Hapus Gambar Lama: Jika user memperbarui gambar pada mode Edit, sistem wajib mengeksekusi fungsi hapus (delete) pada URL/Path gambar lama di bucket Supabase, barulah mengunggah gambar yang baru.
B. Pembuatan Dokumen PDF
 * Metode: Menggunakan Layanan API PDF Berbayar pihak ketiga yang cepat (misal: API2PDF atau sejenisnya) agar tidak membebani memori RAM dan timeout limit Vercel.
 * Logika "Gunakan Lampiran Terpisah" (Checkbox):
   * Tidak Dicentang: Mengirimkan muatan HTML berupa 1 halaman surat berisikan tabel item.
   * Dicentang: Mengirimkan muatan HTML berupa 2 halaman. Halaman 1 = Surat Pengantar (hanya total harga), Halaman 2 = Lampiran detail item/produk beserta gambarnya.
4. Arsitektur Database, Fungsi & Keamanan (Supabase PostgreSQL)
A. Fungsi Penomoran Terpusat (Sequence Engine)
 * Tabel transaction_sequences: Kolom year (INT, PK), last_sequence (INT).
 * RPC generate_transaction_number(prefix TEXT): Fungsi yang mengambil urutan terakhir untuk tahun berjalan, menambah +1, lalu merangkai string (Contoh: RRI-SPH-25-00029). Nomor 00029 ini kemudian menjadi identitas transaksi sekuensial untuk turunan dokumennya (SO-25-00029, DO-25-00029).
B. Logika Kontrak Harga Pelanggan
 * Sistem mengecek tabel customer_product_contracts berdasarkan customer_id dan product_id.
 * Jika start_date <= Hari Ini <= end_date, maka nilai contract_price akan otomatis menimpa selling_price default dari tabel Master Produk saat membuat Quotation atau Sales Order.
C. Skema Tabel Lengkap (Struktur Database)
| Nama Tabel | Kolom Utama & Tipe Data | Relasi (Foreign Keys) |
|---|---|---|
| products | id (UUID, PK), sku (TEXT), name (TEXT), brand (TEXT), category (TEXT), description (TEXT), purchase_price (NUMERIC), selling_price (NUMERIC), stock (INT), unit (TEXT), status (TEXT), image_url (TEXT), created_at, updated_at | - |
| services | id (UUID, PK), code (TEXT), name (TEXT), category (TEXT), selling_price (NUMERIC), unit (TEXT) | - |
| customers | id (UUID, PK), name (TEXT), email (TEXT), phone (TEXT), address (TEXT), tax_id (TEXT) | - |
| suppliers | id (UUID, PK), name (TEXT), contact_info (TEXT), address (TEXT), bank_info (TEXT) | - |
| customer_product_contracts | id (UUID, PK), contract_price (NUMERIC), start_date (DATE), end_date (DATE), notes (TEXT) | customer_id -> customers.id
product_id -> products.id |
| quotations | id (UUID, PK), quotation_number (TEXT), quotation_date (DATE), expiry_days (INT), delivery_days (INT), rfq_number (TEXT), rfq_subject (TEXT), total_amount (NUMERIC), use_tax (BOOLEAN), use_attachment (BOOLEAN), notes (TEXT), status (TEXT), rfq_document_url (TEXT) | customer_id -> customers.id |
| quotation_items | id (UUID, PK), description (TEXT), quantity (INT), price_per_unit (NUMERIC), remarks (TEXT) | quotation_id -> quotations.id
product_id -> products.id (Nullable)
service_id -> services.id (Nullable) |
| sales_orders | id (UUID, PK), so_number (TEXT), status (TEXT), is_contract_based (BOOLEAN), customer_po_url (TEXT), customer_delivery_slip_url (TEXT), signed_po_url (TEXT) | quotation_id -> quotations.id (Nullable)
customer_id -> customers.id |
| delivery_orders | id (UUID, PK), do_number (TEXT), shipping_date (DATE), status (TEXT), signed_do_url (TEXT), customer_grn_url (TEXT) | sales_order_id -> sales_orders.id |
| invoices | id (UUID, PK), invoice_number (TEXT), due_date (DATE), total_amount (NUMERIC), amount_paid (NUMERIC), status (TEXT) | sales_order_id -> sales_orders.id |
| ai_conversations | id (UUID, PK), user_id (UUID), conversation_name (TEXT), mode (TEXT: 'personal'/'shared'), is_pinned (BOOLEAN), created_at, updated_at | user_id -> auth.users.id |
| ai_messages | id (UUID, PK), prompt (TEXT), response (TEXT), tokens_used (INT), temperature (NUMERIC), context_data (JSONB), embedding (pgvector), created_at | conversation_id -> ai_conversations.id |
| ai_knowledge_base | id (UUID, PK), document_name (TEXT), document_type (TEXT: 'SOP'/'FAQ'/'CUSTOM'), content (TEXT), embedding (pgvector), file_url (TEXT), is_active (BOOLEAN), created_by (UUID), created_at, updated_at | created_by -> auth.users.id |
| ai_analysis_cache | id (UUID, PK), analysis_type (TEXT: 'sales_trend'/'inventory'/'customer_churn'/'forecast'), result_json (JSONB), generated_at, expires_at | - |
Catatan Tambahan Database: Seluruh tabel wajib memiliki fungsi Trigger otomatis update_updated_at_column() untuk mencatat jejak waktu pembaruan baris. Tabel-tabel vector (embedding) menggunakan extension pgvector di Supabase untuk semantic search dan RAG queries.
5. Fitur-Fitur Tambahan & Enhancement (Roadmap Future Releases)
A. Dashboard Analytics & Business Intelligence
 * Real-time Dashboard: KPI utama (Total Revenue, Outstanding Invoices, Pending Quotations, Low Stock Products, Top Customers).
 * Interactive Charts & Graphs: Revenue trend per bulan, sales by category, customer concentration, supplier performance metrics.
 * Drill-down Capability: Click chart untuk melihat detail transaksi yang berkontribusi pada data tersebut.
 * Export Reports: PDF, Excel, CSV untuk presentasi stakeholder.
B. Notification System & Work Flow Automation
 * Alert & Notification Types:
   * Quotation Expiring Soon: Notifikasi jika penawaran akan kadaluarsa dalam 3 hari.
   * Low Stock Warning: Alert saat stok produk di bawah safety stock threshold.
   * Payment Overdue: Reminder invoice yang sudah lewat due date (1, 3, 7 hari).
   * Order Status Update: Real-time notification saat SO/DO status berubah (e.g., customer menerima delivery).
 * Notification Channels: In-App notifications, Email digest (Daily/Weekly), SMS untuk urgent alerts (terintegrasi Twilio/AWS SNS).
 * Smart Reminder: RRI AI dapat suggest best timing untuk follow-up customer berdasarkan engagement pattern.
C. Approval Workflow & Multi-Level Authorization
 * Configuration Approval Rules:
   * Quotation > Rp 100 Juta butuh approval dari Manager.
   * Purchase Order > Rp 50 Juta butuh approval dari Finance & Procurement Head.
   * Discount > 15% memerlukan special approval.
 * Status Workflow: Draft -> Pending Approval -> Rejected/Approved -> Executed.
 * Audit Trail: Setiap approval step dilog dengan nama approver, timestamp, dan optional notes.
D. Role-Based Access Control (RBAC) & Granular Permissions
 * Predefined Roles:
   * Admin: Full access ke semua module dan settings.
   * Sales Manager: Akses Quotation, SO, DO, Customer management.
   * Finance Officer: Akses PO, Invoice, Payment tracking, Financial reports.
   * Warehouse Staff: Akses limited ke DO confirmation, stock updates.
   * Customer Service: Akses customer data, order status, order history (read-only).
 * Module-Level & Field-Level Permissions: Granular control over mana field yang visible, editable, atau hidden per role.
 * Delegation: Temporary grant access ke subordinate dengan time-bound permissions (e.g., "Approve up to Rp 50jt for 1 week during my leave").
E. Currency & Language Standar
 * Currency: Seluruh transaksi menggunakan Rupiah Indonesia (IDR/Rp) sebagai mata uang utama tanpa konversi.
 * Satuan Uang: Semua input & output menggunakan format Rp dengan pemisah ribuan (contoh: Rp 1.234.567).
 * Language: User Interface seluruhnya dalam Bahasa Indonesia, tidak ada dukungan multi-bahasa.
 * Date Formatting: Format standar Indonesia DD/MM/YYYY untuk konsistensi dokumentasi & laporan.
F. Email Integration & Document Delivery
 * Automated Email Workflow:
   * Send Quotation PDF langsung ke customer email dengan tracking (delivery status, open rate jika menggunakan Mailgun/SendGrid).
   * Send Invoice Reminder otomatis 3 hari sebelum due date dan setiap 5 hari jika overdue.
   * Send Delivery Confirmation saat DO status berubah menjadi "Delivered" dengan tracking link.
 * Email Template Management: Admin dapat customize email template (company branding, signature, additional notes) tanpa code changes.
 * Integration Stack: Nodemailer + SendGrid / Mailgun (production-grade email service untuk reliability & deliverability).
G. Audit Trail & Compliance Logging
 * Complete Activity Logging: Setiap CREATE, UPDATE, DELETE operation dicatat dengan:
   * Timestamp, user_id, action_type, table_name, old_value (sebelum edit), new_value (sesudah edit).
   * IP address & user agent untuk security audit.
 * Immutable Audit Log: Data tersimpan di dedicated audit table dengan no-update/no-delete policy untuk compliance.
 * Compliance Reports: Readily generate audit reports per user, per module, per date range untuk fungsi compliance & internal audit.
H. Stock Forecasting & Demand Planning
 * Predictive Analytics: RRI AI menganalisis historical sales pattern & seasonal trend untuk forecast demand 3-6 bulan ke depan.
 * Reorder Point Calculation: Sistem otomatis suggest kapan dan berapa quantity PO yang ideal berdasarkan forecast & supplier lead time.
 * Safety Stock Management: Perhitungan safety stock dinamis berdasarkan demand variability dan service level target (95%, 99%).
 * Suggested PO: Admin dapat auto-approve RRI AI suggested PO jika parameter sudah dikonfigurasi.
I. Responsive Design untuk Multiple Screen Sizes
 * Mobile-Optimized Interface: Responsive design untuk tablet & smartphone menggunakan Tailwind responsive utilities untuk kenyamanan user di berbagai device.
 * Focus pada Web: Aplikasi utama berbasis web responsif, bukan native/PWA, untuk kesederhanaan maintenance dan universal compatibility.
J. Financial Management System (Internal)
 * Comprehensive Financial Module: Sistem keuangan terintegrasi penuh dalam aplikasi ERP (tidak perlu integrasi eksternal).
 * Sub-Module 1: Chart of Accounts & General Ledger
   * Setup COA: Struktur Chart of Accounts sesuai standar Indonesia (Assets, Liabilities, Equity, Revenue, Expenses) dengan auto-numbering hierarkis.
   * General Ledger: Master ledger dengan posting automatic dari semua transaksi (penjualan, pembelian, inventory, payroll).
   * GL Reconciliation: Tools untuk reconcile GL balance dengan subsidiary ledgers (AR, AP, inventory).
   * Account Analysis: Drill-down setiap GL account untuk melihat detailed journal entries per periode.
 * Sub-Module 2: Income Statement & Profitability Analysis
   * P&L Statement (Laba Rugi): Automated monthly/quarterly/yearly income statement dengan comparison year-over-year.
   * Cost of Goods Sold (COGS): Automatic calculation dari inventory valuation, dengan support FIFO/LIFO/Average Cost methods.
   * Operating Expenses: Breakdown operasional expenses (salaries, utilities, marketing, depreciation) dengan trend analysis.
   * Gross Profit & Net Income: Automatic calculation margin per product line, per customer segment.
   * Net Profit Margin Trend: Visual chart untuk trend profitability dalam 12 bulan terakhir.
 * Sub-Module 3: Balance Sheet & Financial Position
   * Balance Sheet Statement: Asset, Liability, Equity position per periode dengan comparison.
   * Asset Management: Tracking fixed assets, depreciation schedule, asset disposal & gain/loss calculation.
   * Current Ratio & Working Capital: Automatic liquidity metrics untuk cash flow management.
   * Debt-to-Equity Ratio: Leverage analysis untuk financing decisions.
 * Sub-Module 4: Cash Flow Statement & Liquidity
   * Cash Flow Statement: Automated operating, investing, & financing activities breakdown.
   * Daily Cash Position: Real-time cash balance aggregation dari semua bank accounts.
   * Cash Forecast: Predictive cash position 30/60/90 hari ke depan berdasarkan AR collections & AP payments schedule.
   * Bank Reconciliation: Otomatis matching bank statement dengan GL bank accounts, flagging uncleared items.
 * Sub-Module 5: Trial Balance & Account Reconciliation
   * Trial Balance Report: Debit/Credit balance verification sebelum period close.
   * Unreconciled Items: List outstanding invoices, payments, adjustments yang belum clear.
   * Period Close Checklist: Guided closing process dengan validasi semua line item sebelum allow month-end close.
   * Closing Entries: Automated post closing entries & opening balances untuk next period.
 * Sub-Module 6: Financial Ratio Analysis Dashboard
   * Liquidity Ratios: Current Ratio, Quick Ratio, Cash Ratio untuk short-term solvency assessment.
   * Profitability Ratios: ROA (Return on Assets), ROE (Return on Equity), Net Profit Margin untuk efficiency measurement.
   * Efficiency Ratios: Asset Turnover, Inventory Turnover, AR Turnover untuk operational efficiency insight.
   * Leverage Ratios: Debt Ratio, Debt-to-Equity, Interest Coverage untuk financial structure analysis.
   * Trend Analysis: 12-month historical ratio tracking dengan KPI target setting & variance reporting.
 * Sub-Module 7: Tax Compliance & Reporting
   * PPh & PPN Tracking: Auto-tracking income tax (PPh) & value-added tax (PPN) obligations.
   * Tax Register: Detailed tax register per transaction untuk audit trail.
   * Monthly Tax Reports: Generate Tax Monthly/Quarterly reports siap submit ke tax authorities.
   * Tax Calculation: Automated PPh21 (salary tax), PPh22 (withholding), PPh23 (service income) calculation per regulation.
 * Sub-Module 8: Accounts Receivable (AR) & Accounts Payable (AP) Management
   * AR Aging Report: Breakdown of outstanding invoices by age bucket (current, 30 days, 60 days, 90+ days) untuk collection management.
   * AP Aging Report: Upcoming payment obligations by supplier dengan payment schedule optimization.
   * Bad Debt Provision: Automatic reserve calculation berdasarkan aging buckets & historical default rates.
   * Dunning Management: Auto-escalation collection reminder per aging period (email, SMS, customer portal notification).
 * Sub-Module 9: Budget & Forecast vs Actual
   * Annual Budget Setup: Admin set target revenue, expenses per department/cost center.
   * Monthly Budget Tracking: Actual vs budget comparison dengan variance flag jika exceed threshold.
   * Forecast vs Actual: Quarterly forecast update berdasarkan YTD actual performance.
   * Budget Variance Analysis: Detailed breakdown mana area yang over/under budget dengan management notes.
 * Sub-Module 10: Financial Reporting & Export
   * Report Templates: Pre-built professional report templates (Standard Indonesian Format) untuk income statement, balance sheet, cash flow.
   * Custom Report Builder: Admin dapat design custom reports dengan drag-drop field selection tanpa coding.
   * Export Formats: Export laporan ke PDF (untuk printing & distribution), Excel (untuk further analysis), JSON (untuk system integration).
   * Email Distribution: Schedule automatic email delivery financial reports ke stakeholder (manager, finance team, board) monthly/quarterly.
   * Archival: Historical reports auto-archived dengan version control & audit trail para regulatory compliance.
K. Customer Portal & Self-Service
 * Dedicated Customer Hub: Web portal bagi customer untuk:
   * View quotations & order history.
   * Upload PO dan manage delivery preferences.
   * Track delivery status (real-time location jika terintegrasi logistics partner).
   * View & download invoices, maturity profile, aging statements.
   * Submit payment proof (automated invoice reconciliation).
 * Portal Authentication: OAuth2 terintegrasi dengan customer account di ERP atau email-based OTP magic link.
L. Financial Reports & Business Intelligence
 * Advanced Reporting Tools: Sistem reporting profesional dengan query builder & template management.
 * Export & Distribution: Export laporan ke PDF, Excel dengan formatting profesional, auto-email distribution ke stakeholder.
 * Budget vs Actual: Tracking budget tahunan vs realisasi dengan variance analysis.
 * Report Customization: Admin dapat buat custom report templates tanpa code changes.
M. Supplier Management & Procurement Optimization
 * Supplier Scorecard & Performance Metrics: Rate suppliers berdasarkan quality score (% defect), on-time delivery rate, price competitiveness, payment terms compliance.
 * Purchase Requisition Workflow: User create requisition → approval → convert ke PO dengan full audit trail.
 * RFQ (Request for Quotation) Management: Send RFQ ke multiple suppliers secara simultaneous, compare quotes side-by-side, award PO ke supplier terpilih.
 * Supplier Performance Dashboard: Visual tracking supplier metrics dengan trend analysis 12 bulan.
 * Preferred Supplier List: Setup whitelist suppliers per kategori produk, restrict buying dari non-approved vendors (dengan override capability untuk urgent).
 * Purchase History & Benchmarking: Compare harga across suppliers per periode, identify cost savings opportunities.
 * Supplier Contact Database: Master supplier dengan multi-contact persons, updated contact info, special handling instructions.
 * Lead Time Tracking: Monitor actual vs promised lead time per supplier, auto-alert jika delivery delay.
N. Advanced Dashboard & Business Intelligence
 * Dashboard Customization: Users dapat customize dashboard dengan drag-drop widgets, save multiple custom views per role.
 * Real-time KPI Widgets: Set target KPI per widget dengan threshold alerts (visual indicator: green/yellow/red status).
 * Sales Pipeline Visualization: Funnel chart opportunity status, probability-weighted revenue forecast, win/loss rate trending.
 * Comparative Analytics: Compare current month vs previous month, year-over-year comparison dengan variance highlighting.
 * Interactive Drill-down: Click any chart data → drill-down ke detail transactions dengan filtering capability.
 * Scheduled Dashboard Emails: Auto-generate & email dashboard snapshots ke executives per schedule (daily, weekly, monthly).
 * Dashboard Sharing: Share custom dashboards dengan team members, role-based visibility dengan export-to-PDF capability.
O. Advanced Notification & Alert System
 * Multi-Channel Alert Distribution: Email, SMS, In-app browser notifications, desktop push notifications untuk critical alerts.
 * Custom Alert Rules Engine: Admin setup complex alert rules (e.g., "Alert jika revenue > Rp 500juta AND customer type = 'Key Account'").
 * Alert Priority & Escalation: Set alert severity level (Critical/High/Medium/Low) with escalation path (escalate to manager jika not acknowledged within 2 hours).
 * Notification Preferences per User: Users dapat customize alert types, channels, frequency per notification category (e.g., "Email only untuk Payment Overdue, SMS untuk Low Stock").
 * Bulk Alert Distribution: Send notification ke multiple recipients (team/department/broadcast) dengan tracking (delivery status, read status, click-through).
 * Alert Event Logging: Track semua alerts sent dengan recipient response & action taken untuk audit trail.
 * Notification Templates: Pre-built templates dengan variable substitution (e.g., "Invoice {invoice_number} dari {customer_name} overdue sejak {days_overdue} hari").
P. Data Import & Export - Excel Operations
 * Excel Import Functionality: Bulk import data dari Excel file (products, customers, suppliers, orders) dengan template validation.
 * Validation Rules: Auto-validate imported data (check required fields, data type validation, duplicate detection, foreign key reference check).
 * Preview Before Import: Users dapat preview imported data sebelum commit, dengan option untuk skip error rows atau reject entire import.
 * Import Mapping: User dapat map Excel column headers ke system fields dengan save mapping template untuk reuse.
 * Import History & Log: Track semua imports dengan timestamp, uploaded_by, rows_imported, rows_failed, error details untuk debugging.
 * Excel Export Templates: Pre-built export templates untuk product master, customer list, supplier list, sales order, invoice dengan professional formatting.
 * Scheduled Exports: Setup scheduled export jobs (e.g., "Export daily sales report ke Excel setiap Senin jam 8 pagi").
 * Batch Excel Operations: Export filtered data sets dengan applied filters & sort order maintained dalam export file.
Q. Advanced Search & Saved Filters
 * Full-Text Search: Search across multiple modules/entities (products, customers, suppliers, documents, invoice content) dengan instant results & relevance ranking.
 * Advanced Query Builder: UI untuk build complex search queries (AND/OR conditions, date ranges, numeric ranges) tanpa coding.
 * Search History & Suggestions: Track user searches, provide auto-complete suggestions based on popular/historical searches & context.
 * Saved Filters & Views: Users dapat save complex filter combinations dengan meaningful names untuk quick reuse (e.g., "Invoices Pending > 90 Days").
 * Filter Sharing: Share saved filters dengan team members atau mark as public untuk org-wide access.
 * Smart Search Analytics: Track popular searches untuk identify missing features atau data gaps.
 * Search Performance Optimization: Index frequently searched fields untuk instant results bahkan dengan large dataset.
R. User Activity & Audit Trail Extended
 * User Login History: Track semua login attempts (successful & failed) dengan IP address, device info, geo-location (via IP geolocation API).
 * Activity Dashboard: Manager dapat monitor real-time user activities per user/department (who logged in, what pages visited, what actions performed).
 * Field-Level Change Tracking: Detailed log setiap field change dengan before/after values (e.g., "Price changed from Rp 1.000 to Rp 1.200 by Budi on 2025-03-15 10:30").
 * Activity Report Generation: Generate audit reports filtered by user/module/date range dengan export-to-PDF capability.
 * Data Access Logging: Track who accessed sensitive data (customer tax ID, employee salary, supplier bank account) dengan timestamp & purpose logging.
 * Suspicious Activity Detection: Flag unusual activities (e.g., mass delete operations, bulk discount, after-hours logins) untuk security review.
 * Activity Timeline Visualization: Visual timeline per transaction/record showing all user actions, approvals, modifications in chronological order.
S. Integration-Ready Architecture (Webhook & API)
 * Webhook Event Triggers: Define webhook events untuk business operations (order created, invoice paid, stock updated, customer created, etc).
 * Webhook Configuration Dashboard: Admin dapat setup webhook endpoints per event type dengan retry logic (exponential backoff, max 5 retries).
 * Webhook Payload Format: RESTful JSON payload dengan event metadata (timestamp, event_type, user_id, entity_id, before/after data).
 * Webhook Testing & Monitoring: Test webhook delivery, monitor webhook logs dengan success/failure status & response codes.
 * Webhook Security: Webhook signed dengan HMAC-SHA256 signature validation untuk ensure authenticity (prevent spoofing).
 * REST API Foundation (Future Phase): Public API endpoints untuk third-party integration, mobile apps, custom dashboard dengan OpenAPI/Swagger documentation.
 * API Authentication: OAuth 2.0 support with API keys, rate limiting per client, audit log per API consumer.
 * Webhook Retry Mechanism: Auto-retry failed webhooks dengan exponential backoff (1s, 2s, 4s, 8s, 16s delays) untuk reliability.
 * Event Filtering: Trigger webhooks hanya untuk specific conditions (e.g., "send webhook jika invoice amount > Rp 50juta").
6. Roadmap & Prioritas Implementasi
Phase 1 (MVP Release - Bulan 1-2):
 * Master Data (Products, Services, Customers, Suppliers) dengan full search, filter, pagination.
 * Sales Module: Quotation, SO, DO dengan PDF generation.
 * Basic RRI AI: Q&A terhadap database dengan natural language, smart form suggestion.
 * Role-Based Access Control (basic 3 roles: Admin, Sales, Finance).
 * Basic Financial Module: Chart of Accounts, Journal Entry, general ledger.
 * Advanced Search: Full-text search across entities dengan smart suggestions.
 * User Activity Logging: Basic activity tracking untuk audit trail.
Phase 2 (Enhancement - Bulan 3-4):
 * RRI AI Knowledge Base Management: Upload custom SOP/FAQ.
 * Notification System: Email alerts untuk critical events.
 * Approval Workflow dengan multi-level authorization.
 * Dashboard Analytics dengan basic KPI chart.
 * Financial Statements: Balance Sheet, Income Statement automated generation.
 * Permission Management: Granular field-level permissions per role.
 * Saved Filters & Custom Views: Users dapat save complex queries.
 * Data Import: Excel import untuk products, customers, suppliers dengan validation.
Phase 3 (Advanced - Bulan 5-6):
 * Demand Forecasting & Stock Prediction.
 * Email Integration: Automated document delivery & payment reminders.
 * Audit Trail & Compliance Logging (complete dengan field-level tracking).
 * Customer Portal untuk self-service order tracking.
 * Advanced Financial Reports: Cash Flow, Ratio Analysis, Budget tracking.
 * Supplier Management: RFQ, scorecard, performance metrics, benchmarking.
 * Advanced Dashboard Customization: Drag-drop widgets, threshold alerts, sharing.
 * Advanced Alerts: Multi-channel distribution, custom rules, escalation paths.
 * Data Export: Excel export dengan templates, scheduled exports.
Phase 4 (Integration & Optimization - Bulan 7-8):
 * Advanced Analytics & Business Intelligence Dashboard enhancements.
 * Customer Portal expansion (logistics integration).
 * Webhook & API Foundation: Event triggers, webhook configuration, testing.
 * User Activity Extended: Login history, geo-location, suspicious activity detection.
 * Mobile Responsive Optimization (PWA-ready structure untuk future).
Phase 5 (Future Enhancement):
 * Public REST API endpoints dengan OAuth 2.0 authentication.
 * Advanced integrations (logistics partner, accounting systems).
 * Machine Learning models untuk demand forecasting & customer churn prediction.
 * Advanced WMS (warehouse management system) dengan barcode integration.
7. Dependencies & Libraries (Untuk Development Reference)
Backend/API Dependencies:
 * next.js, typescript, supabase (official client library).
 * langchain, openrouter (untuk AI orchestration & LLM calls ke StepFun via OpenRouter).
 * axios, nodemailer atau sendgrid (untuk HTTP requests & email).
 * zod (untuk validation schema).
 * jsonwebtoken (JWT utilities untuk API auth).
Frontend Dependencies:
 * react, react-dom (Next.js framework).
 * typescript, tailwindcss, shadcn/ui (UI library).
 * react-query atau swr (data fetching & caching).
 * zustand atau jotai (state management).
 * recharts atau chart.js (data visualization).
 * react-markdown (untuk render AI response).
 * react-pdf, html2pdf (untuk PDF preview/download).
 * browser-image-compression (image optimization client-side).
Development & Testing:
 * jest, vitest (unit testing).
 * cypress, playwright (e2e testing).
 * eslint, prettier (code quality & formatting).
 * husky (git hooks untuk pre-commit validation).
Kesimpulan & Langkah Selanjutnya
Dokumen PRD ini telah direvisi v2.2 dengan penambahan 7 fitur enterprise-grade: Supplier Management & Procurement Optimization, Advanced Dashboard & BI, Advanced Notification & Alert System, Excel Import/Export, Advanced Search & Saved Filters, User Activity Extended, dan Integration-Ready Architecture (Webhook & API). Dengan roadmap 5 phases yang terstruktur, sistem siap untuk development dengan fokus MVP pada Phase 1 (Master Data + Basic RRI AI + Financial Module), dilanjutkan Phase 2-3 untuk enhancement operasional & finance, Phase 4 untuk integration & optimization, dan Phase 5 untuk scalability jangka panjang. Dengan kombinasi RRI AI chatbot, comprehensive financial management, supplier management, advanced analytics, dan enterprise-grade features, ERP RRI akan menjadi solusi ERP yang truly powerful & professional untuk mengelola operasional trading hingga financial health PT. Rizqi Ridho Ilahi dengan single integrated platform.