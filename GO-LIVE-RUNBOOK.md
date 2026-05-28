# Go-Live Runbook — ERP RRI

## Persiapan

### Prasyarat
- [ ] Database migration terakhir sudah dijalankan
- [ ] Backup database production sudah dibuat
- [ ] Akses Supabase dashboard (SQL Editor) atau `psql` ke database

---

## Langkah 1: Backup Database

Sebelum reset apapun, **wajib backup**:

```sql
-- Di Supabase: Settings → Database → Create backup
-- Atau via pg_dump:
pg_dump --no-owner --no-acl --clean postgresql://... > erp-rri-backup-$(date +%Y%m%d).sql
```

---

## Langkah 2: Reset Document Counter

Jalankan SQL ini **setelah go-live, sebelum transaksi pertama**:

```sql
-- Hapus semua counter lama agar penomoran mulai dari 0001
TRUNCATE document_counter;
```

Atau jika ingin lebih hati-hati (tidak menghapus, hanya reset ke 0):

```sql
-- Reset semua counter ke 0 (next insert jadi 0001)
UPDATE document_counter SET counter = 0;
```

**Efek:** Dokumen baru pertama akan mendapat nomor `RRI-RFQC-26-06-0001`, `RRI-SPH-26-06-0001`, dst.

**Catatan:**
- Tabel `document_counter` tidak punya relasi FK ke data dokumen — aman
- Data dokumen existing (testing/UAT) tetap utuh
- Jika ada dokumen existing dengan nomor `RRI-xxx-26-06-0001`, counter akan otomatis loncat (`ON CONFLICT DO UPDATE`)

---

## Langkah 3: Verifikasi

Cek bahwa counter sudah kosong/0:

```sql
SELECT * FROM document_counter;
```

Hasil seharusnya: `0 rows` (jika TRUNCATE) atau semua `counter = 0` (jika UPDATE).

Kemudian test generate satu nomor (via API atau langsung):

```sql
SELECT increment_document_counter('RFQC', 2026, 6);
-- Harus return: 1
```

Atau via UI: buka halaman Tambah RFQ Customer → nomor yang muncul harus `RRI-RFQC-26-06-0001`.

---

## Langkah 4: UAT Pasca Go-Live

- [ ] Buat 1 RFQ Customer → nomor `RRI-RFQC-26-06-0001` ✅
- [ ] Buat 1 Quotation → nomor `RRI-SPH-26-06-0001` ✅
- [ ] Buat 1 Delivery Order → nomor `RRI-SJ-26-06-0001` ✅
- [ ] Buat 1 Invoice → nomor `RRI-INV-26-06-0001` ✅
- [ ] Buat 1 Kwitansi → nomor `RRI-KWT-26-06-0001` ✅

---

## Rollback Plan

Jika terjadi masalah, restore dari backup:

```bash
psql postgresql://... < erp-rri-backup-$(date +%Y%m%d).sql
```

Atau jika hanya perlu mengembalikan counter:

```sql
-- Isi manual dari backup, contoh:
INSERT INTO document_counter (kode_dokumen, tahun, bulan, counter) VALUES
  ('RFQC', 2026, 5, 3),
  ('SPH', 2026, 5, 5);
```
