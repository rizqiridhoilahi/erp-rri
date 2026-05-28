# ROADMAP — Perbaikan Modul Kontrak

Dokumen ini mencatat rencana dan progres perbaikan untuk modul Kontrak Customer.

## 🔴 HIGH — Items Management

| # | Task | Status | File |
|---|------|--------|------|
| 1a | Detail page — section "Barang dalam Kontrak" sudah ada (fetch `GET [id]/items`) | ✅ Done | `[id]/page.tsx` |
| 1b | Buat `POST [id]/items` endpoint — insert array item ke `kontrak_item` | ✅ Done | `api/v1/master/kontrak/[id]/items/route.ts` |
| 1c | Edit page — tambah items management (show existing, add, remove, edit harga) + migrasi shadcn form + document upload | ✅ Done | `[id]/edit/page.tsx` |

## 🟡 MEDIUM — UI Consistency

| # | Task | Status | File |
|---|------|--------|------|
| 2a | Detail page — items empty state + quick-link "Buat Barang dari Kontrak" | ✅ Done | `[id]/page.tsx` |
| 2b | PUT endpoint — handle items update (delete all + re-insert) | ✅ Done | `api/v1/master/kontrak/[id]/route.ts` |

## 🟢 LOW — Code Quality

| # | Task | Status | File |
|---|------|--------|------|
| 3a | Ganti `dynamic import` apiFetchFormData → static import | ✅ Done | `tambah/page.tsx` |
| 3b | `VALID_JENIS` cleanup — hapus `rfq_customer` & `di` | ✅ Done | `api/.../documents/route.ts` |
| 3c | Tambah `nomor_kontrak` ke searchable fields di list page | ✅ Done | `page.tsx` |
| 3d | Kode prefix `[kode]` di customer select (tambah & edit) | ✅ Done | `tambah/page.tsx`, `edit/page.tsx` |

## 📄 Documentation

| # | Task | Status | File |
|---|------|--------|------|
| 4a | Update AGENTS.md — format nomor dokumen `RRI-{KODE}-{YY}-{MM}-{0000}` | ✅ Done | `AGENTS.md` |
| 4b | Buat ROADMAP.md ini | ✅ Done | `ROADMAP.md` |

---

## Catatan

- Kontrak menggunakan **nomor manual** dari customer — tidak perlu auto-generate via `generateDocumentNumber()`
- Items kontrak dibuat via **"Import dari Kontrak"** tab di `/dashboard/master/barang/tambah`
- URL kontrak tetap di `/dashboard/master/kontrak` (meski sidebar di Pre-Sales)
- Format nomor dokumen: `RRI-{KODE}-{YY}-{MM}-{0000}` (dashes, bukan slashes)
