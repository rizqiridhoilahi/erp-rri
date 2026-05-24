export interface QueryPattern {
  id: string
  category: string
  intentName: string
  exampleQuery: string
  sql: string
  params: string[]
  description: string
}

export const queryLibrary: QueryPattern[] = [
  // === A. INVOICE & AR ===
  {
    id: 'INV001',
    category: 'INVOICE',
    intentName: 'INVOICE_STATUS',
    exampleQuery: 'Status invoice INV/2026/05/0001?',
    sql: `SELECT i.*, c.nama as customer_nama
FROM invoice i
JOIN customer c ON i.customer_id = c.id
WHERE i.nomor = $1`,
    params: ['nomor_invoice'],
    description: 'Melihat status dan detail sebuah invoice berdasarkan nomor',
  },
  {
    id: 'INV002',
    category: 'INVOICE',
    intentName: 'INVOICE_LIST_PENDING',
    exampleQuery: 'List invoice yang belum lunas?',
    sql: `SELECT i.nomor, i.tanggal, i.status, c.nama as customer_nama, SUM(ii.harga * ii.jumlah) as total
FROM invoice i
JOIN customer c ON i.customer_id = c.id
JOIN invoice_item ii ON i.id = ii.invoice_id
WHERE i.status != 'paid' AND i.is_active = true
GROUP BY i.id, c.nama
ORDER BY i.tanggal`,
    params: [],
    description: 'Menampilkan semua invoice yang statusnya belum lunas',
  },
  {
    id: 'INV003',
    category: 'INVOICE',
    intentName: 'INVOICE_OVERDUE_LIST',
    exampleQuery: 'Invoice overdue berapa banyak?',
    sql: `SELECT i.nomor, i.tanggal, c.nama as customer_nama, i.top,
  EXTRACT(DAY FROM (NOW() - (i.tanggal + INTERVAL '30 days')))::int as overdue_days
FROM invoice i
JOIN customer c ON i.customer_id = c.id
WHERE i.status != 'paid' AND i.tanggal + INTERVAL '30 days' < NOW()
ORDER BY overdue_days DESC`,
    params: [],
    description: 'Menampilkan invoice yang sudah overdue (lewat jatuh tempo 30 hari)',
  },
  {
    id: 'INV004',
    category: 'INVOICE',
    intentName: 'AR_TOTAL_CUSTOMER',
    exampleQuery: 'Total AR customer ABC?',
    sql: `SELECT c.nama, SUM(ii.harga * ii.jumlah * (1 + COALESCE(ii.ppn, 0))) as total_ar
FROM invoice i
JOIN customer c ON i.customer_id = c.id
JOIN invoice_item ii ON i.id = ii.invoice_id
WHERE c.kode = $1 AND i.status != 'paid'
GROUP BY c.nama`,
    params: ['kode_customer'],
    description: 'Menampilkan total piutang (AR) untuk satu customer',
  },
  {
    id: 'INV005',
    category: 'INVOICE',
    intentName: 'AR_TOTAL_ALL',
    exampleQuery: 'Total AR seluruhnya?',
    sql: `SELECT SUM(ii.harga * ii.jumlah * (1 + COALESCE(ii.ppn, 0))) as total_ar
FROM invoice i
JOIN invoice_item ii ON i.id = ii.invoice_id
WHERE i.status != 'paid'`,
    params: [],
    description: 'Menampilkan total seluruh piutang yang belum dibayar',
  },
  {
    id: 'INV006',
    category: 'INVOICE',
    intentName: 'INVOICE_BY_DATE_RANGE',
    exampleQuery: 'Invoice bulan Mei 2026?',
    sql: `SELECT i.nomor, i.tanggal, i.status, c.nama as customer_nama,
  SUM(ii.harga * ii.jumlah) as total
FROM invoice i
JOIN customer c ON i.customer_id = c.id
JOIN invoice_item ii ON i.id = ii.invoice_id
WHERE i.tanggal >= $1::date AND i.tanggal < $2::date
GROUP BY i.id, c.nama`,
    params: ['tanggal_mulai', 'tanggal_selesai'],
    description: 'Menampilkan invoice dalam rentang tanggal tertentu',
  },
  {
    id: 'INV007',
    category: 'INVOICE',
    intentName: 'INVOICE_ITEM_DETAIL',
    exampleQuery: 'Detail barang di invoice INV/2026/05/0001?',
    sql: `SELECT b.nama as barang_nama, ii.jumlah, ii.harga, ii.diskon, ii.ppn,
  (ii.harga * ii.jumlah * (1 + COALESCE(ii.ppn, 0))) as subtotal
FROM invoice_item ii
JOIN barang b ON ii.barang_id = b.id
WHERE ii.invoice_id = $1`,
    params: ['invoice_id'],
    description: 'Menampilkan detail item barang dalam sebuah invoice',
  },
  {
    id: 'INV008',
    category: 'INVOICE',
    intentName: 'INVOICE_COUNT_BY_STATUS',
    exampleQuery: 'Berapa invoice per status?',
    sql: `SELECT status, COUNT(*) as count
FROM invoice
WHERE is_active = true
GROUP BY status
ORDER BY count DESC`,
    params: [],
    description: 'Menghitung jumlah invoice berdasarkan statusnya',
  },
  {
    id: 'INV009',
    category: 'INVOICE',
    intentName: 'AR_AGING_REPORT',
    exampleQuery: 'AR aging report?',
    sql: `SELECT c.nama as customer_nama,
  SUM(CASE WHEN i.tanggal < NOW() - INTERVAL '60 days' THEN ii.harga * ii.jumlah ELSE 0 END) as "above_60_days",
  SUM(CASE WHEN i.tanggal >= NOW() - INTERVAL '60 days' AND i.tanggal < NOW() - INTERVAL '30 days' THEN ii.harga * ii.jumlah ELSE 0 END) as "31_to_60_days",
  SUM(CASE WHEN i.tanggal >= NOW() - INTERVAL '30 days' THEN ii.harga * ii.jumlah ELSE 0 END) as "0_to_30_days"
FROM invoice i
JOIN customer c ON i.customer_id = c.id
JOIN invoice_item ii ON i.id = ii.invoice_id
WHERE i.status != 'paid'
GROUP BY c.nama`,
    params: [],
    description: 'AR aging report mengelompokkan piutang berdasarkan umur',
  },
  {
    id: 'INV010',
    category: 'INVOICE',
    intentName: 'KWITANSI_BY_INVOICE',
    exampleQuery: 'Kwitansi untuk invoice INV/2026/05/0001?',
    sql: `SELECT k.nomor, k.tanggal, k.status
FROM kwitansi k
WHERE k.invoice_id = $1`,
    params: ['invoice_id'],
    description: 'Menampilkan kwitansi yang terkait dengan invoice',
  },
  {
    id: 'INV011',
    category: 'INVOICE',
    intentName: 'FAKTUR_PAJAK_BY_INVOICE',
    exampleQuery: 'Faktur pajak untuk invoice INV/2026/05/0001?',
    sql: `SELECT fp.nomor, fp.tanggal, fp.status
FROM faktur_pajak fp
WHERE fp.invoice_id = $1`,
    params: ['invoice_id'],
    description: 'Menampilkan faktur pajak yang terkait dengan invoice',
  },
  {
    id: 'INV012',
    category: 'INVOICE',
    intentName: 'INVOICE_PAYMENT_RATE',
    exampleQuery: 'Berapa payment rate bulan ini?',
    sql: `SELECT
  COUNT(*) as total_invoice,
  COUNT(CASE WHEN i.status = 'paid' THEN 1 END) as paid_invoice,
  ROUND(COUNT(CASE WHEN i.status = 'paid' THEN 1 END)::numeric / NULLIF(COUNT(*), 0) * 100, 2) as payment_rate
FROM invoice i
WHERE i.tanggal >= DATE_TRUNC('month', NOW())`,
    params: [],
    description: 'Menghitung persentase invoice yang sudah dibayar bulan ini',
  },
  {
    id: 'INV013',
    category: 'INVOICE',
    intentName: 'INVOICE_AVERAGE_DSO',
    exampleQuery: 'Average DSO (Days Sales Outstanding)?',
    sql: `SELECT ROUND(AVG(EXTRACT(EPOCH FROM (kw.tanggal - i.tanggal)) / 86400), 2) as avg_dso_days
FROM invoice i
JOIN kwitansi kw ON kw.invoice_id = i.id
WHERE i.status = 'paid'`,
    params: [],
    description: 'Menghitung rata-rata hari pembayaran invoice (DSO)',
  },
  {
    id: 'INV014',
    category: 'INVOICE',
    intentName: 'CUSTOMER_TOP_AR',
    exampleQuery: 'Customer dengan AR terbesar?',
    sql: `SELECT c.nama, SUM(ii.harga * ii.jumlah * (1 + COALESCE(ii.ppn, 0))) as total_ar
FROM invoice i
JOIN customer c ON i.customer_id = c.id
JOIN invoice_item ii ON i.id = ii.invoice_id
WHERE i.status != 'paid'
GROUP BY c.nama
ORDER BY total_ar DESC
LIMIT 10`,
    params: [],
    description: 'Menampilkan 10 customer dengan piutang terbesar',
  },
  {
    id: 'INV015',
    category: 'INVOICE',
    intentName: 'INVOICE_NEGO_HISTORY',
    exampleQuery: 'History negosiasi invoice INV/2026/05/0001?',
    sql: `SELECT nh.decision, nh.counter_price, nh.risk_score, nh.reasoning, nh.created_at
FROM ai_nego_history nh
WHERE nh.entity_type = 'invoice' AND nh.entity_id = $1
ORDER BY nh.created_at DESC`,
    params: ['invoice_id'],
    description: 'Menampilkan history negosiasi AI untuk sebuah invoice',
  },

  // === B. QUOTATION & PRICING ===
  {
    id: 'QUO001',
    category: 'QUOTATION',
    intentName: 'QUOTATION_STATUS',
    exampleQuery: 'Status quotation QTN/2026/05/0001?',
    sql: `SELECT q.*, c.nama as customer_nama
FROM quotation q
JOIN customer c ON q.customer_id = c.id
WHERE q.nomor = $1`,
    params: ['nomor_quotation'],
    description: 'Melihat status dan detail sebuah quotation',
  },
  {
    id: 'QUO002',
    category: 'QUOTATION',
    intentName: 'QUOTATION_PENDING',
    exampleQuery: 'Quotation yang masih draft/open?',
    sql: `SELECT q.nomor, q.tanggal, q.status, c.nama as customer_nama
FROM quotation q
JOIN customer c ON q.customer_id = c.id
WHERE q.status IN ('draft', 'sent') AND q.is_active = true
ORDER BY q.tanggal DESC`,
    params: [],
    description: 'Menampilkan quotation yang masih diproses',
  },
  {
    id: 'QUO003',
    category: 'QUOTATION',
    intentName: 'QUOTATION_EXPIRED',
    exampleQuery: 'Quotation yang sudah expired?',
    sql: `SELECT q.nomor, q.tanggal, q.status, c.nama as customer_nama,
  (NOW() - q.tanggal)::interval as age
FROM quotation q
JOIN customer c ON q.customer_id = c.id
WHERE q.status = 'sent' AND q.tanggal < NOW() - INTERVAL '30 days'
ORDER BY q.tanggal`,
    params: [],
    description: 'Menampilkan quotation yang sudah expired (lebih dari 30 hari)',
  },
  {
    id: 'QUO004',
    category: 'QUOTATION',
    intentName: 'QUOTATION_ITEM_DETAIL',
    exampleQuery: 'Barang di quotation QTN/2026/05/0001?',
    sql: `SELECT b.nama as barang_nama, qi.jumlah, qi.harga_satuan, qi.diskon,
  qi.ppn_per_item,
  (qi.harga_satuan * qi.jumlah * (1 + COALESCE(qi.ppn_per_item, 0))) as subtotal
FROM quotation_item qi
JOIN barang b ON qi.barang_id = b.id
WHERE qi.quotation_id = $1`,
    params: ['quotation_id'],
    description: 'Menampilkan item barang dalam sebuah quotation',
  },
  {
    id: 'QUO005',
    category: 'QUOTATION',
    intentName: 'QUOTATION_CONVERSION_RATE',
    exampleQuery: 'Berapa conversion rate quotation ke sales order?',
    sql: `SELECT
  COUNT(DISTINCT q.id) as total_quotation,
  COUNT(DISTINCT so.id) as converted_to_so,
  ROUND(COUNT(DISTINCT so.id)::numeric / NULLIF(COUNT(DISTINCT q.id), 0) * 100, 2) as conversion_rate
FROM quotation q
LEFT JOIN customer_po cpo ON cpo.quotation_id = q.id
LEFT JOIN sales_order so ON so.customer_po_id = cpo.id`,
    params: [],
    description: 'Menghitung persentase quotation yang menjadi sales order',
  },
  {
    id: 'QUO006',
    category: 'QUOTATION',
    intentName: 'QUOTATION_VALUE_PENDING',
    exampleQuery: 'Total nilai quotation pending?',
    sql: `SELECT SUM(qi.harga_satuan * qi.jumlah * (1 + COALESCE(qi.ppn_per_item, 0))) as total_pending
FROM quotation q
JOIN quotation_item qi ON q.id = qi.quotation_id
WHERE q.status IN ('draft', 'sent')`,
    params: [],
    description: 'Total nilai dari semua quotation yang masih pending',
  },
  {
    id: 'QUO007',
    category: 'QUOTATION',
    intentName: 'QUOTATION_BY_CUSTOMER',
    exampleQuery: 'Quotation untuk customer ABC?',
    sql: `SELECT q.nomor, q.tanggal, q.status,
  SUM(qi.harga_satuan * qi.jumlah) as nilai
FROM quotation q
JOIN quotation_item qi ON q.id = qi.quotation_id
JOIN customer c ON q.customer_id = c.id
WHERE c.kode = $1
GROUP BY q.id, q.nomor, q.tanggal, q.status
ORDER BY q.tanggal DESC`,
    params: ['kode_customer'],
    description: 'Menampilkan semua quotation untuk customer tertentu',
  },
  {
    id: 'QUO009',
    category: 'QUOTATION',
    intentName: 'QUOTATION_AVERAGE_DISCOUNT',
    exampleQuery: 'Average diskon quotation?',
    sql: `SELECT ROUND(AVG(COALESCE(qi.diskon, 0)), 2) as avg_diskon
FROM quotation_item qi`,
    params: [],
    description: 'Menghitung rata-rata diskon yang diberikan di quotation',
  },
  {
    id: 'QUO011',
    category: 'QUOTATION',
    intentName: 'QUOTATION_PRICE_COMPARISON',
    exampleQuery: 'Bandingkan harga quotation vs harga default?',
    sql: `SELECT b.nama as barang_nama, qi.harga_satuan as harga_quotation,
  b.harga_jual_default, ROUND(qi.harga_satuan - b.harga_jual_default, 2) as selisih
FROM quotation_item qi
JOIN barang b ON qi.barang_id = b.id
WHERE qi.quotation_id = $1`,
    params: ['quotation_id'],
    description: 'Membandingkan harga quotation dengan harga jual default barang',
  },
  {
    id: 'QUO012',
    category: 'QUOTATION',
    intentName: 'QUOTATION_VALIDITY_CHECK',
    exampleQuery: 'Quote validity yang hampir expired?',
    sql: `SELECT q.nomor, q.tanggal, c.nama as customer_nama,
  EXTRACT(DAY FROM (NOW() - q.tanggal))::int as days_old
FROM quotation q
JOIN customer c ON q.customer_id = c.id
WHERE q.status = 'sent' AND (NOW() - q.tanggal) > INTERVAL '20 days'
ORDER BY q.tanggal`,
    params: [],
    description: 'Menampilkan quotation yang hampir expired (lebih dari 20 hari)',
  },

  // === C. SALES ORDER & DELIVERY ===
  {
    id: 'SO001',
    category: 'SALES_ORDER',
    intentName: 'SALES_ORDER_STATUS',
    exampleQuery: 'Status sales order SO/2026/05/0001?',
    sql: `SELECT so.*, c.nama as customer_nama
FROM sales_order so
JOIN customer c ON so.customer_id = c.id
WHERE so.nomor = $1`,
    params: ['nomor_so'],
    description: 'Melihat status dan detail sebuah sales order',
  },
  {
    id: 'SO002',
    category: 'SALES_ORDER',
    intentName: 'SALES_ORDER_PENDING_DELIVERY',
    exampleQuery: 'SO yang belum delivery?',
    sql: `SELECT so.nomor, so.tanggal, so.status, c.nama as customer_nama
FROM sales_order so
JOIN customer c ON so.customer_id = c.id
WHERE so.status NOT IN ('delivered', 'completed', 'cancelled')
ORDER BY so.tanggal`,
    params: [],
    description: 'Menampilkan sales order yang belum dikirim',
  },
  {
    id: 'SO003',
    category: 'SALES_ORDER',
    intentName: 'DELIVERY_ORDER_BY_SO',
    exampleQuery: 'Delivery order untuk SO/2026/05/0001?',
    sql: `SELECT do.nomor, do.tanggal, do.status
FROM delivery_order do
WHERE do.sales_order_id = $1`,
    params: ['sales_order_id'],
    description: 'Menampilkan delivery order yang terkait dengan SO',
  },
  {
    id: 'SO004',
    category: 'SALES_ORDER',
    intentName: 'DELIVERY_PENDING',
    exampleQuery: 'Delivery order yang belum selesai?',
    sql: `SELECT do.nomor, do.tanggal, do.status, so.nomor as so_nomor
FROM delivery_order do
JOIN sales_order so ON do.sales_order_id = so.id
WHERE do.status NOT IN ('completed', 'cancelled')`,
    params: [],
    description: 'Menampilkan delivery order yang masih diproses',
  },
  {
    id: 'SO005',
    category: 'SALES_ORDER',
    intentName: 'SALES_ORDER_ITEM_DETAIL',
    exampleQuery: 'Barang di SO/2026/05/0001?',
    sql: `SELECT b.nama as barang_nama, soi.jumlah, soi.harga_satuan,
  (soi.jumlah * soi.harga_satuan) as subtotal
FROM sales_order_item soi
JOIN barang b ON soi.barang_id = b.id
WHERE soi.sales_order_id = $1`,
    params: ['sales_order_id'],
    description: 'Menampilkan item barang dalam sebuah sales order',
  },
  {
    id: 'SO006',
    category: 'SALES_ORDER',
    intentName: 'SALES_ORDER_BY_CUSTOMER',
    exampleQuery: 'SO customer ABC bulan ini?',
    sql: `SELECT so.nomor, so.tanggal, so.status,
  SUM(soi.jumlah * soi.harga_satuan) as nilai
FROM sales_order so
JOIN customer c ON so.customer_id = c.id
JOIN sales_order_item soi ON so.id = soi.sales_order_id
WHERE c.kode = $1 AND DATE_TRUNC('month', so.tanggal) = DATE_TRUNC('month', NOW())
GROUP BY so.id, so.nomor, so.tanggal, so.status`,
    params: ['kode_customer'],
    description: 'Menampilkan sales order customer tertentu bulan ini',
  },
  {
    id: 'SO007',
    category: 'SALES_ORDER',
    intentName: 'SALES_BACKLOG',
    exampleQuery: 'Total backlog penjualan?',
    sql: `SELECT COUNT(*) as backlog_count
FROM sales_order so
WHERE so.status = 'confirmed' AND so.tanggal < NOW()`,
    params: [],
    description: 'Menghitung jumlah sales order yang sudah confirmed tapi belum delivery',
  },
  {
    id: 'SO008',
    category: 'SALES_ORDER',
    intentName: 'DELIVERY_ON_TIME_RATE',
    exampleQuery: 'Delivery on time rate?',
    sql: `SELECT
  COUNT(*) as total_delivery,
  COUNT(CASE WHEN do.tanggal <= so.tanggal + INTERVAL '7 days' THEN 1 END) as on_time,
  ROUND(COUNT(CASE WHEN do.tanggal <= so.tanggal + INTERVAL '7 days' THEN 1 END)::numeric / NULLIF(COUNT(*), 0) * 100, 2) as on_time_rate
FROM delivery_order do
JOIN sales_order so ON do.sales_order_id = so.id
WHERE do.status = 'completed'`,
    params: [],
    description: 'Menghitung persentase delivery yang tepat waktu',
  },
  {
    id: 'SO009',
    category: 'SALES_ORDER',
    intentName: 'DO_ITEM_TRACE',
    exampleQuery: 'Barang apa saja di DO/2026/05/0001?',
    sql: `SELECT b.nama as barang_nama, doi.jumlah, doi.keterangan
FROM delivery_order_item doi
JOIN barang b ON doi.barang_id = b.id
WHERE doi.delivery_order_id = $1`,
    params: ['delivery_order_id'],
    description: 'Menampilkan item barang dalam delivery order',
  },
  {
    id: 'SO010',
    category: 'SALES_ORDER',
    intentName: 'SALES_ORDER_CANCELLED',
    exampleQuery: 'SO yang di-cancel?',
    sql: `SELECT so.nomor, so.tanggal, so.status, c.nama as customer_nama
FROM sales_order so
JOIN customer c ON so.customer_id = c.id
LEFT JOIN delivery_order do ON do.sales_order_id = so.id
WHERE so.status = 'cancelled'
GROUP BY so.id, c.nama
ORDER BY so.tanggal DESC`,
    params: [],
    description: 'Menampilkan sales order yang dibatalkan',
  },

  // === D. PURCHASE & SUPPLIER ===
  {
    id: 'PO001',
    category: 'PURCHASE',
    intentName: 'PO_STATUS',
    exampleQuery: 'Status PO PO/2026/05/0001?',
    sql: `SELECT po.*, s.nama as supplier_nama
FROM purchase_order po
JOIN supplier s ON po.supplier_id = s.id
WHERE po.nomor = $1`,
    params: ['nomor_po'],
    description: 'Melihat status dan detail purchase order',
  },
  {
    id: 'PO002',
    category: 'PURCHASE',
    intentName: 'PO_PENDING_RECEIVE',
    exampleQuery: 'PO yang belum diterima?',
    sql: `SELECT po.nomor, po.tanggal, po.status, s.nama as supplier_nama
FROM purchase_order po
JOIN supplier s ON po.supplier_id = s.id
WHERE po.status NOT IN ('received', 'completed', 'cancelled') AND po.is_active = true`,
    params: [],
    description: 'Menampilkan purchase order yang belum diterima barangnya',
  },
  {
    id: 'PO003',
    category: 'PURCHASE',
    intentName: 'PO_ITEM_DETAIL',
    exampleQuery: 'Barang di PO PO/2026/05/0001?',
    sql: `SELECT b.nama as barang_nama, poi.jumlah, poi.harga_satuan,
  poi.link_produk, poi.marketplace, poi.nama_toko, poi.no_resi
FROM purchase_order_item poi
JOIN barang b ON poi.barang_id = b.id
WHERE poi.purchase_order_id = $1`,
    params: ['purchase_order_id'],
    description: 'Menampilkan item barang dalam purchase order',
  },
  {
    id: 'PO004',
    category: 'PURCHASE',
    intentName: 'SUPPLIER_PERFORMANCE',
    exampleQuery: 'Performance supplier ABC?',
    sql: `SELECT
  s.nama as supplier_nama,
  COUNT(DISTINCT po.id) as total_po,
  COALESCE(SUM(poi.jumlah * poi.harga_satuan), 0) as total_nilai,
  COUNT(DISTINCT gr.id) as total_grn,
  ROUND(AVG(EXTRACT(EPOCH FROM (gr.tanggal - po.tanggal)) / 86400), 2) as avg_lead_time_days
FROM supplier s
LEFT JOIN purchase_order po ON po.supplier_id = s.id AND po.is_active = true
LEFT JOIN purchase_order_item poi ON po.id = poi.purchase_order_id
LEFT JOIN purchase_receiving pr ON pr.purchase_order_id = po.id
LEFT JOIN grn gr ON gr.purchase_receiving_id = pr.id
WHERE s.kode = $1
GROUP BY s.nama`,
    params: ['kode_supplier'],
    description: 'Analisa performa supplier berdasarkan jumlah PO, nilai, dan lead time',
  },
  {
    id: 'PO005',
    category: 'PURCHASE',
    intentName: 'SUPPLIER_LIST',
    exampleQuery: 'List semua supplier aktif?',
    sql: `SELECT kode, nama, kontak, terms_of_payment
FROM supplier
WHERE is_active = true
ORDER BY nama`,
    params: [],
    description: 'Menampilkan semua supplier yang aktif',
  },
  {
    id: 'PO006',
    category: 'PURCHASE',
    intentName: 'TOP_SUPPLIER_BY_SPEND',
    exampleQuery: 'Supplier dengan PO terbesar?',
    sql: `SELECT s.nama, SUM(poi.jumlah * poi.harga_satuan) as total_po
FROM supplier s
JOIN purchase_order po ON po.supplier_id = s.id
JOIN purchase_order_item poi ON po.id = poi.purchase_order_id
WHERE po.is_active = true
GROUP BY s.nama
ORDER BY total_po DESC
LIMIT 10`,
    params: [],
    description: 'Menampilkan 10 supplier dengan nilai PO terbesar',
  },
  {
    id: 'PO007',
    category: 'PURCHASE',
    intentName: 'PO_BY_TERMS',
    exampleQuery: 'PO dengan TOP Net 30?',
    sql: `SELECT po.nomor, po.tanggal, po.status, s.nama as supplier_nama, po.terms_of_payment
FROM purchase_order po
JOIN supplier s ON po.supplier_id = s.id
WHERE po.terms_of_payment LIKE '%Net 30%'`,
    params: [],
    description: 'Menampilkan PO dengan terms of payment Net 30',
  },
  {
    id: 'PO008',
    category: 'PURCHASE',
    intentName: 'GRN_BY_PO',
    exampleQuery: 'GRN untuk PO PO/2026/05/0001?',
    sql: `SELECT g.nomor, g.tanggal, g.status, g.keterangan
FROM grn g
WHERE g.purchase_receiving_id IN (
  SELECT pr.id FROM purchase_receiving pr WHERE pr.purchase_order_id = $1
)`,
    params: ['purchase_order_id'],
    description: 'Menampilkan GRN (Goods Received Note) untuk PO tertentu',
  },
  {
    id: 'PO009',
    category: 'PURCHASE',
    intentName: 'GRN_ITEM_DETAIL',
    exampleQuery: 'Barang yang diterima di GRN GRN/2026/05/0001?',
    sql: `SELECT b.nama as barang_nama, gi.jumlah, gi.harga_satuan, gi.keterangan
FROM grn_item gi
JOIN barang b ON gi.barang_id = b.id
WHERE gi.grn_id = $1`,
    params: ['grn_id'],
    description: 'Menampilkan item barang dalam GRN',
  },
  {
    id: 'PO010',
    category: 'PURCHASE',
    intentName: 'GRN_QUALITY_ISSUE',
    exampleQuery: 'GRN dengan quality issue?',
    sql: `SELECT g.nomor, g.tanggal, g.status, gi.keterangan
FROM grn g
JOIN grn_item gi ON g.id = gi.grn_id
WHERE gi.keterangan ILIKE '%reject%' OR gi.keterangan ILIKE '%quality%' OR gi.keterangan ILIKE '%rusak%'`,
    params: [],
    description: 'Menampilkan GRN yang memiliki masalah kualitas',
  },
  {
    id: 'PO011',
    category: 'PURCHASE',
    intentName: 'PURCHASE_EXPENSE_MONTHLY',
    exampleQuery: 'Total expense pembelian bulan ini?',
    sql: `SELECT COALESCE(SUM(poi.jumlah * poi.harga_satuan), 0) as total_expense
FROM purchase_order po
JOIN purchase_order_item poi ON po.id = poi.purchase_order_id
WHERE DATE_TRUNC('month', po.tanggal) = DATE_TRUNC('month', NOW())
  AND po.status NOT IN ('cancelled')`,
    params: [],
    description: 'Total pengeluaran pembelian bulan ini',
  },
  {
    id: 'PO012',
    category: 'PURCHASE',
    intentName: 'MARKETPLACE_PURCHASE_SUMMARY',
    exampleQuery: 'Pembelian dari marketplace?',
    sql: `SELECT COALESCE(poi.marketplace, 'Langsung') as sumber,
  COUNT(*) as count,
  SUM(poi.jumlah * poi.harga_satuan) as total
FROM purchase_order_item poi
GROUP BY poi.marketplace
ORDER BY total DESC`,
    params: [],
    description: 'Rekap pembelian berdasarkan sumber (marketplace/langsung)',
  },

  // === E. INVENTORY & STOCK ===
  {
    id: 'STK001',
    category: 'STOCK',
    intentName: 'STOK_RENDAH',
    exampleQuery: 'Barang dengan stok rendah?',
    sql: `SELECT b.kode, b.nama, COALESCE(SUM(s.jumlah), 0) as stok_terkini,
  b.stok_minimum,
  (b.stok_minimum - COALESCE(SUM(s.jumlah), 0)) as kekurangan
FROM barang b
LEFT JOIN stok s ON s.barang_id = b.id
WHERE b.is_active = true
GROUP BY b.id
HAVING COALESCE(SUM(s.jumlah), 0) < b.stok_minimum
ORDER BY kekurangan DESC`,
    params: [],
    description: 'Menampilkan barang yang stoknya di bawah minimum',
  },
  {
    id: 'STK002',
    category: 'STOCK',
    intentName: 'STOK_TOTAL_VALUE',
    exampleQuery: 'Total nilai stok?',
    sql: `SELECT COALESCE(SUM(s.jumlah * COALESCE(b.harga_beli_default, 0)), 0) as total_nilai_stok
FROM stok s
JOIN barang b ON s.barang_id = b.id
WHERE s.jumlah > 0`,
    params: [],
    description: 'Menghitung total nilai stok berdasarkan harga beli default',
  },
  {
    id: 'STK003',
    category: 'STOCK',
    intentName: 'STOK_BY_GUDANG',
    exampleQuery: 'Stok di gudang utama?',
    sql: `SELECT b.kode, b.nama, s.jumlah, g.nama as gudang_nama
FROM stok s
JOIN barang b ON s.barang_id = b.id
JOIN gudang g ON s.gudang_id = g.id
WHERE g.nama ILIKE $1`,
    params: ['nama_gudang'],
    description: 'Menampilkan stok barang di gudang tertentu',
  },
  {
    id: 'STK004',
    category: 'STOCK',
    intentName: 'STOK_BARANG_DETAIL',
    exampleQuery: 'Stok barang BRG/001?',
    sql: `SELECT b.kode, b.nama, COALESCE(SUM(s.jumlah), 0) as stok_terkini,
  b.stok_minimum, b.satuan
FROM barang b
LEFT JOIN stok s ON s.barang_id = b.id
WHERE b.kode = $1
GROUP BY b.id`,
    params: ['kode_barang'],
    description: 'Detail stok untuk satu barang tertentu',
  },
  {
    id: 'STK005',
    category: 'STOCK',
    intentName: 'STOK_MUTASI_HISTORY',
    exampleQuery: 'Mutasi stok barang BRG/001?',
    sql: `SELECT sm.tanggal, sm.tipe, sm.jumlah, sm.keterangan
FROM stok_mutasi sm
JOIN barang b ON sm.barang_id = b.id
WHERE b.kode = $1
ORDER BY sm.tanggal DESC
LIMIT 50`,
    params: ['kode_barang'],
    description: 'Riwayat mutasi stok untuk suatu barang',
  },
  {
    id: 'STK006',
    category: 'STOCK',
    intentName: 'STOK_DEAD_INVENTORY',
    exampleQuery: 'Dead stock (tidak bergerak > 90 hari)?',
    sql: `SELECT b.kode, b.nama, COALESCE(SUM(s.jumlah), 0) as stok_terkini,
  MAX(sm.tanggal) as last_mutasi
FROM barang b
JOIN stok s ON s.barang_id = b.id
LEFT JOIN stok_mutasi sm ON sm.barang_id = b.id
WHERE b.is_active = true
GROUP BY b.id
HAVING COALESCE(SUM(s.jumlah), 0) > 0
  AND (MAX(sm.tanggal) IS NULL OR MAX(sm.tanggal) < NOW() - INTERVAL '90 days')`,
    params: [],
    description: 'Menampilkan barang yang tidak bergerak lebih dari 90 hari',
  },
  {
    id: 'STK007',
    category: 'STOCK',
    intentName: 'STOK_REORDER_POINT',
    exampleQuery: 'Barang yang perlu reorder?',
    sql: `SELECT b.kode, b.nama, COALESCE(SUM(s.jumlah), 0) as stok_terkini,
  b.stok_minimum,
  GREATEST(b.stok_minimum - COALESCE(SUM(s.jumlah), 0), 0) as qty_to_order
FROM barang b
LEFT JOIN stok s ON s.barang_id = b.id
WHERE b.is_active = true
GROUP BY b.id
HAVING COALESCE(SUM(s.jumlah), 0) <= b.stok_minimum
ORDER BY qty_to_order DESC`,
    params: [],
    description: 'Menampilkan barang yang perlu direorder (stok <= minimum)',
  },
  {
    id: 'STK008',
    category: 'STOCK',
    intentName: 'STOK_BY_KATEGORI',
    exampleQuery: 'Stok per kategori?',
    sql: `SELECT kb.nama as kategori,
  COALESCE(SUM(s.jumlah), 0) as total_stok,
  COALESCE(SUM(s.jumlah * COALESCE(b.harga_beli_default, 0)), 0) as nilai_stok
FROM kategori_barang kb
LEFT JOIN barang b ON b.kategori_id = kb.id
LEFT JOIN stok s ON s.barang_id = b.id
GROUP BY kb.nama
ORDER BY kb.nama`,
    params: [],
    description: 'Rekap stok dan nilai stok per kategori barang',
  },
  {
    id: 'STK009',
    category: 'STOCK',
    intentName: 'STOK_OPNAME_NEEDED',
    exampleQuery: 'Barang yang perlu stock opname?',
    sql: `SELECT b.kode, b.nama, s.jumlah, s.last_mutasi
FROM stok s
JOIN barang b ON s.barang_id = b.id
WHERE s.last_mutasi < NOW() - INTERVAL '30 days'
ORDER BY s.last_mutasi`,
    params: [],
    description: 'Barang yang sudah lebih 30 hari belum ada mutasi (perlu opname)',
  },
  {
    id: 'STK010',
    category: 'STOCK',
    intentName: 'STOK_OVERSTOCK',
    exampleQuery: 'Overstock (stok > 2x minimum)?',
    sql: `SELECT b.kode, b.nama, COALESCE(SUM(s.jumlah), 0) as stok_terkini, b.stok_minimum
FROM barang b
LEFT JOIN stok s ON s.barang_id = b.id
WHERE b.is_active = true
GROUP BY b.id
HAVING COALESCE(SUM(s.jumlah), 0) > (b.stok_minimum * 2)
ORDER BY stok_terkini DESC`,
    params: [],
    description: 'Menampilkan barang yang overstock (stok > 2x minimum)',
  },

  // === F. CONTRACT & RFQ ===
  {
    id: 'KTR001',
    category: 'CONTRACT',
    intentName: 'KONTRAK_EXPIRY_30',
    exampleQuery: 'Kontrak yang expired dalam 30 hari?',
    sql: `SELECT k.nama, c.nama as customer_nama, k.tanggal_mulai, k.tanggal_selesai,
  EXTRACT(DAY FROM (k.tanggal_selesai - NOW()))::int as days_remaining
FROM kontrak k
JOIN customer c ON k.customer_id = c.id
WHERE k.tanggal_selesai BETWEEN NOW() AND NOW() + INTERVAL '30 days'
  AND k.is_active = true
ORDER BY k.tanggal_selesai`,
    params: [],
    description: 'Menampilkan kontrak yang akan expired dalam 30 hari ke depan',
  },
  {
    id: 'KTR002',
    category: 'CONTRACT',
    intentName: 'KONTRAK_STATUS',
    exampleQuery: 'Status kontrak Kontrak ABC?',
    sql: `SELECT k.*, c.nama as customer_nama
FROM kontrak k
JOIN customer c ON k.customer_id = c.id
WHERE k.nama ILIKE '%' || $1 || '%' AND k.is_active = true`,
    params: ['nama_kontrak'],
    description: 'Mencari kontrak berdasarkan nama',
  },
  {
    id: 'KTR003',
    category: 'CONTRACT',
    intentName: 'KONTRAK_NILAI_AKTIF',
    exampleQuery: 'Nilai kontrak yang aktif?',
    sql: `SELECT k.nama, c.nama as customer_nama,
  COALESCE(SUM(ki.jumlah * ki.harga), 0) as nilai_kontrak
FROM kontrak k
JOIN customer c ON k.customer_id = c.id
LEFT JOIN kontrak_item ki ON k.id = ki.kontrak_id
WHERE k.is_active = true
GROUP BY k.id, c.nama`,
    params: [],
    description: 'Menampilkan nilai total dari kontrak yang masih aktif',
  },
  {
    id: 'KTR004',
    category: 'CONTRACT',
    intentName: 'RFQ_PENDING',
    exampleQuery: 'RFQ yang belum diproses?',
    sql: `SELECT r.nomor, r.tanggal, r.status, s.nama as supplier_nama
FROM rfq r
JOIN supplier s ON r.supplier_id = s.id
WHERE r.status = 'pending' AND r.is_active = true
ORDER BY r.tanggal`,
    params: [],
    description: 'Menampilkan RFQ yang masih pending',
  },
  {
    id: 'KTR005',
    category: 'CONTRACT',
    intentName: 'CONTRACT_RENEWAL_CANDIDATE',
    exampleQuery: 'Kontrak yang perlu di-renew?',
    sql: `SELECT k.id, k.nama, c.nama as customer_nama, k.tanggal_selesai
FROM kontrak k
JOIN customer c ON k.customer_id = c.id
WHERE k.tanggal_selesai < NOW() + INTERVAL '45 days'
  AND k.is_active = true
ORDER BY k.tanggal_selesai`,
    params: [],
    description: 'Kontrak yang perlu direnew (kurang dari 45 hari lagi)',
  },
  {
    id: 'RFQ001',
    category: 'CONTRACT',
    intentName: 'RFQ_BY_SUPPLIER',
    exampleQuery: 'RFQ untuk supplier ABC?',
    sql: `SELECT r.nomor, r.tanggal, r.status
FROM rfq r
JOIN supplier s ON r.supplier_id = s.id
WHERE s.kode = $1 AND r.is_active = true
ORDER BY r.tanggal DESC`,
    params: ['kode_supplier'],
    description: 'Menampilkan RFQ yang dikirim ke supplier tertentu',
  },
  {
    id: 'RFQ002',
    category: 'CONTRACT',
    intentName: 'RFQ_COMPARISON',
    exampleQuery: 'Bandingkan RFQ dari beberapa supplier?',
    sql: `SELECT r.nomor as rfq_nomor, s.nama as supplier_nama,
  ri.barang_id, ri.jumlah, ri.harga_quoted
FROM rfq r
JOIN rfq_item ri ON r.id = ri.rfq_id
JOIN supplier s ON r.supplier_id = s.id
WHERE r.status = 'quoted'`,
    params: [],
    description: 'Membandingkan harga quote dari berbagai supplier',
  },
  {
    id: 'RFQ003',
    category: 'CONTRACT',
    intentName: 'RFQ_ITEM_DETAIL',
    exampleQuery: 'Item di RFQ RFQ/2026/05/0001?',
    sql: `SELECT b.nama as barang_nama, ri.jumlah, ri.harga_quoted, ri.keterangan
FROM rfq_item ri
JOIN barang b ON ri.barang_id = b.id
WHERE ri.rfq_id = $1`,
    params: ['rfq_id'],
    description: 'Menampilkan item barang dalam RFQ',
  },

  // === G. FINANCE & ACCOUNTING ===
  {
    id: 'JUR001',
    category: 'FINANCE',
    intentName: 'JURNAL_BY_DATE',
    exampleQuery: 'Jurnal tanggal 23 Mei 2026?',
    sql: `SELECT j.nomor, j.tanggal, j.keterangan, ji.akun_id,
  a.nama as akun_nama, ji.debit, ji.kredit
FROM jurnal j
JOIN jurnal_item ji ON j.id = ji.jurnal_id
JOIN coa a ON ji.akun_id = a.id
WHERE j.tanggal = $1::date
ORDER BY j.nomor, ji.debit DESC`,
    params: ['tanggal'],
    description: 'Menampilkan jurnal dan itemnya pada tanggal tertentu',
  },
  {
    id: 'JUR002',
    category: 'FINANCE',
    intentName: 'JURNAL_BALANCE',
    exampleQuery: 'Balance umum hari ini?',
    sql: `SELECT a.nama as akun_nama,
  COALESCE(SUM(ji.debit), 0) as total_debit,
  COALESCE(SUM(ji.kredit), 0) as total_kredit,
  COALESCE(SUM(ji.debit - ji.kredit), 0) as saldo
FROM jurnal_item ji
JOIN coa a ON ji.akun_id = a.id
JOIN jurnal j ON ji.jurnal_id = j.id
WHERE j.tanggal <= NOW()
GROUP BY a.nama
ORDER BY a.nama`,
    params: [],
    description: 'Menampilkan balance setiap akun berdasarkan jurnal',
  },
  {
    id: 'JUR003',
    category: 'FINANCE',
    intentName: 'COA_LIST',
    exampleQuery: 'Chart of accounts?',
    sql: `SELECT kode, nama, tipe, is_active
FROM coa
WHERE is_active = true
ORDER BY kode`,
    params: [],
    description: 'Menampilkan daftar chart of accounts',
  },
  {
    id: 'JUR004',
    category: 'FINANCE',
    intentName: 'BUKU_BESAR',
    exampleQuery: 'Buku besar akun 1-1100?',
    sql: `WITH running_balance AS (
  SELECT
    j.tanggal, j.nomor as jurnal_nomor, ji.keterangan,
    ji.debit, ji.kredit,
    SUM(ji.debit - ji.kredit) OVER (ORDER BY j.tanggal, j.id) as saldo
  FROM jurnal_item ji
  JOIN jurnal j ON ji.jurnal_id = j.id
  WHERE ji.akun_id = $1
)
SELECT * FROM running_balance
ORDER BY tanggal`,
    params: ['akun_id'],
    description: 'Menampilkan buku besar dengan running balance untuk suatu akun',
  },
  {
    id: 'JUR005',
    category: 'FINANCE',
    intentName: 'LABA_RUGI',
    exampleQuery: 'Laba rugi bulan ini?',
    sql: `SELECT a.nama as akun_nama, a.tipe,
  SUM(CASE WHEN a.tipe = 'revenue' THEN ji.kredit - ji.debit
       WHEN a.tipe = 'expense' THEN ji.debit - ji.kredit
       ELSE 0 END) as nilai
FROM jurnal_item ji
JOIN coa a ON ji.akun_id = a.id
JOIN jurnal j ON ji.jurnal_id = j.id
WHERE j.tanggal >= DATE_TRUNC('month', NOW())
  AND j.tanggal < DATE_TRUNC('month', NOW()) + INTERVAL '1 month'
  AND a.tipe IN ('revenue', 'expense')
GROUP BY a.nama, a.tipe
ORDER BY a.tipe, a.nama`,
    params: [],
    description: 'Menampilkan laporan laba rugi bulan berjalan',
  },
  {
    id: 'JUR006',
    category: 'FINANCE',
    intentName: 'NERACA',
    exampleQuery: 'Neraca tanggal hari ini?',
    sql: `SELECT a.nama as akun_nama, a.tipe,
  COALESCE(SUM(ji.debit) - SUM(ji.kredit), 0) as saldo
FROM jurnal_item ji
JOIN coa a ON ji.akun_id = a.id
JOIN jurnal j ON ji.jurnal_id = j.id
WHERE j.tanggal <= NOW()
  AND a.tipe IN ('asset', 'liability', 'equity')
GROUP BY a.nama, a.tipe
ORDER BY a.tipe, a.nama`,
    params: [],
    description: 'Menampilkan neraca (asset, liability, equity)',
  },
  {
    id: 'JUR007',
    category: 'FINANCE',
    intentName: 'FAKTUR_PAJAK_WEEKLY',
    exampleQuery: 'Faktur pajak minggu ini?',
    sql: `SELECT fp.nomor, fp.tanggal, i.nomor as invoice_nomor
FROM faktur_pajak fp
LEFT JOIN faktur_pajak_item fpi ON fp.id = fpi.faktur_pajak_id
LEFT JOIN invoice i ON fpi.invoice_id = i.id
WHERE fp.tanggal >= DATE_TRUNC('week', NOW())
ORDER BY fp.tanggal`,
    params: [],
    description: 'Menampilkan faktur pajak yang terbit minggu ini',
  },
  {
    id: 'JUR008',
    category: 'FINANCE',
    intentName: 'TOTAL_HUTANG_SUPPLIER',
    exampleQuery: 'Total hutang supplier?',
    sql: `SELECT s.nama as supplier_nama,
  COALESCE(SUM(poi.jumlah * poi.harga_satuan), 0) as total_hutang
FROM supplier s
JOIN purchase_order po ON po.supplier_id = s.id
JOIN purchase_order_item poi ON po.id = poi.purchase_order_id
WHERE po.status NOT IN ('paid', 'cancelled')
GROUP BY s.nama
ORDER BY total_hutang DESC`,
    params: [],
    description: 'Menampilkan total hutang ke supplier',
  },
  {
    id: 'JUR009',
    category: 'FINANCE',
    intentName: 'RETUR_PENJUALAN_RECENT',
    exampleQuery: 'Retur penjualan minggu ini?',
    sql: `SELECT rp.nomor, rp.tanggal, c.nama as customer_nama,
  COALESCE(SUM(rpi.jumlah * rpi.harga), 0) as nilai
FROM retur_penjualan rp
JOIN customer c ON rp.customer_id = c.id
JOIN retur_penjualan_item rpi ON rp.id = rpi.retur_penjualan_id
WHERE rp.tanggal >= DATE_TRUNC('week', NOW())
GROUP BY rp.id, c.nama
ORDER BY rp.tanggal DESC`,
    params: [],
    description: 'Menampilkan retur penjualan minggu ini',
  },
  {
    id: 'JUR010',
    category: 'FINANCE',
    intentName: 'RETUR_PEMBELIAN_RECENT',
    exampleQuery: 'Retur pembelian minggu ini?',
    sql: `SELECT rpb.nomor, rpb.tanggal, s.nama as supplier_nama,
  COALESCE(SUM(rpbi.jumlah * rpbi.harga), 0) as nilai
FROM retur_pembelian rpb
JOIN supplier s ON rpb.supplier_id = s.id
JOIN retur_pembelian_item rpbi ON rpb.id = rpbi.retur_pembelian_id
WHERE rpb.tanggal >= DATE_TRUNC('week', NOW())
GROUP BY rpb.id, s.nama
ORDER BY rpb.tanggal DESC`,
    params: [],
    description: 'Menampilkan retur pembelian minggu ini',
  },

  // === H. HR & PAYROLL ===
  {
    id: 'HR001',
    category: 'HR',
    intentName: 'ABSENSI_TODAY',
    exampleQuery: 'Absensi hari ini?',
    sql: `SELECT kr.nama, a.status, a.tanggal
FROM absensi a
JOIN karyawan kr ON a.karyawan_id = kr.id
WHERE a.tanggal = CURRENT_DATE`,
    params: [],
    description: 'Menampilkan absensi hari ini',
  },
  {
    id: 'HR002',
    category: 'HR',
    intentName: 'ABSENSI_MONTHLY_EMPLOYEE',
    exampleQuery: 'Absensi karyawan ABC bulan ini?',
    sql: `SELECT a.tanggal, a.status
FROM absensi a
JOIN karyawan kr ON a.karyawan_id = kr.id
WHERE kr.kode = $1
  AND DATE_TRUNC('month', a.tanggal) = DATE_TRUNC('month', NOW())
ORDER BY a.tanggal`,
    params: ['kode_karyawan'],
    description: 'Riwayat absensi seorang karyawan bulan ini',
  },
  {
    id: 'HR003',
    category: 'HR',
    intentName: 'PAYROLL_TAHUNAN',
    exampleQuery: 'Total payroll tahun 2026?',
    sql: `SELECT COALESCE(SUM(pg.gaji_pokok + COALESCE(pg.tunjangan, 0) - COALESCE(pg.potongan, 0)), 0) as total_gaji
FROM penggajian pg
WHERE EXTRACT(YEAR FROM pg.tanggal) = $1`,
    params: ['tahun'],
    description: 'Total penggajian dalam satu tahun',
  },
  {
    id: 'HR004',
    category: 'HR',
    intentName: 'KARYAWAN_AKTIF_COUNT',
    exampleQuery: 'Berapa karyawan aktif?',
    sql: `SELECT COUNT(*) as total_karyawan
FROM karyawan
WHERE is_active = true`,
    params: [],
    description: 'Menghitung jumlah karyawan yang aktif',
  },
  {
    id: 'HR005',
    category: 'HR',
    intentName: 'ABSENSI_RATE',
    exampleQuery: 'Attendance rate bulan ini?',
    sql: `SELECT
  COUNT(*) as total_hari,
  COUNT(CASE WHEN a.status = 'hadir' THEN 1 END) as hadir,
  ROUND(COUNT(CASE WHEN a.status = 'hadir' THEN 1 END)::numeric / NULLIF(COUNT(*), 0) * 100, 2) as attendance_rate
FROM absensi a
WHERE DATE_TRUNC('month', a.tanggal) = DATE_TRUNC('month', NOW())`,
    params: [],
    description: 'Persentase kehadiran bulan ini',
  },

  // === I. AI HISTORY & AUDIT ===
  {
    id: 'AI001',
    category: 'AI',
    intentName: 'AI_NEGO_HISTORY',
    exampleQuery: 'History negosiasi terbaru?',
    sql: `SELECT nh.entity_type, nh.entity_id, nh.decision, nh.counter_price,
  nh.risk_score, nh.created_at
FROM ai_nego_history nh
ORDER BY nh.created_at DESC
LIMIT 20`,
    params: [],
    description: 'Menampilkan history negosiasi AI terbaru',
  },
  {
    id: 'AI002',
    category: 'AI',
    intentName: 'AI_AUTOMATION_LOG_TODAY',
    exampleQuery: 'Automation trigger yang run hari ini?',
    sql: `SELECT al.trigger_type, al.entity_type, al.status, al.created_at
FROM ai_automation_log al
WHERE al.created_at >= CURRENT_DATE
ORDER BY al.created_at DESC`,
    params: [],
    description: 'Log automation trigger yang berjalan hari ini',
  },
  {
    id: 'AI003',
    category: 'AI',
    intentName: 'AI_USAGE_STATS',
    exampleQuery: 'Usage AI agent bulan ini?',
    sql: `SELECT agent_type, COUNT(*) as total_calls
FROM ai_nego_history
WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())
GROUP BY agent_type`,
    params: [],
    description: 'Statistik penggunaan AI agent bulan ini',
  },
  {
    id: 'AI004',
    category: 'AI',
    intentName: 'AI_NEGO_REJECTED',
    exampleQuery: 'Nego yang rejected?',
    sql: `SELECT nh.entity_type, nh.entity_id, nh.risk_score, nh.reasoning, nh.created_at
FROM ai_nego_history nh
WHERE nh.decision = 'rejected'
  AND DATE_TRUNC('month', nh.created_at) = DATE_TRUNC('month', NOW())
ORDER BY nh.created_at DESC`,
    params: [],
    description: 'Negosiasi yang direject oleh AI bulan ini',
  },
  {
    id: 'AI005',
    category: 'AI',
    intentName: 'AUDIT_LOG_RECENT',
    exampleQuery: 'Audit log terbaru?',
    sql: `SELECT al.entity_type, al.entity_id, al.action, al.user_id, al.created_at
FROM audit_log al
ORDER BY al.created_at DESC
LIMIT 50`,
    params: [],
    description: 'Menampilkan audit log terbaru',
  },
  {
    id: 'AI006',
    category: 'AI',
    intentName: 'AI_VISION_RECENT',
    exampleQuery: 'OCR hasil terbaru?',
    sql: `SELECT vh.document_type, vh.status, vh.confidence, vh.created_at
FROM ai_vision_history vh
ORDER BY vh.created_at DESC
LIMIT 20`,
    params: [],
    description: 'Hasil OCR VisionAgent terbaru',
  },

  // === J. CUSTOMER & SALES ANALYTICS ===
  {
    id: 'CUST001',
    category: 'CUSTOMER',
    intentName: 'CUSTOMER_LIST',
    exampleQuery: 'List semua customer aktif?',
    sql: `SELECT kode, nama, alamat, kontak, terms_of_payment
FROM customer
WHERE is_active = true
ORDER BY nama`,
    params: [],
    description: 'Menampilkan semua customer yang aktif',
  },
  {
    id: 'CUST002',
    category: 'CUSTOMER',
    intentName: 'CUSTOMER_TOP',
    exampleQuery: 'TOP customer ABC?',
    sql: `SELECT c.nama, ct.top
FROM customer c
JOIN customer_top ct ON c.id = ct.customer_id
WHERE c.kode = $1`,
    params: ['kode_customer'],
    description: 'Menampilkan Terms of Payment customer',
  },
  {
    id: 'CUST003',
    category: 'CUSTOMER',
    intentName: 'CUSTOMER_REVENUE_YTD',
    exampleQuery: 'Revenue customer ABC year to date?',
    sql: `SELECT c.nama, COALESCE(SUM(ii.harga * ii.jumlah), 0) as revenue_ytd
FROM customer c
LEFT JOIN invoice i ON c.id = i.customer_id AND i.status != 'cancelled'
LEFT JOIN invoice_item ii ON i.id = ii.invoice_id
WHERE c.kode = $1 AND EXTRACT(YEAR FROM i.tanggal) = EXTRACT(YEAR FROM NOW())
GROUP BY c.nama`,
    params: ['kode_customer'],
    description: 'Revenue year-to-date untuk satu customer',
  },
  {
    id: 'CUST004',
    category: 'CUSTOMER',
    intentName: 'CUSTOMER_INVOICE_SUMMARY',
    exampleQuery: 'Customer ABC punya berapa invoice?',
    sql: `SELECT c.nama,
  COUNT(i.id) as total_invoice,
  COALESCE(SUM(ii.harga * ii.jumlah), 0) as total_nilai
FROM customer c
LEFT JOIN invoice i ON c.id = i.customer_id AND i.is_active = true
LEFT JOIN invoice_item ii ON i.id = ii.invoice_id
WHERE c.kode = $1
GROUP BY c.nama`,
    params: ['kode_customer'],
    description: 'Rekap invoice customer: jumlah dan total nilai',
  },
  {
    id: 'CUST005',
    category: 'CUSTOMER',
    intentName: 'TOP_CUSTOMER_REVENUE',
    exampleQuery: 'Top 10 customer berdasarkan revenue?',
    sql: `SELECT c.nama, COALESCE(SUM(ii.harga * ii.jumlah), 0) as revenue
FROM customer c
JOIN invoice i ON c.id = i.customer_id AND i.status NOT IN ('cancelled', 'draft')
JOIN invoice_item ii ON i.id = ii.invoice_id
WHERE EXTRACT(YEAR FROM i.tanggal) = EXTRACT(YEAR FROM NOW())
GROUP BY c.nama
ORDER BY revenue DESC
LIMIT 10`,
    params: [],
    description: '10 customer dengan revenue tertinggi tahun ini',
  },
  {
    id: 'CUST006',
    category: 'CUSTOMER',
    intentName: 'CUSTOMER_NO_ORDER_90',
    exampleQuery: 'Customer yang belum order > 90 hari?',
    sql: `SELECT c.nama, c.kontak, MAX(i.tanggal) as last_order
FROM customer c
LEFT JOIN invoice i ON c.id = i.customer_id
GROUP BY c.nama, c.kontak
HAVING MAX(i.tanggal) < NOW() - INTERVAL '90 days' OR MAX(i.tanggal) IS NULL
ORDER BY last_order NULLS FIRST`,
    params: [],
    description: 'Customer yang tidak bertransaksi lebih dari 90 hari',
  },
  {
    id: 'CUST008',
    category: 'CUSTOMER',
    intentName: 'SALES_BY_MONTH',
    exampleQuery: 'Sales per bulan tahun ini?',
    sql: `SELECT DATE_TRUNC('month', i.tanggal)::date as bulan,
  COALESCE(SUM(ii.harga * ii.jumlah), 0) as revenue
FROM invoice i
JOIN invoice_item ii ON i.id = ii.invoice_id
WHERE EXTRACT(YEAR FROM i.tanggal) = EXTRACT(YEAR FROM NOW())
  AND i.status NOT IN ('cancelled')
GROUP BY DATE_TRUNC('month', i.tanggal)
ORDER BY bulan`,
    params: [],
    description: 'Revenue per bulan tahun berjalan',
  },
  {
    id: 'CUST009',
    category: 'CUSTOMER',
    intentName: 'SALES_BY_DAY_OF_WEEK',
    exampleQuery: 'Sales per hari dalam seminggu?',
    sql: `SELECT TO_CHAR(i.tanggal, 'Day') as hari,
  COALESCE(SUM(ii.harga * ii.jumlah), 0) as revenue
FROM invoice i
JOIN invoice_item ii ON i.id = ii.invoice_id
WHERE DATE_TRUNC('month', i.tanggal) = DATE_TRUNC('month', NOW())
  AND i.status NOT IN ('cancelled')
GROUP BY TO_CHAR(i.tanggal, 'Day'), EXTRACT(DOW FROM i.tanggal)
ORDER BY EXTRACT(DOW FROM i.tanggal)`,
    params: [],
    description: 'Revenue berdasarkan hari dalam seminggu (analisa pola)',
  },
  {
    id: 'CUST010',
    category: 'CUSTOMER',
    intentName: 'PRODUCT_BEST_SELLER',
    exampleQuery: 'Produk terlaris bulan ini?',
    sql: `SELECT b.nama as barang_nama,
  COALESCE(SUM(ii.jumlah), 0) as total_terjual,
  COALESCE(SUM(ii.jumlah * ii.harga), 0) as revenue
FROM invoice_item ii
JOIN barang b ON ii.barang_id = b.id
JOIN invoice i ON ii.invoice_id = i.id
WHERE DATE_TRUNC('month', i.tanggal) = DATE_TRUNC('month', NOW())
  AND i.status NOT IN ('cancelled')
GROUP BY b.nama
ORDER BY total_terjual DESC
LIMIT 10`,
    params: [],
    description: '10 produk terlaris bulan ini berdasarkan jumlah terjual',
  },
  {
    id: 'CUST011',
    category: 'CUSTOMER',
    intentName: 'CUSTOMER_ORDER_FREQUENCY',
    exampleQuery: 'Order frequency per customer?',
    sql: `SELECT c.nama,
  COUNT(i.id) as order_count,
  CASE
    WHEN COUNT(i.id) <= 1 THEN 0
    ELSE ROUND(AVG(
      EXTRACT(EPOCH FROM (i.tanggal - LAG(i.tanggal) OVER (
        PARTITION BY c.id ORDER BY i.tanggal
      ))) / 86400
    ), 2)
  END as avg_days_between_orders
FROM customer c
JOIN invoice i ON c.id = i.customer_id AND i.status NOT IN ('cancelled')
GROUP BY c.nama
HAVING COUNT(i.id) > 1
ORDER BY order_count DESC`,
    params: [],
    description: 'Frekuensi order per customer dan rata-rata jarak antar order',
  },
]

export function getQueryById(id: string): QueryPattern | undefined {
  return queryLibrary.find((q) => q.id === id)
}

export function getQueriesByCategory(category: string): QueryPattern[] {
  return queryLibrary.filter((q) => q.category === category)
}

export function getCategories(): string[] {
  return [...new Set(queryLibrary.map((q) => q.category))]
}

export function searchQueries(keyword: string): QueryPattern[] {
  const lower = keyword.toLowerCase()
  return queryLibrary.filter(
    (q) =>
      q.intentName.toLowerCase().includes(lower) ||
      q.exampleQuery.toLowerCase().includes(lower) ||
      q.description.toLowerCase().includes(lower) ||
      q.category.toLowerCase().includes(lower)
  )
}
