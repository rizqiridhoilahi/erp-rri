Berikut adalah dokumen **Product Requirement Document (PRD)** lengkap, resmi, dan mendalam untuk pengembangan **Website Bisnis Korporat & B2B Private Catalog (Marketplace tanpa harga)** PT. Rizki Ridho Ilahi.
Dokumen ini dirancang sebagai **Adendum Tambahan** yang terintegrasi penuh dengan sistem ERP yang sudah berjalan di erp.pt-rri.com tanpa mengubah atau merusak arsitektur backend, skema routing, maupun otentikasi internal yang ada saat ini.
# PRODUCT REQUIREMENT DOCUMENT (PRD)
## ADENDUM: WEBSITE BISNIS KORPORAT & B2B PRIVATE CATALOG PORTAL
**PT. RIZKI RIDHO ILAHI (RRI)**
**Versi:** 1.3
**Status:** Approved for Development
**Target Lingkungan:** Single Project (Monorepo) Next.js 15.5 & Supabase
**Domain:** pt-rri.com (Default domain — Website Publik & Portal Klien)
**Subdomain:** erp.pt-rri.com (Custom domain — Sistem Operasional Internal, Tetap/Tidak Berubah)
**Catatan Revisi:** Kedua domain dalam 1 Vercel project yang sama. Middleware Next.js mendeteksi `host` header untuk routing. Folder publik menggunakan `public-pages/` (bukan route group) agar middleware rewrite konsisten.
## 1. PENDAHULUAN & TUJUAN STRATEGIS
PT. Rizki Ridho Ilahi (RRI) bertindak sebagai *General Supplier & Trading Services* skala makro yang berfokus melayani PLTU Tanjung Jati B Jepara serta industri besar lainnya.
Tujuan dari dokumen ini adalah memperluas sistem ERP yang sudah ada dengan membangun wajah publik perusahaan yang **mewah (*luxury corporate*), kredibel, dan eksklusif**, serta menyediakan platform bagi klien korporat (B2B) untuk melakukan eksplorasi produk dan mengajukan permintaan penawaran harga (RFQ) secara digital, mandiri, dan terintegrasi langsung ke hulu operasional ERP.
## 2. PRINSIP VISUAL & DESAIN SISTEM (LUXURY CORPORATE)
Untuk memikat manajemen tingkat tinggi dan tim *procurement* PLTU, antarmuka publik harus mencerminkan stabilitas, teknologi, dan kualitas premium.
 * **Palet Warna Utama:**
   * Deep Sovereign Navy (#0B1528): Warna dominan untuk latar belakang hero, sidebar portal, dan heading utama. Melambangkan otoritas korporat.
   * Pure Electric Blue (#0000FF / #343DFF): Warna aksen untuk tombol CTA, ikon premium, *border active*, dan tautan aktif. Melambangkan presisi teknologi.
   * Pure White (#FFFFFF) & Light Ice Gray (#F8FAFC): Latar belakang konten untuk menjaga kebersihan visual dan kemudahan membaca.
   * Platinum Slate (#94A3B8 / #E2E8F0): Border tipis, pemisah, teks sekunder.
 * **Navbar:** Putih solid (`bg-white`) atau glassmorphism putih (`backdrop-blur-md bg-white/70`) untuk halaman katalog/portal. Bukan navy.
 * **Tipografi:**
   * *Headings/Judul Besar:* **Lexend** (Bold dengan pelonggaran spasi / *wide tracking* untuk estetika modern-mewah).
   * *Body/Teks Deskripsi:* **Inter** (Regular, akurasi tinggi untuk pembacaan spesifikasi teknik).
 * **Efek & Animasi:**
   * *Glassmorphism*: Penggunaan latar belakang transparan dengan efek blur (backdrop-blur-md) pada komponen melayang seperti Navbar dan Dropdown.
   * *Micro-interactions*: Animasi transisi halus (0.3 detik dengan Framer Motion) saat card produk di-hover (efek *scale-105* dan *smooth soft shadow expansion*).
 * **Dukungan 2 Bahasa:** Default Bahasa Indonesia, sekunder Bahasa Inggris. Seluruh teks antarmuka publik menggunakan i18n dictionary.
## 3. ARSITEKTUR DOMAIN & ROUTING (TANPA MENGUBAH ERP)

### 3.1 Domain Strategy

Satu Vercel project melayani dua domain:

| Domain | Fungsi | Konfigurasi Vercel |
|--------|--------|--------------------|
| **pt-rri.com** | Default domain — Website Publik + Portal Klien B2B | Tambah di Project Settings → Domains; CNAME ke `cname.vercel-dns.com` |
| **erp.pt-rri.com** | Custom domain — Sistem Operasional Internal | Sudah terdaftar (tidak berubah) |

**DNS Cloudflare:**
- `pt-rri.com` CNAME → `cname.vercel-dns.com` (proxy: DNS only)
- `erp.pt-rri.com` CNAME → `cname.vercel-dns.com` (proxy: DNS only)

### 3.2 Middleware (`src/middleware.ts`)

Middleware mendeteksi `host` header:

```typescript
const host = request.headers.get('host') ?? ''

// pt-rri.com → internal rewrite ke folder public-pages/
if (host === 'pt-rri.com' || host === 'www.pt-rri.com') {
  return NextResponse.rewrite(new URL('/public-pages' + request.nextUrl.pathname, request.url))
}

// erp.pt-rri.com → route normal (dashboard, api, auth tetap berjalan seperti biasa)
return NextResponse.next()
```

### 3.3 Hierarki Folder `src/app/`

Semua halaman website baru masuk ke folder `public-pages/` di-root `src/app/`. Folder ERP internal (`dashboard/`, `(auth)/`, `api/`) **tidak disentuh sama sekali**. URL tetap bersih karena middleware melakukan internal rewrite.

```text
src/app/
├── (auth)/               --> [TETAP] Login internal ERP (erp.pt-rri.com/login)
├── dashboard/            --> [TETAP] Dashboard operasional internal (erp.pt-rri.com/dashboard)
├── api/                  --> [TETAP] API internal dan global
├── public-pages/         --> [BARU] Diproses saat akses pt-rri.com (via middleware rewrite)
│   ├── page.tsx          --> Landing Page Utama (Hero Section Video)
│   ├── tentang-kami/     --> Profil Perusahaan & Dokumen Kepatuhan Legal
│   ├── layanan/          --> Layanan Services & Solusi Pengadaan Kontrak
│   ├── katalog/          --> Halaman Utama Katalog Produk B2B (Grid Premium)
│   │   ├── page.tsx
│   │   ├── [id]/         --> Detail Spesifikasi Barang (Tanpa Harga)
│   │   └── pltu-corner/  --> [Fase Lanjutan] E-Katalog khusus kluster kebutuhan PLTU
│   ├── quick-order/      --> Fitur unggah formulir Excel massal / Kode Pad
│   ├── customer-login/   --> Gerbang Masuk Klien Korporat B2B
│   ├── customer-register/--> Formulir Pendaftaran Legalitas Mitra Baru
│   ├── inquiry/          --> Keranjang Inquiry Pengganti Checkout Pembayaran
│   └── portal/           --> Dashboard Khusus Klien (Customer Portal)
│       ├── page.tsx      --> Ringkasan Status Dokumen & Finansial Klien
│       ├── dokumen/      --> Riwayat SPH (Unduh PDF), PO, dan Invoice
│       └── retur/        --> Pusat Klaim & Pengajuan Retur Mandiri (integradi dengan retur_penjualan)
├── globals.css           --> [TETAP]
└── layout.tsx            --> [TETAP] Shared Layout Root
```
## 4. SKEMA EKSTENSI DATABASE (SUPABASE & DRIZZLE ORM)

Tiga tabel baru + kolom tambahan pada tabel `barang` untuk mendukung katalog publik dan profil klien.

### 4.1 Kolom Baru pada Tabel `barang`

```sql
ALTER TABLE barang ADD COLUMN is_published_to_catalog BOOLEAN DEFAULT FALSE;
ALTER TABLE barang ADD COLUMN deskripsi_katalog TEXT;
ALTER TABLE barang ADD COLUMN spesifikasi_teknis JSONB; -- Dimensi, berat, sertifikat produk
```

### 4.2 Tabel Baru `barang_gambar` (Multiple Images per Product)

Mendukung galeri gambar multi-angle/high-resolution di halaman detail katalog.

```sql
CREATE TABLE barang_gambar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barang_id TEXT NOT NULL REFERENCES barang(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  urutan INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Storage path:** `dokumen/barang/{barangId}/{uuid}-{fileName}` (Cloudflare R2 bucket `erp-documents`).

### 4.3 Tabel Baru `customer_profiles`

Menyimpan profil legalitas klien perusahaan yang mendaftar secara mandiri. **Terhubung ke tabel `customers` yang sudah ada di ERP** agar RFQ dari portal bisa langsung diproses.

```sql
CREATE TABLE customer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL, -- Link ke master data ERP (customers.id = TEXT/UUID)
  nama_perusahaan VARCHAR(255) NOT NULL,
  penanggung_jawab_pic VARCHAR(150) NOT NULL,
  no_whatsapp_pic VARCHAR(20) NOT NULL,
  alamat_perusahaan TEXT NOT NULL,
  npwp_perusahaan VARCHAR(25),
  status_verifikasi VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'suspended'
  role_internal_client VARCHAR(50) DEFAULT 'manager', -- 'approver', 'requester' (Fase Lanjutan)
  parent_company_id UUID, -- Multi-account dalam 1 perusahaan (Fase Lanjutan)
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_customer_profiles_customer_id ON customer_profiles(customer_id);
```

**Flow Registrasi:**
1. User daftar via `customer-register` -> `auth.users` + `customer_profiles` dibuat (`customer_id = null`, `status = 'pending'`)
2. Admin ERP review di dashboard -> jika valid: buat `customers` baru (atau link ke existing) -> update `customer_profiles.customer_id` & `status = 'approved'`
3. Saat user submit RFQ -> sistem buat `rfq_customer` dengan `customer_id` dari `customer_profiles.customer_id`

### 4.4 Tabel Baru `customer_inquiry_cart`

Menampung item barang pilihan customer sebelum dieksekusi menjadi RFQ formal.

```sql
CREATE TABLE customer_inquiry_cart (
  id BIGSERIAL PRIMARY KEY,
  auth_user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  barang_id TEXT REFERENCES barang(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1,
  catatan_spesifik TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```
## 5. SPESIFIKASI KEBUTUHAN FITUR DETAIL PER HALAMAN
### 5.1 Layer 1: Corporate Presence (Kredibilitas Perusahaan)
 1. **Halaman Utama (Landing Page):**
   * **Hero Section**: Latar belakang video aerial industri berdurasi 15 detik (looping, tanpa suara, redup otomatis dengan overlay opacity 60% Navy). Teks utama: *"Your Premium Strategic Partner in B2B Supply & Logistics"* (EN) / *"Mitra Strategis Premium Anda dalam Suplai & Logistik B2B"* (ID).
   * **CTA Button**: Tombol biru solid (`bg-[#0001bb]`). Jika diklik, meluncur dengan efek *smooth scroll* ke katalog.
   * **Klien Banner**: Slider horizontal otomatis (*infinite looping grid*) yang menampilkan logo-logo transparan putih dari mitra andalan (misal: PLN, Indonesia Power, dll).
 2. **Tentang Kami & Kepatuhan Legal:**
   * Menampilkan profil legalitas PT. RRI, pakta integritas anti-penyuapan (*Anti-Bribery Compliance*), serta dokumentasi pemenuhan standar K3 (Keselamatan Kerja) industri energi.
 3. **Layanan & Solusi:**
   * Penjelasan format interaktif mengenai lini servis: Jasa Kebersihan Industri Makro (*Industrial Cleaning*), Kontrak Suplai ATK Tahunan (*Bulk Supply Contract*), dan Solusi Pengadaan Khusus Suku Cadang.
### 5.2 Layer 2: E-Commerce B2B Private Catalog (Manajemen Produk Tanpa Harga)
 1. **Halaman Utama Katalog Produk:**
   * Menggunakan layout grid longgar (maksimal 3 produk per baris di resolusi desktop).
   * **Penyembunyian Harga Mutlak**: Query API backend (GET /api/v1/public/products) wajib memfilter dan membuang kolom harga_jual_default dan harga_beli_default. Nominal angka rupiah sama sekali tidak dikirim ke browser klien untuk mencegah pencurian data harga oleh kompetitor.
   * **Kondisi Belum Login**: Di bawah nama barang, tertulis teks miring: *"🔒 Access locked. Please login."* / *"🔒 Akses terkunci. Silakan login."* Tombol mengarah ke halaman login.
   * **Kondisi Sudah Login**: Muncul tanda indikasi stok (Ready Stock / Indent) dan tombol solid Navy bertuliskan *"➕ Tambah ke Daftar SPH"* / *"➕ Add to SPH List"*.
 2. **Halaman Detail Produk:**
   * Layout terbagi dua bagian: Kiri adalah galeri gambar beresolusi tinggi dengan fitur *magnifier zoom*, kanan berisi detail nama barang, kode registrasi barang internal (SKU), tabel spesifikasi material, dan dimensi teknis. Tombol aksi berupa *"Tambahkan ke Keranjang Inquiry"* / *"Add to Inquiry Cart"*.
  3. **Halaman PLTU Corner (E-Katalog Sektoral) — [FASE LANJUTAN]**
    * Tidak termasuk MVP. Halaman khusus eksklusif bagi akun dengan atribut perusahaan terafiliasi PLTU. Menyediakan paket bundel langsung. Klien dapat memasukkan 1 paket bundle berisi puluhan jenis barang ke dalam keranjang inquiry hanya dengan satu klik. Implementasi menyusul setelah katalog reguler dan portal klien stabil.
### 5.3 Layer 3: B2B Procurement Operations & Tools

**Autentikasi Customer:** Login via email + password (Supabase Auth). Sesi dikelola via cookies/http-only. Tidak ada integrasi SSO.

 1. **Halaman Quick Order Pad & Upload Excel:**
   * Menyediakan dua opsi input cepat: (1) Tabel kosong tempat pengguna mengetik langsung Kode Barang dan jumlah kuantitas, atau (2) Komponen *Drag and Drop File* untuk mengunggah file spreadsheet Excel berisi daftar kebutuhan barang mereka.
   * Sistem membaca file tersebut, melakukan validasi silang (*cross-match*) kode barang ke database Supabase, lalu otomatis memasukkan item yang cocok ke keranjang inquiry pengguna.
 2. **Halaman Keranjang Inquiry (Inquiry Basket):**
   * Menampilkan daftar barang, kuantitas yang diminta, dan kolom catatan tambahan per item. Di bagian bawah terdapat ringkasan formulir data pengiriman. Tombol utama berupa *"Ajukan Permintaan Surat Penawaran Harga (SPH) Resmi"* / *"Submit Request for Quotation (RFQ)"*.
### 5.4 Layer 4: Client Self-Service Portal (Dashboard Klien)
 1. **Overview Dashboard:**
   * Menampilkan grafik ringkasan status pengadaan barang mereka, pelacakan pengiriman logistik, dan tagihan keuangan yang belum terbayar.
 2. **Pusat Dokumen Digital (SPH, PO, Invoice):**
   * Menampilkan data tabel interaktif. Apabila status SPH (Quotation) di sisi ERP internal sudah dihitung harganya dan berstatus Approved by Sales, tombol **"Unduh SPH (PDF)"** / *"Download SPH (PDF)"* akan aktif secara otomatis di portal pelanggan ini, memungkinkan mereka untuk mencetak dokumen penawaran fisik secara mandiri tanpa menunggu pengiriman manual via kurir/WhatsApp.
  3. **Fitur Multi-User & Budget Control — [FASE LANJUTAN]**
    * Tidak termasuk MVP. Akun berlevel staf (requester) hanya diizinkan mengumpulkan produk ke dalam keranjang belanja dan mengajukan draf penawaran. Dokumen tersebut akan tertahan di sistem internal portal hingga akun berlevel manajer (approver) dari perusahaan yang sama masuk ke portal dan mengklik tombol *"Setujui Pengajuan ke PT. RRI"*. Implementasi menyusul setelah portal klien dasar stabil.
  4. **Pusat Klaim Retur Barang (Integrasi dengan `retur_penjualan`):**
    * Menu retur di portal klien terintegrasi dengan modul **Retur Penjualan** (`retur_penjualan`) yang sudah ada di ERP.
    * Alur: Customer memilih riwayat Surat Jalan (DO) mereka yang sudah *dikirim* → memilih item barang yang akan diretur → mengunggah foto bukti kerusakan fisik → mengisi keterangan → submit.
    * API endpoint: `GET /api/v1/retur-penjualan?customer_id=X` (filter by customer) untuk membaca data retur milik customer tertentu.
    * Upload foto bukti via `POST /api/v1/retur-penjualan/{id}/documents` (sudah tersedia, support JPEG/PNG/WebP).
    * Customer dapat melihat status retur (`draft`, `processed`, `closed`) dan mengunduh PDF Nota Retur.
    * Catatan: Modul **Retur Pembelian** (`retur_pembelian`) tidak termasuk dalam portal klien (internal ERP only).
## 6. ALUR INTEGRASI DAN OTOMATISASI SISTEM (DATA FLOW)
```text
[Customer di Website Publik]
             │
      (Klik Kirim RFQ)
             │
             ▼
[Supabase: Simpan ke tabel 'rfq_customer']
             │
             ├─────────────────────────────────────────────────┐
             ▼                                                 ▼
[ERP Internal: Muncul sebagai Draft RFQ]             [Otomatisasi Fonnte WhatsApp]
             │                                                 │
  (Sales Menghitung Harga & Approve)                     (Kirim Notifikasi ke Sales)
             │                               "Ada permintaan penawaran baru dari PT. X"
             ▼
[Portal Klien: Tombol 'Unduh SPH PDF' Aktif]

```
 1. **Registrasi Klien**: Saat customer baru mendaftar dari web, akun dibuat di Supabase Auth dengan status pending. Tim Admin di dashboard ERP internal menerima notifikasi real-time untuk memeriksa keabsahan perusahaan tersebut, lalu mengubah statusnya menjadi approved.
 2. **Notifikasi WhatsApp Interaktif (Fonnte)**: Setiap kali ada pengiriman inquiry dari website publik, sistem secara otomatis memicu API Fonnte untuk mengirim pesan WhatsApp ke grup koordinasi tim Sales PT. RRI agar penawaran harga dapat segera dihitung di dashboard ERP.
## 7. KRITERIA PENERIMAAN SIKLUS PENGUJIAN (ACCEPTANCE CRITERIA)
 * **Keamanan Data Harga**: Dipastikan 100% tidak ada kebocoran nominal harga pada kode sumber element browser (*Inspect Element -> Network Response*) ketika pengguna mengakses halaman katalog umum dalam kondisi belum melakukan login.
 * **Isolasi Kode ERP**: Penambahan fitur website publik tidak boleh mengubah performa, fungsionalitas, atau merusak link url operasional internal yang sudah berjalan di subdomain erp.pt-rri.com.
 * **Validasi File Excel**: Fitur pemrosesan massal (*bulk upload excel*) harus mampu menangani berkas spreadsheet hingga kapasitas 500 baris item produk tanpa mengalami gejala kendala *request timeout* pada server.
 * **Kesesuaian Estetika Visual**: Seluruh elemen antarmuka halaman publik wajib mematuhi aturan panduan warna korporat (*Deep Sovereign Navy & Pure Electric Blue*) dengan tingkat konsistensi pemakaian font yang seragam.
 * **Dukungan Dwibahasa**: Seluruh halaman publik dapat ditampilkan dalam Bahasa Indonesia (default) dan Bahasa Inggris (toggle).
**Catatan Akhir Dokumen:** Dengan disetujuinya dokumen perencanaan spesifikasi produk (PRD) ini, tahap pengerjaan dapat langsung dilanjutkan ke fase penulisan skema database dan pembuatan struktur komponen UI menggunakan library Tailwind CSS serta shadcn/ui.
