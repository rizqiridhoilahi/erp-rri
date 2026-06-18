/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ReactElement } from 'react'
import { Document, Page, Text, View, Image, StyleSheet, Font } from '@react-pdf/renderer'

Font.register({
  family: 'Arial',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/@canvas-fonts/arial@1.0.4/Arial.ttf', fontWeight: 'normal', fontStyle: 'normal' },
    { src: 'https://cdn.jsdelivr.net/npm/@canvas-fonts/arial-bold@1.0.4/Arial%20Bold.ttf', fontWeight: 'bold', fontStyle: 'normal' },
    { src: 'https://cdn.jsdelivr.net/npm/@canvas-fonts/arial-italic@1.0.4/Arial%20Italic.ttf', fontWeight: 'normal', fontStyle: 'italic' },
    { src: 'https://cdn.jsdelivr.net/npm/@canvas-fonts/arial-bold-italic@1.0.4/Arial%20Bold%20Italic.ttf', fontWeight: 'bold', fontStyle: 'italic' },
  ],
})

Font.registerHyphenationCallback((word) => [word])

const BORDER = { borderWidth: 0.5, borderColor: '#000' }
const BORDER_RIGHT = { borderRightWidth: 0.5, borderRightColor: '#000' }
const BORDER_BOTTOM = { borderBottomWidth: 0.5, borderBottomColor: '#000' }

const styles = StyleSheet.create({
  page: { padding: '10 10', fontFamily: 'Arial', fontSize: 8, lineHeight: 1.3 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 4 },
  logoBox: { width: 60, height: 60, backgroundColor: '#1E3A5F', justifyContent: 'center', alignItems: 'center' },
  logoText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  headerRight: { alignItems: 'flex-end' },
  companyName: { fontSize: 13, fontWeight: 'bold', marginBottom: 4, color: '#0000FF', textDecoration: 'underline' },
  companyLine: { fontSize: 10, fontWeight: 'bold', marginBottom: 1 },
  topLine: { borderBottomWidth: 2, borderBottomColor: '#000', marginTop: 2 },
  bottomLine: { borderBottomWidth: 0.5, borderBottomColor: '#000', height: 2 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, marginBottom: 4 },
  infoLeft: { flex: 1 },
  infoRight: { alignItems: 'flex-end', justifyContent: 'flex-end' },
  labelValue: { flexDirection: 'row', marginBottom: 1 },
  label: { fontSize: 8, width: 60 },
  colon: { fontSize: 8, width: 8 },
  value: { fontSize: 8, fontWeight: 'bold' },
  dateText: { fontSize: 9 },
  table: { width: '100%', ...BORDER, marginTop: 6 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f0f0f0', ...BORDER_BOTTOM },
  tableHeaderCell: { fontSize: 6.5, fontWeight: 'bold', padding: '2 1', textAlign: 'center', ...BORDER_RIGHT },
  tableHeaderCellLast: { fontSize: 6.5, fontWeight: 'bold', padding: '2 1', textAlign: 'center' },
  tableRow: { flexDirection: 'row', ...BORDER_BOTTOM },
  tableRowLast: { flexDirection: 'row' },
  tableCell: { fontSize: 6.5, padding: '2 1', ...BORDER_RIGHT },
  tableCellRight: { fontSize: 6.5, padding: '2 1', textAlign: 'right', ...BORDER_RIGHT },
  tableCellCenter: { fontSize: 6.5, padding: '2 1', textAlign: 'center', ...BORDER_RIGHT },
  tableCellLast: { fontSize: 6.5, padding: '2 1', textAlign: 'right' },
  tableCellCenterLast: { fontSize: 6.5, padding: '2 1', textAlign: 'center' },
  totalRow: { flexDirection: 'row', backgroundColor: '#fafafa', ...BORDER_BOTTOM },
  totalCell: { fontSize: 6.5, fontWeight: 'bold', padding: '2 1', ...BORDER_RIGHT },
  totalCellRight: { fontSize: 6.5, fontWeight: 'bold', padding: '2 1', textAlign: 'right', ...BORDER_RIGHT },
  totalCellLast: { fontSize: 6.5, fontWeight: 'bold', padding: '2 1', textAlign: 'right' },
  marginSection: { marginTop: 8, borderTopWidth: 1, borderTopColor: '#000', paddingTop: 6 },
  marginTitle: { fontSize: 8, fontWeight: 'bold', marginBottom: 3, color: '#374151' },
  marginRow: { flexDirection: 'row', marginBottom: 1 },
  marginLabel: { fontSize: 7.5, width: 100 },
  marginValue: { fontSize: 7.5, fontWeight: 'bold', textAlign: 'right', flex: 1 },
  marginDivider: { borderTopWidth: 0.5, borderTopColor: '#9CA3AF', marginVertical: 2 },
  statusBadgeFull: { fontSize: 7.5, fontWeight: 'bold', color: '#16A34A' },
  statusBadgeWarning: { fontSize: 7.5, fontWeight: 'bold', color: '#D97706' },
  statusBadgeBelow: { fontSize: 7.5, fontWeight: 'bold', color: '#DC2626' },
  adviceSection: { marginTop: 4, padding: 4, backgroundColor: '#F9FAFB', ...BORDER, borderRadius: 2 },
  adviceText: { fontSize: 7, color: '#374151', lineHeight: 1.4 },
  pageNum: { position: 'absolute', bottom: 22, right: 25, fontSize: 8, color: '#0000FF' },
})

interface ApprovalItem {
  nama_barang: string | null
  specification: string | null
  image_url: string | null
  satuan: string | null
  jumlah: number
  harga_satuan: number
  harga_beli: number | null
  overhead_per_unit: number | null
  barang?: { nama: string; kode: string; image_url: string | null } | null
}

interface ApprovalCompany {
  company_nama: string | null
  company_bidang_usaha: string | null
  company_alamat: string | null
  company_no_hp: string | null
  company_email: string | null
  company_logo_url: string | null
}

interface ApprovalData {
  nomor: string
  rfq_nomor: string | null
  customer_nama: string
  pic_customer_nama: string | null
  pic_customer_jabatan: string | null
  tanggal: string
  ppn_rate: number
  ppn_enabled: boolean
  total_harga: number | null
  keterangan: string | null
  target_margin: number
  negotiation_buffer: number
  items: ApprovalItem[]
  company: ApprovalCompany
}

function formatCurrency(v: number | null | undefined): string {
  if (v == null) return '0'
  return v.toLocaleString('id-ID')
}

const REACT_ELEMENT_TYPE = Symbol.for('react.element')

function createEl(type: any, props: Record<string, unknown> | null, ...children: unknown[]): ReactElement {
  const merged: Record<string, unknown> = { ...props }
  const childArr = children.flat(Infinity).filter(c => c !== false && c !== null && c !== undefined)
  if (childArr.length === 0) {
    merged.children = undefined
  } else if (childArr.length === 1) {
    merged.children = childArr[0]
  } else {
    merged.children = childArr
  }
  const key = (merged.key as string | null) ?? null
  delete merged.key
  return {
    $$typeof: REACT_ELEMENT_TYPE,
    type,
    key,
    ref: null,
    props: merged,
    _owner: null,
    _store: {},
  } as ReactElement
}

const W = (w: number) => ({ width: w })

const EMPTY = (w: number) => H(Text, { style: [styles.totalCell, W(w)] }, '')

function H(type: any, props: Record<string, unknown> | null, ...children: unknown[]): ReactElement {
  return createEl(type, props, ...children)
}

export function ApprovalQuotationPDF({ data }: { data: ApprovalData }) {
  const c = data.company
  const bidangUsaha = c.company_bidang_usaha || 'Furniture, Welding, General Trading, Services'
  const bidangLines = bidangUsaha.includes('\n')
    ? bidangUsaha.split('\n').map(s => s.trim()).filter(Boolean)
    : bidangUsaha.split(',').map(s => s.trim()).filter(Boolean)

  const items = data.items.map(item => {
    const hrgBeli = item.harga_beli ?? 0
    const overheadPerUnit = item.overhead_per_unit ?? 0
    const marginKotor = item.harga_satuan - hrgBeli
    const marginBersih = marginKotor - overheadPerUnit
    return {
      ...item,
      _hargaBeli: hrgBeli,
      _overheadPerUnit: overheadPerUnit,
      _marginKotor: marginKotor,
      _marginBersih: marginBersih,
      _marginKotorPct: item.harga_satuan > 0 ? (marginKotor / item.harga_satuan) * 100 : 0,
      _marginBersihPct: item.harga_satuan > 0 ? (marginBersih / item.harga_satuan) * 100 : 0,
      _totalBeli: item.jumlah * hrgBeli,
      _totalJual: item.jumlah * item.harga_satuan,
      _totalMk: marginKotor * item.jumlah,
      _totalMb: marginBersih * item.jumlah,
    }
  })

  const totals = {
    beli: items.reduce((s, i) => s + i._totalBeli, 0),
    jual: items.reduce((s, i) => s + i._totalJual, 0),
    mk: items.reduce((s, i) => s + i._totalMk, 0),
    mb: items.reduce((s, i) => s + i._totalMb, 0),
  }

  const avgMkPct = totals.jual > 0 ? (totals.mk / totals.jual) * 100 : 0
  const avgMbPct = totals.jual > 0 ? (totals.mb / totals.jual) * 100 : 0

  const totalOverhead = items.reduce((s, i) => s + i.jumlah * i._overheadPerUnit, 0)
  const marginBersihTotal = totals.mb
  const marginPct = totals.jual > 0 ? (marginBersihTotal / totals.jual) * 100 : 0

  const tm = data.target_margin || 0.15
  const nb = data.negotiation_buffer || 0.10
  const targetWithBufferPct = (1 - (1 - tm) * (1 - nb)) * 100
  const targetPct = tm * 100

  let marginStatus: 'full' | 'on_target' | 'below'
  if (marginPct >= targetWithBufferPct) {
    marginStatus = 'full'
  } else if (marginPct >= targetPct) {
    marginStatus = 'on_target'
  } else {
    marginStatus = 'below'
  }

  const durasiHari = 44
  const modalKerja = totals.beli + totalOverhead
  const roiEstimasi = modalKerja > 0 ? (marginBersihTotal / modalKerja) * (365 / durasiHari) * 100 : 0
  const ruangNegosiasi = Math.max(0, ((1 + marginPct / 100) / (1 - tm) - 1) * 100)

  let statusLabel: string
  let statusAdvice: string
  let statusColor: any

  if (marginStatus === 'full') {
    statusLabel = 'SEHAT'
    statusColor = styles.statusBadgeFull
    statusAdvice = `✅ Margin bersih ${marginPct.toFixed(1)}% — di atas target+buffer (${targetWithBufferPct.toFixed(1)}%). ` +
      `Modal Rp ${formatCurrency(modalKerja)} dengan margin Rp ${formatCurrency(marginBersihTotal)}. ` +
      `Estimasi ${durasiHari} hari (14 hari pengiriman + 30 hari TOP): ROI tahunan ~${roiEstimasi.toFixed(0)}%. ` +
      `Ruang negosiasi aman ~${ruangNegosiasi.toFixed(1)}%. Disarankan pertahankan harga jual.`
  } else if (marginStatus === 'on_target') {
    statusLabel = 'WASPADA'
    statusColor = styles.statusBadgeWarning
    statusAdvice = `⚠️ Margin bersih ${marginPct.toFixed(1)}% — sesuai target (${targetPct.toFixed(0)}%) ` +
      `namun belum mencapai buffer (${(nb * 100).toFixed(0)}%). ` +
      `Estimasi ${durasiHari} hari: ROI tahunan ~${roiEstimasi.toFixed(0)}%. ` +
      `Ruang negosiasi terbatas ~${ruangNegosiasi.toFixed(1)}%. Disarankan tidak memberikan diskon >${(marginPct - targetPct).toFixed(1)}%.`
  } else {
    statusLabel = 'KURANG'
    statusColor = styles.statusBadgeBelow
    statusAdvice = `🔴 Margin bersih ${marginPct.toFixed(1)}% — di bawah target (${targetPct.toFixed(0)}%). ` +
      `Estimasi ${durasiHari} hari: ROI tahunan hanya ~${roiEstimasi.toFixed(0)}%. ` +
      `Disarankan review harga beli supplier atau negosiasi ulang overhead. ` +
      `Coba tambahkan selisih minimal ${(targetPct - marginPct).toFixed(1)}% ke harga jual.`
  }

  const headerCells = [
    H(Text, { style: [styles.tableHeaderCell, W(14)] }, '#'),
    H(Text, { style: [styles.tableHeaderCell, W(20)] }, 'Pic'),
    H(Text, { style: [styles.tableHeaderCell, { flex: 1.2 }] }, 'Item'),
    H(Text, { style: [styles.tableHeaderCell, { flex: 0.7 }] }, 'Spec'),
    H(Text, { style: [styles.tableHeaderCell, W(18)] }, 'Qty'),
    H(Text, { style: [styles.tableHeaderCell, W(18)] }, 'UoM'),
    H(Text, { style: [styles.tableHeaderCell, W(45), { color: '#DC2626' }] }, 'Hrg Beli'),
    H(Text, { style: [styles.tableHeaderCell, W(45), { color: '#2563EB' }] }, 'Hrg Jual'),
    H(Text, { style: [styles.tableHeaderCell, W(45), { color: '#DC2626' }] }, 'Tot Beli'),
    H(Text, { style: [styles.tableHeaderCell, W(45), { color: '#2563EB' }] }, 'Tot Jual'),
    H(Text, { style: [styles.tableHeaderCell, W(45)] }, 'MK (Rp)'),
    H(Text, { style: [styles.tableHeaderCell, W(45), { color: '#D97706' }] }, 'Tot MK'),
    H(Text, { style: [styles.tableHeaderCell, W(25)] }, 'MK (%)'),
    H(Text, { style: [styles.tableHeaderCell, W(45)] }, 'Overhead'),
    H(Text, { style: [styles.tableHeaderCell, W(45)] }, 'MB (Rp)'),
    H(Text, { style: [styles.tableHeaderCell, W(45), { color: '#16A34A' }] }, 'Tot MB'),
    H(Text, { style: [styles.tableHeaderCellLast, W(25)] }, 'MB (%)'),
  ]

  const dataRows = items.map((item, i) => {
    const isLast = i === items.length - 1
    const rowStyle = isLast ? styles.totalRow : styles.tableRow
    const imgUrl = item.image_url || item.barang?.image_url || null
    const nama = item.barang?.nama || item.nama_barang || '-'
    const spec = item.specification || '-'

    return H(View, { key: i, style: rowStyle },
      H(Text, { style: [styles.tableCellCenter, W(14)] }, String(i + 1)),
      H(View, { style: [W(20), { justifyContent: 'center', alignItems: 'center', padding: '1 0', ...BORDER_RIGHT }] },
        imgUrl
          ? H(Image, { src: imgUrl, style: { width: 14, height: 14, objectFit: 'contain' } })
          : H(Text, { style: { fontSize: 5, textAlign: 'center' } }, '-')
      ),
      H(Text, { style: [styles.tableCell, { flex: 1.2 }] }, nama),
      H(Text, { style: [styles.tableCell, { flex: 0.7 }] }, spec),
      H(Text, { style: [styles.tableCellCenter, W(18)] }, String(item.jumlah)),
      H(Text, { style: [styles.tableCellCenter, W(18)] }, item.satuan || '-'),
      H(Text, { style: [styles.tableCellRight, W(45), { color: '#DC2626' }] }, formatCurrency(item._hargaBeli)),
      H(Text, { style: [styles.tableCellRight, W(45), { color: '#2563EB' }] }, formatCurrency(item.harga_satuan)),
      H(Text, { style: [styles.tableCellRight, W(45), { color: '#DC2626' }] }, formatCurrency(item._totalBeli)),
      H(Text, { style: [styles.tableCellRight, W(45), { color: '#2563EB' }] }, formatCurrency(item._totalJual)),
      H(Text, { style: [styles.tableCellRight, W(45)] }, formatCurrency(item._marginKotor)),
      H(Text, { style: [styles.tableCellRight, W(45), { color: '#D97706' }] }, formatCurrency(item._totalMk)),
      H(Text, { style: [styles.tableCellRight, W(25)] }, item._marginKotorPct.toFixed(1) + '%'),
      H(Text, { style: [styles.tableCellRight, W(45)] }, formatCurrency(item._overheadPerUnit)),
      H(Text, { style: [styles.tableCellRight, W(45)] }, formatCurrency(item._marginBersih)),
      H(Text, { style: [styles.tableCellRight, W(45), { color: '#16A34A' }] }, formatCurrency(item._totalMb)),
      H(Text, { style: [styles.tableCellLast, W(25)] }, item._marginBersihPct.toFixed(1) + '%'),
    )
  })

  const totalRow = H(View, { style: styles.totalRow },
    EMPTY(14),
    EMPTY(20),
    H(Text, { style: [styles.totalCell, { flex: 1.2 }] }, 'TOTAL'),
    H(Text, { style: [styles.totalCell, { flex: 0.7 }] }, ''),
    EMPTY(18),
    EMPTY(18),
    EMPTY(45),
    EMPTY(45),
    H(Text, { style: [styles.totalCellRight, W(45), { color: '#DC2626' }] }, formatCurrency(totals.beli)),
    H(Text, { style: [styles.totalCellRight, W(45), { color: '#2563EB' }] }, formatCurrency(totals.jual)),
    EMPTY(45),
    H(Text, { style: [styles.totalCellRight, W(45), { color: '#D97706' }] }, formatCurrency(totals.mk)),
    H(Text, { style: [styles.totalCellRight, W(25), { color: '#D97706' }] }, avgMkPct.toFixed(1) + '%'),
    EMPTY(45),
    EMPTY(45),
    H(Text, { style: [styles.totalCellRight, W(45), { color: '#16A34A' }] }, formatCurrency(totals.mb)),
    H(Text, { style: [styles.totalCellLast, W(25), { color: '#16A34A' }] }, avgMbPct.toFixed(1) + '%'),
  )

  return H(Document, null,
    H(Page, { size: 'A4', orientation: 'landscape', style: styles.page, wrap: true },
      H(View, { fixed: true, style: { marginBottom: 2 } },
        H(View, { style: styles.header },
          c.company_logo_url
            ? H(Image, { src: c.company_logo_url, style: { width: 60, height: 60 } })
            : H(View, { style: styles.logoBox },
                H(Text, { style: styles.logoText }, 'R')
              ),
          H(View, { style: styles.headerRight },
            H(Text, { style: styles.companyName }, c.company_nama || 'PT. RIZQI RIDHO ILAHI'),
            ...bidangLines.map((line, i) =>
              H(Text, { key: i, style: styles.companyLine }, line)
            )
          )
        ),
        H(View, { style: styles.topLine }),
        H(View, { style: styles.bottomLine }),
      ),

      H(Text, { style: { textAlign: 'center', fontSize: 10, fontWeight: 'bold', textDecoration: 'underline', marginTop: 4, marginBottom: 2 } }, 'APPROVAL PENAWARAN HARGA'),

      H(View, { style: styles.infoRow },
        H(View, { style: styles.infoLeft },
          H(View, { style: styles.labelValue },
            H(Text, { style: styles.label }, 'No. SPH'),
            H(Text, { style: styles.colon }, ':'),
            H(Text, { style: styles.value }, data.nomor)
          ),
          H(View, { style: styles.labelValue },
            H(Text, { style: styles.label }, 'No. RFQ'),
            H(Text, { style: styles.colon }, ':'),
            H(Text, { style: styles.value }, data.rfq_nomor || '-')
          ),
          H(View, { style: styles.labelValue },
            H(Text, { style: styles.label }, 'Customer'),
            H(Text, { style: styles.colon }, ':'),
            H(Text, { style: styles.value }, data.customer_nama)
          ),
          H(View, { style: styles.labelValue },
            H(Text, { style: styles.label }, 'PIC'),
            H(Text, { style: styles.colon }, ':'),
            H(Text, { style: styles.value }, [data.pic_customer_nama, data.pic_customer_jabatan].filter(Boolean).join(' - ') || '-')
          ),
        ),
        H(View, { style: styles.infoRight },
          H(Text, { style: styles.dateText }, data.tanggal)
        ),
      ),

      H(View, { style: styles.table, wrap: true },
        H(View, { fixed: true, style: styles.tableHeader }, ...headerCells),
        ...dataRows,
        totalRow,
      ),

      H(View, { style: styles.marginSection },
        H(Text, { style: styles.marginTitle }, 'Estimasi Margin (Internal)'),
        H(View, { style: { flexDirection: 'row', marginBottom: 3 } },
          H(Text, { style: { fontSize: 7, color: '#374151', marginRight: 8 } }, `Target: ${(tm * 100).toFixed(0)}%`),
          H(Text, { style: { fontSize: 7, color: '#374151' } }, `Buffer: ${(nb * 100).toFixed(0)}%`),
        ),
        H(View, { style: styles.marginRow },
          H(Text, { style: styles.marginLabel }, 'Total Harga Jual'),
          H(Text, { style: [styles.marginValue, { color: '#2563EB' }] }, formatCurrency(totals.jual))
        ),
        H(View, { style: styles.marginRow },
          H(Text, { style: styles.marginLabel }, 'Total Harga Beli'),
          H(Text, { style: [styles.marginValue, { color: '#DC2626' }] }, formatCurrency(totals.beli))
        ),
        H(View, { style: styles.marginRow },
          H(Text, { style: styles.marginLabel }, 'Margin Kotor'),
          H(Text, { style: [styles.marginValue, { color: '#D97706' }] }, formatCurrency(totals.jual - totals.beli))
        ),
        H(View, { style: styles.marginRow },
          H(Text, { style: styles.marginLabel }, 'Total Overhead'),
          H(Text, { style: [styles.marginValue, { color: '#6B7280' }] }, formatCurrency(totalOverhead))
        ),
        H(View, { style: styles.marginDivider }),
        H(View, { style: styles.marginRow },
          H(Text, { style: [styles.marginLabel, { fontWeight: 'bold' }] }, 'Margin Bersih'),
          H(Text, { style: [styles.marginValue, { fontWeight: 'bold' }, marginColor(marginBersihTotal >= 0 ? '#16A34A' : '#DC2626')] },
            `${formatCurrency(marginBersihTotal)} (${marginPct.toFixed(1)}%)`
          )
        ),
        H(View, { style: { flexDirection: 'row', marginTop: 2, alignItems: 'center' } },
          H(Text, { style: { fontSize: 7.5, marginRight: 6 } }, 'Status Margin'),
          H(Text, { style: statusColor }, `[${statusLabel}]`)
        ),
      ),

      H(View, { style: { ...BORDER, marginTop: 6, padding: 4, backgroundColor: '#F9FAFB' } },
        H(Text, { style: { fontSize: 7.5, fontWeight: 'bold', color: '#374151', marginBottom: 2 } }, 'Analisis & Rekomendasi'),
        H(Text, { style: { fontSize: 7, color: '#374151', lineHeight: 1.4 } }, statusAdvice),
      ),

      data.keterangan ? H(View, { style: { marginTop: 6 } },
        H(Text, { style: { fontSize: 7, fontStyle: 'italic', color: '#555' } }, 'Keterangan: ' + data.keterangan)
      ) : null,

      H(Text, { style: styles.pageNum }, 'Page 1')
    )
  )
}

function marginColor(color: string) {
  return { color }
}
