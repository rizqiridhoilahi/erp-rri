# ROADMAP: Import dari PO Customer

## Goal
Fitur untuk mengimpor data dari PDF Purchase Order (PO) Customer ke sistem ERP RRI — mencatat history PO yang terjadi di luar sistem dengan cara mengimpor data barang, customer, PIC, dan PO itu sendiri.

---

## Document Numbering

### Format
```
RRI-CPO-EXT-{YY}-{MM}-{NNNN}
```

| Segmen | Makna | Sumber |
|--------|-------|--------|
| `CPO` | Customer Purchase Order (kode dokumen) | Fixed |
| `EXT` | External (sumber dari luar sistem) | Fixed |
| `YY` | Tahun pembuatan PO (2 digit) | Dari `tanggal_po` pada JSON |
| `MM` | Bulan pembuatan PO (2 digit) | Dari `tanggal_po` pada JSON |
| `NNNN` | Counter 4 digit | Tabel `document_counter` via `increment_document_counter` |

### Implementasi
- Panggil `generateDocumentNumber('CPO-EXT', tahun, bulan)` — fungsi existing ditambahi parameter opsional `tahun`/`bulan`
- Counter terpisah dari `CPO` reguler (karena kode_dokumen berbeda: `CPO-EXT`)

---

## Database: Tabel Baru `customer_prompt`

```sql
CREATE TABLE customer_prompt (
  customer_id UUID PRIMARY KEY REFERENCES customer(id),
  prompt_template TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

- Diisi **manual via Supabase Table Editor** oleh admin
- Jika customer belum punya prompt → blokir import (tampilkan error)
- Join dengan customer untuk dropdown — hanya tampilkan customer yang sudah `is_active = true`

---

## Standardized JSON Output (WAJIB — semua prompt harus produce format ini)

```json
{
  "nama_customer": "PT. Bhumi Jepara Service",
  "nama_pic": "ICHIRO USUI",
  "jabatan_pic": "GM of Planning & Coord.",
  "nomor_po_customer": "PO-BJS-26-1682-HSE",
  "nomor_pr_customer": "PR-BJS-26-1162-HSE",
  "nomor_quotation_rri": "RRI-SPH-26-046",
  "tanggal_po": "2026-06-03",
  "revisi_ke": 0,
  "time_for_delivery_hari": 14,
  "durasi_payment_hari": 14,
  "catatan": "",
  "items": [
    {
      "nama_barang": "Head Lamp Clip (Per Pack: 20 Pcs)",
      "satuan": "PACK",
      "qty": 5,
      "harga_satuan": 45000
    }
  ]
}
```

### Field Wajib (validasi ketat — harus ada, tidak boleh fallback)
| Field | Type | Keterangan |
|-------|------|------------|
| `nama_customer` | string | Nama customer |
| `nomor_po_customer` | string | Nomor PO dari customer |
| `tanggal_po` | string (YYYY-MM-DD) | Tanggal PO |
| `items` | array (min 1) | Array item barang |
| `items[].nama_barang` | string | Nama barang |
| `items[].satuan` | string | Satuan barang |
| `items[].qty` | number | Quantity |
| `items[].harga_satuan` | number | Harga satuan |

### Field Opsional (fallback: `"-"` untuk string, `0` untuk number)
| Field | Type | Fallback |
|-------|------|----------|
| `nama_pic` | string | `"-"` |
| `jabatan_pic` | string | `"-"` |
| `nomor_pr_customer` | string | `"-"` |
| `nomor_quotation_rri` | string | `"-"` |
| `revisi_ke` | number | `0` |
| `time_for_delivery_hari` | number | `0` |
| `durasi_payment_hari` | number | `0` |
| `catatan` | string | `""` |

---

## Flow End-to-End (Updated)

```
[Tab Import dari PO]
  │
  ├─ 1. Pilih Customer dari Dropdown
  │    → GET customer yang punya prompt aktif
  │    → Hanya tampilkan customer dengan prompt tersedia
  │    → Jika belum ada prompt: blokir, suruh admin isi via Supabase
  │
  ├─ 2. Prompt Gemini Muncul (custom per customer)
  │    → GET /api/v1/master/customer/{id}/prompt
  │    → Tampilkan prompt di textarea read-only
  │    → Tombol "Salin Prompt"
  │    → User upload PDF ke Gemini, paste prompt, dapat JSON
  │
  ├─ 3. Upload File PDF PO
  │    → Compact upload UI
  │    → Simpan ke Supabase Storage: dokumen/customer-po/{id}/{file}
  │
  ├─ 4. Paste JSON & Preview
  │    → Parse & validasi JSON (validasi ketat field wajib)
  │    → Tampilkan tabel pratinjau items
  │    → Tampilkan ringkasan header (customer, nomor PO, tanggal)
  │
  ├─ 5. Import
  │    │
  │    ├─ Auto-match Customer by nama
  │    │   → Cari di tabel customer by nama (case-insensitive)
  │    │   → Jika tidak ditemukan: auto-create
  │    │     • Kode: CUST-{NNNNN} (query max CUST-%, increment, padStart 5)
  │    │     • Nama: dari JSON
  │    │   → PIC Customer: cari by nama + customer_id
  │    │     • Jika tidak ditemukan: auto-create dengan nama + jabatan dari JSON
  │    │
  │    ├─ Auto-create Barang (per item)
  │    │   → Generate kode: BRG-RRI-{NNNNN} via generateAutoKode()
  │    │   → Validasi duplicate:
  │    │     • Nama SAMA + harga SAMA → skip (sudah terdaftar)
  │    │     • Nama SAMA + harga BEDA → tetap create (history harga)
  │    │     • Nama BEDA → create baru
  │    │
  │    ├─ Buat Customer PO record
  │    │   → Nomor RRI: generateDocumentNumber('CPO-EXT', tahun, bulan)
  │    │   → Nomor quotation: dari JSON.nomor_quotation_rri || "-"
  │    │   → Status: confirmed
  │    │   → terms_of_payment: dari JSON.durasi_payment_hari + " days"
  │    │   → waktu_pengiriman: dari JSON.time_for_delivery_hari
  │    │   → pic_customer_id: dari PIC yang di-match/created
  │    │
  │    └─ Buat Customer PO Item records
  │        → customer_po_id, barang_id, jumlah, harga_satuan
  │
  └─ 6. Redirect ke halaman master barang
```

---

## Prompt Template: BJS (PT. Bhumi Jepara Service)

```text
Extract purchase order data from this PT. Bhumi Jepara Service PO PDF as a JSON object.

Return a valid JSON object (NOT array) with this exact structure:
{
  "nama_customer": "PT. Bhumi Jepara Service",
  "nama_pic": "string (authorized signatory name, e.g. ICHIRO USUI)",
  "jabatan_pic": "string (position, e.g. GM of Planning & Coord.)",
  "nomor_po_customer": "string (PO Number, e.g. PO-BJS-26-1682-HSE)",
  "nomor_pr_customer": "string (Reference PR Number, or \"-\" if not found)",
  "nomor_quotation_rri": "string (Reference Quotation Number, e.g. RRI-SPH-26-046, or \"-\")",
  "tanggal_po": "YYYY-MM-DD (PO Date, e.g. 2026-06-03)",
  "revisi_ke": 0,
  "time_for_delivery_hari": 0 (convert "2 weeks" to 14, "30 days" to 30, etc.),
  "durasi_payment_hari": 0 (extract from PAYMENT terms, e.g. "TTR 14 calendar days" = 14),
  "catatan": "",
  "items": [
    {
      "nama_barang": "string (Description column)",
      "satuan": "string (Unit column, e.g. PACK)",
      "qty": 0,
      "harga_satuan": 0
    }
  ]
}

Extraction rules:
- TIME FOR DELIVERY: parse from terms table, convert weeks to days
- PAYMENT: parse "TTR X calendar days" → extract number
- PIC name from "Authorized by" in signature section
- Department field → store in catatan if needed
- If a field is not found, use "-" (text) or 0 (number)

Return ONLY valid JSON with no markdown formatting, no explanation.
```

---

## Prompt Template: MKP (PT. Mitra Karya Prima)

```text
Extract purchase order data from this PT Mitra Karya Prima PO PDF as a JSON object.

Return a valid JSON object (NOT array) with this exact structure:
{
  "nama_customer": "PT Mitra Karya Prima",
  "nama_pic": "string (signatory name, e.g. Supriyanto)",
  "jabatan_pic": "string (position, e.g. Manajer Operasi)",
  "nomor_po_customer": "string (PO Number, e.g. 221/PO/MKP/OPS/XII/2025)",
  "nomor_pr_customer": "-",
  "nomor_quotation_rri": "-",
  "tanggal_po": "YYYY-MM-DD (from date line, e.g. Sidoarjo, 01 Desember 2025)",
  "revisi_ke": 0,
  "time_for_delivery_hari": 0,
  "durasi_payment_hari": 0,
  "catatan": "string (subject/HAL line, e.g. CONSUMABLE BJS DES-JAN 2025)",
  "items": [
    {
      "nama_barang": "string (Uraian Biaya column)",
      "satuan": "string (Sat. column)",
      "qty": 0,
      "harga_satuan": 0
    }
  ]
}

Notes:
- nomor_pr_customer, nomor_quotation_rri: always "-" for this customer
- time_for_delivery_hari, durasi_payment_hari: use 0
- Items from the table (columns: No, Uraian Biaya, Vol., Sat., Harga Satuan, Total)
- PIC name and position from signature section (Hormat kami)
- catatan: use the subject/HAL line
- Format PO ini adalah surat formal (letter-style), bukan tabel header

Return ONLY valid JSON with no markdown formatting, no explanation.
```

---

## Files yang Dimodifikasi

| File | Perubahan |
|------|-----------|
| `src/lib/db/schema/customer-prompt.ts` | **BARU** — Drizzle schema tabel `customer_prompt` |
| `src/lib/utils/document-number.ts` | Tambah parameter opsional `tahun`/`bulan` ke `generateDocumentNumber()` |
| `src/lib/utils/barang-auto-create.ts` | Tambah `generateCustomerAutoKode()` |
| `src/app/dashboard/master/barang/tambah/page.tsx` | Implementasi tab "Import dari PO" (dropdown + prompt + upload + preview + import) |

## Files yang Dibuat

| File | Tujuan |
|------|--------|
| Migration SQL | `CREATE TABLE customer_prompt` |
| `src/app/api/v1/master/customer/[id]/prompt/route.ts` | GET prompt by customer ID |
| `src/app/api/v1/master/barang/import-from-po/route.ts` | POST import (validasi JSON, auto-match customer, auto-create barang, create PO + items) |

---

## Implemetasi Detail

### 1. Migration SQL
```sql
CREATE TABLE IF NOT EXISTS customer_prompt (
  customer_id UUID PRIMARY KEY REFERENCES customer(id) ON DELETE CASCADE,
  prompt_template TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Grant access
ALTER TABLE customer_prompt ENABLE ROW LEVEL SECURITY;
GRANT ALL ON customer_prompt TO authenticated, service_role;
```

### 2. Drizzle Schema (`customer-prompt.ts`)
```typescript
import { sql } from "drizzle-orm"
import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const customerPrompt = pgTable("customer_prompt", {
  customerId: text("customer_id").primaryKey(),
  promptTemplate: text("prompt_template").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
```

### 3. API — GET prompt by customer
- `GET /api/v1/master/customer/{id}/prompt`
- Query `customer_prompt` WHERE `customer_id = {id}` AND `is_active = true`
- Return `{ data: { customer_id, prompt_template, customer: { nama } } }`

### 4. API — POST import
- Request body:
```json
{
  "customerId": "uuid",
  "tanggalPo": "2026-06-03",
  "jsonData": { ... standardized JSON ... },
  "pdfFile": "base64 or upload ref"
}
```
- Flow:
  1. Verify auth
  2. Validasi Zod — field wajib harus ada
  3. Auto-match / create customer by `nama_customer`
  4. Auto-match / create PIC by `nama_pic` + customer_id
  5. Generate nomor PO: `generateDocumentNumber('CPO-EXT', tahun, bulan)`
  6. Upload PDF ke storage: `dokumen/customer-po/{customerPoId}/{file}`
  7. Loop items:
     - Cek duplicate barang by nama + harga
     - Jika baru: generate kode `generateAutoKode()`, insert ke `barang`
  8. Insert `customer_po` (confirmed) + `customer_po_item`
  9. Return hasil import

### 5. Frontend — Tab "Import dari PO"
- Dropdown customer (filter: hanya yang punya prompt aktif)
- Saat pilih customer → fetch prompt → tampilkan
- Tombol "Salin Prompt" + File upload compact
- Textarea paste JSON
- Tombol "Preview Data" — validasi JSON + field wajib
- Tabel pratinjau (header info + items)
- Tombol "Import" — kirim ke API

---

## UI/UX Notes

- Tab aktif: `bg-primary text-primary-foreground` (global)
- Dropdown: hanya customer yang sudah punya prompt
- Upload file: compact, drag-drop or click, PDF only
- Loading state: spinner di tombol import
- Error handling: toast per-item error + summary
- Jika customer tanpa prompt: tampilkan pesan "Prompt untuk customer ini belum tersedia. Hubungi admin untuk menambahkan prompt di Supabase."

---

## Referensi

- Pattern "Import dari Kontrak": `src/app/dashboard/master/barang/tambah/page.tsx` (tab `import`)
- API pattern: `src/app/api/v1/master/barang/import-from-kontrak/route.ts`
- Barang auto-create: `src/lib/utils/barang-auto-create.ts`
- Document number: `src/lib/utils/document-number.ts`
- Storage path: `dokumen/customer-po/{id}/{file}`
- Format PO BJS: `docs-format-examples/format-po-BJS.html`
- Format PO MKP: `docs-format-examples/format-po-MKP.html`
