# Roadmap ERP RRI

## Fase 1 — Setup & Master Data
- [x] Project setup (Next.js, Tailwind, Drizzle, ESLint)
- [x] Database schema (50+ tables)
- [x] Auth pages (login, register)
- [x] Middleware route protection (`src/middleware.ts`)
- [x] Dashboard layout + sidebar (navigasi ke semua modul)
- [x] Root layout (`<html><body>`) — fix route group `(dashboard)` → `dashboard/`
- [x] Master Barang (list, tambah, edit)
- [x] Master Supplier (list, tambah, edit)
- [x] Master Customer (list, tambah, edit)
- [x] Master PIC Customer (list, tambah, edit)
- [x] Master COA (list, tambah, edit)
- [x] Master Kontrak (list, tambah, edit)
- [x] Master Kategori Barang (list, tambah, edit)
- [x] Master Jabatan (list, tambah, edit)
- [x] Master Karyawan (list, tambah, edit)
- [x] Document Counter auto-numbering (PostgreSQL function + TypeScript utility)
- [x] API infrastructure: `lib/api/client.ts`, `auth.ts`, `errors.ts`, `supabase-server.ts`
- [x] API routes `/api/v1/master/*` — 20 route handlers (GET/POST/PUT/DELETE) untuk 9 entities
- [x] OpenAPI auto-generate (`/openapi.json`) + Scalar UI (`/api-docs`)
- [x] Frontend refactor: all form pages use `apiFetch()` instead of direct Supabase
- [x] Hybrid pattern: server components → direct Supabase, client components → API routes
- [x] UI/UX Design System: shadcn/ui, color palette, typography (Lexend + Source Sans 3), icon rules
- [x] PRD.md v4.0 — didokumentasi penuh (design system, API architecture, folder structure update)

## Fase 2 — Pre-Sales & Sales
- [ ] RFQ (list, tambah, edit, detail)
- [ ] Quotation (list, tambah, edit, PDF)
- [ ] Negosiasi (track, counter offer, approval)
- [ ] DI — Delivery Instruction (list, tambah, edit)
- [ ] Sales Order (auto-generate, list, detail)
- [ ] Delivery Order (list, tambah, PDF, tracking)

## Fase 3 — Procurement & Inventory
- [ ] Purchase Request (list, tambah, approval)
- [ ] AI Search Harga
- [ ] Purchase Order (list, tambah, edit, PDF)
- [ ] Receiving / Penerimaan Barang
- [ ] GRN (Goods Received Note)
- [ ] Retur Pembelian
- [ ] Stok Masuk / Keluar
- [ ] Kartu Stok

## Fase 4 — Finance & Dokumen PDF
- [ ] Invoice (list, tambah, PDF)
- [ ] Kwitansi (list, tambah, PDF)
- [ ] Faktur Pajak
- [ ] PPN & PPh kalkulasi
- [ ] AR / AP Aging
- [ ] Jurnal Umum
- [ ] Laba / Rugi
- [ ] Neraca
- [ ] Arus Kas

## Fase 5 — AI Agent
- [ ] AI Search Harga (Playwright)
- [ ] AI OCR Kontrak
- [ ] AI Rekomendasi Harga
- [ ] AI Negosiasi Assistant

## Fase 6 — HR, Dashboard & Laporan
- [ ] Absensi
- [ ] Penggajian
- [ ] Slip Gaji
- [ ] Dashboard Owner
- [ ] Dashboard Manager / Sales / Procurement / Gudang / Finance
- [ ] Export Excel / CSV
- [ ] Audit Trail
- [ ] Global Search

## Fase 7 — Notifikasi & Retur
- [ ] WhatsApp Notification
- [ ] Retur Penjualan
- [ ] User Onboarding

## Fase 8 — Polish & Production
- [ ] Dark Mode
- [ ] Keyboard Shortcuts
- [ ] Loading Skeleton
- [ ] Print-Friendly CSS
- [ ] Testing Setup (Vitest + Playwright)
- [ ] Deploy ke Vercel
