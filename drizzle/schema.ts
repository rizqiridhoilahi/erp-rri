import { pgTable, text, timestamp, unique, real, integer, boolean, jsonb, inet, index, pgPolicy, check, uuid, bigint, numeric, primaryKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const absensi = pgTable("absensi", {
	id: text().primaryKey().notNull(),
	karyawanId: text("karyawan_id").notNull(),
	tanggal: timestamp({ mode: 'string' }).notNull(),
	status: text().notNull(),
	keterangan: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const aiSearchHistory = pgTable("ai_search_history", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	query: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const barang = pgTable("barang", {
	id: text().primaryKey().notNull(),
	nama: text().notNull(),
	kode: text().notNull(),
	kategoriId: text("kategori_id").notNull(),
	satuan: text().notNull(),
	spesifikasi: text(),
	hargaBeliDefault: real("harga_beli_default"),
	hargaJualDefault: real("harga_jual_default"),
	stokMinimum: integer("stok_minimum").default(0).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("barang_kode_unique").on(table.kode),
]);

export const auditLog = pgTable("audit_log", {
	id: text().primaryKey().notNull(),
	userId: text("user_id"),
	action: text().notNull(),
	tableName: text("table_name").notNull(),
	recordId: text("record_id").notNull(),
	changes: jsonb(),
	ipAddress: inet("ip_address"),
	userAgent: text("user_agent"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const customer = pgTable("customer", {
	id: text().primaryKey().notNull(),
	nama: text().notNull(),
	kode: text().notNull(),
	alamat: text(),
	kontak: text(),
	termsOfPayment: text("terms_of_payment"),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("customer_kode_unique").on(table.kode),
]);

export const customerPic = pgTable("customer_pic", {
	id: text().primaryKey().notNull(),
	customerId: text("customer_id").notNull(),
	nama: text().notNull(),
	jabatan: text(),
	noHp: text("no_hp"),
	email: text(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const customerPoItem = pgTable("customer_po_item", {
	id: text().primaryKey().notNull(),
	customerPoId: text("customer_po_id").notNull(),
	barangId: text("barang_id").notNull(),
	jumlah: integer().notNull(),
	hargaSatuan: real("harga_satuan").notNull(),
	keterangan: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const customerTop = pgTable("customer_top", {
	id: text().primaryKey().notNull(),
	customerId: text("customer_id").notNull(),
	top: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const customerPoPic = pgTable("customer_po_pic", {
	id: text().primaryKey().notNull(),
	customerPoId: text("customer_po_id").notNull(),
	customerPicId: text("customer_pic_id").notNull(),
	assignedAt: timestamp("assigned_at", { mode: 'string' }).defaultNow().notNull(),
});

export const di = pgTable("di", {
	id: text().primaryKey().notNull(),
	customerId: text("customer_id").notNull(),
	kontrakId: text("kontrak_id"),
	tanggal: timestamp({ mode: 'string' }).notNull(),
	keterangan: text(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	nomor: text().notNull(),
	status: text().default('draft').notNull(),
}, (table) => [
	unique("di_nomor_unique").on(table.nomor),
]);

export const kategoriBarang = pgTable("kategori_barang", {
	id: text().primaryKey().notNull(),
	nama: text().notNull(),
	keterangan: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const kontrak = pgTable("kontrak", {
	id: text().primaryKey().notNull(),
	customerId: text("customer_id").notNull(),
	nama: text().notNull(),
	tanggalMulai: timestamp("tanggal_mulai", { mode: 'string' }),
	tanggalSelesai: timestamp("tanggal_selesai", { mode: 'string' }),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const quotation = pgTable("quotation", {
	id: text().primaryKey().notNull(),
	customerId: text("customer_id").notNull(),
	tanggal: timestamp({ mode: 'string' }).notNull(),
	ppnRate: real("ppn_rate").default(0.11).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	nomor: text().notNull(),
	status: text().default('draft').notNull(),
}, (table) => [
	unique("quotation_nomor_unique").on(table.nomor),
]);

export const userRoles = pgTable("user_roles", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	role: text().notNull(),
	assignedAt: timestamp("assigned_at", { mode: 'string' }).defaultNow().notNull(),
});

export const supplier = pgTable("supplier", {
	id: text().primaryKey().notNull(),
	nama: text().notNull(),
	kode: text().notNull(),
	namaToko: text("nama_toko"),
	linkToko: text("link_toko"),
	noRekening: text("no_rekening"),
	kontak: text(),
	termsOfPayment: text("terms_of_payment"),
	isMarketplace: boolean("is_marketplace").default(false).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("supplier_kode_unique").on(table.kode),
]);

export const whatsappLog = pgTable("whatsapp_log", {
	id: text().primaryKey().notNull(),
	userId: text("user_id"),
	recipient: text().notNull(),
	message: text().notNull(),
	status: text().notNull(),
	sentAt: timestamp("sent_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const users = pgTable("users", {
	id: text().primaryKey().notNull(),
	email: text().notNull(),
	name: text().notNull(),
	role: text().notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	onboardingDisabled: boolean("onboarding_disabled").default(false),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const jabatan = pgTable("jabatan", {
	id: text().primaryKey().notNull(),
	nama: text().notNull(),
	keterangan: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const karyawan = pgTable("karyawan", {
	id: text().primaryKey().notNull(),
	nik: text().notNull(),
	nama: text().notNull(),
	email: text().notNull(),
	noHp: text("no_hp"),
	jabatanId: text("jabatan_id").notNull(),
	gajiPokok: real("gaji_pokok"),
	tanggalMasuk: timestamp("tanggal_masuk", { mode: 'string' }),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("karyawan_nik_unique").on(table.nik),
	unique("karyawan_email_unique").on(table.email),
]);

export const coa = pgTable("coa", {
	id: text().primaryKey().notNull(),
	kode: text().notNull(),
	nama: text().notNull(),
	tipe: text().notNull(),
	indukId: text("induk_id"),
	keterangan: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("coa_kode_unique").on(table.kode),
]);

export const kontrakItem = pgTable("kontrak_item", {
	id: text().primaryKey().notNull(),
	kontrakId: text("kontrak_id").notNull(),
	barangId: text("barang_id").notNull(),
	hargaSatuan: real("harga_satuan").notNull(),
	ppnInclude: boolean("ppn_include").default(true).notNull(),
	keterangan: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const kontrakFile = pgTable("kontrak_file", {
	id: text().primaryKey().notNull(),
	kontrakId: text("kontrak_id").notNull(),
	fileName: text("file_name").notNull(),
	fileUrl: text("file_url").notNull(),
	uploadedAt: timestamp("uploaded_at", { mode: 'string' }).defaultNow().notNull(),
});

export const quotationItem = pgTable("quotation_item", {
	id: text().primaryKey().notNull(),
	quotationId: text("quotation_id").notNull(),
	barangId: text("barang_id").notNull(),
	hargaSatuan: real("harga_satuan").notNull(),
	diskon: real().default(0),
	ppnPerItem: real("ppn_per_item"),
	jumlah: integer().notNull(),
	keterangan: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const quotationPic = pgTable("quotation_pic", {
	id: text().primaryKey().notNull(),
	quotationId: text("quotation_id").notNull(),
	customerPicId: text("customer_pic_id").notNull(),
	assignedAt: timestamp("assigned_at", { mode: 'string' }).defaultNow().notNull(),
});

export const negoiasiItem = pgTable("negoiasi_item", {
	id: text().primaryKey().notNull(),
	negoiasiId: text("negoiasi_id").notNull(),
	quotationItemId: text("quotation_item_id").notNull(),
	hargaSatuanBaru: real("harga_satuan_baru").notNull(),
	diskonBaru: real("diskon_baru").default(0),
	alasan: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const diItem = pgTable("di_item", {
	id: text().primaryKey().notNull(),
	diId: text("di_id").notNull(),
	barangId: text("barang_id").notNull(),
	jumlah: integer().notNull(),
	keterangan: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const diPic = pgTable("di_pic", {
	id: text().primaryKey().notNull(),
	diId: text("di_id").notNull(),
	customerPicId: text("customer_pic_id").notNull(),
	assignedAt: timestamp("assigned_at", { mode: 'string' }).defaultNow().notNull(),
});

export const salesOrderItem = pgTable("sales_order_item", {
	id: text().primaryKey().notNull(),
	salesOrderId: text("sales_order_id").notNull(),
	barangId: text("barang_id").notNull(),
	jumlah: integer().notNull(),
	hargaSatuan: real("harga_satuan").notNull(),
	keterangan: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const deliveryOrderItem = pgTable("delivery_order_item", {
	id: text().primaryKey().notNull(),
	deliveryOrderId: text("delivery_order_id").notNull(),
	barangId: text("barang_id").notNull(),
	jumlah: integer().notNull(),
	keterangan: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const grnItem = pgTable("grn_item", {
	id: text().primaryKey().notNull(),
	grnId: text("grn_id").notNull(),
	barangId: text("barang_id").notNull(),
	jumlah: integer().notNull(),
	keterangan: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const returPenjualanItem = pgTable("retur_penjualan_item", {
	id: text().primaryKey().notNull(),
	returPenjualanId: text("retur_penjualan_id").notNull(),
	barangId: text("barang_id").notNull(),
	jumlah: integer().notNull(),
	keterangan: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const returPenjualanDocument = pgTable("retur_penjualan_document", {
	id: text().primaryKey().notNull(),
	returPenjualanId: text("retur_penjualan_id").notNull(),
	fileName: text("file_name").notNull(),
	fileUrl: text("file_url").notNull(),
	uploadedAt: timestamp("uploaded_at", { mode: 'string' }).defaultNow().notNull(),
});

export const returPembelianItem = pgTable("retur_pembelian_item", {
	id: text().primaryKey().notNull(),
	returPembelianId: text("retur_pembelian_id").notNull(),
	barangId: text("barang_id").notNull(),
	jumlah: integer().notNull(),
	keterangan: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const returPembelianDocument = pgTable("retur_pembelian_document", {
	id: text().primaryKey().notNull(),
	returPembelianId: text("retur_pembelian_id").notNull(),
	fileName: text("file_name").notNull(),
	fileUrl: text("file_url").notNull(),
	uploadedAt: timestamp("uploaded_at", { mode: 'string' }).defaultNow().notNull(),
});

export const negoiasi = pgTable("negoiasi", {
	id: text().primaryKey().notNull(),
	quotationId: text("quotation_id").notNull(),
	tanggal: timestamp({ mode: 'string' }).notNull(),
	keterangan: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	nomor: text().notNull(),
	status: text().default('draft').notNull(),
}, (table) => [
	unique("negoiasi_nomor_unique").on(table.nomor),
]);

export const purchaseRequest = pgTable("purchase_request", {
	id: text().primaryKey().notNull(),
	salesOrderId: text("sales_order_id"),
	tanggal: timestamp({ mode: 'string' }).notNull(),
	keterangan: text(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	nomor: text().notNull(),
	status: text().default('draft').notNull(),
}, (table) => [
	unique("purchase_request_nomor_unique").on(table.nomor),
]);

export const purchaseOrder = pgTable("purchase_order", {
	id: text().primaryKey().notNull(),
	supplierId: text("supplier_id").notNull(),
	purchaseRequestId: text("purchase_request_id"),
	tanggal: timestamp({ mode: 'string' }).notNull(),
	termsOfPayment: text("terms_of_payment"),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	nomor: text().notNull(),
	status: text().default('draft').notNull(),
}, (table) => [
	unique("purchase_order_nomor_unique").on(table.nomor),
]);

export const returPenjualan = pgTable("retur_penjualan", {
	id: text().primaryKey().notNull(),
	deliveryOrderId: text("delivery_order_id"),
	customerId: text("customer_id").notNull(),
	tanggal: timestamp({ mode: 'string' }).notNull(),
	keterangan: text(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	nomor: text().notNull(),
	status: text().default('draft').notNull(),
}, (table) => [
	unique("retur_penjualan_nomor_unique").on(table.nomor),
]);

export const purchaseRequestItem = pgTable("purchase_request_item", {
	id: text().primaryKey().notNull(),
	purchaseRequestId: text("purchase_request_id").notNull(),
	barangId: text("barang_id").notNull(),
	jumlah: integer().notNull(),
	keterangan: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const purchaseOrderItem = pgTable("purchase_order_item", {
	id: text().primaryKey().notNull(),
	purchaseOrderId: text("purchase_order_id").notNull(),
	barangId: text("barang_id").notNull(),
	jumlah: integer().notNull(),
	hargaSatuan: real("harga_satuan").notNull(),
	linkProduk: text("link_produk"),
	namaToko: text("nama_toko"),
	marketplace: text(),
	noResi: text("no_resi"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const purchaseReceivingItem = pgTable("purchase_receiving_item", {
	id: text().primaryKey().notNull(),
	purchaseReceivingId: text("purchase_receiving_id").notNull(),
	barangId: text("barang_id").notNull(),
	jumlah: integer().notNull(),
	keterangan: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const invoiceItem = pgTable("invoice_item", {
	id: text().primaryKey().notNull(),
	invoiceId: text("invoice_id").notNull(),
	barangId: text("barang_id").notNull(),
	harga: real().notNull(),
	diskon: real().default(0),
	ppn: real(),
	pph: real(),
	jumlah: integer().notNull(),
	keterangan: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const invoiceDocument = pgTable("invoice_document", {
	id: text().primaryKey().notNull(),
	invoiceId: text("invoice_id").notNull(),
	documentType: text("document_type").notNull(),
	fileName: text("file_name").notNull(),
	fileUrl: text("file_url").notNull(),
	uploadedAt: timestamp("uploaded_at", { mode: 'string' }).defaultNow().notNull(),
});

export const fakturPajakItem = pgTable("faktur_pajak_item", {
	id: text().primaryKey().notNull(),
	fakturPajakId: text("faktur_pajak_id").notNull(),
	invoiceItemId: text("invoice_item_id").notNull(),
	harga: real().notNull(),
	dpp: real().notNull(),
	ppn: real().notNull(),
	pph: real(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const kwitansiItem = pgTable("kwitansi_item", {
	id: text().primaryKey().notNull(),
	kwitansiId: text("kwitansi_id").notNull(),
	invoiceItemId: text("invoice_item_id").notNull(),
	jumlah: real().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const stok = pgTable("stok", {
	id: text().primaryKey().notNull(),
	barangId: text("barang_id").notNull(),
	gudangId: text("gudang_id"),
	jumlah: integer().notNull(),
	lastMutasi: timestamp("last_mutasi", { mode: 'string' }).defaultNow().notNull(),
	keterangan: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const gudang = pgTable("gudang", {
	id: text().primaryKey().notNull(),
	nama: text().notNull(),
	lokasi: text(),
	keterangan: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const jurnalItem = pgTable("jurnal_item", {
	id: text().primaryKey().notNull(),
	jurnalId: text("jurnal_id").notNull(),
	akunId: text("akun_id").notNull(),
	debit: real().default(0).notNull(),
	credit: real().default(0).notNull(),
	keterangan: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const aiSearchResult = pgTable("ai_search_result", {
	id: text().primaryKey().notNull(),
	aiSearchHistoryId: text("ai_search_history_id").notNull(),
	nama: text().notNull(),
	harga: real().notNull(),
	toko: text().notNull(),
	link: text().notNull(),
	marketplace: text().notNull(),
	rating: real(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const aiOcrHistory = pgTable("ai_ocr_history", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	fileName: text("file_name").notNull(),
	fileUrl: text("file_url").notNull(),
	extractedAt: timestamp("extracted_at", { mode: 'string' }).defaultNow().notNull(),
	keterangan: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const rfqItem = pgTable("rfq_item", {
	id: text().primaryKey().notNull(),
	rfqId: text("rfq_id").notNull(),
	barangId: text("barang_id").notNull(),
	jumlah: integer().notNull(),
	satuan: text(),
	hargaTarget: real("harga_target"),
	keterangan: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const invoice = pgTable("invoice", {
	id: text().primaryKey().notNull(),
	salesOrderId: text("sales_order_id").notNull(),
	customerId: text("customer_id").notNull(),
	tanggal: timestamp({ mode: 'string' }).notNull(),
	top: text().notNull(),
	ppnRate: real("ppn_rate").default(0.11).notNull(),
	pphRate: real("pph_rate"),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	nomor: text().notNull(),
	status: text().default('draft').notNull(),
}, (table) => [
	unique("invoice_nomor_unique").on(table.nomor),
]);

export const penggajian = pgTable("penggajian", {
	id: text().primaryKey().notNull(),
	karyawanId: text("karyawan_id").notNull(),
	bulan: integer().notNull(),
	tahun: integer().notNull(),
	gajiPokok: real("gaji_pokok").notNull(),
	tunjangan: real().default(0),
	potongan: real().default(0),
	gajiBersih: real("gaji_bersih").notNull(),
	tanggalPembayaran: timestamp("tanggal_pembayaran", { mode: 'string' }),
	keterangan: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	nomor: text().notNull(),
	status: text().default('draft').notNull(),
}, (table) => [
	unique("penggajian_nomor_unique").on(table.nomor),
]);

export const kwitansi = pgTable("kwitansi", {
	id: text().primaryKey().notNull(),
	invoiceId: text("invoice_id").notNull(),
	tanggal: timestamp({ mode: 'string' }).notNull(),
	keterangan: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	nomor: text().notNull(),
	status: text().default('draft').notNull(),
}, (table) => [
	unique("kwitansi_nomor_unique").on(table.nomor),
]);

export const rfq = pgTable("rfq", {
	id: text().primaryKey().notNull(),
	nomor: text().notNull(),
	supplierId: text("supplier_id").notNull(),
	tanggal: timestamp({ mode: 'string' }).notNull(),
	status: text().default('draft').notNull(),
	keterangan: text(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("rfq_nomor_unique").on(table.nomor),
]);

export const rfqPic = pgTable("rfq_pic", {
	id: text().primaryKey().notNull(),
	rfqId: text("rfq_id").notNull(),
	customerPicId: text("customer_pic_id").notNull(),
	assignedAt: timestamp("assigned_at", { mode: 'string' }).defaultNow().notNull(),
});

export const customerPo = pgTable("customer_po", {
	id: text().primaryKey().notNull(),
	customerId: text("customer_id").notNull(),
	quotationId: text("quotation_id"),
	tanggal: timestamp({ mode: 'string' }).notNull(),
	termsOfPayment: text("terms_of_payment"),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	nomor: text().notNull(),
	nomorPoCustomer: text("nomor_po_customer"),
	status: text().default('draft').notNull(),
}, (table) => [
	unique("customer_po_nomor_unique").on(table.nomor),
]);

export const salesOrder = pgTable("sales_order", {
	id: text().primaryKey().notNull(),
	customerPoId: text("customer_po_id"),
	diId: text("di_id"),
	tanggal: timestamp({ mode: 'string' }).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	nomor: text().notNull(),
	status: text().default('draft').notNull(),
}, (table) => [
	unique("sales_order_nomor_unique").on(table.nomor),
]);

export const deliveryOrder = pgTable("delivery_order", {
	id: text().primaryKey().notNull(),
	salesOrderId: text("sales_order_id").notNull(),
	tanggal: timestamp({ mode: 'string' }).notNull(),
	status: text().default('draft').notNull(),
	keterangan: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	nomor: text().notNull(),
}, (table) => [
	unique("delivery_order_nomor_unique").on(table.nomor),
]);

export const purchaseReceiving = pgTable("purchase_receiving", {
	id: text().primaryKey().notNull(),
	purchaseOrderId: text("purchase_order_id").notNull(),
	tanggal: timestamp({ mode: 'string' }).notNull(),
	keterangan: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	nomor: text().notNull(),
	status: text().default('draft').notNull(),
}, (table) => [
	unique("purchase_receiving_nomor_unique").on(table.nomor),
]);

export const grn = pgTable("grn", {
	id: text().primaryKey().notNull(),
	purchaseReceivingId: text("purchase_receiving_id"),
	diId: text("di_id"),
	tanggal: timestamp({ mode: 'string' }).notNull(),
	keterangan: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	nomor: text().notNull(),
	status: text().default('draft').notNull(),
}, (table) => [
	unique("grn_nomor_unique").on(table.nomor),
]);

export const returPembelian = pgTable("retur_pembelian", {
	id: text().primaryKey().notNull(),
	purchaseOrderId: text("purchase_order_id"),
	supplierId: text("supplier_id").notNull(),
	tanggal: timestamp({ mode: 'string' }).notNull(),
	keterangan: text(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	nomor: text().notNull(),
	status: text().default('draft').notNull(),
}, (table) => [
	unique("retur_pembelian_nomor_unique").on(table.nomor),
]);

export const fakturPajak = pgTable("faktur_pajak", {
	id: text().primaryKey().notNull(),
	invoiceId: text("invoice_id").notNull(),
	nomorFaktur: text("nomor_faktur").notNull(),
	tanggal: timestamp({ mode: 'string' }).notNull(),
	dpp: real().notNull(),
	ppn: real().notNull(),
	pph: real(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	nomor: text().notNull(),
	status: text().default('draft').notNull(),
}, (table) => [
	unique("faktur_pajak_nomor_unique").on(table.nomor),
]);

export const jurnal = pgTable("jurnal", {
	id: text().primaryKey().notNull(),
	tanggal: timestamp({ mode: 'string' }).notNull(),
	keterangan: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	nomor: text().notNull(),
	status: text().default('draft').notNull(),
}, (table) => [
	unique("jurnal_nomor_unique").on(table.nomor),
]);

export const stokMutasi = pgTable("stok_mutasi", {
	id: text().primaryKey().notNull(),
	barangId: text("barang_id").notNull(),
	gudangId: text("gudang_id"),
	tipe: text().notNull(),
	jumlah: integer().notNull(),
	saldoSebelum: integer("saldo_sebelum").default(0).notNull(),
	saldoSesudah: integer("saldo_sesudah").default(0).notNull(),
	refJenis: text("ref_jenis"),
	refId: text("ref_id"),
	keterangan: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	createdBy: text("created_by"),
});

export const rfqDocument = pgTable("rfq_document", {
	id: text().primaryKey().notNull(),
	rfqId: text("rfq_id").notNull(),
	fileName: text("file_name").notNull(),
	fileUrl: text("file_url").notNull(),
	uploadedAt: timestamp("uploaded_at", { mode: 'string' }).defaultNow().notNull(),
});

export const aiNegoHistory = pgTable("ai_nego_history", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	quotationId: text("quotation_id"),
	userId: uuid("user_id").notNull(),
	barangId: text("barang_id"),
	prompt: jsonb().notNull(),
	response: jsonb().notNull(),
	reasoningChain: text("reasoning_chain"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	hargaDimintaan: bigint("harga_dimintaan", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	hargaCounter: bigint("harga_counter", { mode: "number" }),
	marginPercent: numeric("margin_percent", { precision: 5, scale:  2 }),
	recommendation: text(),
	approvalLevel: text("approval_level"),
	riskScore: numeric("risk_score", { precision: 3, scale:  1 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_ai_nego_history_created_at").using("btree", table.createdAt.desc().nullsFirst().op("timestamptz_ops")),
	index("idx_ai_nego_history_quotation_id").using("btree", table.quotationId.asc().nullsLast().op("text_ops")),
	index("idx_ai_nego_history_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	pgPolicy("Users can insert own nego history", { as: "permissive", for: "insert", to: ["public"], withCheck: sql`(auth.uid() = user_id)`  }),
	pgPolicy("Users can view own nego history", { as: "permissive", for: "select", to: ["public"] }),
	check("ai_nego_history_approval_level_check", sql`approval_level = ANY (ARRAY['sales'::text, 'manager'::text, 'owner'::text])`),
	check("ai_nego_history_recommendation_check", sql`recommendation = ANY (ARRAY['ACCEPT'::text, 'COUNTER'::text, 'REJECT'::text])`),
]);

export const aiDataHistory = pgTable("ai_data_history", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	agentType: text("agent_type").default('data-agent'),
	userId: uuid("user_id").notNull(),
	taskType: text("task_type").notNull(),
	prompt: jsonb().notNull(),
	response: jsonb().notNull(),
	tokensUsed: integer("tokens_used"),
	latencyMs: integer("latency_ms"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_ai_data_history_created_at").using("btree", table.createdAt.desc().nullsFirst().op("timestamptz_ops")),
	index("idx_ai_data_history_task_type").using("btree", table.taskType.asc().nullsLast().op("text_ops")),
	index("idx_ai_data_history_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	pgPolicy("Users can insert own data history", { as: "permissive", for: "insert", to: ["public"], withCheck: sql`(auth.uid() = user_id)`  }),
	pgPolicy("Users can view own data history", { as: "permissive", for: "select", to: ["public"] }),
]);

export const aiVisionHistory = pgTable("ai_vision_history", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	agentType: text("agent_type").default('vision-agent'),
	userId: uuid("user_id").notNull(),
	fileName: text("file_name"),
	fileUrl: text("file_url"),
	sourceType: text("source_type"),
	extractedData: jsonb("extracted_data").notNull(),
	confidenceScore: numeric("confidence_score", { precision: 3, scale:  2 }),
	modelUsed: text("model_used"),
	tokensUsed: integer("tokens_used"),
	latencyMs: integer("latency_ms"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_ai_vision_history_created_at").using("btree", table.createdAt.desc().nullsFirst().op("timestamptz_ops")),
	index("idx_ai_vision_history_source_type").using("btree", table.sourceType.asc().nullsLast().op("text_ops")),
	index("idx_ai_vision_history_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	pgPolicy("Users can insert own vision history", { as: "permissive", for: "insert", to: ["public"], withCheck: sql`(auth.uid() = user_id)`  }),
	pgPolicy("Users can view own vision history", { as: "permissive", for: "select", to: ["public"] }),
	check("ai_vision_history_source_type_check", sql`source_type = ANY (ARRAY['kontrak'::text, 'receipt'::text, 'delivery'::text, 'invoice'::text, 'pdf'::text, 'image'::text])`),
]);

export const aiAutomationLog = pgTable("ai_automation_log", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	triggerType: text("trigger_type").notNull(),
	triggerPayload: jsonb("trigger_payload").notNull(),
	agentType: text("agent_type").notNull(),
	result: jsonb(),
	success: boolean().default(true),
	errorMessage: text("error_message"),
	executedBy: uuid("executed_by"),
	executedAt: timestamp("executed_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_ai_automation_log_executed_at").using("btree", table.executedAt.desc().nullsFirst().op("timestamptz_ops")),
	index("idx_ai_automation_log_trigger_type").using("btree", table.triggerType.asc().nullsLast().op("text_ops")),
	pgPolicy("Service role can insert automation logs", { as: "permissive", for: "insert", to: ["public"], withCheck: sql`true`  }),
	pgPolicy("Users can view own automation logs", { as: "permissive", for: "select", to: ["public"] }),
]);

export const supplierKontak = pgTable("supplier_kontak", {
	id: text().primaryKey().notNull(),
	supplierId: text("supplier_id").notNull(),
	nama: text().notNull(),
	jabatan: text(),
	noHp: text("no_hp"),
	email: text(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_supplier_kontak_supplier_id").using("btree", table.supplierId.asc().nullsLast().op("text_ops")),
]);

export const documentCounter = pgTable("document_counter", {
	kodeDokumen: text("kode_dokumen").notNull(),
	tahun: integer().notNull(),
	bulan: integer().notNull(),
	counter: integer().default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	primaryKey({ columns: [table.kodeDokumen, table.tahun, table.bulan], name: "document_counter_kode_dokumen_tahun_bulan_pk"}),
]);
