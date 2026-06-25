# ROADMAP — B2B Website & Private Catalog Portal

**Project:** Website Bisnis Korporat & B2B Private Catalog Portal
**PRD:** `PRD-website-B2B-catalog-portal.md` v1.3
**Domain:** pt-rri.com (default), erp.pt-rri.com (custom — ERP internal, unchanged)

---

## Priority Legend
| Icon | Meaning |
|------|---------|
| 🔴 | Critical — blocking dependency |
| 🟡 | High — core feature |
| 🟢 | Medium — enhancement |
| 🔵 | Low — nice to have |

---

## Fase 0 — Foundation (Infrastructure + Corporate Presence)

**Goal:** Middleware routing, layout publik, i18n, database schema, landing page + tentang kami + layanan.

| # | Task | Priority | Status |
|---|------|----------|--------|
| F0-1 | **Middleware — host detection** — `pt-rri.com` → rewrite ke `public-pages/`, `erp.pt-rri.com` → normal routing | 🔴 Critical | ✅ Done |
| F0-2 | **i18n setup** — Dictionary ID (default) + EN, utility `getDictionary(locale)`, locale switcher component | 🔴 Critical | ✅ Done |
| F0-3 | **Public layout** — Tailwind: Navy/Blue theme, white glassmorphism navbar, footer corporate, fonts Lexend + Inter | 🔴 Critical | ✅ Done |
| F0-4 | **DB Migration — catalog columns on `barang`** — `is_published_to_catalog` (BOOLEAN), `deskripsi_katalog` (TEXT), `spesifikasi_teknis` (JSONB) | 🔴 Critical | ✅ Done |
| F0-5 | **DB Migration — `barang_gambar` table** — multiple images per product (uuid, barang_id FK, url, urutan, is_primary) | 🔴 Critical | ✅ Done |
| F0-6 | **DB Migration — `customer_profiles` table** — profil legalitas klien, FK ke `auth.users` + `customers` | 🟡 High | ✅ Done |
| F0-7 | **DB Migration — `customer_inquiry_cart` table** — keranjang inquiry sementara sebelum jadi RFQ | 🟡 High | ✅ Done |
| F0-8 | **Drizzle schema — `barang-gambar.ts`** — TypeScript schema + export di `index.ts` | 🔴 Critical | ✅ Done |
| F0-9 | **Drizzle schema — `customer-profiles.ts`** — TypeScript schema + export | 🟡 High | ✅ Done |
| F0-10 | **Drizzle schema — `customer-inquiry-cart.ts`** — TypeScript schema + export | 🟡 High | ✅ Done |
| F0-11 | **API publik — `GET /api/v1/public/products`** — filter `is_published_to_catalog = true`, **tanpa kolom harga** | 🔴 Critical | ✅ Done |
| F0-12 | **API publik — `GET /api/v1/public/products/[id]`** — detail produk termasuk `barang_gambar` + `spesifikasi_teknis` | 🔴 Critical | ✅ Done |
| F0-13 | **Landing page** — Hero video + overlay Navy 60% + tagline + CTA smooth scroll + client logos slider infinite | 🟡 High | ✅ Done |
| F0-14 | **Tentang Kami** — Profil perusahaan, legalitas, anti-bribery compliance, K3 documentation | 🟢 Medium | ✅ Done |
| F0-15 | **Layanan** — Card interaktif: Industrial Cleaning, Bulk Supply Contract, Spare Parts Procurement | 🟢 Medium | ✅ Done |

---

## Fase 1 — B2B Private Catalog

**Goal:** Katalog produk + detail dengan login gate, multiple images, dashboard integration.

| # | Task | Priority | Status |
|---|------|----------|--------|
| F1-1 | **Dashboard: catalog toggle** — Toggle `is_published_to_catalog` + input `deskripsi_katalog` + `spesifikasi_teknis` di form Tambah/Edit Barang | 🔴 Critical | ✅ Done |
| F1-2 | **Dashboard: multiple images upload** — Uploader `barang_gambar` di form barang, set primary, urutkan, hapus | 🔴 Critical | ✅ Done |
| F1-3 | **Katalog grid page** — `public-pages/katalog/page.tsx` — grid 3 kolom, card premium, price hidden. Login gate: locked vs "Tambah ke SPH" | 🟡 High | ✅ Done |
| F1-4 | **Katalog detail page** — `public-pages/katalog/[id]/page.tsx` — galeri gambar + magnifier zoom, spesifikasi teknis, SKU, tombol "Tambahkan ke Keranjang Inquiry" | 🟡 High | ✅ Done |
| F1-5 | **Framer Motion** — untuk micro-interactions (card hover scale-105, smooth shadow) — terimplementasi di landing, tentang, katalog, layanan, detail katalog (whileHover, whileInView, stagger) | 🟢 Medium | ✅ Done |

---

## Fase 2 — Procurement Tools

**Goal:** Customer bisa daftar, login, dan mengajukan permintaan penawaran.

| # | Task | Priority | Status |
|---|------|----------|--------|
| F2-1 | **Customer Register** — `public-pages/customer-register/page.tsx` — Form + Supabase Auth email/password → insert `customer_profiles` (status `pending`) | 🔴 Critical | ✅ Done |
| F2-2 | **Customer Login** — `public-pages/customer-login/page.tsx` — Email + password → Supabase Auth session | 🔴 Critical | ✅ Done |
| F2-3 | **Dashboard: Review registrasi** — Admin lihat daftar `customer_profiles` pending, approve → link ke `customers` + set `status = 'approved'` | 🟡 High | ✅ Done |
| F2-4 | **Quick Order** — `public-pages/quick-order/page.tsx` — Input manual kode barang + quantity, lookup produk, add to cart | 🟡 High | ✅ Done |
| F2-5 | **Inquiry Cart** — `public-pages/inquiry/page.tsx` — Review items, catatan per item, submit → create `rfq_customer` | 🔴 Critical | ✅ Done |
| F2-6 | **API — POST /api/v1/public/auth/register** + login + me + logout — Register, Supabase Auth session | 🔴 Critical | ✅ Done |
| F2-7 | **API — cart CRUD** — cart add/update/delete/clear endpoints | 🔴 Critical | ✅ Done |
| F2-8 | **API — POST /api/v1/public/inquiry + WhatsApp notification** — Submit inquiry → create rfq_customer + items + kirim WA ke tim sales | 🔴 Critical | ✅ Done |

---

## Fase 3 — Client Portal

**Goal:** Customer bisa melihat status dokumen, download PDF SPH/PO/Invoice, dan mengajukan retur.

| # | Task | Priority | Status |
|---|------|----------|--------|
| F3-1 | **Portal Dashboard** — `public-pages/portal/page.tsx` — Overview: status RFQ terbaru, dokumen, ringkasan pengadaan | 🟡 High | ✅ Done |
| F3-2 | **Portal Dokumen** — `public-pages/portal/dokumen/page.tsx` — Tabel SPH/PO/Invoice milik customer (filter by `customer_id`), tombol "Unduh SPH (PDF)" | 🟡 High | ✅ Done |
| F3-3 | **Portal Retur** — `public-pages/portal/retur/page.tsx` — Pilih DO → pilih item → lihat status + progres timeline | 🟢 Medium | ✅ Done |
| F3-4 | **API publik** — `GET/POST /api/v1/public/retur`, `GET /api/v1/public/delivery-order` — Filter retur + DO by customer untuk portal | 🟢 Medium | ✅ Done |
| F3-5 | **SPH/RFQ History page** — `public-pages/portal/sph-history/page.tsx` — Riwayat SPH yang pernah diajukan, status, link download PDF | 🟢 Medium | ✅ Done |

---

## Fase Lanjutan (Belum Dijadwalkan)

| Feature | Notes | Status |
|---------|-------|--------|
| **PLTU Corner** | E-Katalog sektoral dengan bundel produk. Butuh tabel `produk_bundel` + `produk_bundel_item` | ⏳ Pending |
| **Multi-User & Budget Control** | Requester → Approver flow dalam 1 perusahaan. Butuh `parent_company_id` di `customer_profiles` | ⏳ Pending |
| **Faktur Pajak di Portal** | Jika customer PKP dan butuh download Faktur Pajak PDF | ⏳ Pending |
| **Client logo slider — asset nyata** | Ganti placeholder logo dengan logo klien sungguhan, upload ke R2 `dokumen/logo-klien/` | ⏳ Pending |
| **Logo upload API** | Endpoint untuk manage logo klien dari dashboard | ⏳ Pending |
| **Custom 404 page** | Halaman 404 dengan brand identity RRI | ✅ Done |
| **Empty States & Skeletons** | `src/components/skeleton.tsx` — Skeleton, SkeletonCard, SkeletonTableRow. Semua portal + katalog pages sudah pakai skeleton loading + empty state icons | ✅ Done |

---

## Dependencies & Notes

### Library yang sudah diinstall
- `framer-motion` — animasi micro-interactions ✅

### Database Migrations (per Fase)
| Fase | Migration | Tabel |
|------|-----------|-------|
| F0 | `0064_b2b_catalog_portal.sql` | `barang` (3 columns), `barang_gambar`, `customer_profiles`, `customer_inquiry_cart` |

### API Endpoints yang sudah dibuat
| Method | Endpoint | Fase |
|--------|----------|------|
| GET | `/api/v1/public/products` | F0 |
| GET | `/api/v1/public/products/[id]` | F0 |
| POST | `/api/v1/public/auth/register` | F2 |
| POST | `/api/v1/public/auth/login` | F2 |
| GET | `/api/v1/public/auth/me` | F2 |
| POST | `/api/v1/public/auth/logout` | F2 |
| GET | `/api/v1/public/cart` | F2 |
| POST | `/api/v1/public/cart` | F2 |
| PUT | `/api/v1/public/cart/[itemId]` | F2 |
| DELETE | `/api/v1/public/cart/[itemId]` | F2 |
| DELETE | `/api/v1/public/cart` | F2 |
| POST | `/api/v1/public/inquiry` | F2 |
| GET | `/api/v1/public/portal/dashboard` | F3 |
| GET | `/api/v1/public/portal/dokumen` | F3 |
| GET | `/api/v1/public/portal/sph-history` | F3 |
| GET | `/api/v1/public/retur` | F3 |
| POST | `/api/v1/public/retur` | F3 |
| PUT | `/api/v1/public/retur` | F3 |
| GET | `/api/v1/public/retur/[id]` | F3 |
| GET | `/api/v1/public/delivery-order` | F3 |

### Design Tokens (Tailwind)
- `--color-navy: #0B1528`
- `--color-blue: #0000FF`
- `--color-blue-primary: #0001bb`
- `--color-blue-light: #343DFF`
- `--color-platinum: #94A3B8`
- `--color-ice-gray: #F8FAFC`
- Font heading: `Lexend`
- Font body: `Inter`
- Navbar: White solid / White glassmorphism
