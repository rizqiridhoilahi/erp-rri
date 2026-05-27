# Audit Bug Report — ERP RRI

Tanggal: 2026-05-26 — Audit Komprehensif (full codebase scan: 137 API routes, 84 schema files, 78 components)

---

## Ringkasan

| Severitas | Jumlah | Kritis | Perlu Segera |
|-----------|--------|--------|--------------|
| **CRITICAL** | 5 | Runtime error / data salah | Sebelum production |
| **HIGH** | 16 | Security hole / logic salah | Sebelum production |
| **MEDIUM** | 18 | Inkosisten / UX buruk | Sebelum / setelah deploy |
| **LOW** | 16 | Convention / best practice | Nice to have |

**Total: 55 findings unik** (belum termasuk yang sudah fixed dari audit sebelumnya)

---

## Yang Sudah Diperbaiki (Audit 23-24 May 2026)

| # | Temuan | Severity | Status |
|---|--------|----------|--------|
| 1 | GET Handler Tanpa Auth (4 endpoint) | HIGH | ✅ FIXED |
| 2 | Cron Endpoint Tanpa Auth | HIGH | ✅ FIXED |
| 3 | Memory Leak Object URL Tidak Di-revoke | HIGH | ✅ FIXED |
| 4 | Stale Cached Token Setelah Sign-Out | HIGH | ✅ FIXED |
| 5 | Dynamic Tailwind Class Names | MEDIUM | ✅ FIXED |
| 6 | Login Page Console Logs | MEDIUM | ✅ FIXED |
| 7 | FormSkeleton Tidak Dipakai | MEDIUM | ✅ FIXED |
| 8 | RFQ Page Pakai fetch Langsung | MEDIUM | ✅ FIXED |
| 9 | Badge Variants CSS Variables Non-Standard | MEDIUM | ✅ FIXED |
| 10 | API Response Format Tidak Konsisten | LOW | ✅ FIXED — 8 file: 4 GET `{ data: data ?? [] }`, 2 DELETE `{ message: ... }`, 2 PUT `{ data: { ...data, siblingKey } }` |
| 11 | Unused Ref OCR Kontrak | LOW | ✅ FIXED |
| 12 | Finance Dashboard Hardcoded Colors | LOW | ✅ FIXED |
| 13 | Error Boundary Tidak Dipakai | LOW | ✅ FIXED |
| 14 | Error Masking di GET Handlers (36 file) | HIGH | ✅ FIXED |
| 15 | customer_top CRUD Missing | MEDIUM | ✅ FIXED |
| 16 | satuan Bukan Tabel Terpisah | LOW | ✅ PRD Corrected |
| 17 | supplier_kontak Belum Ada | LOW | ✅ FIXED |

---

# TEMUAN BARU (Audit 26 May 2026)

## CRITICAL — Runtime Error / Data Salah

### C1. Sidebar Mutasi Module-Level Array 🔴

**File:** `src/components/sidebar-content.tsx:173`

**Masalah:** `filterMenuByRole()` memanggil `item.children = item.children.filter(...)` yang **memutasi module-scope `menuItems` secara in-place**. Efek: user A (admin) lihat semua menu, user B (sales) buka → menu terfilter, user A buka lagi → menu sudah terfilter versi sales. Menu menghilang progresif.

**Perbaikan:** Deep clone sebelum filter, atau gunakan pristine source di setiap render.

---

### C2. Dashboard — `totalPiutang` Menjumlahkan `ppn_rate` 🔴

**File:** `src/app/dashboard/page.tsx:105`

**Masalah:** `reduce((s, i) => s + (i.ppn_rate ?? 0), 0)` — `ppn_rate` adalah **persentase PPN** (misal 11), bukan nominal. Hasil: angka piutang di dashboard = 11 + 11 + 11 = 33 (salah total).

**Perbaikan:** Jumlahkan `harga * jumlah` dari `invoice_item` seperti yang dilakukan `finance.tsx:76-80`.

---

### C3. Manager Dashboard — Sama `ppn_rate` Bug 🔴

**File:** `src/components/dashboards/manager.tsx:15`

**Masalah:** Identik dengan C2 — `reduce` menjumlahkan `ppn_rate`.

**Perbaikan:** Sama seperti C2.

---

### C4. Revenue Mix — Pakai `invoice_id` sebagai Key Lookup `barang` 🔴

**File:** `src/app/dashboard/page.tsx:204-211`

**Masalah:** `barangKategoriMap` berisi `barang.id → kategori_id`, tapi lookup pakai `item.invoice_id` (ID invoice). Tidak akan pernah match → semua revenue masuk "Tanpa Kategori".

**Perbaikan:** Fetch `barang_id` di query invoice items dan pakai itu untuk lookup.

---

### C5. File Upload — MIME Type Fallback Gagal Total 🔴

**File:** `src/components/file-upload.tsx:33`

**Masalah:** `file.type.startsWith(a.replace(".", ""))` — untuk `.pdf`, string jadi `"pdf"` sedangkan `file.type` = `"application/pdf"`. `"pdf"` tidak `startsWith("application/pdf")`. Fallback tidak pernah jalan.

**Perbaikan:** `file.type === "application/" + ext` atau `file.type.includes(ext)`.

---

## HIGH — Security / Logic Salah

### H1. Search Route Query Table TyPo: `negosiasi` vs `negoiasi` 🔴

**File:** `src/app/api/v1/search/route.ts:64`

**Masalah:** Search route query `supabase.from('negosiasi')` tapi tabel di DB bernama `negoiasi` (typo di schema file `negoiasi.ts:4`). Query akan throw `relation "negosiasi" does not exist`.

**Perbaikan:** Ganti query jadi `'negoiasi'` (sesuai nama tabel aktual), atau rename tabel via migration.

---

### H2. Search Route Query Column `nama` di `absensi` Tidak Ada 🔴

**File:** `src/app/api/v1/search/route.ts:66`

**Masalah:** `.select('id, nama').ilike('nama', ...)` — tabel `absensi` tidak punya kolom `nama`. Kolom: `id`, `karyawan_id`, `tanggal`, `status`, `keterangan`, `created_at`, `updated_at`. Akan throw `column absensi.nama does not exist`.

**Perbaikan:** Query `karyawan_id` dan join ke tabel `karyawan` untuk ambil nama.

---

### H3. Missing `await` pada Supabase Insert di VisionAgent 🔴

**File:** `src/lib/ai/agents/VisionAgent/index.ts:211`

**Masalah:** `supabaseAdmin.from('ai_vision_history').insert({...})` tanpa `await`. Insert fire-and-forget — error silent, data history hilang.

**Perbaikan:** Tambah `await`.

---

### H4. Tidak Ada Tipe TypeScript untuk 84 Tabel Database

**File:** `src/types/` (hanya ada `role.ts`)

**Masalah:** Zero TypeScript types untuk entity database. Developer harus manual infer dari Drizzle schema. Risk of mismatch di runtime.

**Perbaikan:** Generate type pakai `supabase gen types typescript` atau export `InferSelect`/`InferInsert` dari Drizzle.

---

### H5. Dual Migration Directory — 50 FK Hanya di Manual SQL

**File:** `drizzle/` vs `src/lib/db/migrations/`

**Masalah:** Dua direktori migrasi terpisah. ~50 FK constraint (dari `0002_add_foreign_keys.sql`) dan ~65 performance indexes (dari `0001_init.sql`) HANYA ada di manual `src/lib/db/migrations/` yang TIDAK terhubung ke Drizzle journal. `npx drizzle-kit migrate` di DB baru akan melewatkan semua FK dan index ini.

**Perbaikan:** Migrate semua FK dan index ke dalam Drizzle migration chain (`drizzle/`), atau konversi ke `.references()` di schema.

---

### H6. SidebarGroup — Prop `defaultOpen` Diabaikan Setelah Render Awal 🔴

**File:** `src/components/sidebar-content.tsx:238`

**Masalah:** `const [open, setOpen] = useState(defaultOpen)` — navigasi ke page di group berbeda tidak membuka group karena `useState` hanya pakai initial value.

**Perbaikan:** `useEffect(() => setOpen(defaultOpen), [defaultOpen])`.

---

### H7. Onboarding Overlay Pakai Tailwind Class Sebagai CSS Value 🔴

**File:** `src/components/onboarding/onboarding-provider.tsx:125`

**Masalah:** `overlay: { backgroundColor: 'bg-black/40' }` — `bg-black/40` adalah Tailwind utility, bukan CSS value. Overlay tidak tampil.

**Perbaikan:** `overlay: { backgroundColor: 'rgba(0,0,0,0.4)' }`.

---

### H8. Onboarding Text Warna Hardcoded — Rusak di Dark Mode 🔴

**File:** `src/components/onboarding/onboarding-provider.tsx:128-129`

**Masalah:** `tooltipContent: { color: '#020617' }` — warna sangat gelap. Di dark mode (latar belakang gelap), teks tidak terbaca.

**Perbaikan:** Pakai `hsl(var(--foreground))` atau theme-aware color.

---

### H9. GET Handler Tidak Punya Auth (30+ Endpoint)

**File:** Semua `[id]/route.ts` di master & transaksi (lihat catatan audit sebelumnya)

**Masalah:** 30+ GET handler detail tidak panggil `verifyAuth()`. Data bisa dibaca tanpa token.

**Perbaikan:** Tambah `verifyAuth()` di setiap GET handler.

---

## MEDIUM — Inkonsisten / UX Buruk

### M1. 4 AI Schema Pakai `uuid` Type, 80+ Lainnya Pakai `text`

**File:** `schema/ai-*-history.ts`, `schema/ai-automation-log.ts`

**Masalah:** ID type tidak konsisten — `uuid('id').defaultRandom()` vs `text("id").default(sql\`gen_random_uuid()::text\`)`. Join antara dua type bisa error.

**Perbaikan:** Standardisasi ke satu type (prefer `text` seperti mayoritas).

---

### M2. `aiNegoHistory` Properti `created_at` Snake_case

**File:** `schema/ai-nego-history.ts:19`

**Masalah:** `created_at: timestamp('created_at', ...)` — nama properti snake_case. Semua schema lain pakai `createdAt`.

**Perbaikan:** Rename ke `createdAt: timestamp('created_at', ...)`.

---

### M3. AI Schemas Omit `.notNull()` pada Default Field

**File:** `ai-*-history.ts`, `ai-automation-log.ts`

**Masalah:** Field dengan `.defaultNow()` atau `.default(true)` tidak punya `.notNull()`. Inkosisten dengan 80+ schema lain.

**Perbaikan:** Tambah `.notNull()`.

---

### M4. Tidak Ada Zod Validation di Supplier Payment

**File:** `src/app/api/v1/procurement/supplier-payment/route.ts:22-25`

**Masalah:** Manual `if (!body.x || !body.y)` alih-alih Zod `safeParse`. Inkonsisten dengan semua POST handler lain.

**Perbaikan:** Implementasi Zod validation schema.

---

### M5. Tidak Ada Zod Validation di DO Scan Items

**File:** `src/app/api/v1/delivery-order/[id]/scan/route.ts:22-25`

**Masalah:** Raw type assertion `body.scanned_items as Array<...>` tanpa validasi.

**Perbaikan:** Zod schema untuk scanned items.

---

### M6. Non-Standard Error Response di Users Routes

**File:** `src/app/api/v1/users/route.ts`, `src/app/api/v1/users/[id]/route.ts`

**Masalah:** `NextResponse.json({ error: 'Unauthorized' })` instead of `unauthorized()` dari error helpers.

**Perbaikan:** Pakai error helpers yang konsisten.

---

### M7. Stock Opname — Document Number Tidak Auto-Generate

**File:** `src/app/api/v1/inventory/stock-opname/route.ts:38`

**Masalah:** Schema require `nomor: z.string().min(1)` — client harus kirim nomor. Semua dokumen lain auto-generate via `generateDocumentNumber()`.

**Perbaikan:** Auto-generate nomor dokumen.

---

### M8. Search Harga — Empty Catch Block

**File:** `src/app/api/v1/ai/search-harga/route.ts:21`

**Masalah:** `catch { /* fallback to mock */ }` — semua error diswallow tanpa log.

**Perbaikan:** Minimal `console.error`.

---

### M9. Syntax Error di Migration Manual: `CREATE_INDEX`

**File:** `src/lib/db/migrations/0001_init.sql:741`

**Masalah:** `CREATE_INDEX idx_penggajian_krw_id ON penggajian(karyawan_id);` — underscore, harusnya `CREATE INDEX`. Akan error jika dijalankan.

**Perbaikan:** Ganti jadi `CREATE INDEX`.

---

### M10. ID Type Churn (Migration 0008 ↔ 0009)

**File:** `drizzle/0008_mean_doctor_doom.sql`, `drizzle/0009_material_tinkerer.sql`

**Masalah:** Migrasi 0008 ubah semua ID dari `text` → `uuid`, migrasi 0009 balikin `uuid` → `text`. Full-table rewrite tanpa net change.

**Perbaikan:** Hapus kedua migrasi dari chain jika belum dijalankan di production.

---

### M11. `0005_ai_error_tracking.sql` Tidak di Journal

**File:** `drizzle/0005_ai_error_tracking.sql`

**Masalah:** File ada tapi tidak terdaftar di `drizzle/meta/_journal.json`. Akan dilewati oleh `drizzle-kit migrate`.

**Perbaikan:** Register di journal atau merge isinya ke migrasi lain.

---

### M12. Belum Ada FK Constraints untuk Document Tables

**File:** Schema `customer-po-document`, `di-document`, `grn-document`, `quotation-document`, `rfq-customer*`

**Masalah:** Tabel dokumen dan rfq_customer tidak punya FK constraint sama sekali — baik di schema `.references()` maupun migration `ALTER TABLE`.

**Perbaikan:** Tambah `.references()` di schema + migration untuk add FK.

---

### M13. `handleLogout` Tidak `useCallback`

**File:** `src/components/sidebar-content.tsx:192-195`

**Masalah:** Function reference baru tiap render → potential unnecessary re-renders.

**Perbaikan:** Wrap dengan `useCallback`.

---

### M14. Duplicate `"use client"` Directive (4 file)

**File:** `sidebar-content.tsx`, `onboarding-provider.tsx`, `panduan-button.tsx`, `dark-mode-toggle.tsx`

**Masalah:** Baris 1 dan 3 sama-sama `"use client"` (quotes beda). Duplikat.

**Perbaikan:** Hapus salah satu.

---

### M15. Skeleton — Dynamic Tailwind Classes Tidak Akan Resolve

**File:** `src/components/ui/skeleton.tsx:26,37`

**Masalah:** `` w-${colWidths[i]} `` — Tailwind JIT hanya scan complete class names. Runtime template literal tidak akan digenerate.

**Perbaikan:** Map preset widths atau pakai inline style.

---

### M16. Delete Button Text Tidak Berubah Saat Loading

**File:** `src/components/kelola-kategori-dialog.tsx:274-276`

**Masalah:** Button tetap "Ya, Hapus" saat loading. Pembanding: `delete-confirmation-dialog.tsx:57` sudah benar pakai "Menghapus...".

**Perbaikan:** `{deleteLoading ? "Menghapus..." : "Ya, Hapus"}`.

---

### M17. Confirm Leave Dialog — Hardcoded Color

**File:** `src/components/confirm-leave-dialog.tsx:31`

**Masalah:** `bg-red-500/70` langsung, tidak pakai button variant. Inkonsisten dengan `delete-confirmation-dialog.tsx:48` yang pakai `bg-zinc-500/70`.

**Perbaikan:** Pakai `variant="destructive"` dari button system.

---

### M18. Master Data Table — Sorting String untuk Field Numerik ✅ FIXED

**File:** `src/components/master-data-table.tsx:47-51`

**Masalah:** `localeCompare` dipakai untuk semua kolom. "100" datang sebelum "20" secara leksikografis.

**Perbaikan:** Deteksi tipe data: jika `typeof === "number"`, pakai `a - b`; sisanya pakai `localeCompare`.

---

## LOW — Convention / Best Practice

### L1. `invoiceItem` Pakai `harga` Bukan `hargaSatuan` ✅ FIXED

**File:** `schema/invoice-item.ts:8`

**Masalah:** Semua item table lain pakai `hargaSatuan`, invoice-item pakai `harga`. Inkonsisten.

**Perbaikan:** Rename ke `hargaSatuan` + migration `ALTER TABLE invoice_item RENAME COLUMN harga TO harga_satuan` + update 36 references.

---

### L2. `aiAutomationLog` Tidak Punya `createdAt`

**File:** `schema/ai-automation-log.ts`

**Masalah:** Hanya punya `executedAt`, tidak ada `createdAt`. Semua tabel lain punya `createdAt`.

**Perbaikan:** Tambah field `createdAt`.

---

### L3. `invoiceDocument` Punya Field Unik `documentType` ✅ FIXED

**File:** `schema/invoice-document.ts:7`

**Masalah:** Satu-satunya document table dengan `documentType`. Semua document table lain identik.

**Perbaikan:** Hapus `documentType` dari schema + migration `ALTER TABLE invoice_document DROP COLUMN document_type`. Juga tambah FK `.references()` ke `invoice.id` (sejalan M12). Field tidak pernah diisi oleh kode manapun — dead column.

---

### L4. `siteSettings` — Tidak Ada `id` atau `createdAt`

**File:** `schema/site-settings.ts`

**Masalah:** Key-value store tanpa `id` dan `createdAt`. Break pattern umum semua tabel.

---

### L5. `userRoles` — Tidak Ada `updatedAt` atau `isActive`

**File:** `schema/user-roles.ts`

**Masalah:** Tidak bisa track kapan role diubah, dan tidak bisa soft-disable role assignment.

---

### L6. Inconsistent Auth Pattern di 5 AI Routes

**File:** AI routes (rekomendasi-supplier, error-stats, usage, anomaly-detection, auto-suggest-barang, price-trend)

**Masalah:** `if (!auth.user) { ... }` bukan `if (auth.error) return auth.error`.

---

### L7. Hardcoded PPN Rate 11%

**File:** `src/app/api/v1/invoice/route.ts:24`, `src/app/api/v1/quotation/route.ts:31`

**Masalah:** `ppn_rate: ...default(0.11)` hardcoded. Harusnya dari site settings atau company profile.

---

### L8. Hardcoded 24h Escalation Threshold

**File:** `src/app/api/v1/cron/approval-escalation/route.ts:14`

**Masalah:** `24 * 60 * 60 * 1000` hardcoded. Harusnya dari config table.

---

### L9. DELETE Handler Return 200 Instead of 204

**File:** Semua DELETE handler (30+)

**Masalah:** `NextResponse.json({ message: 'Berhasil dihapus' })` — REST convention prefers 204 No Content.

---

### L10. Non-null Assertion `auth.user!`

**File:** AI routes (ocr-kontrak, search-harga, dll)

**Masalah:** `auth.user!.id` — kalau user null (edge case), throw runtime TypeError.

**Perbaikan:** Guard dengan early return.

---

### L11. `status-badge.tsx` — Union Type Collapse ke `string`

**File:** `src/components/status-badge.tsx:5`

**Masalah:** `StatusVariant | string` — karena `string` adalah supertype, union collapse ke `string` saja. Type checking tidak berguna.

---

### L12. Export PDF Button — `download` Diabaikan dengan `target="_blank"`

**File:** `src/components/export-pdf-button.tsx:21`

**Masalah:** Browser ignore `download` attribute saat `target="_blank"` (cross-origin security). PDF opens in new tab instead of download.

---

### L13. Barcode Scanner — Tidak Ada Feedback di Browser Unsupported

**File:** `src/components/barcode-scanner.tsx:63-80`

**Masalah:** `BarcodeDetector` API hanya di Chromium. Firefox/Safari: kamera aktif tapi tidak ada feedback.

**Perbaikan:** Deteksi support dan tampilkan pesan.

---

### L14. `table-actions.tsx` — Prop `id` Dideklarasi tapi Tidak Dipakai

**File:** `src/components/table-actions.tsx:11-13`

---

### L15. `kelola-kategori-dialog.tsx` — Field `keterangan` Tidak Ada `<FormMessage />`

**File:** `src/components/kelola-kategori-dialog.tsx:239`

---

### L16. Extensive `as` Type Assertions (Multiple Files) ✅ FIXED

**File:** `sidebar-content.tsx`, `activity-timeline.tsx`, `dashboard/page.tsx`, `dashboards/*.tsx`

**Masalah:** Banyak `as SomeType` yang bypass type checking.

**Perbaikan:** 28 `as` assertions paling berbahaya (dari 113+) diberi runtime guard: `Array.isArray()` + null check + optional chaining. Sisanya (`as const`, `as keyof`, narrowing) aman dan tidak perlu diubah.

---

## Prioritas Perbaikan

### Phase 1 — Segera (sebelum production)
| Priority | Item | Effort |
|----------|------|--------|
| P0 | C1: Sidebar mutasi module-level array | 1 jam |
| P0 | C2-C3: `ppn_rate` instead of amount (dashboard + manager) | 1 jam |
| P0 | C4: Revenue mix `invoice_id` jadi key lookup | 1 jam |
| P0 | C5: File upload MIME fallback | 30 menit |
| P0 | H1: Search route query `negosiasi` typo | 15 menit |
| P0 | H2: Search route query `nama` di absensi | 30 menit |
| P0 | H3: Missing `await` VisionAgent insert | 15 menit |
| P0 | H9: 30+ GET handler tanpa auth | 2 jam |

### Phase 2 — Sebelum Production Deploy
| Priority | Item | Effort |
|----------|------|--------|
| P1 | H5: Dual migration / FK hilang | 4 jam |
| P1 | H6: SidebarGroup defaultOpen | 30 menit |
| P1 | H7-H8: Onboarding overlay & dark mode | 1 jam |
| P1 | M1-M3: AI schema inconsistencies | 1 jam |
| P1 | M4-M5: Zod validation missing | 2 jam |
| P1 | M6: Users route non-standard error | 30 menit |
| P1 | M7: Stock opname no auto-number | 1 jam |
| P1 | M9: Migration syntax error | 15 menit |
| P1 | M10-M12: Migration fixes | 3 jam |
| P1 | M15: Skeleton dynamic tailwind | 30 menit |
| P1 | M16-M18: Dialog UX fixes | 1 jam |
| P1 | H4: Generate TypeScript types | 2 jam |
| P1 | M8: Search harga catch block | 15 menit |

### Phase 3 — Post-Deploy / Quality (✅ Selesai 27 May 2026)
| Priority | Item | Effort | Status |
|----------|------|--------|--------|
| P2 | M13-M14: useCallback + dup directives | 30 menit | ✅ FIXED (Phase 2) |
| P2 | L1-L5: Schema naming consistency | 2 jam | ✅ L1+L3+L4+L5 fixed; L2 sdh ada |
| P2 | L6: AI routes auth pattern | 1 jam | ✅ FIXED (6 file) |
| P2 | L7-L8: Hardcoded values → config | 2 jam | ✅ FIXED (pakai `getConfigNumber()` dari `site_settings`) |
| P2 | L9-L12: REST convention fixes | 2 jam | ✅ FIXED (DELETE 204: 29 file; auth.user! guard; status-badge union; pdf download) |
| P3 | L13-L16: Minor UX & type fixes | 2 jam | ✅ L13/L14/L15/L16 fixed (28 `as` berbahaya dikasih runtime guard) |

---

## Catatan Infrastruktur

### Migration Strategy
1. **Segera:** Hapus migrasi 0008 dan 0009 dari chain (ID type churn)
2. **Segera:** Register `0005_ai_error_tracking.sql` ke `drizzle/meta/_journal.json`
3. **Post-deploy:** Migrate FK dari `src/lib/db/migrations/0002_add_foreign_keys.sql` ke Drizzle schema `.references()` dan generate migration baru
4. **Post-deploy:** Migrate index dari `src/lib/db/migrations/0001_init.sql` ke schema `.index()` atau migration manual

### Deploy Checklist
- [ ] Semua Phase 1 items selesai
- [ ] `npm run build` sukses tanpa error
- [ ] `npm run lint` bersih
- [ ] Testing manual: login, buka dashboard, buat invoice, buat PO
- [ ] Testing migration di branch database
- [ ] Update AGENTS.md jika ada perubahan konvensi
