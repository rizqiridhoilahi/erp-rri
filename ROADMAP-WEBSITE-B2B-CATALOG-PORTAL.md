# ROADMAP: Website B2B Catalog Portal

**PT. Rizki Ridho Ilahi (RRI)**
**Referensi PRD:** `PRD-website-B2B-catalog-portal.md`
**Target:** Single project monorepo Next.js 15.5 + Supabase

---

## Fase 1: Foundation & Multiple Images (Saat Ini)

### 1.1 Migration: Tabel `barang_gambar`

```sql
CREATE TABLE barang_gambar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid()::text,
  barang_id TEXT NOT NULL REFERENCES barang(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  keterangan TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_barang_gambar_barang_id ON barang_gambar(barang_id);
```

### 1.2 Drizzle Schema — `src/lib/db/schema/barang-gambar.ts`

- Define `barangGambar` table with relations to `barang`
- Export type for TypeScript usage

### 1.3 API Routes

| Method | Endpoint | File |
|--------|----------|------|
| `GET` | `/api/v1/master/barang/[id]/gambar` | `src/app/api/v1/master/barang/[id]/gambar/route.ts` |
| `POST` | `/api/v1/master/barang/[id]/gambar` | (same file, method handler) |
| `DELETE` | `/api/v1/master/barang/[id]/gambar/[gambarId]` | `src/app/api/v1/master/barang/[id]/gambar/[gambarId]/route.ts` |

Upload flow:
- Client: `browser-image-compression` → WebP (max 1MB, 1920px)
- Path: `barang/{id}/gallery/{timestamp}.webp`
- Storage: Cloudflare R2 via `storageService.upload()`
- Validasi: max 5 gambar per barang (server-side check di POST)

### 1.4 Kolom Tambahan di `barang` (per PRD)

```sql
ALTER TABLE barang ADD COLUMN is_published_to_catalog BOOLEAN DEFAULT FALSE;
ALTER TABLE barang ADD COLUMN deskripsi_katalog TEXT;
ALTER TABLE barang ADD COLUMN spesifikasi_teknis JSONB;
```

### 1.5 UI — Barang Detail Page

- Galeri gambar dengan thumbnail strip (max 5), klik untuk preview besar
- Reorder via drag-and-drop
- Upload komponen dengan preview + hapus
- Tab/edit untuk `deskripsi_katalog` dan `spesifikasi_teknis`

### 1.6 UI — Barang Edit / Tambah Page

- Upload multiple images (drag & drop area, max 5)
- Validasi tipe & ukuran di client

### 1.7 Barang List API — Sertakan Gambar Galeri

- Include `barang_gambar` (ordered by `sort_order`) di response GET list
- `image_url` tetap sebagai thumbnail cover utama

---

## Fase 2: Website Publik — Infrastructure

### 2.1 Route Group `(public)/`

Buat folder `src/app/(public)/` dengan layout terpisah dari ERP:
```
src/app/
├── (public)/
│   ├── layout.tsx        (theme navy + gold, public header/footer)
│   ├── page.tsx          Landing Page
│   ├── tentang-kami/
│   ├── layanan/
│   ├── katalog/
│   ├── customer-login/
│   ├── customer-register/
│   ├── inquiry/
│   └── portal/
```

### 2.2 Middleware — Domain Routing

Update `src/middleware.ts`:
- Deteksi `host` header
- Jika `pt-rri.com` → rewrite ke `(public)/`
- Jika `erp.pt-rri.com` → routing normal (tidak berubah)

### 2.3 Public Layout Component

- Palet warna: Deep Midnight Navy (#0A1128), Champagne Gold (#D4AF37)
- Font: Lexend (heading), Inter (body)
- Glassmorphism navbar, micro-interactions (Framer Motion)
- Footer dengan informasi legal perusahaan

---

## Fase 3: Katalog Publik (Layer 2)

### 3.1 Halaman Katalog — `(public)/katalog/page.tsx`

- Grid maksimal 3 produk per baris (desktop)
- Filter by kategori, search by nama/kode
- **Harga tidak pernah dikirim ke client** (response API difilter)
- Belum login: teks "Akses spesifikasi terkunci"
- Sudah login: tombol "Tambah ke Daftar SPH"

### 3.2 API Publik — `GET /api/v1/public/products`

- Route baru, hasil filter dari `barang` + `barang_gambar`
- `is_published_to_catalog = true` only
- Kolom `harga_jual_default`, `harga_beli_default` di-strip dari response
- Include `barang_gambar` untuk galeri

### 3.3 Halaman Detail Produk — `(public)/katalog/[id]/page.tsx`

- Layout kiri: galeri gambar dengan magnifier zoom
- Layout kanan: nama, kode (SKU), spesifikasi teknis, deskripsi katalog
- Tombol "Tambahkan ke Keranjang Inquiry"

### 3.4 PLTU Corner — `(public)/katalog/pltu-corner/`

- Halaman eksklusif untuk akun terafiliasi PLTU
- Paket bundel (satu klik → banyak item ke keranjang)
- Filter by sektor PLTU

---

## Fase 4: Auth & Customer Portal (Layer 3 & 4)

### 4.1 Registrasi Klien — `customer-register/`

- Form: nama perusahaan, PIC, no WA, alamat, NPWP
- Upload dokumen legalitas
- Status: pending → admin ERP review → approved/suspended

### 4.2 Login Klien — `customer-login/`

- Login via email/password (Supabase Auth)
- Multi-user: requester + approver

### 4.3 Quick Order — `quick-order/`

- Input manual: tabel kosong + kode barang + qty
- Upload Excel: drag & drop, validasi cross-match kode barang
- Maks 500 baris

### 4.4 Keranjang Inquiry — `inquiry/`

- Daftar barang + qty + catatan
- Kirim → create `rfq_customer` di ERP
- Trigger notifikasi WhatsApp (Fonnte)

### 4.5 Portal Klien — `portal/`

- Overview dashboard (grafik status pengadaan)
- Dokumen digital (unduh SPH PDF jika sudah approved)
- Retur (klaim barang cacat)

---

## Fase 5: Integrasi & Otomatisasi

### 5.1 Notifikasi WhatsApp (Fonnte)

- Trigger saat inquiry baru dari website
- Kirim ke grup Sales RRI

### 5.2 Sinkronisasi Status

- SPH approved → portal klien → tombol unduh aktif
- PO confirmed → portal klien lihat status pesanan
- DO + Invoice → portal klien lihat riwayat pengiriman

### 5.3 Multi-User Budget Control

- Requester: buat draft, kumpulkan item
- Approver: setujui pengajuan ke RRI
- Parent company ID untuk grouping akun

---

## Prioritas Pengerjaan

| Priority | Fase | Item |
|----------|------|------|
| 🔴 P0 | 1 | Multiple images (`barang_gambar`) |
| 🔴 P0 | 1 | Kolom katalog (`is_published_to_catalog`, `deskripsi_katalog`, `spesifikasi_teknis`) |
| 🔴 P0 | 2 | Route group + middleware domain routing |
| 🟡 P1 | 3 | Katalog publik (grid + detail) |
| 🟡 P1 | 3 | API publik tanpa harga |
| 🟢 P2 | 4 | Registrasi & login klien |
| 🟢 P2 | 4 | Keranjang inquiry → RFQ ERP |
| 🔵 P3 | 4 | Portal klien (dashboard, dokumen) |
| 🔵 P3 | 5 | Notifikasi WhatsApp, retur, multi-user |

---

## File Changes Summary (Fase 1)

| # | File | Tipe |
|---|------|------|
| 1 | `src/lib/db/migrations/0052_create_barang_gambar.sql` | Buat baru |
| 2 | `src/lib/db/migrations/0053_add_catalog_columns_to_barang.sql` | Buat baru |
| 3 | `src/lib/db/schema/barang-gambar.ts` | Buat baru |
| 4 | `src/lib/db/schema/barang.ts` | Edit — tambah kolom katalog |
| 5 | `src/app/api/v1/master/barang/[id]/gambar/route.ts` | Buat baru (GET + POST) |
| 6 | `src/app/api/v1/master/barang/[id]/gambar/[gambarId]/route.ts` | Buat baru (DELETE) |
| 7 | `src/app/api/v1/master/barang/route.ts` | Edit — include `barang_gambar` |
| 8 | `src/app/api/v1/master/barang/[id]/route.ts` | Edit — include `barang_gambar` |
| 9 | `src/app/dashboard/master/barang/[id]/page.tsx` | Edit — galeri + deskripsi katalog |
| 10 | `src/app/dashboard/master/barang/[id]/edit/page.tsx` | Edit — upload multiple images |
| 11 | `src/app/dashboard/master/barang/tambah/page.tsx` | Edit — upload multiple images |
