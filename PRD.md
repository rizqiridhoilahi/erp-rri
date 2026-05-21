# PRD: ERP PT. RIZKI RIDHO ILAHI

**Versi:** 3.2
**Status:** Draft
**Tanggal:** 21 Mei 2026

---

## 1. Latar Belakang

PT. Rizki Ridho Ilahi (RRI) adalah perusahaan General Supplier barang operasional untuk Customer, dengan fokus utama melayani kebutuhan operasional PLTU Tanjung Jati B di kota Jepara.

Kategori barang yang disuplai:
- Cleaning Service / Alat Kebersihan
- Alat Tulis Kantor (ATK)
- Peralatan operasional
- Barang pendukung operasional lainnya

Saat ini seluruh proses bisnis masih dilakukan secara secara manual (Microsoft Word, Excel) — tidak ada sistem terintegrasi.

## 2. Tujuan

Membangun sistem ERP berbasis web yang terintegrasi untuk:

1. Mengelola seluruh siklus bisnis dari pra-penjualan hingga pembayaran
2. Menghasilkan dokumen formal (Quotation, PO, DO, Invoice, Kwitansi) dalam format PDF secara otomatis
3. Kontrol stok barang secara real-time
4. Role-based access control untuk setiap divisi
5. Laporan keuangan dan operasional yang akurat
6. Responsive di semua perangkat (mobile, tablet, desktop)
7. Modul AI Agent untuk otomatisasi pencarian harga, OCR kontrak, dan rekomendasi
8. Otomatisasi proses bisnis berantai dari hulu ke hilir
9. Audit trail dan logging penuh untuk akuntabilitas
10. Kepatuhan pajak Indonesia (PPN 11%, PPh, laporan PPN masa)
11. Manajemen retur dan claim barang
12. Notifikasi otomatis via WhatsApp untuk reminder dan approval
13. Monitoring sistem kesehatan aplikasi (uptime, error tracking)

## 3. Tech Stack

| Lapisan | Teknologi |
|---|---|
| Framework | Next.js 15.5.18 (App Router) |
| Bundler | Turbopack |
| Bahasa | TypeScript |
| Styling | Tailwind CSS |
| UI Komponen | shadcn/ui + lucide-react |
| State Management | Zustand + TanStack React Query |
| Form | react-hook-form + Zod |
| Database | Supabase (PostgreSQL) |
| ORM | Drizzle ORM |
| Auth | Supabase Auth |
| PDF Generator | @react-pdf/renderer |
| Background Jobs | Inngest / Trigger.dev |
| Cache | Redis (Upstash) |
| Notifikasi In-App | sonner |
| Notifikasi WhatsApp | Fonnte (gratis 500 msg/hari) atau whatsapp-web.js |
| AI Agent | opencode CLI (free model) + Playwright (Chrome on AWS VPS) |
| Testing (Unit) | Vitest |
| Testing (E2E) | Playwright |
| Storage | Supabase Storage (dengan CDN) |
| Image Optimization | browser-image-compression + WebP conversion |
| Deploy | Vercel |
| Platform | Web Browser (Responsive: Mobile, Tablet, Desktop) |

## 4. Storage & File Management

### 4.1 Supabase Storage Strategy
Menggunakan Supabase Storage dengan bucket terstruktur dan optimasi penyimpanan untuk menghemat biaya.

### 4.2 Struktur Bucket

```
avatars/                  → Foto profil user/karyawan
  └── {userId}/avatar.jpg

barang/                   → Foto barang
  └── {barangId}/foto-1.jpg
  └── {barangId}/foto-2.jpg

dokumen/                  → File dokumen (PDF kontrak, RFQ, dll)
  └── kontrak/{kontrakId}/kontrak.pdf
  └── rfq/{rfqId}/rfq.pdf

temporary/                → File sementara (auto-delete setelah 24 jam)
  └── export/{sessionId}/laporan.xlsx
```

### 4.3 Optimasi Penyimpanan (Hemat Biaya)

| Teknik | Implementasi | Manfaat |
|---|---|---|
| **Compress sebelum upload** | `browser-image-compression` library di client-side. Kompres gambar sebelum dikirim ke Supabase | Ukuran file turun 60-80% |
| **Konversi ke WebP** | Semua gambar otomatis dikonversi ke format WebP (lebih kecil dari JPEG/PNG) | Ukuran file turun 30% tambahan |
| **Delete file lama** | Setiap update file gambar/file: hapus file existing di bucket, baru upload yang baru. Tidak ada file sampah menumpuk | Tidak ada file sampah menumpuk |
| **Max dimensi** | Foto barang: max 1920px. Avatar: max 200px. Foto profil: max 600px | File size terkontrol |
| **Max file size** | Client-side + server-side validation: Foto = max 5MB, Dokumen PDF = max 10MB | Mencegah abuse |
| **Whitelist tipe file** | Hanya izinkan: `image/jpeg`, `image/png`, `image/webp`, `application/pdf` | Keamanan storage |
| **Supabase CDN** | Setiap file di-serve via CDN — cepat diakses, cache otomatis | Performa loading |
| **Blur placeholder** | Gambar ditampilkan dengan blur placeholder saat loading — UX tetap mulus tanpa harus download full resolution dulu | User experience |
| **Sliced** | Sliced images via URL params if premium features enabled | Optional |

### 4.4 Alur Upload File

```
User pilih file
  ↓
Validasi tipe file & ukuran (client-side)
  ↓
Compress gambar + konversi ke WebP (browser-image-compression)
  ↓
Cek: apakah ada file existing di path yang sama?
  ├── YA → Hapus file lama dari Supabase Storage
  └── TIDAK → LANJUT
  ↓
Upload file baru ke Supabase Storage
  ↓
Simpan public URL ke database
  ↓
Tampilkan ke user
```

### 4.5 Rekomendasi Tambahan untuk Profesionalisme

| Rekomendasi | Keterangan |
|---|---|
| **Supabase Image Transformations** | Fitur berbayar tapi sangat worth it: bisa request ukuran gambar on-the-fly via URL parameter (`?width=200&height=200&format=webp`). Tidak perlu simpan multiple resolusi |
| **RLS Policy per Bucket** | Setiap bucket punya Row Level Security — hanya role tertentu yang bisa upload/hapus. Finance tidak bisa hapus foto barang, Gudang tidak bisa hapus dokumen kontrak |
| **Signed URLs untuk Dokumen Sensitif** | Untuk file kontrak PDF yang bersifat rahasia, akses via signed URL yang expire dalam 1 jam — bukan public URL |
| **Auto-cleanup Temporary** | Bucket `temporary/` di-cleanup otomatis setiap 24 jam via Supabase cron atau trigger. File cocok untuk auto-cleanup: Export laporan (Excel/PDF), preview dokumen, import bulk Excel, hasil screenshot AI Search, file upload gagal/cancel, cache generate PDF | Tidak ada file sampah menumpuk |
| **File Naming Convention** | `{modul}/{id}/{timestamp}-{originalName}.webp` — tidak ada nama file yang bentrok |

## 5. Scalability & Arsitektur

### 5.1 Background Jobs
Proses berat dijalankan di background agar tidak memblokir user:
- AI Search Harga (Playwright scraping)
- AI OCR Kontrak
- Generate PDF dokumen
- Export laporan Excel

Teknologi: **Inngest** atau **Trigger.dev** — terintegrasi native dengan Next.js.

### 5.2 Caching dengan Redis (Upstash)
Data yang sering diakses di-cache untuk performa optimal:
- Daftar barang & harga
- Data customer & kontrak
- Hasil AI Search (TTL 1 jam)
- Session & rate limiting

### 5.3 Database Indexing
Semua foreign key dan kolom yang sering di-query diberi index sejak awal:
- `barang.kategori_id`, `barang.kode`
- `customer_po.customer_id`, `customer_po.status`
- `sales_order.customer_po_id`
- `stok.barang_id`, `stok.gudang_id`
- Semua kolom `created_at`, `deleted_at`

### 5.4 API Versioning
```
/api/v1/master/barang
/api/v1/pre-sales/quotation
/api/v1/sales/delivery-order
```
Ketika ada perubahan besar, API lama tetap jalan — client tidak broken.

### 5.5 Pagination Wajib
Semua list data menggunakan pagination (offset-based atau cursor-based). Tidak ada `SELECT *` tanpa `LIMIT`.

### 5.6 Soft Delete
Data tidak pernah dihapus permanen dari database. Setiap tabel memiliki kolom `deleted_at`:
```sql
deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
```
Data yang "dihapus" hanya di-filter di query level. Data tetap utuh untuk audit trail.

### 5.7 Database Backup
- **Supabase Point-in-Time Recovery (PITR)** — restore ke detik kapanpun dalam 7 hari terakhir (termasuk di free tier)
- **Daily automated backup** — Supabase backup otomatis setiap 24 jam
- **Manual backup** — export database via `pg_dump` bisa dijadwalkan via cron job
- **Storage backup** — file di Supabase Storage di-replicate secara otomatis

### 5.8 Database Archiving
Data lama (>1 tahun) bisa di-archive ke tabel khusus atau bucket storage khusus untuk mengoptimasi performa query utama. Proses archiving bisa dijadwalkan bulan sekali.

### 5.9 System Health Monitoring
Monitoring gratis menggunakan UptimeRobot (uptime kunjungan) + Sentry.io (error tracking gratis tier) + LogRocket (session replay free tier). Alternatif self-hosted: Grafana + Prometheus + Loki.

## 6. Modul Aplikasi

### A. Master Data

Modul ini menyimpan seluruh data referensi yang digunakan oleh modul lainnya.

| Sub-Modul | Deskripsi |
|---|---|
| **Barang** | Data barang (nama, kode, kategori, satuan, spesifikasi, harga beli default, harga jual default) |
| **Kategori Barang** | Pengelompokan barang (Cleaning Service, ATK, Peralatan, dll) |
| **Supplier** | Data supplier — termasuk supplier marketplace (Shopee, Tokopedia) dengan field: nama toko, link toko, no. rekening, kontak. Untuk marketplace: field tambahan seperti link produk, marketplace, nama toko. Dilengkapi **Terms of Payment** (TOP): Net 30, Net 60, Cash, Custom |
| **Customer** | Data customer, alamat, kontak. Dilengkapi **Terms of Payment** (TOP): Net 30, Net 60, Cash, Custom |
| **PIC Customer** | Multiple PIC per customer (nama, jabatan, no. HP, email). Tracking per RFQ/DI/Kontrak — setiap dokumen bisa diassign ke PIC berbeda |
| **Karyawan** | Data karyawan RRI (data pribadi, jabatan, gaji pokok) |
| **Chart of Accounts (COA)** | Daftar akun untuk pembukuan keuangan |
| **Kontrak Kunden** | Kontrak harga tetap dengan customer (fixed price list). Upload file PDF kontrak → AI OCR extract harga → masuk database |
| **Harga Barang** | Histori harga beli dari supplier dan harga jual ke customer |
| **Bulk Import Excel** | Import master data barang, supplier, customer bisa dari upload file Excel |

### B. AI Agent Module

Modul AI adalah otak cerdas ERP RRI. Model AI berjalan via opencode CLI menggunakan free model, dengan agent playwrite di Chrome Browser yang berjalan di VPS AWS.

| Fitur AI | Deskripsi |
|---|---|
| **AI Search Harga (Playwright)** | Agent otomatis mencari barang di Shopee & Tokopedia: buka browser, cari produk, scraping harga, toko, rating, link produk. Hasil ditampilkan ke user Procurement sebagai referensi harga termurah dan tercepat |
| **AI OCR Kontrak** | Upload file PDF kontrak customer → AI OCR baca daftar barang & harga → masukkan langsung ke database sistem |
| **AI Rekomendasi Harga** | Saat buat Quotation, AI rekomendasi harga jual berdasarkan: harga beli termurah (dari search), margin default 15%, atau harga kontrak jika ada |
| **AI Negosiasi Assistant** | Membantu Sales merespon negosiasi dari Procurement customer dengan data harga & margin |
| **Prediktif Rekomendasi Supplier** | AI rekomendasi supplier terbaik berdasarkan histori: harga termurah, kecepatan pengiriman, rating toko |
| **Auto-Suggest Barang** | Saat ketik nama barang di Quotation/PO, AI auto-suggest dari histori barang yang pernah dibeli customer tersebut |
| **Price Trend Analysis** | Grafik tren harga barang per supplier — tahu kapan harga sedang murah |
| **Anomaly Detection** | Deteksi harga jual terlalu rendah/miring atau harga beli terlalu mahal, auto-flag ke Manager |

**Alur AI Search Harga:**

```
Procurement input barang yang dicari
  → AI trigger Playwright di AWS VPS
  → Chrome buka Shopee / Tokopedia
  → Cari produk, ambil: nama, harga, toko, rating, link
  → Simpan hasil ke database (search_history)
  → Tampilkan di UI Procurement
  → User pilih supplier terbaik → auto-fill ke PO
```

### C. Pre-Sales

Modul ini menangani proses sebelum terjadinya penjualan, dengan tracking per PIC Customer.

**Jalur RFQ → Quotation → PO Customer:**

| Sub-Modul | Deskripsi |
|---|---|
| **RFQ (Request for Quotation)** | Merekam RFQ dari customer. Assign ke PIC Customer spesifik. Upload file RFQ jika ada |
| **Quotation** | Membuat penawaran harga. Dua model pricing: (1) Default: cost + 15% profit, (2) Manual: user tentukan sendiri. Bisa pilih hasil dari AI Search sebagai referensi harga beli. Nomor otomatis: `SPH/RRI/YY/MM/0001` |
| **Negosiasi** | Setelah Quotation dikirim, Procurement customer bisa negosiasi. Fitur: track history negosiasi, counter offer, approval internal |
| **Quotation → PO** | Konversi quotation yang deal menjadi PO customer — auto-generate Sales Order |

**Jalur Kontrak → DI (Delivery Instruction):**

| Sub-Modul | Deskripsi |
|---|---|
| **Kontrak Customer** | Kontrak fixed price list. Upload PDF → AI OCR → simpan harga kontrak. Assign PIC Customer |
| **DI (Delivery Instruction)** | Instruksi pengiriman dari customer berdasarkan kontrak. Assign PIC Customer |

### D. Sales Order & Pengiriman

| Sub-Modul | Deskripsi |
|---|---|
| **Sales Order (SO)** | Order penjualan internal (berdasarkan PO Customer atau DI). Auto-generate saat PO/DI deal |
| **Delivery Order (DO)** | Surat jalan untuk pengiriman barang. Nomor otomatis: `SJ/RRI/YY/MM/0001`. Auto-generate draft saat SO siap kirim |
| **Tracking Pengiriman** | Status pengiriman barang. Begitu DO status "Dikirim", auto-generate draft Invoice |
| **Retur Penjualan** | Barang dikembalikan oleh customer karena cacat/rusak/tidak sesuai. Proses: Retur → GRN Retur → Stok masuk → Invoice Adjustment / Refund. Dokumen: Nota Retur |
| **Barcode / QR Code** | Setiap DO bisa di-scan pakai HP gudang |

### E. Procurement / Pembelian

Modul ini menangani pembelian dari supplier — termasuk supplier marketplace Shopee & Tokopedia.

| Sub-Modul | Deskripsi |
|---|---|
| **Purchase Request (PR)** | Permintaan pembelian ketika stok tidak mencukupi. Auto-generate jika SO butuh barang yang stoknya kurang |
| **Supplier Search** | Cari supplier — bisa dari database seller existing, atau via AI Search (Shopee/Tokopedia) |
| **Purchase Order (PO)** | Order pembelian ke supplier. Untuk marketplace: field tambahan (link produk, nama toko, marketplace, no. resi) |
| **Receiving / Penerimaan Barang** | Penerimaan barang dari supplier, update stok |
| **GRN (Goods Received Note)** | Tanda terima barang |
| **Retur Pembelian** | Barang dikembalikan ke supplier karena cacat/tidak sesuai. Proses: Retur → DO Retur → Kirim ke supplier → Refund/Adjustment |
| **Supplier Payment** | Pembayaran ke supplier (termasuk bukti transfer) |
| **Approval Escalation** | Jika PR/PO tidak di-approve dalam 24 jam, auto-escalate ke atasan via notifikasi |

**Model Inventory:**
- **Default: Make-to-Order** — barang dibeli setelah PO Customer deal
- **Future: Gudang Fisik** — infrastruktur stok & gudang sudah disiapkan untuk scaling

### F. Inventory / Gudang (Future-Ready)

| Sub-Modul | Deskripsi |
|---|---|
| **Stok Masuk** | Barang masuk (dari pembelian) |
| **Stok Keluar** | Barang keluar (untuk penjualan) |
| **Stock Opname** | Opname stok fisik |
| **Mutasi Baru** | Mutasi antar gudang |
| **Minimum Stock Alert** | Notifikasi stok minimum |
| **Kartu Stok** | Riwayat pergerakan stok per barang |

> **Catatan:** Saat MVP, inventory berjalan secara make-to-order. Modul gudang siap digunakan saat RRI mulai menyimpan stok fisik.

### G. Finance / Keuangan

| Sub-Modul | Deskripsi |
|---|---|
| **Accounts Receivable (AR)** | Piutang dagang — tagihan ke customer. Auto-reminder: H-7, H-3, H+1, H+7 via notifikasi in-app & WhatsApp. Aging berdasarkan **Terms of Payment** (TOP) |
| **Accounts Payable (AP)** | Hutang dagang — kewagiban bayar ke supplier. Aging berdasarkan TOP |
| **Cash & Bank** | Kas dan rekening bank. Mata uang: IDR (single currency untuk MVP) |
| **PPN & Pajak** | PPN 11% default di setiap Invoice & Quotation. PPh Pasal 22/23 jika berlaku. Auto-kalkulasi pajak di setiap transaksi |
| **Laporan PPN Masa** | Rekap PPN masa untuk pelaporan ke Kantor Pajak. Filter per bulan |
| **Faktur Pajak** | Generate nomor faktur pajak sesuai ketentuan Dirjen Pajak |
| **Jurnal Umum** | Jurnal transaksi keuangan. Auto-generate jurnal saat Invoice terbit (debit AR, credit Revenue, debit/kredit PPN) |
| **Laba / Rugi** | Laporan pendapatan dan biaya |
| **Neraca** | Laporan posisi keuangan |
| **Arus Kas** | Laporan cashflow |

### H. HR / Sumber Daya Manusia

| Sub-Modul | Deskripsi |
|---|---|
| **Absensi** | Kehadiran karyawan |
| **Penggajian** | Perhitungan gaji karyawan. Generate otomatis setiap tanggal 25 |
| **Slip Gaji** | Cetak slip gaji per periode |

### I. Dokumen PDF Otomatis

Semua dokumen berikut digenerate dalam format PDF yang bisa diprint dan disave:

| Dokumen | Nomor Format | Teks |
|---|---|---|
| **Quotation** | `SPH/RRI/YY/MM/0001` | Pre-Sales — termasuk PPN 11% |
| **Purchase Order (Internal)** | `PO/RRI/YY/MM/0001` | Procurement |
| **Delivery Order / Surat Jalan** | `SJ/RRI/YY/MM/0001` | Sales |
| **Invoice (Jalur PO)** | `INV/RRI/YY/MM/0001` | Finance — Dok: PO, DO, GRN, Invoice, Kwitansi. Termasuk PPN & PPh |
| **Invoice (Jalur DI)** | `INV/RRI/YY/MM/0001` | Finance — Dok: DI, DO, GRN, Invoice, Kwitansi. Termasuk PPN & PPh |
| **Goods Received Note (GRN)** | `GRN/RRI/YY/MM/0001` | Procurement / Inventory |
| **Kwitansi / Receipt** | `KWT/RRI/YY/MM/0001` | Finance |
| **Faktur Pajak** | Sesuai aturan Dirjen Pajak | Finance |
| **Nota Retur** | `RTJ/RRI/YY/MM/0001` (jual) / `RTB/RRI/YY/MM/0001` (beli) | Sales / Procurement |

**Ketentuan Nomor Dokumen:**
- Format: `{KODE}/{RRI}/{YY}/{MM}/{0001}`
- Setiap tahun berganti, nomor urut di-reset ke `/0001`
- Diimplementasikan dengan sequence/counter table PostgreSQL — di-reset otomatis setiap tahun via trigger atau cron job
- Contoh reset: Desember 2026 nomor `INV/RRI/26/12/0015`, Januari 2027 menjadi `INV/RRI/27/01/0001`

Format dokumen akan mengikuti template yang akan disediakan customer di direktori `/docs/templates/`.

### J. Dashboard & Laporan

| Dashboard | Untuk Role |
|---|---|
| Dashboard Owner | Owner — Revenue, Profit, Cashflow, AP/AR Aging, grafik tren, ringkasan pajak |
| Dashboard Manager | Manager — Ringkasan per modul, approval pending |
| Dashboard Sales | Sales — Pipeline order, RFQ → Quotation → Deal ratio |
| Dashboard Procurement | Procurement — PR/PO status, hasil AI Search |
| Dashboard Gudang | Gudang — Stok, barang mau habis, retur pending |
| Dashboard Finance | Finance — AP/AR, cashflow, jurnal, PPN masa, faktur pajak |
| Semua data bisa di-export ke Excel/CSV | Semua role |

## 7. Automation & Smart Workflow

### 7.1 Rantai Otomatisasi
```
Quotation deal
  → Auto-generate Sales Order
  → Auto-generate Purchase Request (jika stok kurang)
  → Notifikasi ke Gudang & Procurement

DO status "Dikirim"
  → Auto-generate draft Invoice
  → Notifikasi ke Finance

Invoice terbit
  → Auto-buat Jurnal Penjualan (debit AR, credit Revenue)
  → Auto-update AR Aging

Invoice jatuh tempo
  → Auto-reminder H-7, H-3, H+1, H+7 via notifikasi
  → Escalasi ke Manager jika H+7 belum dibayar
```

### 7.2 Approval Escalation
- PR/PO pending > 24 jam → notifikasi Manager
- Invoice pending > 7 hari → escalation ke Owner

### 7.3 Smart Document Numbering
Nomor dokumen digenerate otomatis — tidak perlu input manual:
```
Quotation:  SPH/RRI/26/05/0001
DO:         SJ/RRI/26/05/0001
Invoice:    INV/RRI/26/05/0001
Kwitansi:   KWT/RRI/26/05/0001
```

### 7.4 WhatsApp Notification Integration

Notifikasi otomatis via WhatsApp API (Fonnte / whatsapp-web.js) untuk komunikasi dengan Customer & Supplier.

| Notifikasi | Trigger | Penerima |
|---|---|---|
| **Quotation Terkirim** | Quotation berhasil dibuat | PIC Customer via WhatsApp |
| **PO/DI Deal** | Customer deal & terbit PO/DI | PIC Customer (konfirmasi) |
| **DO Dikirim** | DO status "Dikirim" | PIC Customer — info no. resi & estimasi |
| **AR Reminder H-7** | Invoice jatuh tempo H-7 | PIC Customer — pengingat tagihan |
| **AR Reminder H-3** | Invoice jatuh tempo H-3 | PIC Customer — pengingat |
| **AR Overdue H+1** | Invoice lewat jatuh tempo | PIC Customer + Finance |
| **AR Overdue H+7** | Invoice lewat 7 hari | PIC Customer + Manager |
| **PO ke Supplier** | PO terbit ke supplier marketplace | Supplier via WhatsApp (informasi) |
| **Approval Request** | PR/PO pending approval | Manager via WhatsApp |

**Config:** Setiap user bisa setting preferensi notifikasi (in-app, WhatsApp, atau keduanya) di halaman profil.

**Catatan Biaya:** Fonnte menyediakan **500 pesan gratis per hari** – lebih dari cukup untuk kebutuhan ERP RRI (estimasi ~20 pesan/hari). Tersedia juga opsi `whatsapp-web.js` yang sepenuhnya gratis tapi memerlukan session WhatsApp Web aktif.

## 8. Professional Features

| Fitur | Deskripsi |
|---|---|
| **Audit Trail** | Setiap create/update/delete tercatat: siapa, kapan, IP, data sebelum & sesudah. Tidak bisa dihapus |
| **Activity Log** | Timeline per transaksi — lihat histori lengkap satu SO/PO/Invoice dari awal sampai selesai |
| **Digital Approval** | Approve/Reject dengan digital signature (nama + timestamp) |
| **Global Search** | Satu search bar (shortcut `/` atau `Cmd+K`) untuk mencari barang, customer, supplier, PO, SO, Invoice, Quotation dari halaman manapun. Search fuzzy across semua modul |
| **Export Excel / CSV** | Semua halaman list data bisa di-export — Owner & Manager sering minta data dalam Excel |
| **Bulk Import Excel** | Input master data barang, supplier, customer bisa upload file Excel |
| **Dark Mode** | Toggle dark/light mode — nyaman dipakai malam hari |
| **Keyboard Shortcuts** | Power user: `Ctrl+N` = Baru, `Ctrl+S` = Simpan, `/` = Fokus global search, `Escape` = Tutup modal |
| **Print-Friendly CSS** | Halaman dokumen langsung bisa di-print rapi dari browser tanpa perlu PDF |
| **Loading Skeleton** | Tidak ada spinner — skeleton loading memberikan kesan profesional |
| **Role-Based Navigation** | Sidebar & menu menyesuaikan role user — tidak lihat menu yang bukan haknya |
| **User Onboarding** | Walkthrough interaktif saat pertama login — user baru langsung paham cara pakai ERP |
| **Multi-Bahasa (future)** | Persiapan i18n jika nanti ada customer atau kebutuhan internasional |
| **Maintenance Mode** | Satu toggle di settings — user lihat halaman "Sedang Perbaikan" |
| **Soft Delete** | Semua data hanya di-soft-delete (`deleted_at`), tidak pernah hilang permanen |
| **Data Archiving** | Data lama (>1 tahun) bisa di-archive ke tabel khusus atau bucket storage khusus untuk mengoptimasi performa query utama. Proses archiving bisa dijadwalkan bulan sekali. |
| **System Health Monitoring** | Monitoring gratis menggunakan UptimeRobot (uptime kunjungan) + Sentry.io (error tracking gratis tier) + LogRocket (session rocket free tier). Alternatif self-hosted: Grafana + Prometheus + Loki. |

## 9. User Roles & Hak Akses

| Role | Akses Utama |
|---|---|
| **Owner** | ALL — semua modul, laporan keuangan, dashboard utama, audit trail |
| **Admin** | Master data, user management, konfigurasi sistem, maintenance mode |
| **Manager** | Approval PR/PO, approval retur, escalation, laporan operasional, dashboard |
| **Sales** | Pre-Sales (RFQ, Quotation, Negosiasi), Sales Order, Retur Penjualan, lihat stok |
| **Procurement** | PR, PO, Retur Pembelian, AI Search, Supplier management, Receiving |
| **Gudang** | Stok masuk/keluar, opname, delivery order, retur, scan barcode |
| **Finance** | Invoice, AP/AR, PPN, Faktur Pajak, pembayaran, jurnal, laporan keuangan |
| **HR** | Data karyawan, absensi, penggajian |

## 10. Alur Bisnis End-to-End

### Jalur A — Kontrak (Fixed Price)

```
START
  ↓
Customer buat KONTRAK (fixed price list)
  → Upload PDF kontrak → AI OCR → simpan harga ke database
  → Assign PIC Customer
  ↓
Customer kirim DI (Delivery Instruction) — assign PIC Customer
  ↓
Auto-generate SALES ORDER (dengan TOP dari kontrak)
  ↓
Cek: Apakah stok tersedia?
  ├── YES → Auto-generate DO → Kirim barang
  └── NO  → Auto-generate PURCHASE REQUEST
        ├── AI Search harga Shopee/Tokopedia
        ├── Manager approve PR (escalation 24 jam jika pending)
        ├── Purchase Order (PO) ke supplier (nomor: PO/RRI/YY/MM/0001)
        ├── Checkout & bayar di Shopee/Tokopedia (manual)
        ├── Barang datang → Receiving → GRN → Stok masuk
        └── Lanjut auto-generate DO
  ↓
DELIVERY ORDER (DO) — Surat Jalan (nomor: SJ/RRI/YY/MM/0001)
  ↓
Barang dikirim ke Customer
  ↓
Customer beri GRN (tanda terima)
  ↓
DO status "Dikirim" → Auto-generate INVOICE
  ↓
INVOICE + KWITANSI (nomor: INV/RRI/YY/MM/0001, KWT/RRI/YY/MM/0001)
Dokumen: DI, DO, GRN customer, Invoice, Kwitansi
Termasuk PPN 11% dan PPh (jika berlaku)
  ↓
Auto-buat JURNAL (debit AR, credit Revenue, credit PPN)
  ↓
Finance: Tagih Customer (AR) — Auto-reminder jatuh tempo
  ↓
END
```

### Jalur B — Non-Kontrak (RFQ)

```
START
  ↓
Customer kirim RFQ — assign PIC Customer
  ↓
RRI cari harga supplier (AI Search Shopee/Tokopedia / manual)
  ↓
RRI buat QUOTATION (nomor: SPH/RRI/YY/MM/0001)
  → Harga: Default (cost + 15%) atau Manual
  → Kirim Quotation ke Customer
  ↓
Negosiai? ← Procurement customer nego harga
  ├── YES → Counter offer → Approve internal → Kirim ulang
  └── NO  → LANJUT
  ↓
Customer SETUJU (deal) → Customer terbitkan PO (TOP sesuai master customer)
  ↓
Auto-generate SALES ORDER
  ↓
Cek stok → jika kurang → PROCUREMENT FLOW (sama seperti Jalur A)
  ↓
Auto-generate DO → Kirim barang
  ↓
Customer GRN → Auto-generate INVOICE
  ↓
INVOICE + KWITANSI
Dokumen: PO Customer, DO, GRN customer, Invoice, Kwitansi
Termasuk PPN 11% dan PPh (jika berlaku)
  ↓
Auto-buat JURNAL (debit AR, credit Revenue, credit PPN) + Auto-reminder AR
  ↓
END
```

### Jalur C — Retur Penjualan (dari Customer)

```
Customer kirim barang retur (cacat/tidak sesuai)
  ↓
Gudang terima retur → GRN Retur
  ↓
Cek kondisi barang:
  ├── Ganti barang baru → buat DO Replacement → kirim ke customer
  └── Refund → buat Nota Retur → adjust Invoice / Refund
  ↓
Stok masuk kembali (jika barang masih layak)
  ↓
Finance: Buat Jurnal Retur
  ↓
END
```

### Jalur D — Retur Pembelian (ke Supplier)

```
Barang dari supplier cacat/tidak sesuai
  ↓
Buat Nota Retur Pembelian
  ↓
DO Retur → Kirim barang ke supplier
  ↓
Supplier:
  ├── Ganti barang baru → Receiving GRN
  └── Refund → Adjustment AP / Cash
  ↓
Stok keluar (retur)
  ↓
END
```

## 11. Arsitektur Aplikasi

### 11.1 Struktur Folder

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Login, Forgot Password
│   ├── (dashboard)/              # Protected pages
│   │   ├── master/
│   │   │   ├── barang/
│   │   │   ├── kategori-barang/
│   │   │   ├── supplier/
│   │   │   ├── customer/
│   │   │   ├── pic-customer/
│   │   │   ├── karyawan/
│   │   │   ├── coa/
│   │   │   ├── kontrak/
│   │   │   └── harga/
│   │   ├── pre-sales/
│   │   │   ├── rfq/
│   │   │   ├── quotation/
│   │   │   ├── negosiasi/
│   │   │   ├── di/
│   │   │   └── kontrak-ocr/
│   │   ├── sales/
│   │   │   ├── sales-order/
│   │   │   ├── delivery-order/
│   │   │   └── tracking/
│   │   ├── procurement/
│   │   │   ├── purchase-request/
│   │   │   ├── ai-search/
│   │   │   ├── purchase-order/
│   │   │   ├── receiving/
│   │   │   └── grn/
│   │   ├── inventory/
│   │   │   ├── stok-masuk/
│   │   │   = stok-keluar/
│   │   │   = opname/
│   │   │   = mutasi/
│   │   │   = kartu-stok/
│   │   │   = alert/
│   │   ├── finance/
│   │   │   = ar/
│   │   │   = ap/
│   │   │   = cash-bank/
│   │   │   = jurnal/
│   │   │   = laba-rugi/
│   │   │   = neraca/
│   │   │   = arus-kas/
│   │   ├── hr/
│   │   │   = absensi/
│   │   │   = penggajian/
│   │   ├── ai/
│   │   │   = search/
│   │   │   = ocr/
│   │   ├── dokumen/
│   │   │   = invoice/
│   │   │   = quotation/
│   │   │   = do/
│   │   │   = grn/
│   │   │   = kwitansi/
│   │   ├── laporan/
│   │   └── settings/
│   │       └── users/
│   └── api/
│       └── v1/
│           ├── auth/
│           ├── master/
│           ├── pre-sales/
│           ├── sales/
│           ├── procurement/
│           ├── inventory/
│           ├── finance/
│           ├── hr/
│           ├── ai/
│           ├── dokumen/
│           └── laporan/
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── forms/                    # Form components
│   ├── tables/                   # Table components
│   ├── layout/                   # Layout components
│   ├── pdf/                      # PDF components
│   └── shared/                   # Shared components
├── lib/
│   ├── db/
│   │   ├── schema/               # Drizzle schema files
│   │   ├── migrations/           # Database migrations
│   │   └── client.ts             # Database client
│   ├── actions/                  # Server Actions
│   ├── ai/                       # AI Agent integration
│   ├── pdf/                      # PDF components
│   ├── services/                 # Business logic layer
│   ├── utils/                    # Utility functions
│   └── validations/              # Zod schemas
├── hooks/                        # Custom React hooks
├── store/                        # Zustand stores
├── types/                        # TypeScript type definitions
└── styles/                       # Global CSS
```

### 11.2 Struktur Database (Tabel)

```
users                    → auth + profil (semua role)
user_roles               → mapping user ke role

barang                   → master barang
kategori_barang          → kategori barang
satuan                   → satuan barang

supplier                 → data supplier (termasuk marketplace)
supplier_kontak          → multiple kontak supplier

customer                 → data customer
customer_pic             → multiple PIC per customer
customer_top             → terms of payment per customer (net_30, net_60, cash, custom)

karyawan                 → data karyawan RRI
jabatan                  → master jabatan

coa                      → chart of accounts

kontrak                  → kontrak customer
kontrak_item             → daftar barang + harga dalam kontrak (termasuk harga sudah include/exclude PPN)
kontrak_file             → file PDF kontrak yang diupload

rfq                      → request for quotation
rfq_item                 → item dalam rfq
rfq_pic                  → assign PIC customer ke rfq

quotation                → penawaran harga (field: ppn_rate default 11%)
quotation_item           → item dalam quotation (field: harga_satuan, diskon, ppn_per_item)
quotation_pic            → assign PIC customer ke quotation

negosiasi                → riwayat negosiasi
negosiai_item            → detail item yang dinegosiasi

customer_po              → po dari customer
customer_po_item         → item dalam po customer
customer_po_pic          → assign PIC customer ke po

di                       → delivery instruction
di_item                  → item dalam di
di_pic                   → assign PIC customer ke di

sales_order              → sales order internal
sales_order_item         → item dalam so

delivery_order           → surat jalan
delivery_order_item      → item dalam do

grn                      → goods received note (dari customer)
grn_item                 → item dalam grn

retur_penjualan          → retur dari customer
retur_penjualan_item     → item retur
retur_penjualan_dokumen  → dokumen retur

retur_pembelian          → retur ke supplier
retur_pembelian_item     → item retur
retur_pembelian_dokumen  → dokumen retur

purchase_request         → permintaan pembelian
purchase_request_item

purchase_order           → po ke supplier
purchase_order_item      → item dalam po
                         (field: link_produk, nama_toko, marketplace, no_resi)

purchase_receiving       → penerimaan barang
purchase_receiving_item

invoice                  → invoice penjualan (field: top, ppn_rate default 11%, pph_rate optional)
invoice_item             → item dalam invoice (field: harga, diskon, ppn, pph)
invoice_dokumen          → dokumen kelengkapan (PO, DI, DO, GRN)

faktur_pajak             → data faktur pajak
faktur_pajak_item        → item faktur pajak

kwitansi                 → receipt
kwitansi_item            → item dalam kwitansi

stok                     → kartu stok / pergerakan stok
gudang                   → master gudang (untuk future)

jurnal                   → jurnal umum
jurnal_item              → detail jurnal

absensi                  → kehadiran
penggajian               → data gaji

document_counter         → counter nomor dokumen per tahun

ai_search_history        → riwayat pencarian AI
ai_search_result         → hasil scraping (nama, harga, toko, link, marketplace)
ai_ocr_history           → riwayat OCR kontrak

audit_log                → audit trail semua transaksi
whatsapp_log             → log pengiriman notifikasi WhatsApp (status: terkirim/gagal)
```

### 11.3 Nomor Dokumen Otomatis

Implementasi counter di PostgreSQL:

```sql
CREATE TABLE document_counter (
  kode_dokumen TEXT NOT NULL,   -- SPH, SJ, INV, KWT, PO, GRN, RTJ, RTB
  tahun INTEGER NOT NULL,       -- 2026
  bulan INTEGER NOT NULL,       -- 1-12
  counter INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (kode_dokumen, tahun, bulan)
);
```

Fungsi untuk generate nomor:

```sql
-- Akan menghasilkan: SPH/RRI/26/05/0001
-- Counter di-reset otomatis setiap tahun/bulan berganti
```

## 12. Prioritas Pengembangan (MVP)

| Fase | Modul | Estimasi |
|---|---|---|
| **Fase 1** | Setup Project + Auth + Master Data + Document Counter | — |
| **Fase 2** | Pre-Sales (RFQ, Quotation, Negosiasi) + Sales (SO, DO) | — |
| **Fase 3** | Procurement (PR, PO, Receiving, Retur Beli) + Inventory (make-to-order) | — |
| **Fase 4** | Finance (AR, AP, PPN, PPh, Jurnal, Faktur Pajak) + Dokumen PDF | — |
| **Fase 5** | AI Agent (Search + OCR) | — |
| **Fase 6** | HR + Dashboard + Laporan + Export + Audit Trail + Global Search | — |
| **Fase 7** | WhatsApp Notifikasi + Retur Penjualan + User Onboarding | — |
| **Fase 8** | Professional polish (Dark mode, shortcuts, skeleton, print CSS) + Testing Setup + Deploy Vercel | — |

## 13. Testing Strategy

| Level | Tools | Scope |
|---|---|---|
| **Unit Test** | Vitest + React Testing Library | Validasi form (Zod schemas), utility functions, server actions logic, Drizzle query helpers |
| **Integration Test** | Vitest + MSW (Mock Service Worker) | API endpoints, database queries, state management (Zustand stores + TanStack Query) |
| **E2E Test** | Playwright | Full user flow: login → buat Quotation → approve → generate PDF. Critical paths: RFQ to Invoice flow |
| **Component Test** | Storybook (opsional) | Visual testing untuk komponen UI kompleks (TanStack Table, form multi-step) |

### Testing Prioritas

| Prioritas | Area | Alasan |
|---|---|---|
| **P1** | Form validation (Zod schemas) | Mencegah data invalid masuk database |
| **P1** | Server Actions (CRUD) | Operasi inti aplikasi |
| **P1** | Document numbering logic | Nomor dokumen harus akurat & unik |
| **P1** | Auth & RBAC | Keamanan akses |
| **P2** | AI Search trigger | Integrasi dengan Playwright |
| **P2** | Auto-generate chain (SO→DO→Invoice) | Automation workflow |
| **P2** | PPN calculation | Akurasi pajak |
| **P3** | WhatsApp notification | Notifikasi tidak kritikal |
| **P3** | E2E full flow | Regression testing |

### CI/CD Pipeline

```
Push ke branch → GitHub Actions:
  ├── Lint (ESLint + Prettier)
  ├── Type Check (TypeScript)
  ├── Unit Test (Vitest)
  ├── Build (next build)
  └── Deploy ke Vercel Preview (jika branch fitur)
```

---
**Catatan Teknis:** Nomor dokumen dengan reset tahunan sangat mudah diimplementasikan di PostgreSQL/Supabase. Cukup gunakan tabel counter atau sequence yang di-reset via trigger setiap pergantian tahun.