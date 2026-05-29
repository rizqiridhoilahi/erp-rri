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
