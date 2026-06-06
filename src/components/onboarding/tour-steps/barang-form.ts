import type { Step } from 'react-joyride'

export const barangFormSteps: Step[] = [
  {
    target: '[data-tour="barang-form-header"]',
    content: 'Form ini digunakan untuk menambahkan data barang baru. Ada dua cara input: manual atau import dari kontrak.',
    title: 'Tambah Barang',
    placement: 'bottom',
  },
  {
    target: '[data-tour="barang-form-header"]',
    content: 'Pilih "Input Manual" untuk mengisi form satu per satu, atau "Import dari Kontrak" untuk mengambil data barang dari kontrak yang sudah ada menggunakan AI.',
    title: 'Metode Input',
    placement: 'bottom',
  },
  {
    target: '[data-tour="barang-form-header"]',
    content: 'Isi nama barang dengan jelas dan deskriptif. Nama ini akan muncul di seluruh sistem — quotation, invoice, dan dokumen lainnya.',
    title: 'Nama Barang',
    placement: 'bottom',
  },
  {
    target: '[data-tour="barang-form-header"]',
    content: 'Kode barang bersifat unik. Gunakan kode yang konsisten, misalnya sesuai kategori atau supplier.',
    title: 'Kode Barang',
    placement: 'bottom',
  },
  {
    target: '[data-tour="barang-form-header"]',
    content: 'Pilih kategori yang sesuai. Jika kategori belum ada, klik tombol "+" untuk membuat kategori baru langsung dari sini.',
    title: 'Kategori',
    placement: 'bottom',
  },
  {
    target: '[data-tour="barang-form-header"]',
    content: 'Isi harga beli dan harga jual default. Harga ini akan menjadi patokan saat membuat transaksi, tetapi bisa disesuaikan per transaksi.',
    title: 'Harga Default',
    placement: 'bottom',
  },
  {
    target: '[data-tour="barang-form-header"]',
    content: 'Upload foto barang untuk memudahkan identifikasi. Format yang didukung: JPG, PNG, WebP — maksimal 5MB. Foto akan otomatis dikompres dan dikonversi ke WebP.',
    title: 'Foto Barang',
    placement: 'bottom',
  },
  {
    target: '[data-tour="barang-form-header"]',
    content: 'Pastikan semua data sudah benar, lalu klik Simpan. Data barang akan tersimpan dan muncul di halaman daftar barang.',
    title: 'Simpan',
    placement: 'bottom',
  },
]
