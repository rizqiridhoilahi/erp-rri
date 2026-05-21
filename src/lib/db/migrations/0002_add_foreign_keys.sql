-- Add foreign key constraints that were defined inline in the original migration
-- but omitted by Drizzle push (no `.references()` calls in TypeScript schemas).

-- user_roles
ALTER TABLE user_roles ADD CONSTRAINT fk_user_roles_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- barang
ALTER TABLE barang ADD CONSTRAINT fk_barang_kategori_id FOREIGN KEY (kategori_id) REFERENCES kategori_barang(id) ON DELETE RESTRICT;

-- customer_pic
ALTER TABLE customer_pic ADD CONSTRAINT fk_customer_pic_customer_id FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE CASCADE;

-- customer_top
ALTER TABLE customer_top ADD CONSTRAINT fk_customer_top_customer_id FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE CASCADE;

-- karyawan
ALTER TABLE karyawan ADD CONSTRAINT fk_karyawan_jabatan_id FOREIGN KEY (jabatan_id) REFERENCES jabatan(id) ON DELETE RESTRICT;

-- coa (self-referencing)
ALTER TABLE coa ADD CONSTRAINT fk_coa_induk_id FOREIGN KEY (induk_id) REFERENCES coa(id) ON DELETE SET NULL;

-- kontrak
ALTER TABLE kontrak ADD CONSTRAINT fk_kontrak_customer_id FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE RESTRICT;

-- kontrak_item
ALTER TABLE kontrak_item ADD CONSTRAINT fk_kontrak_item_kontrak_id FOREIGN KEY (kontrak_id) REFERENCES kontrak(id) ON DELETE CASCADE;
ALTER TABLE kontrak_item ADD CONSTRAINT fk_kontrak_item_barang_id FOREIGN KEY (barang_id) REFERENCES barang(id) ON DELETE RESTRICT;

-- kontrak_file
ALTER TABLE kontrak_file ADD CONSTRAINT fk_kontrak_file_kontrak_id FOREIGN KEY (kontrak_id) REFERENCES kontrak(id) ON DELETE CASCADE;

-- rfq
ALTER TABLE rfq ADD CONSTRAINT fk_rfq_customer_id FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE RESTRICT;

-- rfq_item
ALTER TABLE rfq_item ADD CONSTRAINT fk_rfq_item_rfq_id FOREIGN KEY (rfq_id) REFERENCES rfq(id) ON DELETE CASCADE;
ALTER TABLE rfq_item ADD CONSTRAINT fk_rfq_item_barang_id FOREIGN KEY (barang_id) REFERENCES barang(id) ON DELETE RESTRICT;

-- rfq_pic
ALTER TABLE rfq_pic ADD CONSTRAINT fk_rfq_pic_rfq_id FOREIGN KEY (rfq_id) REFERENCES rfq(id) ON DELETE CASCADE;
ALTER TABLE rfq_pic ADD CONSTRAINT fk_rfq_pic_customer_pic_id FOREIGN KEY (customer_pic_id) REFERENCES customer_pic(id) ON DELETE RESTRICT;

-- quotation
ALTER TABLE quotation ADD CONSTRAINT fk_quotation_customer_id FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE RESTRICT;

-- quotation_item
ALTER TABLE quotation_item ADD CONSTRAINT fk_quotation_item_quotation_id FOREIGN KEY (quotation_id) REFERENCES quotation(id) ON DELETE CASCADE;
ALTER TABLE quotation_item ADD CONSTRAINT fk_quotation_item_barang_id FOREIGN KEY (barang_id) REFERENCES barang(id) ON DELETE RESTRICT;

-- quotation_pic
ALTER TABLE quotation_pic ADD CONSTRAINT fk_quotation_pic_quotation_id FOREIGN KEY (quotation_id) REFERENCES quotation(id) ON DELETE CASCADE;
ALTER TABLE quotation_pic ADD CONSTRAINT fk_quotation_pic_customer_pic_id FOREIGN KEY (customer_pic_id) REFERENCES customer_pic(id) ON DELETE RESTRICT;

-- negoiasi
ALTER TABLE negoiasi ADD CONSTRAINT fk_negoiasi_quotation_id FOREIGN KEY (quotation_id) REFERENCES quotation(id) ON DELETE CASCADE;

-- negoiasi_item
ALTER TABLE negoiasi_item ADD CONSTRAINT fk_negoiasi_item_negoiasi_id FOREIGN KEY (negoiasi_id) REFERENCES negoiasi(id) ON DELETE CASCADE;
ALTER TABLE negoiasi_item ADD CONSTRAINT fk_negoiasi_item_quotation_item_id FOREIGN KEY (quotation_item_id) REFERENCES quotation_item(id) ON DELETE RESTRICT;

-- customer_po
ALTER TABLE customer_po ADD CONSTRAINT fk_customer_po_customer_id FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE RESTRICT;
ALTER TABLE customer_po ADD CONSTRAINT fk_customer_po_quotation_id FOREIGN KEY (quotation_id) REFERENCES quotation(id) ON DELETE SET NULL;

-- customer_po_item
ALTER TABLE customer_po_item ADD CONSTRAINT fk_customer_po_item_customer_po_id FOREIGN KEY (customer_po_id) REFERENCES customer_po(id) ON DELETE CASCADE;
ALTER TABLE customer_po_item ADD CONSTRAINT fk_customer_po_item_barang_id FOREIGN KEY (barang_id) REFERENCES barang(id) ON DELETE RESTRICT;

-- customer_po_pic
ALTER TABLE customer_po_pic ADD CONSTRAINT fk_customer_po_pic_customer_po_id FOREIGN KEY (customer_po_id) REFERENCES customer_po(id) ON DELETE CASCADE;
ALTER TABLE customer_po_pic ADD CONSTRAINT fk_customer_po_pic_customer_pic_id FOREIGN KEY (customer_pic_id) REFERENCES customer_pic(id) ON DELETE RESTRICT;

-- di
ALTER TABLE di ADD CONSTRAINT fk_di_customer_id FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE RESTRICT;
ALTER TABLE di ADD CONSTRAINT fk_di_kontrak_id FOREIGN KEY (kontrak_id) REFERENCES kontrak(id) ON DELETE SET NULL;

-- di_item
ALTER TABLE di_item ADD CONSTRAINT fk_di_item_di_id FOREIGN KEY (di_id) REFERENCES di(id) ON DELETE CASCADE;
ALTER TABLE di_item ADD CONSTRAINT fk_di_item_barang_id FOREIGN KEY (barang_id) REFERENCES barang(id) ON DELETE RESTRICT;

-- di_pic
ALTER TABLE di_pic ADD CONSTRAINT fk_di_pic_di_id FOREIGN KEY (di_id) REFERENCES di(id) ON DELETE CASCADE;
ALTER TABLE di_pic ADD CONSTRAINT fk_di_pic_customer_pic_id FOREIGN KEY (customer_pic_id) REFERENCES customer_pic(id) ON DELETE RESTRICT;

-- sales_order
ALTER TABLE sales_order ADD CONSTRAINT fk_sales_order_customer_po_id FOREIGN KEY (customer_po_id) REFERENCES customer_po(id) ON DELETE SET NULL;
ALTER TABLE sales_order ADD CONSTRAINT fk_sales_order_di_id FOREIGN KEY (di_id) REFERENCES di(id) ON DELETE SET NULL;

-- sales_order_item
ALTER TABLE sales_order_item ADD CONSTRAINT fk_sales_order_item_sales_order_id FOREIGN KEY (sales_order_id) REFERENCES sales_order(id) ON DELETE CASCADE;
ALTER TABLE sales_order_item ADD CONSTRAINT fk_sales_order_item_barang_id FOREIGN KEY (barang_id) REFERENCES barang(id) ON DELETE RESTRICT;

-- delivery_order
ALTER TABLE delivery_order ADD CONSTRAINT fk_delivery_order_sales_order_id FOREIGN KEY (sales_order_id) REFERENCES sales_order(id) ON DELETE RESTRICT;

-- delivery_order_item
ALTER TABLE delivery_order_item ADD CONSTRAINT fk_delivery_order_item_delivery_order_id FOREIGN KEY (delivery_order_id) REFERENCES delivery_order(id) ON DELETE CASCADE;
ALTER TABLE delivery_order_item ADD CONSTRAINT fk_delivery_order_item_barang_id FOREIGN KEY (barang_id) REFERENCES barang(id) ON DELETE RESTRICT;

-- grn
ALTER TABLE grn ADD CONSTRAINT fk_grn_purchase_receiving_id FOREIGN KEY (purchase_receiving_id) REFERENCES purchase_receiving(id) ON DELETE SET NULL;
ALTER TABLE grn ADD CONSTRAINT fk_grn_di_id FOREIGN KEY (di_id) REFERENCES di(id) ON DELETE SET NULL;

-- grn_item
ALTER TABLE grn_item ADD CONSTRAINT fk_grn_item_grn_id FOREIGN KEY (grn_id) REFERENCES grn(id) ON DELETE CASCADE;
ALTER TABLE grn_item ADD CONSTRAINT fk_grn_item_barang_id FOREIGN KEY (barang_id) REFERENCES barang(id) ON DELETE RESTRICT;

-- retur_penjualan
ALTER TABLE retur_penjualan ADD CONSTRAINT fk_retur_penjualan_delivery_order_id FOREIGN KEY (delivery_order_id) REFERENCES delivery_order(id) ON DELETE SET NULL;
ALTER TABLE retur_penjualan ADD CONSTRAINT fk_retur_penjualan_customer_id FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE RESTRICT;

-- retur_penjualan_item
ALTER TABLE retur_penjualan_item ADD CONSTRAINT fk_retur_penjualan_item_retur_penjualan_id FOREIGN KEY (retur_penjualan_id) REFERENCES retur_penjualan(id) ON DELETE CASCADE;
ALTER TABLE retur_penjualan_item ADD CONSTRAINT fk_retur_penjualan_item_barang_id FOREIGN KEY (barang_id) REFERENCES barang(id) ON DELETE RESTRICT;

-- retur_penjualan_document
ALTER TABLE retur_penjualan_document ADD CONSTRAINT fk_retur_penjualan_document_retur_penjualan_id FOREIGN KEY (retur_penjualan_id) REFERENCES retur_penjualan(id) ON DELETE CASCADE;

-- retur_pembelian
ALTER TABLE retur_pembelian ADD CONSTRAINT fk_retur_pembelian_purchase_order_id FOREIGN KEY (purchase_order_id) REFERENCES purchase_order(id) ON DELETE SET NULL;
ALTER TABLE retur_pembelian ADD CONSTRAINT fk_retur_pembelian_supplier_id FOREIGN KEY (supplier_id) REFERENCES supplier(id) ON DELETE RESTRICT;

-- retur_pembelian_item
ALTER TABLE retur_pembelian_item ADD CONSTRAINT fk_retur_pembelian_item_retur_pembelian_id FOREIGN KEY (retur_pembelian_id) REFERENCES retur_pembelian(id) ON DELETE CASCADE;
ALTER TABLE retur_pembelian_item ADD CONSTRAINT fk_retur_pembelian_item_barang_id FOREIGN KEY (barang_id) REFERENCES barang(id) ON DELETE RESTRICT;

-- retur_pembelian_document
ALTER TABLE retur_pembelian_document ADD CONSTRAINT fk_retur_pembelian_document_retur_pembelian_id FOREIGN KEY (retur_pembelian_id) REFERENCES retur_pembelian(id) ON DELETE CASCADE;

-- purchase_request
ALTER TABLE purchase_request ADD CONSTRAINT fk_purchase_request_sales_order_id FOREIGN KEY (sales_order_id) REFERENCES sales_order(id) ON DELETE SET NULL;

-- purchase_request_item
ALTER TABLE purchase_request_item ADD CONSTRAINT fk_purchase_request_item_purchase_request_id FOREIGN KEY (purchase_request_id) REFERENCES purchase_request(id) ON DELETE CASCADE;
ALTER TABLE purchase_request_item ADD CONSTRAINT fk_purchase_request_item_barang_id FOREIGN KEY (barang_id) REFERENCES barang(id) ON DELETE RESTRICT;

-- purchase_order
ALTER TABLE purchase_order ADD CONSTRAINT fk_purchase_order_supplier_id FOREIGN KEY (supplier_id) REFERENCES supplier(id) ON DELETE RESTRICT;
ALTER TABLE purchase_order ADD CONSTRAINT fk_purchase_order_purchase_request_id FOREIGN KEY (purchase_request_id) REFERENCES purchase_request(id) ON DELETE SET NULL;

-- purchase_order_item
ALTER TABLE purchase_order_item ADD CONSTRAINT fk_purchase_order_item_purchase_order_id FOREIGN KEY (purchase_order_id) REFERENCES purchase_order(id) ON DELETE CASCADE;
ALTER TABLE purchase_order_item ADD CONSTRAINT fk_purchase_order_item_barang_id FOREIGN KEY (barang_id) REFERENCES barang(id) ON DELETE RESTRICT;

-- purchase_receiving
ALTER TABLE purchase_receiving ADD CONSTRAINT fk_purchase_receiving_purchase_order_id FOREIGN KEY (purchase_order_id) REFERENCES purchase_order(id) ON DELETE RESTRICT;

-- purchase_receiving_item
ALTER TABLE purchase_receiving_item ADD CONSTRAINT fk_purchase_receiving_item_purchase_receiving_id FOREIGN KEY (purchase_receiving_id) REFERENCES purchase_receiving(id) ON DELETE CASCADE;
ALTER TABLE purchase_receiving_item ADD CONSTRAINT fk_purchase_receiving_item_barang_id FOREIGN KEY (barang_id) REFERENCES barang(id) ON DELETE RESTRICT;

-- invoice
ALTER TABLE invoice ADD CONSTRAINT fk_invoice_sales_order_id FOREIGN KEY (sales_order_id) REFERENCES sales_order(id) ON DELETE RESTRICT;
ALTER TABLE invoice ADD CONSTRAINT fk_invoice_customer_id FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE RESTRICT;

-- invoice_item
ALTER TABLE invoice_item ADD CONSTRAINT fk_invoice_item_invoice_id FOREIGN KEY (invoice_id) REFERENCES invoice(id) ON DELETE CASCADE;
ALTER TABLE invoice_item ADD CONSTRAINT fk_invoice_item_barang_id FOREIGN KEY (barang_id) REFERENCES barang(id) ON DELETE RESTRICT;

-- invoice_document
ALTER TABLE invoice_document ADD CONSTRAINT fk_invoice_document_invoice_id FOREIGN KEY (invoice_id) REFERENCES invoice(id) ON DELETE CASCADE;

-- faktur_pajak
ALTER TABLE faktur_pajak ADD CONSTRAINT fk_faktur_pajak_invoice_id FOREIGN KEY (invoice_id) REFERENCES invoice(id) ON DELETE RESTRICT;

-- faktur_pajak_item
ALTER TABLE faktur_pajak_item ADD CONSTRAINT fk_faktur_pajak_item_faktur_pajak_id FOREIGN KEY (faktur_pajak_id) REFERENCES faktur_pajak(id) ON DELETE CASCADE;
ALTER TABLE faktur_pajak_item ADD CONSTRAINT fk_faktur_pajak_item_invoice_item_id FOREIGN KEY (invoice_item_id) REFERENCES invoice_item(id) ON DELETE RESTRICT;

-- kwitansi
ALTER TABLE kwitansi ADD CONSTRAINT fk_kwitansi_invoice_id FOREIGN KEY (invoice_id) REFERENCES invoice(id) ON DELETE RESTRICT;

-- kwitansi_item
ALTER TABLE kwitansi_item ADD CONSTRAINT fk_kwitansi_item_kwitansi_id FOREIGN KEY (kwitansi_id) REFERENCES kwitansi(id) ON DELETE CASCADE;
ALTER TABLE kwitansi_item ADD CONSTRAINT fk_kwitansi_item_invoice_item_id FOREIGN KEY (invoice_item_id) REFERENCES invoice_item(id) ON DELETE RESTRICT;

-- stok
ALTER TABLE stok ADD CONSTRAINT fk_stok_barang_id FOREIGN KEY (barang_id) REFERENCES barang(id) ON DELETE RESTRICT;
ALTER TABLE stok ADD CONSTRAINT fk_stok_gudang_id FOREIGN KEY (gudang_id) REFERENCES gudang(id) ON DELETE SET NULL;

-- jurnal_item
ALTER TABLE jurnal_item ADD CONSTRAINT fk_jurnal_item_jurnal_id FOREIGN KEY (jurnal_id) REFERENCES jurnal(id) ON DELETE CASCADE;
ALTER TABLE jurnal_item ADD CONSTRAINT fk_jurnal_item_akun_id FOREIGN KEY (akun_id) REFERENCES coa(id) ON DELETE RESTRICT;

-- absensi
ALTER TABLE absensi ADD CONSTRAINT fk_absensi_karyawan_id FOREIGN KEY (karyawan_id) REFERENCES karyawan(id) ON DELETE RESTRICT;

-- penggajian
ALTER TABLE penggajian ADD CONSTRAINT fk_penggajian_karyawan_id FOREIGN KEY (karyawan_id) REFERENCES karyawan(id) ON DELETE RESTRICT;

-- ai_search_history
ALTER TABLE ai_search_history ADD CONSTRAINT fk_ai_search_history_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- ai_search_result
ALTER TABLE ai_search_result ADD CONSTRAINT fk_ai_search_result_ai_search_history_id FOREIGN KEY (ai_search_history_id) REFERENCES ai_search_history(id) ON DELETE CASCADE;

-- ai_ocr_history
ALTER TABLE ai_ocr_history ADD CONSTRAINT fk_ai_ocr_history_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- audit_log
ALTER TABLE audit_log ADD CONSTRAINT fk_audit_log_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- whatsapp_log
ALTER TABLE whatsapp_log ADD CONSTRAINT fk_whatsapp_log_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
