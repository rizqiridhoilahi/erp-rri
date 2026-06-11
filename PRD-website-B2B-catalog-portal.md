Berikut adalah dokumen **Product Requirement Document (PRD)** lengkap, resmi, dan mendalam untuk pengembangan **Website Bisnis Korporat & B2B Private Catalog (Marketplace tanpa harga)** PT. Rizki Ridho Ilahi.
Dokumen ini dirancang sebagai **Adendum Tambahan** yang terintegrasi penuh dengan sistem ERP yang sudah berjalan di erp.pt-rri.com tanpa mengubah atau merusak arsitektur backend, skema routing, maupun otentikasi internal yang ada saat ini.
# PRODUCT REQUIREMENT DOCUMENT (PRD)
## ADENDUM: WEBSITE BISNIS KORPORAT & B2B PRIVATE CATALOG PORTAL
**PT. RIZKI RIDHO ILAHI (RRI)**
**Versi:** 1.0
**Status:** Approved for Development
**Target Lingkungan:** Single Project (Monorepo) Next.js 15.5 & Supabase
**Domain Utama:** pt-rri.com (Website Publik & Portal Klien)
**Subdomain ERP:** erp.pt-rri.com (Sistem Operasional Internal - Tetap/Tidak Berubah)
## 1. PENDAHULUAN & TUJUAN STRATEGIS
PT. Rizki Ridho Ilahi (RRI) bertindak sebagai *General Supplier & Trading Services* skala makro yang berfokus melayani PLTU Tanjung Jati B Jepara serta industri besar lainnya.
Tujuan dari dokumen ini adalah memperluas sistem ERP yang sudah ada dengan membangun wajah publik perusahaan yang **mewah (*luxury corporate*), kredibel, dan eksklusif**, serta menyediakan platform bagi klien korporat (B2B) untuk melakukan eksplorasi produk dan mengajukan permintaan penawaran harga (RFQ) secara digital, mandiri, dan terintegrasi langsung ke hulu operasional ERP.
## 2. PRINSIP VISUAL & DESAIN SISTEM (LUXURY CORPORATE)
Untuk memikat manajemen tingkat tinggi dan tim *procurement* PLTU, antarmuka publik harus mencerminkan stabilitas, teknologi, dan kualitas premium.
 * **Palet Warna Utama:**
   * Deep Midnight Navy (#0A1128): Warna dominan untuk latar belakang gelap, navbar mewah, dan komponen utama. Melambangkan profesionalisme korporat.
   * Champagne Gold (#D4AF37 / #C5A880): Warna aksen tipis untuk tombol CTA, ikon premium, *border high-light*, dan teks krusial. Melambangkan kualitas kelas atas.
   * Pure White (#FFFFFF) & Soft Slate Gray (#F8F9FA): Latar belakang konten untuk menjaga kebersihan visual dan kemudahan membaca dokumen teknis.
 * **Tipografi:**
   * *Headings/Judul Besar:* **Lexend** (Bold dengan pelonggaran spasi / *wide tracking* untuk estetika modern-mewah).
   * *Body/Teks Deskripsi:* **Source Sans 3** atau **Inter** (Regular, akurasi tinggi untuk pembacaan spesifikasi teknik).
 * **Efek & Animasi:**
   * *Glassmorphism*: Penggunaan latar belakang transparan dengan efek blur (backdrop-blur-md) pada komponen melayang seperti Navbar dan Dropdown.
   * *Micro-interactions*: Animasi transisi halus (0.3 detik dengan Framer Motion) saat card produk di-hover (efek *scale-105* dan *smooth soft shadow expansion*).
## 3. ARSITEKTUR ROUTING & STRUKTUR FILE (TANPA MENGUBAH ERP)
Aplikasi dikembangkan dalam satu repositori (*monorepo* Next.js 15.5 App Router). Semua halaman website baru dimasukkan ke dalam Route Group (public) di bawah folder src/app/. Jalur folder ERP internal Anda **tidak disentuh sama sekali** agar terhindar dari *breaking routing changes*.
### 3.1 Hierarki Folder src/app/
```text
src/app/
├── (auth)/               --> [TETAP] Login internal ERP (erp.pt-rri.com/login)
├── dashboard/            --> [TETAP] Dashboard operasional internal (erp.pt-rri.com/dashboard)
├── api/                  --> [TETAP] API internal dan global
├── (public)/             --> [BARU] Memproses lalu lintas domain utama (pt-rri.com)
│   ├── page.tsx          --> Landing Page Utama (Hero Section Video)
│   ├── tentang-kami/     --> Profil Perusahaan & Dokumen Kepatuhan Legal
│   ├── layanan/          --> Layanan Services & Solusi Pengadaan Kontrak
│   ├── katalog/          --> Halaman Utama Katalog Produk B2B (Grid Premium)
│   │   ├── page.tsx
│   │   ├── [id]/         --> Detail Spesifikasi Barang (Tanpa Harga)
│   │   └── plntu-corner/ --> E-Katalog khusus kluster kebutuhan PLTU
│   ├── quick-order/      --> Fitur unggah formulir Excel massal / Kode Pad
│   ├── customer-login/   --> Gerbang Masuk Klien Korporat B2B
│   ├── customer-register/--> Formulir Pendaftaran Legalitas Mitra Baru
│   ├── inquiry/          --> Keranjang Inquiry Pengganti Checkout Pembayaran
│   └── portal/           --> Dashboard Khusus Klien (Customer Portal)
│       ├── page.tsx      --> Ringkasan Status Dokumen & Finansial Klien
│       ├── dokumen/      --> Riwayat SPH (Unduh PDF), PO, dan Invoice
│       └── retur/        --> Pusat Klaim & Pengajuan Garansi/Retur Mandiri
├── global.css            --> [TETAP]
└── layout.tsx            --> [TETAP] Shared Layout Root

```
### 3.2 Logika src/middleware.ts
Middleware mendeteksi header host. Jika akses berasal dari pt-rri.com, request akan dialihkan secara internal (*rewrite*) ke folder (public), sementara akses ke erp.pt-rri.com dibiarkan berjalan normal menggunakan routing bawaan Next.js.
## 4. SKEMA EKSTENSI DATABASE (SUPABASE & DRIZZLE ORM)
Dua tabel baru ditambahkan ke skema database untuk mengelola profil pengguna eksternal (customer) dan keranjang belanja berbasis penawaran, serta menambahkan kolom kontrol pada tabel master barang yang sudah ada.
### 4.1 Tambahan Kolom pada Tabel barang
```sql
ALTER TABLE barang ADD COLUMN is_published_to_catalog BOOLEAN DEFAULT FALSE;
ALTER TABLE barang ADD COLUMN deskripsi_katalog TEXT;
ALTER TABLE barang ADD COLUMN spesifikasi_teknis JSONB; -- Menyimpan dimensi, berat, sertifikat produk

```
### 4.2 Tabel Baru customer_profiles
Menyimpan profil legalitas hukum dari klien perusahaan yang mendaftar secara mandiri.
```sql
CREATE TABLE customer_profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  nama_perusahaan VARCHAR(255) NOT NULL,
  penanggung_jawab_pic VARCHAR(150) NOT NULL,
  no_whatsapp_pic VARCHAR(20) NOT NULL,
  alamat_perusahaan TEXT NOT NULL,
  npwp_perusahaan VARCHAR(25),
  status_verifikasi VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'suspended'
  role_internal_client VARCHAR(50) DEFAULT 'manager', -- 'approver', 'requester' (Multi-User Control)
  parent_company_id UUID, -- Digunakan jika satu PLTU memiliki banyak akun staf lapangan
  created_at TIMESTAMP DEFAULT NOW()
);

```
### 4.3 Tabel Baru customer_inquiry_cart
Menampung item barang pilihan customer sebelum dieksekusi menjadi Request for Quotation (RFQ) formal.
```sql
CREATE TABLE customer_inquiry_cart (
  id BIGSERIAL PRIMARY KEY,
  customer_id UUID REFERENCES auth.users ON DELETE CASCADE,
  barang_id BIGINT REFERENCES barang(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1,
  catatan_spesifik TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

```
## 5. SPESIFIKASI KEBUTUHAN FITUR DETAIL PER HALAMAN
### 5.1 Layer 1: Corporate Presence (Kredibilitas Perusahaan)
 1. **Halaman Utama (Landing Page):**
   * **Hero Section**: Latar belakang video aerial industri berdurasi 15 detik (looping, tanpa suara, redup otomatis dengan overlay opacity 60% Navy). Teks utama menggunakan font emas berbunyi: *"Elevating Industrial Supply Standards for Power Generation."*
   * **CTA Button**: Tombol mewah border emas tipis. Jika diklik, meluncur dengan efek *smooth scroll* ke katalog.
   * **Klien Banner**: Slider horizontal otomatis (*infinite looping grid*) yang menampilkan logo-logo transparan putih dari mitra andalan (misal: PLN, Indonesia Power, dll).
 2. **Tentang Kami & Kepatuhan Legal:**
   * Menampilkan profil legalitas PT. RRI, pakta integritas anti-penyuapan (*Anti-Bribery Compliance*), serta dokumentasi pemenuhan standar K3 (Keselamatan Kerja) industri energi.
 3. **Layanan & Solusi:**
   * Penjelasan format interaktif mengenai lini servis: Jasa Kebersihan Industri Makro (*Industrial Cleaning*), Kontrak Suplai ATK Tahunan (*Bulk Supply Contract*), dan Solusi Pengadaan Khusus Suku Cadang.
### 5.2 Layer 2: E-Commerce B2B Private Catalog (Manajemen Produk Tanpa Harga)
 1. **Halaman Utama Katalog Produk:**
   * Menggunakan layout grid longgar (maksimal 3 produk per baris di resolusi desktop).
   * **Penyembunyian Harga Mutlak**: Query API backend (GET /api/v1/public/products) wajib memfilter dan membuang kolom harga_jual_default dan harga_beli_default. Nominal angka rupiah sama sekali tidak dikirim ke browser klien untuk mencegah pencurian data harga oleh kompetitor.
   * **Kondisi Belum Login**: Di bawah nama barang, tertulis teks miring: *"🔒 Akses spesifikasi terkunci. Silakan login mitra."* Tombol mengarah ke halaman login.
   * **Kondisi Sudah Login**: Muncul tanda indikasi stok (Ready Stock / Indent) dan tombol solid Navy bertuliskan *"➕ Tambah ke Daftar SPH"*.
 2. **Halaman Detail Produk:**
   * Layout terbagi dua bagian: Kiri adalah galeri gambar beresolusi tinggi dengan fitur *magnifier zoom*, kanan berisi detail nama barang, kode registrasi barang internal (SKU), tabel spesifikasi material, dan dimensi teknis. Tombol aksi berupa *"Tambahkan ke Keranjang Inquiry"*.
 3. **Halaman PLTU Corner (E-Katalog Sektoral):**
   * Halaman khusus eksklusif bagi akun dengan atribut perusahaan terafiliasi PLTU. Menyediakan paket bundel langsung, seperti *"Paket Pemeliharaan Kebersihan Ruang Turbin Bulanan"* atau *"Paket Suplai Alat Administrasi Control Room"*. Klien dapat memasukkan 1 paket bundle berisi puluhan jenis barang ke dalam keranjang inquiry hanya dengan satu klik.
### 5.3 Layer 3: B2B Procurement Operations & Tools
 1. **Halaman Quick Order Pad & Upload Excel:**
   * Menyediakan dua opsi input cepat: (1) Tabel kosong tempat pengguna mengetik langsung Kode Barang dan jumlah kuantitas, atau (2) Komponen *Drag and Drop File* untuk mengunggah file spreadsheet Excel berisi daftar kebutuhan barang mereka.
   * Sistem membaca file tersebut, melakukan validasi silang (*cross-match*) kode barang ke database Supabase, lalu otomatis memasukkan item yang cocok ke keranjang inquiry pengguna.
 2. **Halaman Keranjang Inquiry (Inquiry Basket):**
   * Menampilkan daftar barang, kuantitas yang diminta, dan kolom catatan tambahan per item. Di bagian bawah terdapat ringkasan formulir data pengiriman. Tombol utama berupa *"Ajukan Permintaan Surat Penawaran Harga (SPH) Resmi"*.
### 5.4 Layer 4: Client Self-Service Portal (Dashboard Klien)
 1. **Overview Dashboard:**
   * Menampilkan grafik ringkasan status pengadaan barang mereka, pelacakan pengiriman logistik, dan tagihan keuangan yang belum terbayar.
 2. **Pusat Dokumen Digital (SPH, PO, Invoice):**
   * Menampilkan data tabel interaktif. Apabila status SPH (Quotation) di sisi ERP internal sudah dihitung harganya dan berstatus Approved by Sales, tombol **"Unduh SPH (PDF)"** akan aktif secara otomatis di portal pelanggan ini, memungkinkan mereka untuk mencetak dokumen penawaran fisik secara mandiri tanpa menunggu pengiriman manual via kurir/WhatsApp.
 3. **Fitur Multi-User & Budget Control:**
   * Akun berlevel staf (requester) hanya diizinkan mengumpulkan produk ke dalam keranjang belanja dan mengajukan draf penawaran. Dokumen tersebut akan tertahan di sistem internal portal hingga akun berlevel manajer (approver) dari perusahaan yang sama masuk ke portal dan mengklik tombol *"Setujui Pengajuan ke PT. RRI"*.
 4. **Pusat Tiket Klaim Retur Barang Cacat:**
   * Jika ada barang operasional yang rusak, customer dapat membuka menu retur, memilih riwayat Surat Jalan (DO) atau Invoice lama mereka, memilih item barang yang bermasalah, mengunggah foto bukti kerusakan fisik, dan mengirimkan komplain. Data ini langsung masuk ke modul retur pada sistem ERP internal RRI untuk segera diproses tindak lanjutnya.
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
 * **Kesesuaian Estetika Visual**: Seluruh elemen antarmuka halaman publik wajib mematuhi aturan panduan warna korporat mewah (*Midnight Navy & Champagne Gold*) dengan tingkat konsistensi pemakaian font yang seragam.
**Catatan Akhir Dokumen:** Dengan disetujuinya dokumen perencanaan spesifikasi produk (PRD) ini, tahap pengerjaan dapat langsung dilanjutkan ke fase penulisan skema database dan pembuatan struktur komponen UI menggunakan library Tailwind CSS serta shadcn/ui.
