# ROADMAP — Pengembangan ERP RRI

## ✅ DONE — Sidebar Navigation & Document Management Page

| # | Task | Status | File |
|---|------|--------|------|
| SN-1 | **Sidebar: "Delivery Instr." → "Delivery Instruction"** — rename + pindah posisi di bawah "Customer PO" | ✅ Done | `src/components/sidebar-content.tsx` |
| SN-2 | **Sidebar: category heading color** — default `text-muted-foreground`, jadi `text-primary` saat ada child link active | ✅ Done | `src/components/sidebar-content.tsx` |
| SN-3 | **Sidebar: "Manajemen Dokumen" pindah** — dari top-level ke dalam grup Master Data, di bawah "Kategori Barang" | ✅ Done | `src/components/sidebar-content.tsx` |
| DM-1 | **Migration all_documents view** — tambah `recordid` column + 4 UNION baru (DO, Delivery Slip, GRN Customer, Kwitansi) | ✅ Done | `0027_update_all_documents_view.sql` |
| DM-2 | **Migration virtual PDF entries** — 5 UNION virtual PDF (Quotation, DO/Surat Jalan, Invoice, Tanda Terima, Kwitansi) dengan prefix `pdf-{modul}-{id}` | ✅ Done | `0028_add_virtual_pdf_entries.sql` |
| DM-3 | **Migration Resi Pengiriman** — add virtual PDF entries untuk Resi Pengiriman | ✅ Done | `0029_add_virtual_pdf_resi_pengiriman.sql` |
| DM-4 | **API dokumen — filter nomorPo & nomorDi** — tambah filter via `.or('and(...)')` | ✅ Done | `src/app/api/v1/dokumen/route.ts` |
| DM-5 | **Frontend dokumen page** — semua modul dropdown, smart filters, PDF buttons per modul | ✅ Done | `src/app/dashboard/dokumen/page.tsx` |
| DM-6 | **PDF blob fetch pattern** — virtual PDF entries (fileurl `/api/...`) di-fetch dengan auth token via blob fetch → `URL.createObjectURL()` → `window.open(blobUrl)`. Storage files tetap `window.open(url)` langsung. Anti-popup blocker: buka tab kosong dulu, set `location.href` setelah blob siap. | ✅ Done | `src/app/dashboard/dokumen/page.tsx` |
| DM-7 | **Download button storage files** — tombol Download terpisah (icon `Download`) di samping tombol Buka per baris. Untuk semua tipe file: blob fetch (dengan auth jika API route, tanpa jika public URL) → download via `<a download>` click. | ✅ Done | `src/app/dashboard/dokumen/page.tsx` |
| DM-8 | **Fix: Missing modules in all_documents view** — tambah Retur Pembelian, RFQ Supplier, GRN ke view (supplier-side, NULL customer) | ✅ Done | `0030_add_missing_document_modules.sql` |
| DM-9 | **Fix: Sales Order document upload 404** — buat `sales_order_document` table + API route + Drizzle schema + tambah ke view | ✅ Done | `0031_create_sales_order_document.sql`, `0032_add_sales_order_to_documents_view.sql`, `sales-order/[id]/documents/route.ts` |
| DM-10 | **Update frontend dropdown** — tambah 5 modul baru (Resi Pengiriman, Retur Pembelian, RFQ Supplier, GRN, Sales Order) ke filter dan badge colors | ✅ Done | `src/app/dashboard/dokumen/page.tsx` |
| DM-11 | **Smart Filter DI & PO** — autocomplete combobox untuk cari nomor DI / PO Customer. Resolve chain DI → SO → DO/Invoice/Kwitansi/Retur/GRN Customer/Kontrak. UI: Popover + Command, debounced search (300ms), auto-fill customer dropdown. API: `/api/v1/dokumen/autocomplete/di`, `/api/v1/dokumen/autocomplete/po` | ✅ Done | `route.ts`, `document-search-combobox.tsx`, `page.tsx` |

## 🔴 HIGH — Status Management & Quotation Fixes

| # | Task | Status | File |
|---|------|--------|------|
| 1 | **Fix satuan validation mismatch** — client `z.string().min(1)` → `z.string().optional()` | ✅ Done | `edit/page.tsx` |
| 2 | **Fix barang_id null handling** — `i.barang_id ?? ''` → `?? null` | ✅ Done | `edit/page.tsx` |
| 3 | **Conditional item processing di PUT** — JSON.stringify comparison | ✅ Done | `api/v1/quotation/[id]/route.ts` |
| 4a | **Buat PATCH status endpoint** — `/api/v1/quotation/[id]/status` | ✅ Done | `status/route.ts` |
| 4b | **Quick-action buttons** — Kirim, Setujui, Tolak, Revisi, Tutup | ✅ Done | `[id]/page.tsx` |
| 5 | **Validasi status transition** — `ALLOWED_TRANSITIONS` map | ✅ Done | `route.ts`, `status/route.ts` |
| 6a | **Auto-update quotation status** saat nego approved/rejected | ✅ Done | `negoiasi/[id]/route.ts` |
| 6b | **Tampilkan negosiasi** di halaman quotation detail | ✅ Done | `[id]/page.tsx` |
| 6c | **Tombol "Buat Negosiasi"** → navigasi | ✅ Done | `[id]/page.tsx` |

## 🔵 NEW — Proses Negosiasi Status & Revisi Quotation

| # | Task | Status | File |
|---|------|--------|------|
| A | **Status `proses_negosiasi`** — enum + allowed transitions + badge + workflow | ✅ Done | `status/route.ts`, `[id]/route.ts`, `[id]/page.tsx` |
| B | **Auto-set `proses_negosiasi`** di POST negoiasi | ✅ Done | `negoiasi/route.ts` |
| C | **Update quotation items** saat nego approved (harga + PPN recalc) | ✅ Done | `negoiasi/[id]/route.ts` |
| D | **Kolom `revisi`** INTEGER DEFAULT 0 + tampil `-R1` di nomor | ✅ Done | schema, migration, UI, PDF |
| E | **Validasi transisi nego** — hanya `sent`/`proses_negosiasi` bisa dinego | ✅ Done | `negoiasi/[id]/route.ts` |
| F | **Button visibility** — Edit hanya di draft/rejected, Buat Negosiasi hanya di sent/proses_negosiasi | ✅ Done | `[id]/page.tsx` |

## 🟢 DONE — Customer PO Enhancements (TOP, PIC, Waktu Pengiriman, Due Date Logic)

| # | Task | Status | File |
|---|------|--------|------|
| 1 | **TOP Net 14** — tambah opsi Net 14 ke TOP dropdown | ✅ Done | `tambah/page.tsx`, `edit/page.tsx` |
| 2 | **TOP jatuh tempo logic** — hitungan TOP dimulai setelah invoice hardcopy diterima customer, bukan dari tanggal PO. Due date display dihapus dari form tambah, diganti info note | ✅ Done | `tambah/page.tsx`, `[id]/page.tsx` |
| 3 | **PIC Customer auto-load** — saat pilih customer, PIC otomatis fetch dari DB. Kolom `pic_customer_id` langsung di `customer_po` (bukan join table) | ✅ Done | `tambah/page.tsx`, `[id]/page.tsx`, `[id]/edit/page.tsx`, `api/v1/master/pic-customer/route.ts` |
| 4 | **Waktu Pengiriman (hari)** — kolom `waktu_pengiriman` di `customer_po`, auto-propagate ke `sales_order` → `delivery_order` → `retur_penjualan` | ✅ Done | schema (4 files), migration, `auto-sales.ts`, tambah/detail/edit pages |
| 5 | **API updates** — POST/PUT customer-po + GET join `customer_pic` + PIC customer filter by `customer_id` | ✅ Done | `api/v1/customer-po/route.ts`, `[id]/route.ts`, `api/v1/master/pic-customer/route.ts` |
| 6 | **Database migration** — `0014_customer_po_extras.sql` | ✅ Done | `migrations/0014_customer_po_extras.sql` |

## ✅ DONE — Email Delivery (SMTP via Nodemailer)

| # | Task | Status | Priority |
|---|------|--------|----------|
| 1 | Install `nodemailer` + types | ✅ Done | Medium |
| 2 | Buat utility `src/lib/utils/email.ts` — kirim email via SMTP dengan auto-log ke `email_log` | ✅ Done | Medium |
| 3 | Buat email template HTML untuk Quotation (body + subject auto saat status → `sent`) | ✅ Done | Medium |
| 4 | Generate PDF Quotation + attach — struktur siap, PDF skip sementara (mismatch type), fallback link portal | ✅ Done | Medium |
| 5 | Tabel `email_log` + schema Drizzle | ✅ Done | Low |
| 6 | SMTP config di `.env.example` | ✅ Done | Low |

**Setup:** App Password di Google Account → `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` di env.

## 🟢 DONE — SO/DO Integration & Navigation Chain

| # | Task | Status | File |
|---|------|--------|------|
| 1 | **PO Detail → Link ke SO** — setelah PO confirm, tampilkan tombol "Lihat SO"; GET endpoint juga include sales_order. Backfill: untuk PO existing (confirmed tanpa SO) tampilkan tombol "Buat SO" | ✅ Done | `customer-po/[id]/page.tsx`, `api/v1/customer-po/[id]/route.ts` |
| 2 | **SO Detail → Link ke DO** — setelah SO processed, tampilkan tombol "Lihat DO" | ✅ Done | `sales-order/[id]/page.tsx` |
| 3 | **Cegah duplicate SO** — cek apakah SO/DO sudah ada sebelum auto-generate | ✅ Done | `auto-sales.ts` |
| 4 | **PO List → Kolom SO status** — tampilkan nomor SO dari list PO | ✅ Done | `customer-po/page.tsx` |
| 5 | **SO List → Kolom DO status** — tampilkan nomor DO dari list SO | ✅ Done | `sales-order/page.tsx` |
| 6 | **Upload dokumen di DO** — foto delivery, signed receipt (schema + migration + API + UI) | ✅ Done | `delivery-order-document.ts`, `0028_add_delivery_order_document.sql`, `documents/route.ts`, `do-documents.tsx`, `[id]/page.tsx` |

## 🟡 SO Enhancement — Sales Order Module Professionalization

### 🔴 Phase 1 — Core Functionality (Critical)

| # | Task | Status | File |
|---|------|--------|------|
| 1 | **Status workflow di detail page** — Konversi SO detail ke `"use client"`, tambah quick-action buttons inline (Konfirmasi, Proses, Kirim, Batalkan) | ✅ Done | `sales-order/[id]/page.tsx` |
| 2 | **Item editing di edit page & API** — Edit page form items (dynamic row, add/remove). PUT handler support `body.items` (delete + re-insert). Tambah field `keterangan` ke edit form | ❌ Removed — SO adalah dokumen binding, items tidak boleh diubah. Edit page dihapus. Status workflow via tombol detail page. | N/A |
| 3 | **Customer info di detail page** — Resolve `customer_po -> customer` join, tampilkan: nama customer, nomor PO, PIC, TOP, waktu_pengiriman, estimasi timeline | ✅ Done | `sales-order/[id]/page.tsx` |
| 4 | **Tab DI di tambah page** — Dua tab: "Dari Customer PO" (existing) dan "Dari Delivery Instruction" (baru). Tab DI: pilih DI (status `active`) → auto-load customer + items dari DI + **harga dari kontrak** | ✅ Done | `sales-order/tambah/page.tsx`, `lib/auto-sales.ts` (generateSOFromDI) |
| 5 | **Document upload SO** — Schema `sales_order_document` + migration `0029` + API `/api/v1/sales-order/[id]/documents` + client `SoDocuments.tsx` + UI di detail page | ✅ Done | new files |

### 🟡 Phase 2 — Professional Standard (High)

| # | Task | Status | File |
|---|------|--------|------|
| 6 | **List page — kolom customer** — Fetch `sales_order` → join `customer_po` → join `customer`. Tampilkan `customer.nama` | ✅ Done | `sales-order/page.tsx` |
| 7 | **Validasi status transisi** — `SO_ALLOWED_TRANSITIONS`: `draft: [confirmed, cancelled]`, `confirmed: [processed]`, `processed: [delivered]`, `delivered: []`, `cancelled: []` | ✅ Done | `api/v1/sales-order/[id]/route.ts` |
| 8 | **waktu_pengiriman display** — Tampilkan di detail card + estimasi tanggal kirim (waktu_pengiriman setelah tanggal SO) | ✅ Done | `sales-order/[id]/page.tsx` |
| 9 | **WhatsApp notification** — Saat SO status → `processed` (auto DO generated), kirim WA ke PIC customer via `sendWhatsapp()` | ✅ Done | `api/v1/sales-order/[id]/route.ts` |

### 🟢 Phase 3 — Enhancement (Medium)

| # | Task | Status | File |
|---|------|--------|------|
 | 10 | **Auto-populate items saat pilih PO** — Saat user pilih PO di tab PO, auto-load items + prices dari PO_items | ✅ Done | `sales-order/tambah/page.tsx` |
| 11 | **is_active usage** — Tambahkan toggle/filter di list & detail, atau hapus field jika tidak dibutuhkan | ✅ Done | `sales-order/page.tsx`, `sales-order/[id]/page.tsx` |
| 12 | **DI reference selector** — Di edit page, tampilkan `di_id` jika ada, izinkan replace | ❌ Removed — edit page dihapus, DI reference hanya di set saat creation | N/A |
| 13 | **Backfill SO untuk existing PO** — Confirmed PO tanpa SO: tampilkan tombol "Buat SO" yang trigger generateSOFromPO | ✅ Done | `customer-po/[id]/page.tsx`, `api/v1/customer-po/[id]/route.ts` |

## 🔴 DO Scan Enhancement — Barcode + QR + Hybrid Checkbox

| # | Task | Status | File |
|---|------|--------|------|
| A | **QR Code DO → encode URL** — QR encode `window.location.origin + /dashboard/delivery-order/{id}` bukan UUID mentah | ✅ Done | `do-scan-panel.tsx` |
| B | **Migration 0033** — `ALTER TABLE barang ADD COLUMN barcode text` + unique index | ✅ Done | `drizzle/0033_add_barang_barcode.sql` |
| C | **Schema Drizzle** — tambah field `barcode: text("barcode")` | ✅ Done | `barang.ts` |
| D | **API barang** — validasi + simpan `barcode` di POST/PUT | ✅ Done | `master/barang/route.ts`, `[id]/route.ts` |
| E | **Form Tambah/Edit barang** — input field `Barcode` (opsional) | ✅ Done | `tambah/page.tsx`, `[id]/edit/page.tsx` |
| F | **Detail barang** — tampilkan `Barcode` di card | ✅ Done | `[id]/page.tsx` |
| G | **API DO items** — select include `barang.barcode` | ✅ Done | `delivery-order/[id]/route.ts` |
| H | **Scanner match** — cocokkan `barcode` dulu, fallback `kode` | ✅ Done | `barcode-scanner.tsx` |
| I | **Hybrid checkbox** — checklist per item + Check All di panel scan | ✅ Done | `do-scan-panel.tsx` |
| J | **API scan** — terima `manual_verified_ids` + catat di audit log | ✅ Done | `delivery-order/[id]/scan/route.ts` |

---

### Status Transition SO

```
draft ──→ confirmed ──→ processed ──→ delivered
  │
  └──→ cancelled
```

### Tab DI → SO Flow

```
User pilih tab "Dari DI"
  → Dropdown daftar DI (status='active', join customer)
  → Pilih DI
    → Auto-load:
      - Customer dari DI.customer_id
      - Items dari DI_item (barang_id, jumlah, keterangan)
      - Harga satuan dari kontrak_item WHERE kontrak_id = DI.kontrak_id AND barang_id match
      - Jika tidak ada match di kontrak → harga = 0 (user bisa isi manual)
  → User review/edit items + harga
  → Submit → POST /api/v1/sales-order (set di_id & customer_po_id=null)
```

## 🟡 DI Module Overhaul — Delivery Instruction Professionalization

### Status Transition DI

```
draft ──→ confirmed ──→ (terminal, locked)
  │
  └──→ cancelled
```

### DI → SO Auto-Generation

```
DI diterbitkan (draft)
  → User setujui DI (confirmed)
    → Auto-generate SO via generateSOFromDI()
    → WhatsApp notification ke PIC Customer
  → SO dibuat dengan di_id = DI.id
```

### Migration Overview

| # | Task | Status | File |
|---|------|--------|------|
| 1 | **Migration 0038** — add `harga_satuan` to `di_item`, `pic_customer_id` to `di`, drop `di_pic` | ✅ Done | `0038_add_di_harga_satuan_pic.sql` |
| 2 | **API POST** — Zod + handler for `pic_customer_id`, `harga_satuan` | ✅ Done | `api/v1/di/route.ts` |
| 3 | **API PUT** — status transitions (draft→confirmed|cancelled), full edit, SO auto-gen on confirmed | ✅ Done | `api/v1/di/[id]/route.ts` |
| 4 | **Auto-sales** — `generateSOFromDI()` prefers `di_item.harga_satuan` over kontrak | ✅ Done | `auto-sales.ts` |
| 5 | **Detail page** — CPO-style: Konfirmasi/Batal buttons, PIC/kontrak info, pricing, SO link | ✅ Done | `di/[id]/page.tsx` |
| 6 | **Create page** — kontrak picker (non-expired), PIC dropdown, harga_satuan, auto-populate | ✅ Done | `di/tambah/page.tsx` |
| 7 | **Edit page** — full edit form (same as create, pre-populated) | ✅ Done | `di/[id]/edit/page.tsx` |
| 8 | **List page** — add PIC Customer column | ✅ Done | `di/page.tsx` |
| 9 | **Item Barang card redesign** — ganti 137-row table + Select dengan 2 opsi input: Import JSON dari Gemini AI (paste array kode+nama+jumlah → auto-match harga_satuan) + Input Manual (ketik kode → auto-lookup). Hapus fetch master barang, hapus render 137 Select options. Performance: load kontrak <500ms (dari 10s), ganti PIC <50ms (dari 4s) | ✅ Done | `di/tambah/page.tsx`, `di/[id]/edit/page.tsx` |
| 10 | **Harga cross-check validation** — simpan `harga_satuan_kontrak` di AddedItem (client-side), visual warning saat harga berbeda dari kontrak (amber bg + AlertTriangle icon + "≠ kontrak: Rp X"), modal konfirmasi submit jika ada perbedaan dengan tabel selisih, user bisa "Kembali Edit" atau "Lanjutkan Simpan" | ✅ Done | `di/tambah/page.tsx`, `di/[id]/edit/page.tsx` |

## 📄 Documentation

| # | Task | Status | File |
|---|------|--------|------|
| 7 | Update PRD.md — flow Quotation status + integrasi Negosiasi | ✅ Done | `PRD.md` |

---

## 🟡 Invoice & Kwitansi Module — Post DO "Dikirim"

### 🔴 Phase 1 — Auto-generate Kwitansi + GRN Input (Critical)

| # | Task | Status | File |
|---|------|--------|------|
| 1 | **Migration** — add `nomor_grn` to `invoice` table | ✅ Done | `migrations/0016_add_nomor_grn_to_invoice.sql` |
| 2 | **Schema update** — add `nomor_grn: text("nomor_grn")` to `invoice.ts` | ✅ Done | `src/lib/db/schema/invoice.ts` |
| 3 | **Auto-generate Kwitansi** di DO PUT — saat DO → `dikirim`, generate Kwitansi barengan Invoice (reference ke Invoice ID) | ✅ Done | `src/app/api/v1/delivery-order/[id]/route.ts` |
| 4 | **Invoice detail — GRN input** — form input `nomor_grn` + save button + upload file GRN via existing invoice document upload (`dokumen/invoice/{id}/`) | ✅ Done | `src/app/dashboard/invoice/[id]/page.tsx` |
| 5 | **Invoice detail — Kwitansi reference** — tampilkan nomor Kwitansi + link ke halaman Kwitansi | ✅ Done | `src/app/dashboard/invoice/[id]/page.tsx` |

### 🟢 Phase 2 — Payment & Jurnal Masuk (High)

| # | Task | Status | File |
|---|------|--------|------|
| 6 | **Schema** — `invoice_payment` table (id, invoice_id, tanggal, amount, metode, keterangan) | ✅ Done | `src/lib/db/schema/invoice-payment.ts` + `migrations/0017_add_invoice_payment.sql` |
| 7 | **API** — Payment recording `POST /api/v1/invoice/{id}/payment` → update invoice status partial/paid | ✅ Done | `src/app/api/v1/invoice/[id]/payment/route.ts` |
| 8 | **Auto-jurnal payment** — saat payment tercatat, generate jurnal debit Cash/Bank, credit AR | ✅ Done | `src/lib/auto-jurnal.ts` |
| 9 | **Invoice detail — Payment form** — UI: input amount, metode bayar, tanggal bayar | ✅ Done | `src/app/dashboard/invoice/[id]/page.tsx` |
| 10 | **Jurnal PDF component** — PDF template untuk jurnal umum | ✅ Done | `src/lib/pdf/jurnal.ts` + `src/app/api/v1/jurnal/[id]/pdf/route.ts` |

### 🟢 Phase 3 — Enhancement (Medium)

| # | Task | Status | File |
|---|------|--------|------|
| 11 | **AR Dashboard** — enhance AR aging dengan data payment & outstanding, filter by status | ✅ Done | `src/app/dashboard/laporan/ar-aging/page.tsx` |

---

## 🟢 Rencana Lanjutan — Post Invoice & Kwitansi

### ✅ Done — Faktur Pajak PDF + Auto-generate

| # | Task | Status | File |
|---|------|--------|------|
| FP-1 | **Faktur Pajak PDF route** — `GET /api/v1/faktur-pajak/[id]/pdf` + PDF component rewritten with proper PKP Penjual/Pembeli layout, company data from site_settings, NPWP, multi-column item table with DPP/PPN/PPh | ✅ Done | `src/app/api/v1/faktur-pajak/[id]/pdf/route.ts` + `src/lib/pdf/faktur-pajak.tsx` |
| FP-2 | **Auto-generate dari Invoice** — tombol "Buat Faktur Pajak" di invoice detail + dialog input nomor_faktur + API auto-compute DPP/PPN/PPh dari invoice items | ✅ Done | `src/app/dashboard/invoice/[id]/page.tsx` + `src/lib/auto-faktur-pajak.ts` + `src/app/api/v1/invoice/[id]/auto-faktur-pajak/route.ts` |
| FP-3 | **Faktur Pajak detail page — PKP & NPWP** — ambil data company profile dari site_settings (bukan hardcoded), tampilkan NPWP dari database + PDF Preview/Download buttons | ✅ Done | `src/app/dashboard/faktur-pajak/[id]/page.tsx` + `src/components/faktur-pajak-pdf-actions.tsx` |

### 🔴 High Priority — Kwitansi & Invoice Polish

| # | Task | Status | File |
|---|------|--------|------|
| K-1 | **Kwitansi detail page** — halaman `/dashboard/kwitansi/{id}` (sekarang cuma ada edit page) | ✅ Done | `src/app/dashboard/kwitansi/[id]/page.tsx` |
| K-2 | **Invoice detail → link ke Kwitansi detail** (bukan edit) | ✅ Done | `src/app/dashboard/invoice/[id]/page.tsx` |

---

## 🟡 Kwitansi Module — Gaps & Perbaikan (berdasarkan audit)

### 🔴 High Priority — Critical Bugs

| # | Task | Status | File |
|---|------|--------|------|
| KW-1 | **Document upload broken** — detail page panggil `/api/v1/kwitansi/{id}/documents` tapi tidak ada API route. Buat schema `kwitansi_document` + drizzle export + API route (GET/POST/DELETE) + migration | ✅ Done | `kwitansi-document.ts`, `index.ts`, `documents/route.ts` |
| KW-2 | **Create page unusable** — input `invoice_item_id` masih UUID manual, tidak auto-load items saat pilih invoice. Ganti dengan checkbox pilih item dari invoice + auto-fill jumlah | ✅ Done | `kwitansi/tambah/page.tsx` |
| KW-3 | **Detail page — item display raw UUID** — kolom menampilkan `barang_id` (UUID) bukan nama barang. Tampilkan nama barang, kode, harga satuan | ✅ Done | `kwitansi/[id]/page.tsx`, `api/v1/kwitansi/[id]/route.ts` |

### 🟡 Medium Priority — UX & Workflow

| # | Task | Status | File |
|---|------|--------|------|
| KW-4 | **Status quick-actions** — Tambah "Selesaikan" button di detail page (draft → completed), tanpa perlu edit page | ✅ Done | `kwitansi/[id]/page.tsx` |
| KW-5 | **Filter kwitansi by invoice_id server-side** — ganti fetch all + client filter di invoice detail page | ✅ Done | `api/v1/kwitansi/route.ts`, `invoice/[id]/page.tsx` |
| KW-6 | **Confirmation dialog** — konfirmasi sebelum ubah status ke completed | ✅ Done | `kwitansi/[id]/page.tsx` |
| KW-7 | **PDF — redesign sesuai format contoh** — desain klasik dengan border biru ganda, bilingual labels, terbilang, signature block, ref DI/PO, tinggi setengah A4 | ✅ Done | `lib/pdf/kwitansi.tsx`, `lib/utils/terbilang.ts`, `api/v1/kwitansi/[id]/pdf/route.ts` |

### ✅ Done — Kwitansi Page Polish (from audit vs Invoice)

| # | Task | Status | File |
|---|------|--------|------|
| K-8 | **Tampilkan customer info di list & detail** — join `invoice → customer`, tampilkan `customer.nama` di tabel list dan customer card di detail (nama, kode) | ✅ Done | `page.tsx`, `[id]/page.tsx`, `api/v1/kwitansi/route.ts`, `[id]/route.ts` |
| K-9 | **Perbaiki edit page** — tambah edit tanggal, tampilkan items current, shadcn `<Select>` not raw `<select>`, navigasi balik ke detail page | ✅ Done | `[id]/edit/page.tsx` |
| K-13 | **shadcn Select di edit page** — subsumed by K-9 | ❌ Removed | N/A |
| K-15 | **Navigasi edit → detail** — subsumed by K-9 | ❌ Removed | N/A |

### ✅ Done — Medium Priority

| # | Task | Status | File |
|---|------|--------|------|
| K-10 | **Running total saat create** — tampilkan total pembayaran agregat dari item yang dipilih | ✅ Done | `tambah/page.tsx` |
| K-11 | **Kolom total amount di list** — tampilkan nominal kwitansi di tabel list | ✅ Done | `page.tsx` |
| K-12 | **Error state di detail page** — set error state variable, tampilkan error UI (bukan silent "not found") | ✅ Done | `[id]/page.tsx` |

### ✅ Done — Low Priority

| # | Task | Status | File |
|---|------|--------|------|
| K-14 | **Loading skeleton di create** — skeleton loading saat inisialisasi form | ✅ Done | `tambah/page.tsx` |

### ✅ Done

### ✅ Done — Invoice PDF Finalization

| # | Task | Status | File |
|---|------|--------|------|
| IP-1 | **urutan column on invoice_item** — migration `0021` add `urutan integer` + backfill. All insert handlers assign `urutan`. GET route `.order('urutan')` | ✅ Done | `0021_add_urutan_to_invoice_item.sql`, `invoice-item.ts`, `invoice/route.ts`, `[id]/route.ts` |
| IP-2 | **Bank fields in site_settings** — add `company_bank_name`, `company_rekening_nama`, `company_rekening_nomor` to COMPANY_KEYS + company settings page form | ✅ Done | `system/company/route.ts`, `system/company/page.tsx` |
| IP-3 | **Invoice PDF route update** — remove signature/stamp fields, add bank fields, remove PPN/PPh computation, `.order('urutan')`, include `urutan` in item mapping | ✅ Done | `invoice/[id]/pdf/route.ts` |
| IP-4 | **Invoice PDF component rewrite** — `.ts` + `createEl()`. Remove DPP/PPN/PPh rows, no signature/stamp images, wet signature only. Bank data from site_settings. Multi-page pagination (15 ROWS_PER_PAGE). Page numbers (`Page X of Y`). Format alignment with quotation.ts. "Hal" → "Perihal", "DI Number" → "No. Ref. DI". Sequential item numbering via `urutan` from DB | ✅ Done | `invoice.ts` |

### ✅ Done — Resi Packing & Multi-Page PDF

| # | Task | Status | File |
|---|------|--------|------|
| RP-1 | **Migration — add packing_number to delivery_order_item** | ✅ Done | `migrations/0019_add_packing_number_to_doi.sql` |
| RP-2 | **Schema drizzle — packingNumber field** | ✅ Done | `delivery-order-item.ts` |
| RP-3 | **API — PUT packing assignments** — validasi max 10 items/packing | ✅ Done | `api/v1/delivery-order/[id]/packing/route.ts` |
| RP-4 | **PDF component — multi-page packing** — `packingGroups` input, per-group page, "packing i of n" | ✅ Done | `resi-pengiriman.ts` |
| RP-5 | **Route handler — group items by packing_number** — backward compatible (all NULL = single group) | ✅ Done | `resi-pdf/route.ts` |
| RP-6 | **Packing dialog** — dialog modal, packing tabs, checklist items, Simpan + Preview/Download Resi | ✅ Done | `resi-packing-dialog.tsx` |
| RP-7 | **DO detail page** — ganti DOPdfDownload dengan DOHeaderActions (SJ buttons + button Resi Packing) | ✅ Done | `page.tsx`, `do-header-actions.tsx` |
| RP-8 | **Packing dialog enhancement** — search by kode/nama di Item Tersedia, kolom No. Urut (fixed dari SJ) + Kode Barang, nomor urut tetap berdasarkan index original items | ✅ Done | `resi-packing-dialog.tsx` |
| RP-9 | **urutan column — sinkron nomor item SJ & Resi PDF** — migration `0020` add `urutan integer` ke `delivery_order_item` + backfill. Semua insert handler assign `urutan`. SJ & Resi PDF sort by `urutan` | ✅ Done | `0020_add_urutan_to_doi.sql`, `delivery-order-item.ts`, `delivery-order/route.ts`, `[id]/route.ts`, `auto-sales.ts`, `pdf/route.ts`, `delivery-order.ts`, `resi-pdf/route.ts` |

### ✅ Done — Export & Precision

| # | Task | Status | File |
|---|------|--------|------|
| E-1 | **Export Excel UI buttons** — reusable `ExportButton` component + ditambahkan ke 24 list pages (semua halaman utama: invoice, kwitansi, quotation, sales-order, delivery-order, customer-po, di, faktur-pajak, jurnal, dll) + whitelist tabel export diperluas | ✅ Done | `src/components/export-button.tsx` + 24 list pages + `src/app/api/v1/export/route.ts` |
| E-2 | **Financial data type precision** — migrasi `real` → `numeric(18,2)` untuk 8 tabel keuangan (invoice, invoice_item, kwitansi_item, faktur_pajak, faktur_pajak_item, jurnal_item, supplier_payment) + update Drizzle schema + `$type<number>()` agar kompatibel TS | ✅ Done | `0022_financial_numeric_precision.sql` + 8 schema files |

### ✅ Done — Email Delivery (dari ROADMAP existing)

| # | Task | Status | Priority |
|---|------|--------|----------|
| EM-1 | Install `nodemailer` + `@types/nodemailer` | ✅ Done | Medium |
| EM-2 | Buat utility `src/lib/utils/email.ts` — kirim email via SMTP dengan auto-log ke `email_log` | ✅ Done | Medium |
| EM-3 | Buat email template HTML untuk Quotation di status route | ✅ Done | Medium |
| EM-4 | Generate PDF Quotation + attach — struktur attachment API siap | ✅ Done | Medium |
| EM-5 | Tabel `email_log` — migration + schema Drizzle | ✅ Done | Low |
| EM-6 | SMTP config di `.env.example` — Gmail App Password | ✅ Done | Low |

## ✅ Done — Tanda Terima PDF Revision & Delivery Slip Integration

| # | Task | Status | File |
|---|------|--------|------|
| TT-1 | **Font + layout revisions** — font sizes 10pt/9pt, "No. Ref. PO/DI" → "No. PO Ref./No. DI Ref.", "Tanggal" → "Tempat/Tanggal", checkbox gap 8, tighter margins/padding, signature stamp image, Page 1 of 1 footer | ✅ Done | `src/lib/pdf/tanda-terima.ts` |
| TT-2 | **API route updated** — fetch referensi PO/DI + signature stamp from site_settings | ✅ Done | `api/v1/invoice/[id]/tanda-terima/pdf/route.ts` |
| TT-3 | **Schema changes** — add `invoice_id` to `grn`, remove `nomor_grn` from `invoice`, add `delivery_slip_nomor` + `delivery_slip_file_url` to `delivery_order` | ✅ Done | `grn.ts`, `invoice.ts`, `delivery-order.ts` |
| TT-4 | **Migration 0024** — all 3 schema changes applied | ✅ Done | `migrations/0024_fix_grn_invoice_delivery_slip.sql` |
| TT-5 | **DO API PUT** — include delivery_slip fields in select/update, auto-link GRN → Invoice via `grn.invoice_id` | ✅ Done | `api/v1/delivery-order/[id]/route.ts` |
| TT-6 | **DO detail page** — add `DoDeliverySlip` client component (nomor input + file upload) | ✅ Done | `do-delivery-slip.tsx`, `delivery-order/[id]/page.tsx` |
| TT-7 | **Invoice detail/edit** — remove nomor_grn field from detail & edit pages + API | ✅ Done | `invoice/[id]/page.tsx`, `invoice/[id]/edit/page.tsx`, `api/v1/invoice/[id]/route.ts` |
| TT-8 | **API route rewrite** — fetch all 11 document numbers (RFQ, SPH, PO, Kontrak, DI, Delivery Slip, Surat Jalan, GRN, Invoice, Kwitansi) via joined chain | ✅ Done | `api/v1/invoice/[id]/tanda-terima/pdf/route.ts` |
| TT-9 | **PDF component** — change "Jenis Dokumen" → "Nama Dokumen", replace "Kelengkapan" checkbox column with "Nomor Dokumen" text column, dynamic `dokumenList` data | ✅ Done | `lib/pdf/tanda-terima.ts` |

## ✅ Done — Skenario B: Non-PKP (PPN/PPh Removal)

| # | Task | Status | File |
|---|------|--------|------|
| SB-1 | **Invoice API POST** — hapus `ppn_rate`, `pph_rate`, per-item `ppn`/`pph` dari Zod schema dan insert logic | ✅ Done | `api/v1/invoice/route.ts` |
| SB-2 | **Invoice API PUT** — hapus field PPN/PPh dari update | ✅ Done | `api/v1/invoice/[id]/route.ts` |
| SB-3 | **Invoice create page** — hapus input PPN Rate, PPh Rate, PPN/PPh columns dari item table & form | ✅ Done | `invoice/tambah/page.tsx` |
| SB-4 | **Invoice edit page** — hapus PPN Rate, PPh Rate inputs + PPN/PPh columns | ✅ Done | `invoice/[id]/edit/page.tsx` |
| SB-5 | **Invoice detail page** — hapus PPh column, "Buat Faktur Pajak" button/dialog; grand total = DPP only | ✅ Done | `invoice/[id]/page.tsx` |
| SB-6 | **DO → auto-invoice route** — hapus `getConfigNumber`, `ppnRate`, `ppn_rate` from invoice insert | ✅ Done | `api/v1/delivery-order/[id]/route.ts` |
| SB-7 | **Sidebar** — hapus "Faktur Pajak" menu item | ✅ Done | `sidebar-content.tsx` |
| SB-8 | **Dashboard main** — hapus pending faktur pajak count & alert | ✅ Done | `dashboard/page.tsx` |
| SB-9 | **Finance dashboard** — hapus faktur pajak stat card & quick action | ✅ Done | `dashboards/finance.tsx` |
| SB-10 | **Quotation** — default `ppn_enabled: false` di schema, form, dan API POST | ✅ Done | `quotation/tambah/page.tsx`, `[id]/edit/page.tsx`, `api/v1/quotation/route.ts` |
| SB-11 | **Kwitansi PDF redesign** — blue border → double black, terbilang single-line with auto-wrap, DI ref dari `nomor_di_customer`, padding 40pt, amount styling | ✅ Done | `lib/pdf/kwitansi.ts` |
| SB-12 | **Finance dashboard** — remove unused `ReceiptText` import | ✅ Done | `dashboards/finance.tsx` |

**Keputusan:** PPN=0 (non-PKP), PPh dibayar langsung perusahaan ke kantor pajak, tidak dipotong dari invoice customer. DB columns (`ppn_rate`, `pph_rate`, `ppn`, `pph`) tetap ada untuk skenario PKP masa depan — API dan UI hanya mengabaikannya.

## 🔴 Phase 4 — Flow Procurement & Inventory — Gap Fixes

### 🔴 Critical — Blocking End-to-End Flow

| # | Task | Status | File |
|---|------|--------|------|
| SP-1 | **Supplier Payment — Schema & API** — buat API route GET/POST/PUT untuk `supplier_payment` + Zod validation | ✅ Done | `api/v1/procurement/supplier-payment/` |
| SP-2 | **Supplier Payment — Create page** — form tambah pembayaran (inline dialog di list page) + PO URL bug fixed | ✅ Done | `procurement/supplier-payment/page.tsx` |
| SP-3 | **Supplier Payment — Detail page** — info supplier, PO ref, nominal, metode, bukti transfer, link ke PO, edit button | ✅ Done | `procurement/supplier-payment/[id]/page.tsx` |
| SP-4 | **Supplier Payment — Edit page** — update metode, bukti transfer, keterangan (read-only: supplier, PO, nominal, tanggal) | ✅ Done | `procurement/supplier-payment/[id]/edit/page.tsx` |
| SP-5 | **Supplier Payment — Auto-jurnal** — debit Hutang (COA 2-1000), credit Kas/Bank (COA 1-1101) + PO status → completed on payment | ✅ Done | `lib/auto-jurnal.ts`, `api/v1/procurement/supplier-payment/route.ts` |
| SO-1 | **Stock Opname — Schema & API** — buat API route GET/POST/PUT + migration tabel `stock_opname` + `stock_opname_item` | ✅ Done | `api/v1/inventory/stock-opname/` |
| SO-2 | **Stock Opname — Create page** — form opname via inline dialog di list page (pilih petugas, gudang) | ✅ Done | `inventory/stock-opname/page.tsx` |
| SO-3 | **Stock Opname — Detail page** — lihat item, input stok fisik per barang, selisih auto-hitung, tambah/hapus barang, ubah status (selesai/dibatalkan) | ✅ Done | `inventory/stock-opname/[id]/page.tsx` |
| SO-4 | **Stock Opname — Edit page** — edit stok fisik, keterangan per item, tambah/hapus barang, edit keterangan sesi | ✅ Done | `inventory/stock-opname/[id]/edit/page.tsx` |

### 🟡 Medium — Enhancement

| # | Task | Status | File |
|---|------|--------|------|
| GD-1 | **Gudang — Detail page** — tambah halaman `[id]/page.tsx` untuk lihat detail warehouse | ✅ Done | `inventory/gudang/[id]/page.tsx` |
| MC-1 | **Master Customer — Create page** — tambah halaman `tambah/page.tsx` di master customer | ✅ Done | `master/customer/tambah/page.tsx` |

## 🟡 Document Number Reservation System

### Problem Statement

**Kondisi Existing:**
- Setiap modul punya counter terpisah (`document_counter` table)
- Race condition: 2 user buka form bersamaan → dapat nomor yang sama
- Nomor hangus: user submit gagal/error → nomor sudah terpakai
- Tidak ada validasi "nomor terakhir" sebelum generate
- Tidak ada sinkronisasi jalur PO vs DI

**Jalur Dokumen:**
```
Jalur PO (Pre-sales → Sales):
RFQ Customer (RFQC) → Quotation (SPH) → Negosiasi (NEG) → Customer PO (CPO) → SO → DO → Invoice → Kwitansi

Jalur DI (Sales):
Kontrak (manual) → DI → SO → DO → Invoice → Kwitansi
```

### Solution Architecture

**Mekanisme:** Reserve on Form Open + Validate on Submit

**Komponen Utama:**
1. **Tabel `document_number_reservation`** — simpan nomor yang di-reserve per user
2. **PostgreSQL Functions:**
   - `reserve_document_number()` — reserve nomor dengan TTL 15 menit
   - `use_reserved_number()` — validasi & gunakan reservation
   - `cleanup_expired_reservations()` — cleanup expired reservations
3. **API Routes:**
   - `GET /api/v1/{modul}/next-number` — reserve nomor untuk form
   - `POST /api/v1/{modul}` — validasi `reserveId` saat submit
4. **Frontend:**
   - Fetch nomor saat mount form
   - Countdown timer expiry (warning 5 menit sebelum expired)
   - Include `reserveId` di payload submit
5. **Cron Job:** Cleanup expired reservations setiap 6 jam

### Implementation Plan

| # | Task | Status | File | Priority |
|---|------|--------|------|----------|
| DN-1 | **Migration — tabel `document_number_reservation`** — schema + index | ✅ Done | `migrations/0033_document_number_reservation.sql` | 🔴 High |
| DN-2 | **PostgreSQL function — `reserve_document_number()`** — atomic upsert counter + create reservation | ✅ Done | `migrations/0033_document_number_reservation.sql` | 🔴 High |
| DN-3 | **PostgreSQL function — `use_reserved_number()`** — validasi expiry + mark as used | ✅ Done | `migrations/0033_document_number_reservation.sql` | 🔴 High |
| DN-4 | **PostgreSQL function — `cleanup_expired_reservations()`** — cleanup job | ✅ Done | `migrations/0033_document_number_reservation.sql` | 🟡 Medium |
| DN-5 | **Utility — `src/lib/utils/document-number-reservation.ts`** — `reserveDocumentNumber()`, `useReservedNumber()` | ✅ Done | new file | 🔴 High |
| DN-6 | **API — `/api/v1/rfq-customer/next-number/route.ts`** — GET reserve nomor | ✅ Done | new file | 🔴 High |
| DN-7 | **API — `/api/v1/rfq-customer/route.ts`** — update POST handler untuk validasi `reserveId` | ✅ Done | update existing | 🔴 High |
| DN-8 | **Frontend — `rfq-customer/tambah/page.tsx`** — fetch nomor saat mount, countdown timer, include `reserveId` | ✅ Done | update existing | 🔴 High |
| DN-9 | **API — `/api/v1/quotation/next-number/route.ts`** — GET reserve nomor | ✅ Done | new file | 🔴 High |
| DN-10 | **API — `/api/v1/quotation/route.ts`** — update POST handler untuk validasi `reserveId` | ✅ Done | update existing | 🔴 High |
| DN-11 | **Frontend — `quotation/tambah/page.tsx`** — fetch nomor saat mount, countdown timer, include `reserveId` | ✅ Done | update existing | 🔴 High |
| DN-12 | **API — `/api/v1/di/next-number/route.ts`** — GET reserve nomor | ✅ Done | new file | 🔴 High |
| DN-13 | **API — `/api/v1/di/route.ts`** — update POST handler untuk validasi `reserveId` | ✅ Done | update existing | 🔴 High |
| DN-14 | **Frontend — `di/tambah/page.tsx`** — fetch nomor saat mount, countdown timer, include `reserveId` | ✅ Done | update existing | 🔴 High |
| DN-15 | **Cron — `/api/v1/cron/cleanup-reservations/route.ts`** — cleanup endpoint | ✅ Done | new file | 🟡 Medium |
| DN-16 | **Vercel Cron — `vercel.json`** — setup cron setiap 6 jam | ✅ Done | update existing | 🟡 Medium |
| DN-17 | **Monitoring Dashboard — `/dashboard/admin/reservations/page.tsx`** — lihat active/expired reservations | ✅ Done | new file | 🟡 Medium |
| DN-18 | **Unit Tests — `src/test/utils/document-number-reservation.test.ts`** — test concurrent reservations | ✅ Done | new file | 🟢 Low |

### Configuration

| Parameter | Value | Deskripsi |
|-----------|-------|-----------|
| TTL | 15 menit | Waktu reserve sebelum expired |
| Cleanup Frequency | Setiap 6 jam | Cron job cleanup expired reservations |
| Warning Threshold | 5 menit | Warning countdown sebelum expired |
| Backward Compatibility | ✅ Yes | Fallback ke `generateDocumentNumber()` jika `reserveId` tidak ada/invalid |

### Rollout Strategy

**Phase 1 — Core Infrastructure (Week 1):**
- DN-1 s/d DN-5: Migration, PostgreSQL functions, utility functions

**Phase 2 — API Routes (Week 2):**
- DN-6 s/d DN-14: API routes + frontend updates untuk 3 modul (RFQ Customer, Quotation, DI)

**Phase 3 — Cron & Monitoring (Week 3):**
- DN-15 s/d DN-17: Cron job + monitoring dashboard

**Phase 4 — Testing (Week 4):**
- DN-18: Unit tests + load testing

### Rollback Plan

**Option 1: Disable Reservation di Frontend**
- Revert frontend changes (hapus `reserveId` dari payload)
- Backend tetap support both systems

**Option 2: Bypass Reservation di Backend**
- Add feature flag `ENABLE_NUMBER_RESERVATION`
- Jika `false`, skip validasi `reserveId`

**Option 3: Emergency Cleanup**
```sql
-- Release all active reservations
UPDATE document_number_reservation
SET used = FALSE
WHERE used = TRUE AND created_at > NOW() - INTERVAL '1 hour';
```

### Trade-offs

**Keuntungan:**
- ✅ Tidak ada race condition
- ✅ User tahu nomor di awal (UX lebih baik)
- ✅ Audit trail lengkap
- ✅ Nomor tidak hangus jika user batal submit (TTL expired → release)

**Kekurangan:**
- ❌ Kompleksitas bertambah (tabel baru, functions baru, cleanup job)
- ❌ Overhead database (insert reservation per form open)
- ❌ Potensi nomor hangus jika user buka form tapi tidak submit

**Mitigasi:**
- TTL 15 menit — cukup untuk user isi form
- Cleanup job setiap 6 jam — release nomor expired
- Monitoring dashboard — track berapa nomor yang hangus per hari

---

## Catatan

### Flow Quotation Status
```
draft ──→ sent ──→ proses_negosiasi ──→ approved ──→ closed
  │         │            │
  │         │            └──→ rejected
  │         └──→ rejected
  └──→ rejected ──→ draft (revisi)
```

### Status Transitions Allowed
| From | To |
|------|----|
| draft | sent, rejected |
| sent | approved, rejected, **proses_negosiasi** |
| **proses_negosiasi** | **approved, rejected** |
| approved | closed |
| rejected | draft |
| closed | (terminal) |
