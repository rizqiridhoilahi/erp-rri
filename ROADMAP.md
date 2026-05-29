# ROADMAP — Perbaikan Modul Quotation & Negosiasi

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

## 📧 Future — Email Delivery (Gmail SMTP via Nodemailer)

| # | Task | Status | Priority |
|---|------|--------|----------|
| 1 | Install `nodemailer` + types | Pending | Medium |
| 2 | Buat utility `src/lib/utils/email.ts` — kirim email via Gmail SMTP | Pending | Medium |
| 3 | Buat email template untuk Quotation (body + subject auto) | Pending | Medium |
| 4 | Generate PDF Quotation + attach ke email saat Kirim | Pending | Medium |
| 5 | Simpan log pengiriman ke tabel `email_log` | Pending | Low |
| 6 | Tampilkan status email di halaman Quotation detail | Pending | Low |

**Setup:** App Password di Google Account → `GMAIL_USER` + `GMAIL_APP_PASSWORD` di env.

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
| 2 | **Item editing di edit page & API** — Edit page form items (dynamic row, add/remove). PUT handler support `body.items` (delete + re-insert). Tambah field `keterangan` ke edit form | ✅ Done | `sales-order/[id]/edit/page.tsx`, `api/v1/sales-order/[id]/route.ts` |
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
| 12 | **DI reference selector** — Di edit page, tampilkan `di_id` jika ada, izinkan replace | ✅ Done | `sales-order/[id]/edit/page.tsx` |
| 13 | **Backfill SO untuk existing PO** — Confirmed PO tanpa SO: tampilkan tombol "Buat SO" yang trigger generateSOFromPO | ✅ Done | `customer-po/[id]/page.tsx`, `api/v1/customer-po/[id]/route.ts` |

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

## 📄 Documentation

| # | Task | Status | File |
|---|------|--------|------|
| 7 | Update PRD.md — flow Quotation status + integrasi Negosiasi | ✅ Done | `PRD.md` |

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
