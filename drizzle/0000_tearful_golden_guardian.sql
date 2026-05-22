CREATE TABLE "absensi" (
	"id" text PRIMARY KEY NOT NULL,
	"karyawan_id" text NOT NULL,
	"tanggal" timestamp NOT NULL,
	"status" text NOT NULL,
	"keterangan" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_ocr_history" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"file_name" text NOT NULL,
	"file_url" text NOT NULL,
	"extracted_at" timestamp DEFAULT now() NOT NULL,
	"keterangan" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_search_history" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"query" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_search_result" (
	"id" text PRIMARY KEY NOT NULL,
	"ai_search_history_id" text NOT NULL,
	"nama" text NOT NULL,
	"harga" real NOT NULL,
	"toko" text NOT NULL,
	"link" text NOT NULL,
	"marketplace" text NOT NULL,
	"rating" real,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"action" text NOT NULL,
	"table_name" text NOT NULL,
	"record_id" text NOT NULL,
	"changes" jsonb,
	"ip_address" "inet",
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "barang" (
	"id" text PRIMARY KEY NOT NULL,
	"nama" text NOT NULL,
	"kode" text NOT NULL,
	"kategori_id" text NOT NULL,
	"satuan" text NOT NULL,
	"spesifikasi" text,
	"harga_beli_default" real,
	"harga_jual_default" real,
	"stok_minimum" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "barang_kode_unique" UNIQUE("kode")
);
--> statement-breakpoint
CREATE TABLE "coa" (
	"id" text PRIMARY KEY NOT NULL,
	"kode" text NOT NULL,
	"nama" text NOT NULL,
	"tipe" text NOT NULL,
	"induk_id" text,
	"keterangan" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "coa_kode_unique" UNIQUE("kode")
);
--> statement-breakpoint
CREATE TABLE "customer" (
	"id" text PRIMARY KEY NOT NULL,
	"nama" text NOT NULL,
	"kode" text NOT NULL,
	"alamat" text,
	"kontak" text,
	"terms_of_payment" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "customer_kode_unique" UNIQUE("kode")
);
--> statement-breakpoint
CREATE TABLE "customer_pic" (
	"id" text PRIMARY KEY NOT NULL,
	"customer_id" text NOT NULL,
	"nama" text NOT NULL,
	"jabatan" text,
	"no_hp" text,
	"email" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_po" (
	"id" text PRIMARY KEY NOT NULL,
	"nomor" text NOT NULL,
	"customer_id" text NOT NULL,
	"quotation_id" text,
	"tanggal" timestamp NOT NULL,
	"nomor_po_customer" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"terms_of_payment" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "customer_po_nomor_unique" UNIQUE("nomor")
);
--> statement-breakpoint
CREATE TABLE "customer_po_item" (
	"id" text PRIMARY KEY NOT NULL,
	"customer_po_id" text NOT NULL,
	"barang_id" text NOT NULL,
	"jumlah" integer NOT NULL,
	"harga_satuan" real NOT NULL,
	"keterangan" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_po_pic" (
	"id" text PRIMARY KEY NOT NULL,
	"customer_po_id" text NOT NULL,
	"customer_pic_id" text NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_top" (
	"id" text PRIMARY KEY NOT NULL,
	"customer_id" text NOT NULL,
	"top" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "delivery_order" (
	"id" text PRIMARY KEY NOT NULL,
	"nomor" text NOT NULL,
	"sales_order_id" text NOT NULL,
	"tanggal" timestamp NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"keterangan" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "delivery_order_nomor_unique" UNIQUE("nomor")
);
--> statement-breakpoint
CREATE TABLE "delivery_order_item" (
	"id" text PRIMARY KEY NOT NULL,
	"delivery_order_id" text NOT NULL,
	"barang_id" text NOT NULL,
	"jumlah" integer NOT NULL,
	"keterangan" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "di" (
	"id" text PRIMARY KEY NOT NULL,
	"nomor" text NOT NULL,
	"customer_id" text NOT NULL,
	"kontrak_id" text,
	"tanggal" timestamp NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"keterangan" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "di_nomor_unique" UNIQUE("nomor")
);
--> statement-breakpoint
CREATE TABLE "di_item" (
	"id" text PRIMARY KEY NOT NULL,
	"di_id" text NOT NULL,
	"barang_id" text NOT NULL,
	"jumlah" integer NOT NULL,
	"keterangan" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "di_pic" (
	"id" text PRIMARY KEY NOT NULL,
	"di_id" text NOT NULL,
	"customer_pic_id" text NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_counter" (
	"kode_dokumen" text NOT NULL,
	"tahun" integer NOT NULL,
	"bulan" integer NOT NULL,
	"counter" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "document_counter_kode_dokumen_tahun_bulan_pk" PRIMARY KEY("kode_dokumen","tahun","bulan")
);
--> statement-breakpoint
CREATE TABLE "faktur_pajak" (
	"id" text PRIMARY KEY NOT NULL,
	"nomor" text NOT NULL,
	"invoice_id" text NOT NULL,
	"nomor_faktur" text NOT NULL,
	"tanggal" timestamp NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"dpp" real NOT NULL,
	"ppn" real NOT NULL,
	"pph" real,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "faktur_pajak_nomor_unique" UNIQUE("nomor")
);
--> statement-breakpoint
CREATE TABLE "faktur_pajak_item" (
	"id" text PRIMARY KEY NOT NULL,
	"faktur_pajak_id" text NOT NULL,
	"invoice_item_id" text NOT NULL,
	"harga" real NOT NULL,
	"dpp" real NOT NULL,
	"ppn" real NOT NULL,
	"pph" real,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grn" (
	"id" text PRIMARY KEY NOT NULL,
	"nomor" text NOT NULL,
	"purchase_receiving_id" text,
	"di_id" text,
	"tanggal" timestamp NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"keterangan" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "grn_nomor_unique" UNIQUE("nomor")
);
--> statement-breakpoint
CREATE TABLE "grn_item" (
	"id" text PRIMARY KEY NOT NULL,
	"grn_id" text NOT NULL,
	"barang_id" text NOT NULL,
	"jumlah" integer NOT NULL,
	"keterangan" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gudang" (
	"id" text PRIMARY KEY NOT NULL,
	"nama" text NOT NULL,
	"lokasi" text,
	"keterangan" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice" (
	"id" text PRIMARY KEY NOT NULL,
	"nomor" text NOT NULL,
	"sales_order_id" text NOT NULL,
	"customer_id" text NOT NULL,
	"tanggal" timestamp NOT NULL,
	"top" text NOT NULL,
	"ppn_rate" real DEFAULT 0.11 NOT NULL,
	"pph_rate" real,
	"status" text DEFAULT 'draft' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invoice_nomor_unique" UNIQUE("nomor")
);
--> statement-breakpoint
CREATE TABLE "invoice_document" (
	"id" text PRIMARY KEY NOT NULL,
	"invoice_id" text NOT NULL,
	"document_type" text NOT NULL,
	"file_name" text NOT NULL,
	"file_url" text NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_item" (
	"id" text PRIMARY KEY NOT NULL,
	"invoice_id" text NOT NULL,
	"barang_id" text NOT NULL,
	"harga" real NOT NULL,
	"diskon" real DEFAULT 0,
	"ppn" real,
	"pph" real,
	"jumlah" integer NOT NULL,
	"keterangan" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jabatan" (
	"id" text PRIMARY KEY NOT NULL,
	"nama" text NOT NULL,
	"keterangan" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jurnal" (
	"id" text PRIMARY KEY NOT NULL,
	"nomor" text NOT NULL,
	"tanggal" timestamp NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"keterangan" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "jurnal_nomor_unique" UNIQUE("nomor")
);
--> statement-breakpoint
CREATE TABLE "jurnal_item" (
	"id" text PRIMARY KEY NOT NULL,
	"jurnal_id" text NOT NULL,
	"akun_id" text NOT NULL,
	"debit" real DEFAULT 0 NOT NULL,
	"credit" real DEFAULT 0 NOT NULL,
	"keterangan" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "karyawan" (
	"id" text PRIMARY KEY NOT NULL,
	"nik" text NOT NULL,
	"nama" text NOT NULL,
	"email" text NOT NULL,
	"no_hp" text,
	"jabatan_id" text NOT NULL,
	"gaji_pokok" real,
	"tanggal_masuk" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "karyawan_nik_unique" UNIQUE("nik"),
	CONSTRAINT "karyawan_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "kategori_barang" (
	"id" text PRIMARY KEY NOT NULL,
	"nama" text NOT NULL,
	"keterangan" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kontrak" (
	"id" text PRIMARY KEY NOT NULL,
	"customer_id" text NOT NULL,
	"nama" text NOT NULL,
	"tanggal_mulai" timestamp,
	"tanggal_selesai" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kontrak_file" (
	"id" text PRIMARY KEY NOT NULL,
	"kontrak_id" text NOT NULL,
	"file_name" text NOT NULL,
	"file_url" text NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kontrak_item" (
	"id" text PRIMARY KEY NOT NULL,
	"kontrak_id" text NOT NULL,
	"barang_id" text NOT NULL,
	"harga_satuan" real NOT NULL,
	"ppn_include" boolean DEFAULT true NOT NULL,
	"keterangan" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kwitansi" (
	"id" text PRIMARY KEY NOT NULL,
	"nomor" text NOT NULL,
	"invoice_id" text NOT NULL,
	"tanggal" timestamp NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"keterangan" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "kwitansi_nomor_unique" UNIQUE("nomor")
);
--> statement-breakpoint
CREATE TABLE "kwitansi_item" (
	"id" text PRIMARY KEY NOT NULL,
	"kwitansi_id" text NOT NULL,
	"invoice_item_id" text NOT NULL,
	"jumlah" real NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "negoiasi" (
	"id" text PRIMARY KEY NOT NULL,
	"nomor" text NOT NULL,
	"quotation_id" text NOT NULL,
	"tanggal" timestamp NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"keterangan" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "negoiasi_nomor_unique" UNIQUE("nomor")
);
--> statement-breakpoint
CREATE TABLE "negoiasi_item" (
	"id" text PRIMARY KEY NOT NULL,
	"negoiasi_id" text NOT NULL,
	"quotation_item_id" text NOT NULL,
	"harga_satuan_baru" real NOT NULL,
	"diskon_baru" real DEFAULT 0,
	"alasan" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "penggajian" (
	"id" text PRIMARY KEY NOT NULL,
	"nomor" text NOT NULL,
	"karyawan_id" text NOT NULL,
	"bulan" integer NOT NULL,
	"tahun" integer NOT NULL,
	"gaji_pokok" real NOT NULL,
	"tunjangan" real DEFAULT 0,
	"potongan" real DEFAULT 0,
	"gaji_bersih" real NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"tanggal_pembayaran" timestamp,
	"keterangan" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "penggajian_nomor_unique" UNIQUE("nomor")
);
--> statement-breakpoint
CREATE TABLE "purchase_order" (
	"id" text PRIMARY KEY NOT NULL,
	"nomor" text NOT NULL,
	"supplier_id" text NOT NULL,
	"purchase_request_id" text,
	"tanggal" timestamp NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"terms_of_payment" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "purchase_order_nomor_unique" UNIQUE("nomor")
);
--> statement-breakpoint
CREATE TABLE "purchase_order_item" (
	"id" text PRIMARY KEY NOT NULL,
	"purchase_order_id" text NOT NULL,
	"barang_id" text NOT NULL,
	"jumlah" integer NOT NULL,
	"harga_satuan" real NOT NULL,
	"link_produk" text,
	"nama_toko" text,
	"marketplace" text,
	"no_resi" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchase_receiving" (
	"id" text PRIMARY KEY NOT NULL,
	"nomor" text NOT NULL,
	"purchase_order_id" text NOT NULL,
	"tanggal" timestamp NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"keterangan" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "purchase_receiving_nomor_unique" UNIQUE("nomor")
);
--> statement-breakpoint
CREATE TABLE "purchase_receiving_item" (
	"id" text PRIMARY KEY NOT NULL,
	"purchase_receiving_id" text NOT NULL,
	"barang_id" text NOT NULL,
	"jumlah" integer NOT NULL,
	"keterangan" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchase_request" (
	"id" text PRIMARY KEY NOT NULL,
	"nomor" text NOT NULL,
	"sales_order_id" text,
	"tanggal" timestamp NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"keterangan" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "purchase_request_nomor_unique" UNIQUE("nomor")
);
--> statement-breakpoint
CREATE TABLE "purchase_request_item" (
	"id" text PRIMARY KEY NOT NULL,
	"purchase_request_id" text NOT NULL,
	"barang_id" text NOT NULL,
	"jumlah" integer NOT NULL,
	"keterangan" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quotation" (
	"id" text PRIMARY KEY NOT NULL,
	"nomor" text NOT NULL,
	"customer_id" text NOT NULL,
	"tanggal" timestamp NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"ppn_rate" real DEFAULT 0.11 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "quotation_nomor_unique" UNIQUE("nomor")
);
--> statement-breakpoint
CREATE TABLE "quotation_item" (
	"id" text PRIMARY KEY NOT NULL,
	"quotation_id" text NOT NULL,
	"barang_id" text NOT NULL,
	"harga_satuan" real NOT NULL,
	"diskon" real DEFAULT 0,
	"ppn_per_item" real,
	"jumlah" integer NOT NULL,
	"keterangan" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quotation_pic" (
	"id" text PRIMARY KEY NOT NULL,
	"quotation_id" text NOT NULL,
	"customer_pic_id" text NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "retur_pembelian" (
	"id" text PRIMARY KEY NOT NULL,
	"nomor" text NOT NULL,
	"purchase_order_id" text,
	"supplier_id" text NOT NULL,
	"tanggal" timestamp NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"keterangan" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "retur_pembelian_nomor_unique" UNIQUE("nomor")
);
--> statement-breakpoint
CREATE TABLE "retur_pembelian_document" (
	"id" text PRIMARY KEY NOT NULL,
	"retur_pembelian_id" text NOT NULL,
	"file_name" text NOT NULL,
	"file_url" text NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "retur_pembelian_item" (
	"id" text PRIMARY KEY NOT NULL,
	"retur_pembelian_id" text NOT NULL,
	"barang_id" text NOT NULL,
	"jumlah" integer NOT NULL,
	"keterangan" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "retur_penjualan" (
	"id" text PRIMARY KEY NOT NULL,
	"nomor" text NOT NULL,
	"delivery_order_id" text,
	"customer_id" text NOT NULL,
	"tanggal" timestamp NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"keterangan" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "retur_penjualan_nomor_unique" UNIQUE("nomor")
);
--> statement-breakpoint
CREATE TABLE "retur_penjualan_document" (
	"id" text PRIMARY KEY NOT NULL,
	"retur_penjualan_id" text NOT NULL,
	"file_name" text NOT NULL,
	"file_url" text NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "retur_penjualan_item" (
	"id" text PRIMARY KEY NOT NULL,
	"retur_penjualan_id" text NOT NULL,
	"barang_id" text NOT NULL,
	"jumlah" integer NOT NULL,
	"keterangan" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rfq" (
	"id" text PRIMARY KEY NOT NULL,
	"nomor" text NOT NULL,
	"supplier_id" text NOT NULL,
	"tanggal" timestamp NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"keterangan" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "rfq_nomor_unique" UNIQUE("nomor")
);
--> statement-breakpoint
CREATE TABLE "rfq_item" (
	"id" text PRIMARY KEY NOT NULL,
	"rfq_id" text NOT NULL,
	"barang_id" text NOT NULL,
	"jumlah" integer NOT NULL,
	"satuan" text,
	"harga_target" real,
	"keterangan" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rfq_pic" (
	"id" text PRIMARY KEY NOT NULL,
	"rfq_id" text NOT NULL,
	"customer_pic_id" text NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sales_order" (
	"id" text PRIMARY KEY NOT NULL,
	"nomor" text NOT NULL,
	"customer_po_id" text,
	"di_id" text,
	"tanggal" timestamp NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sales_order_nomor_unique" UNIQUE("nomor")
);
--> statement-breakpoint
CREATE TABLE "sales_order_item" (
	"id" text PRIMARY KEY NOT NULL,
	"sales_order_id" text NOT NULL,
	"barang_id" text NOT NULL,
	"jumlah" integer NOT NULL,
	"harga_satuan" real NOT NULL,
	"keterangan" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stok" (
	"id" text PRIMARY KEY NOT NULL,
	"barang_id" text NOT NULL,
	"gudang_id" text,
	"jumlah" integer NOT NULL,
	"last_mutasi" timestamp DEFAULT now() NOT NULL,
	"keterangan" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stok_mutasi" (
	"id" text PRIMARY KEY NOT NULL,
	"barang_id" text NOT NULL,
	"gudang_id" text,
	"tipe" text NOT NULL,
	"jumlah" integer NOT NULL,
	"saldo_sebelum" integer DEFAULT 0 NOT NULL,
	"saldo_sesudah" integer DEFAULT 0 NOT NULL,
	"ref_jenis" text,
	"ref_id" text,
	"keterangan" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" text
);
--> statement-breakpoint
CREATE TABLE "supplier" (
	"id" text PRIMARY KEY NOT NULL,
	"nama" text NOT NULL,
	"kode" text NOT NULL,
	"nama_toko" text,
	"link_toko" text,
	"no_rekening" text,
	"kontak" text,
	"terms_of_payment" text,
	"is_marketplace" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "supplier_kode_unique" UNIQUE("kode")
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"role" text NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"onboarding_disabled" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "whatsapp_log" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"recipient" text NOT NULL,
	"message" text NOT NULL,
	"status" text NOT NULL,
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
