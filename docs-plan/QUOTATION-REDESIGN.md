# Quotation Redesign — SPH Format (Plan & Roadmap)

**Tujuan:** Redesign modul Quotation agar output PDF sesuai format Surat Penawaran Harga (SPH) — 2 halaman: surat utama + lampiran tabel rincian.

---

## A. Database Schema Changes

### 1. `barang` — tambah 2 kolom
| Kolom | Type | Default |
|---|---|---|
| `justification` | `text` | nullable |
| `image_url` | `text` | nullable |

### 2. `quotation` — tambah 11 kolom + ganti prefix nomor
| Kolom | Type | Default | Notes |
|---|---|---|---|
| `rfq_id` | `text` | nullable | FK → rfq(id) |
| `referensi` | `text` | nullable | Nomor RFQ |
| `lampiran` | `text` | nullable | "Softcopy Penawaran Harga" |
| `perihal` | `text` | `'Penawaran Harga'` | |
| `pic_customer_id` | `text` | nullable | FK → customer_pic(id) |
| `alamat` | `text` | nullable | Alamat tujuan |
| `masa_berlaku` | `text` | nullable | "1 Minggu", "2 Minggu", dll |
| `tanggal_berlaku_sampai` | `date` | nullable | Kalkulasi dari masa_berlaku |
| `ppn_enabled` | `boolean` | `true` | |
| `total_harga` | `real` | nullable | Grand total |
| `keterangan` | `text` | nullable | |

Prefix nomor: `QTN` → `SPH`. Format: `RRI-SPH-YY-MM-0001`

### 3. `quotation_item` — tambah 5 kolom
| Kolom | Type | Default |
|---|---|---|
| `specification` | `text` | nullable |
| `justification` | `text` | nullable |
| `image_url` | `text` | nullable |
| `satuan` | `text` | nullable |
| `total_harga` | `real` | nullable |

### 4. `site_settings` — 11 key baru
`company_nama`, `company_bidang_usaha`, `company_alamat`, `company_no_hp`, `company_email`, `company_logo_url`, `penandatangan_nama`, `penandatangan_jabatan`, `penandatangan_no_hp`, `tanda_tangan_url`, `stempel_url`

---

## B. New Files

| # | Path | Fungsi |
|---|---|---|
| 1 | `src/app/dashboard/system/company/page.tsx` | Company settings form |
| 2 | `src/app/api/v1/system/company/route.ts` | Company settings API (GET/POST) |
| 3 | `docs-plan/QUOTATION-REDESIGN.md` | Plan & roadmap ini |

---

## C. Modified Files

| # | Path | Perubahan |
|---|---|---|
| 1 | `src/lib/db/schema/barang.ts` | +`justification`, +`imageUrl` |
| 2 | `src/lib/db/schema/quotation.ts` | +11 kolom baru |
| 3 | `src/lib/db/schema/quotation-item.ts` | +5 kolom baru |
| 4 | `src/app/api/v1/master/barang/route.ts` | Zod + handler update |
| 5 | `src/app/api/v1/master/barang/[id]/route.ts` | Zod + handler update |
| 6 | `src/app/dashboard/master/barang/tambah/page.tsx` | +justification, image_url |
| 7 | `src/app/dashboard/master/barang/[id]/edit/page.tsx` | +justification, image_url |
| 8 | `src/app/api/v1/quotation/route.ts` | Zod baru + POST handler |
| 9 | `src/app/api/v1/quotation/[id]/route.ts` | Zod baru + PUT handler |
| 10 | `src/app/dashboard/quotation/tambah/page.tsx` | Form redesign total |
| 11 | `src/app/dashboard/quotation/[id]/edit/page.tsx` | Form redesign total |
| 12 | `src/app/dashboard/quotation/[id]/page.tsx` | Detail page update |
| 13 | `src/lib/pdf/quotation.tsx` | Full rewrite 2 halaman |
| 14 | `src/app/api/v1/quotation/[id]/pdf/route.ts` | Adjust untuk data baru |
| 15 | `src/lib/utils/document-number.ts` | Support format dash `RRI-SPH-YY-MM-0001` |
| 16 | `src/components/sidebar-nav.tsx` | +Company Profile link |
| 17 | `drizzle/0017_quotation_redesign.sql` | Migration |
| 18 | `PRD.md`, `ROADMAP.md` | Update |

---

## D. Urutan Eksekusi

### Step 1: DB Schema + Migration
1. Edit `barang.ts` — tambah `justification`, `imageUrl`
2. Edit `quotation.ts` — tambah 11 kolom
3. Edit `quotation-item.ts` — tambah 5 kolom
4. Generate migration SQL
5. Apply ke Supabase

### Step 2: Document Number Utility
1. `document-number.ts` — dukung format dash `RRI-SPH-26-05-0001`

### Step 3: Company Settings
1. API route: `GET/POST /api/v1/system/company`
2. Page: `/dashboard/system/company`
3. Sidebar: tambah link

### Step 4: Barang Master Enhancement
1. API routes: tambah `justification`, `image_url` ke Zod
2. Form tambah: tambah 2 field
3. Form edit: tambah 2 field

### Step 5: Quotation API Enhancement
1. `route.ts` (POST/GET list): Zod + handler baru
2. `[id]/route.ts` (GET/PUT/DELETE): Zod + handler baru

### Step 6: Quotation Forms
1. `tambah/page.tsx` — redesign total
2. `[id]/edit/page.tsx` — redesign total

### Step 7: Quotation Detail Page
1. `[id]/page.tsx` — tampilkan field-field baru

### Step 8: PDF Generation
1. `quotation.tsx` (component) — rewrite 2 halaman
2. `pdf/route.ts` — adjust

### Step 9: Build & Verify

### Step 10: Update PRD.md + ROADMAP.md

---

## E. Format Nomor Dokumen

**Baru:** `RRI-SPH-26-05-0001`

Penjelasan:
- `RRI` — Kode perusahaan
- `SPH` — Surat Penawaran Harga
- `26` — Tahun (2026)
- `05` — Bulan (Mei)
- `0001` — Counter (reset per tahun)

Implementasi: `generateDocumentNumber('SPH')` dengan format baru di utility.

---

## F. Catatan PDF

- Font: Arial (gunakan `@react-pdf/renderer` dengan font registration)
- Halaman 1: Header, Kepala Surat, Alamat Tujuan, Isi Surat, Tanda Tangan, Footer
- Halaman 2: Lampiran tabel rincian dengan kolom: No, Item, Specification, Justification, Pict, Qty, UoM, Price, TotalPrice
- PPN: jika enabled, tampilkan baris PPN sebelum Grand Total
- Format angka: locale `id-ID`
