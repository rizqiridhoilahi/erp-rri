# ROADMAP: Multi-Termin Invoice PDF & Kwitansi

## Latar Belakang

Saat ini sistem hanya menghasilkan **1 PDF invoice + 1 PDF kwitansi** per invoice dengan total 100% pembayaran. Untuk customer yang memiliki **multi-termin pembayaran** (via `payment_term`), sistem perlu menghasilkan **PDF terpisah per termin**.

### Aturan Umum

| Customer | Invoice PDF | Kwitansi |
|----------|-------------|----------|
| **Tanpa payment term** | 1 PDF (100%) — **existing behavior, tidak berubah** | 1 kwitansi (100%) — **existing behavior, tidak berubah** |
| **Dengan payment term** (multi-termin) | 1 PDF per termin: total = `term.jumlah` | 1 kwitansi per termin: total = `term.jumlah` |

---

## Status Saat Ini

### Schema Terkait

| Tabel | Field Kunci |
|-------|------------|
| `invoice` | `nomor` (RRI-INV-YY-MM-NNNNN), `top`, `customer_id` |
| `invoice_item` | `harga`, `jumlah`, `diskon` — per item barang |
| `invoice_payment_schedule` | `urutan`, `deskripsi`, `persentase`, `jumlah`, `due_date`, `status` |
| `payment_term` | `nama` (header) |
| `payment_term_item` | `urutan`, `deskripsi`, `persentase`, `due_days` |
| `kwitansi` | `nomor` (RRI-KWT-YY-MM-NNNNN), `invoice_id` |
| `kwitansi_item` | `invoice_item_id`, `jumlah` |

### Alur Create Invoice Saat Ini (`POST /api/v1/invoice`)

```
1. Generate nomor → RRI-INV-YY-MM-NNNNN
2. Insert invoice + invoice_item
3. Auto-create 1 kwitansi for total:
   - nomor: RRI-KWT-YY-MM-NNNNN (formatChildNumber(inv.nomor, 'KWT'))
   - kwitansi_item: 1 row per invoice_item, jumlah = item_total
4. (if customer has payment_term_id)
   - Auto-generate invoice_payment_schedule dari payment_term_item
   - Setiap term: {urutan, deskripsi, persentase, jumlah = total * % / 100}
5. Generate jurnal akuntansi
```

### Alur PDF Saat Ini (`GET /api/v1/invoice/[id]/pdf`)

```
1. Fetch invoice + sales_order + customer + customer_pic
2. Fetch semua invoice_item
3. Hitung grandTotal = sum(items)
4. Render InvoicePDF dengan:
   - nomor: inv.nomor
   - perihal: "Tagihan" (hardcoded)
   - grandTotal: 100%
   - items: full list
5. Return blob PDF
```

### Alur Kwitansi PDF Saat Ini (`GET /api/v1/kwitansi/[id]/pdf`)

```
1. Fetch kwitansi + invoice + customer
2. Fetch kwitansi_item → dapat invoice_item_ids
3. Hitung total = sum(invoice_item.harga * jumlah - diskon) dari invoice_item_ids
4. Render KwitansiPDF dengan total tsb
5. Return blob PDF
```

---

## Rencana Implementasi

### 1. Fungsi Pembantu: Roman Numeral

**File baru:** `src/lib/utils/roman.ts`

```typescript
export function toRoman(n: number): string
```

Support berapa pun jumlah termin (1-3999). Dipakai untuk suffix nomor: `/I`, `/II`, `/III`, dst.

---

### 2. Schema Kwitansi — Tambah Kolom

**File:** `src/lib/db/schema/kwitansi.ts`

```typescript
export const kwitansi = pgTable("kwitansi", {
  // ...existing fields...
  scheduleId: text("schedule_id"),  // FK ke invoice_payment_schedule.id (nullable — null untuk full kwitansi)
  total: numeric("total", { precision: 18, scale: 2 }).$type<number>(),  // override total (nullable)
})
```

**Migration:** `drizzle/XXXX_add_schedule_id_to_kwitansi.sql`

```sql
ALTER TABLE kwitansi ADD COLUMN schedule_id text REFERENCES invoice_payment_schedule(id);
ALTER TABLE kwitansi ADD COLUMN total numeric(18, 2);
```

---

### 3. Invoice PDF Template — Field Baru

**File:** `src/lib/pdf/invoice.ts`

**Tambah ke `InvoiceData`:**
```typescript
termLabel?: string         // "DP 50%" — untuk Perihal: "Tagihan DP 50%"
termNomor?: string         // "RRI-INV-26-06-0047/I" — nomor di header
termAmount?: number        // 9800000 — grand total per termin
scheduleItems?: Array<{    // tabel jadwal termin di body PDF
  urutan: number
  deskripsi: string
  persentase: number
  jumlah: number
}>
```

**Logika render:**
- `perihal` → `"Tagihan " + (termLabel ?? "")` jika ada termLabel, fallback `"Tagihan"`
- `nomor header` → `termNomor ?? nomor`
- `GRAND TOTAL` → `termAmount ?? grandTotal`
- Jika `scheduleItems` ada → render tabel termin setelah item table (sebelum paymentSection)
  - Highlight row untuk term yang sedang digenerate

---

### 4. PDF Route — Handle `?term=N`

**File:** `src/app/api/v1/invoice/[id]/pdf/route.ts`

```typescript
const termParam = request.nextUrl.searchParams.get('term')

let pdfOverrides = { termNomor: undefined, termLabel: undefined, termAmount: undefined, scheduleItems: undefined }

if (termParam) {
  const { data: schedule } = await supabaseAdmin
    .from('invoice_payment_schedule')
    .select('*')
    .eq('invoice_id', id)
    .eq('urutan', Number(termParam))
    .single()

  if (schedule) {
    const { data: allSchedules } = await supabaseAdmin
      .from('invoice_payment_schedule')
      .select('*')
      .eq('invoice_id', id)
      .order('urutan')

    pdfOverrides = {
      termNomor: inv.nomor + '/' + toRoman(schedule.urutan),
      termLabel: schedule.deskripsi,
      termAmount: Number(schedule.jumlah),
      scheduleItems: (allSchedules ?? []).map(s => ({
        urutan: s.urutan,
        deskripsi: s.deskripsi,
        persentase: Number(s.persentase),
        jumlah: Number(s.jumlah),
      })),
    }
  }
}

// Spread ke pdfData
const pdfData = {
  ...pdfOverrides,
  nomor: pdfOverrides.termNomor ?? inv.nomor,
  // ...existing fields...
}
```

**Backward compat:** Jika `?term` tidak ada → behavior persis seperti sekarang.

---

### 5. Create Invoice — Kwitansi Per Termin

**File:** `src/app/api/v1/invoice/route.ts` (POST)

**Logika baru di bagian kwitansi (setelah schedule digenerate):**

```typescript
if (schedule && schedule.length > 0) {
  // Hapus kwitansi total lama (jika ada dari sebelumnya)
  // Buat 1 kwitansi PER TERMIN
  for (const term of schedule) {
    const nomorKwt = formatChildNumber(inv.nomor, 'KWT') + '/' + toRoman(term.urutan)
    const { data: kwtTerm } = await supabaseAdmin.from('kwitansi').insert({
      nomor: nomorKwt,
      invoice_id: inv.id,
      schedule_id: term.id,        // FK ke schedule
      tanggal: now,
      status: 'draft',
      total: term.jumlah,          // override total (bukan full sum)
      created_at: now,
      updated_at: now,
    }).select().single()

    if (kwtTerm) {
      // Kwitansi_item tetap dibuat dari invoice_item, tapi jumlah = item_total * persentase / 100
      const kwtTermItems = (invItems ?? []).map((invItem) => ({
        kwitansi_id: kwtTerm.id,
        invoice_item_id: invItem.id,
        jumlah: Math.round(
          (Number(invItem.harga) * Number(invItem.jumlah) - (Number(invItem.diskon) || 0))
          * Number(term.persentase) / 100 * 100
        ) / 100,
        created_at: now,
        updated_at: now,
      }))
      await supabaseAdmin.from('kwitansi_item').insert(kwtTermItems).catch(e => console.error(e))
    }
  }
} else {
  // Tanpa schedule → 1 kwitansi total (existing behavior)
}
```

**Edge case:** `formatChildNumber` menghasilkan `RRI-KWT-YY-MM-NNNNN` — perlu manual tambah `/I` suffix.

---

### 6. Kwitansi PDF Route — Pakai `total` Override

**File:** `src/app/api/v1/kwitansi/[id]/pdf/route.ts`

```typescript
// Jika kwitansi punya total override (per termin), pakai itu
// Jika tidak (full kwitansi), hitung dari invoice_items seperti sekarang
let total: number
if (kwt.total != null) {
  total = Number(kwt.total)
} else {
  // hitung dari invoice_items (existing logic)
  total = (invItems ?? []).reduce((sum, i) => sum + (i.harga * i.jumlah - (i.diskon ?? 0)), 0)
}
```

---

### 7. Invoice Detail Page — Download Per Termin

**File:** `src/app/dashboard/invoice/[id]/page.tsx`

**a. Tabel Jadwal Pembayaran** — tambah kolom Aksi:

```tsx
// Di <TableHeader>...
<TableHead>Aksi</TableHead>

// Di setiap <TableRow> schedule...
<TableCell>
  <a href={`/api/v1/invoice/${id}/pdf?term=${s.urutan}`} target="_blank"
     className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted">
    <Download className="h-4 w-4" />
  </a>
</TableCell>
```

**b. Section Kwitansi** — tampilkan per termin (schedule-linked):

```tsx
// Iterasi schedule, untuk setiap term tampilkan kwitansi terkait
{schedule.map(term => {
  const kwt = kwitansiList.find(k => k.schedule_id === term.id)
  return (
    <div key={term.id} className="flex items-center gap-2 ml-4">
      <FileText className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">{term.deskripsi}:</span>
      {kwt ? (
        <a href={`/dashboard/kwitansi/${kwt.id}`} className="text-primary hover:underline font-medium">
          {kwt.nomor}
        </a>
      ) : <Badge variant="outline" className="text-xs">Pending</Badge>}
      {kwt && <Badge variant="outline" className="text-xs">{kwt.status}</Badge>}
    </div>
  )
})}
```

---

### 8. Invoice Edit Page — Jadwal Pembayaran

**File:** `src/app/dashboard/invoice/[id]/edit/page.tsx`

Tambah section **"Jadwal Pembayaran"** setelah form field:

- Tabel read-only: urutan, deskripsi, persentase, jumlah, jatuh tempo
- Tombol **"Generate Ulang Jadwal"** (POST ke `/api/v1/invoice/${id}/payment-schedule`)
  - Hapus schedule existing + kwitansi existing (yang punya `schedule_id`)
  - Regenerate dari `payment_term_item` customer
  - Re-create kwitansi per term

---

### 9. `all_documents` View — Virtual Entries Per Termin

**Migration:** `drizzle/XXXX_add_term_pdf_to_all_documents.sql`

```sql
-- Tambah di dalam CREATE OR REPLACE VIEW all_documents AS ... (sebelum bagian Invoice)

UNION ALL

SELECT
  'pdf-invoice-' || p.id || '-' || s.urutan,
  'Invoice - ' || p.nomor || '/' ||
    CASE s.urutan
      WHEN 1 THEN 'I' WHEN 2 THEN 'II' WHEN 3 THEN 'III'
      WHEN 4 THEN 'IV' WHEN 5 THEN 'V' WHEN 6 THEN 'VI'
      WHEN 7 THEN 'VII' WHEN 8 THEN 'VIII' WHEN 9 THEN 'IX'
      WHEN 10 THEN 'X'
      ELSE 'N' || s.urutan::text
    END || '.pdf',
  '/api/v1/invoice/' || p.id || '/pdf?term=' || s.urutan,
  NULL,
  p.updated_at,
  'Invoice (Termin)',
  p.nomor || '/' ||
    CASE s.urutan
      WHEN 1 THEN 'I' WHEN 2 THEN 'II' WHEN 3 THEN 'III'
      WHEN 4 THEN 'IV' WHEN 5 THEN 'V' WHEN 6 THEN 'VI'
      WHEN 7 THEN 'VII' WHEN 8 THEN 'VIII' WHEN 9 THEN 'IX'
      WHEN 10 THEN 'X'
      ELSE 'N' || s.urutan::text
    END,
  p.customer_id,
  c.nama,
  s.id
FROM invoice p
JOIN customer c ON c.id = p.customer_id
JOIN invoice_payment_schedule s ON s.invoice_id = p.id
```

---

### 10. Migration untuk Kwitansi Existing

Untuk invoice existing yang sudah punya `invoice_payment_schedule` tetapi masih 1 kwitansi total:

**Script one-time:** `scripts/migrate-kwitansi-per-term.ts` (node script, dijalankan manual)

Logika:
```
1. Cari semua invoice yang punya schedule > 0
2. Untuk setiap invoice:
   a. Cari kwitansi existing (tanpa schedule_id)
   b. Untuk setiap term di schedule:
      - Buat kwitansi baru dengan schedule_id, total = term.jumlah
      - Nomor: existing_kwt.nomor + '/' + toRoman(urutan)
      - Kwitansi_item: copy dari existing dengan jumlah = item_total * % / 100
   c. Delete kwitansi lama (tanpa schedule_id)
```

---

## Daftar File Lengkap

| # | File | Action | Keterangan |
|---|------|--------|------------|
| 1 | `src/lib/utils/roman.ts` | **NEW** | Fungsi `toRoman(n)` |
| 2 | `src/lib/db/schema/kwitansi.ts` | **EDIT** | Tambah `scheduleId`, `total` |
| 3 | `src/lib/pdf/invoice.ts` | **EDIT** | Tambah `termLabel`, `termNomor`, `termAmount`, `scheduleItems` |
| 4 | `src/app/api/v1/invoice/[id]/pdf/route.ts` | **EDIT** | Handle `?term=N`, fetch schedule |
| 5 | `src/app/api/v1/invoice/route.ts` (POST) | **EDIT** | N kwitansi per term di schedule |
| 6 | `src/app/api/v1/kwitansi/[id]/pdf/route.ts` | **EDIT** | Pakai `total` override jika ada |
| 7 | `src/app/dashboard/invoice/[id]/page.tsx` | **EDIT** | Download per term + kwitansi per term |
| 8 | `src/app/dashboard/invoice/[id]/edit/page.tsx` | **EDIT** | Schedule read-only + "Generate Ulang" |
| 9 | `drizzle/XXXX_add_schedule_id_to_kwitansi.sql` | **NEW** | Migration schema kwitansi |
| 10 | `drizzle/XXXX_add_term_pdf_to_all_documents.sql` | **NEW** | Migration all_documents view |
| 11 | `scripts/migrate-kwitansi-per-term.ts` | **NEW** | Script migrasi kwitansi existing |

## Hal yang Tidak Berubah

- Invoice list page (`/dashboard/invoice`) — download link tetap ke `/api/v1/invoice/{id}/pdf` (tanpa term → full PDF)
- `GET /api/v1/invoice/[id]` — schedule tetap dikembalikan seperti sekarang
- Payment recording — tidak diubah
- Auto-jurnal — tidak diubah
- Invoice edit (status, TOP, items) — tidak diubah
- `InvoicePdfActions` component — tetap untuk full PDF preview

## Testing Checklist

1. **Customer tanpa payment term:**
   - Create invoice → 1 PDF full → 1 kwitansi total ✅
   - PDF preview dari detail page → sama seperti sekarang ✅

2. **Customer dengan 2 termin (DP 50%, Pelunasan 50%):**
   - Create invoice → `invoice_payment_schedule` terisi 2 term
   - `?term=1` → PDF nomor `/I`, total 50%, Perihal "Tagihan DP 50%", tabel 2 term ✅
   - `?term=2` → PDF nomor `/II`, total 50%, Perihal "Tagihan Pelunasan 50%", tabel 2 term ✅
   - Tanpa `?term` → PDF full 100% ✅
   - Kwitansi: 2 record, nomor `/I` dan `/II`, masing-masing total 50% ✅

3. **Customer dengan 5 termin:**
   - `?term=1` s/d `?term=5` → PDF dengan nomor `/I` s/d `/V` ✅
   - Kwitansi: 5 record ✅

4. **Backward compat:**
   - Invoice existing tanpa schedule → PDF full ✅
   - Tombol Preview Invoice existing → tetap jalan ✅
   - Invoice list page download → tetap jalan ✅

5. **Build:**
   - `npm run lint && npm run build` → 0 errors ✅
