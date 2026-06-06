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

const styles = StyleSheet.create({
  page: { padding: '40 50', fontFamily: 'Arial', fontSize: 11, lineHeight: 1.4 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: 1 },
  logoBox: { width: 90, height: 90, backgroundColor: '#1E3A5F', justifyContent: 'center', alignItems: 'center' },
  logoText: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  headerRight: { alignItems: 'flex-end' },
  companyName: { fontSize: 16, fontWeight: 'bold', marginBottom: 6, color: '#0000FF', textDecoration: 'underline' },
  companyLine: { fontSize: 13, fontWeight: 'bold', marginBottom: 2 },
  labelValueRow: { flexDirection: 'row', marginBottom: 2 },
  labelText: { fontSize: 11, width: 100 },
  colonText: { fontSize: 11, width: 10 },
  valueText: { fontSize: 11 },
  bodyText: { fontSize: 11, marginBottom: 2, textAlign: 'justify' },
  penutupText: { fontSize: 11, marginTop: 14 },
  signatureSection: { marginTop: 16, flexDirection: 'row', justifyContent: 'space-between' },
  signatureBox: { width: '45%', alignItems: 'center' },
  signatureTitle: { fontSize: 11, marginBottom: 2 },
  signatureCompany: { fontSize: 11, fontWeight: 'bold', marginBottom: 2 },
  signatureWrap: { marginTop: 4, minHeight: 105, alignItems: 'center' },
  signatureName: { fontSize: 11, fontWeight: 'bold', textDecoration: 'underline' },
  signatureJabatan: { fontSize: 11 },
  footer: { position: 'absolute', bottom: 24, left: 50, right: 50, borderTopWidth: 1.5, borderTopColor: '#000', paddingTop: 6, alignItems: 'center' },
  footerText: { fontSize: 10 },
  pageNum: { position: 'absolute', bottom: 28, right: 50, fontSize: 10, color: '#0000FF' },
  table: { width: '100%', borderStyle: 'solid', borderWidth: 1, borderColor: '#000' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#000' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f0f0f0', borderBottomWidth: 1, borderBottomColor: '#000' },
  tableCell: { fontSize: 9, padding: 2, borderRightWidth: 1, borderRightColor: '#000' },
  tableHeaderCell: { fontSize: 9, fontWeight: 'bold', textAlign: 'center' },
  tableCellLast: { fontSize: 9, padding: 2, textAlign: 'right' },
  tableCellCenter: { fontSize: 9, padding: 2, textAlign: 'center', borderRightWidth: 1, borderRightColor: '#000' },
  tableCellCenterLast: { fontSize: 9, padding: 2, textAlign: 'center' },
})

interface ReturItem {
  nama: string
  kode: string
  satuan: string
  jumlah: number
  hargaSatuan: number
  keterangan: string | null
  urutan: number
}

interface CompanyData {
  company_nama: string | null
  company_bidang_usaha: string | null
  company_alamat: string | null
  company_no_hp: string | null
  company_email: string | null
  company_logo_url: string | null
  penandatangan_nama: string | null
  penandatangan_jabatan: string | null
  penandatangan_no_hp: string | null
  tanda_tangan_stempel_url: string | null
}

interface ReturPenjualanData {
  nomor: string
  doNomor: string | null
  customerNama: string
  customerAlamat: string | null
  picNama: string | null
  picJenisKelamin: string | null
  picJabatan: string | null
  tanggal: string
  items: ReturItem[]
  grandTotal: number
  company: CompanyData
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

const ROWS_PER_PAGE = 15

export function ReturPenjualanPDF({ data }: { data: ReturPenjualanData }): ReactElement {
  const c = data.company
  const bidangUsaha = c.company_bidang_usaha || 'Furniture, Welding, General Trading, Services'
  const bidangLines = bidangUsaha.includes('\n')
    ? bidangUsaha.split('\n').map(s => s.trim()).filter(Boolean)
    : bidangUsaha.split(',').map(s => s.trim()).filter(Boolean)

  const H = createEl
  const totalPages = Math.ceil(data.items.length / ROWS_PER_PAGE) || 1

  const v = (child: any, style: any) => H(View, { style: { justifyContent: 'center', ...style } }, child)

  const tableHeaderCells = [
    v(H(Text, { style: styles.tableHeaderCell }, 'No'), { width: 25, padding: 2, borderRightWidth: 1, borderRightColor: '#000' }),
    v(H(Text, { style: styles.tableHeaderCell }, 'Description'), { flex: 1, padding: 2, borderRightWidth: 1, borderRightColor: '#000' }),
    v(H(Text, { style: styles.tableHeaderCell }, 'Unit'), { width: 50, padding: 2, borderRightWidth: 1, borderRightColor: '#000' }),
    v(H(Text, { style: styles.tableHeaderCell }, 'QTY'), { width: 35, padding: 2, borderRightWidth: 1, borderRightColor: '#000' }),
    v(H(Text, { style: styles.tableHeaderCell }, 'Unit Price'), { width: 65, padding: 2, borderRightWidth: 1, borderRightColor: '#000' }),
    v(H(Text, { style: styles.tableHeaderCell }, 'Subtotal'), { width: 70, padding: 2, borderRightWidth: 1, borderRightColor: '#000' }),
    v(H(Text, { style: styles.tableHeaderCell }, 'Keterangan'), { width: 80, padding: 2 }),
  ]

  const headerSection = H(View, { style: { marginBottom: 6 } },
    H(View, { style: styles.header },
      c.company_logo_url
        ? H(Image, { src: c.company_logo_url, style: { width: 80, height: 80, marginTop: -5 } })
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
    H(View, { style: { borderBottomWidth: 2, borderBottomColor: '#000', marginTop: 3 } }),
    H(View, { style: { height: 3 } }),
    H(View, { style: { borderBottomWidth: 0.5, borderBottomColor: '#000' } }),
  )

  const docInfoSection = H(View, { style: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 } },
    H(View, null,
      H(View, { style: styles.labelValueRow },
        H(Text, { style: styles.labelText }, 'No. Nota Retur'),
        H(Text, { style: styles.colonText }, ':'),
        H(Text, { style: styles.valueText }, data.nomor)
      ),
      H(View, { style: styles.labelValueRow },
        H(Text, { style: styles.labelText }, 'No. DO Ref.'),
        H(Text, { style: styles.colonText }, ':'),
        H(Text, { style: styles.valueText }, data.doNomor || '-')
      ),
      H(View, { style: styles.labelValueRow },
        H(Text, { style: styles.labelText }, 'Perihal'),
        H(Text, { style: styles.colonText }, ':'),
        H(Text, { style: [styles.valueText, { fontWeight: 'bold' }] }, 'Nota Retur')
      ),
    ),
    H(Text, { style: styles.valueText }, data.tanggal)
  )

  const alamatSection = H(View, { style: { marginBottom: 4 } },
    H(Text, { style: { fontSize: 11, marginBottom: 2 } }, 'Kepada Yth.'),
    H(Text, { style: { fontSize: 11, fontWeight: 'bold', marginBottom: 2 } }, data.customerNama),
    data.picNama ? H(Text, { style: { fontSize: 11, marginBottom: 2 } }, 'u.p. ' + (data.picJenisKelamin === 'L' ? 'Bapak' : 'Ibu') + ' ' + data.picNama) : null,
    data.customerAlamat ? H(Text, { style: { fontSize: 11, maxWidth: 350, lineHeight: 1.3, marginBottom: 2 } }, data.customerAlamat) : null,
  )

  const bodySection = H(Text, { style: styles.bodyText },
    'Dengan ini kami memberitahukan bahwa barang-barang berikut telah dilakukan retur:'
  )

  const footerView = H(View, { style: styles.footer, fixed: true },
    H(Text, { style: styles.footerText }, c.company_alamat || 'Jerukwangi - Bangsri, Jepara'),
    H(Text, { style: styles.footerText },
      (c.company_no_hp || '+6281 2607 5500') + ', ' + (c.company_email || 'mazzjoeq@gmail.com')
    )
  )

  const penutupSection = H(Text, { style: styles.penutupText },
    'Demikian nota retur ini kami sampaikan untuk dapat dipergunakan sebagaimana mestinya.'
  )

  const signatureBlock = H(View, { wrap: false },
    H(View, { style: styles.signatureSection },
      H(View, { style: styles.signatureBox },
        H(Text, { style: styles.signatureTitle }, 'Yang Menyerahkan,'),
        H(Text, { style: styles.signatureCompany }, data.customerNama),
        H(View, { style: styles.signatureWrap }),
        H(Text, { style: styles.signatureName }, data.picNama || '..................................................'),
        H(Text, { style: styles.signatureJabatan }, data.picJabatan || '')
      ),
      H(View, { style: styles.signatureBox },
        H(Text, { style: styles.signatureTitle }, 'Yang Menerima,'),
        H(Text, { style: styles.signatureCompany }, c.company_nama || 'PT. RIZQI RIDHO ILAHI'),
        H(View, { style: styles.signatureWrap },
          c.tanda_tangan_stempel_url
            ? H(Image, { src: c.tanda_tangan_stempel_url, style: { height: 100, objectFit: 'contain' } })
            : null
        ),
        H(Text, { style: styles.signatureName }, c.penandatangan_nama || 'Mohamad Marzuqi'),
        H(Text, { style: styles.signatureJabatan }, c.penandatangan_jabatan || 'Direktur')
      )
    ),
  )

  return H(Document, null,
    ...Array.from({ length: totalPages }, (_, pageIdx) => {
      const isLastPage = pageIdx === totalPages - 1
      const startIdx = pageIdx * ROWS_PER_PAGE
      const pageItems = data.items.slice(startIdx, startIdx + ROWS_PER_PAGE)
      const pageNumber = pageIdx + 1

      return H(Page, { key: pageIdx, size: 'A4', style: styles.page },
        headerSection,
        pageIdx === 0 ? docInfoSection : null,
        pageIdx === 0 ? alamatSection : null,
        pageIdx === 0 ? bodySection : null,

        H(View, { style: styles.table },
          H(View, { style: styles.tableHeader }, ...tableHeaderCells),
          ...pageItems.map((item) => {
            const subtotal = item.hargaSatuan * item.jumlah
            return H(View, { key: item.urutan, style: styles.tableRow },
              v(H(Text, { style: { fontSize: 9, textAlign: 'center' } }, String(item.urutan)), { width: 25, padding: 2, borderRightWidth: 1, borderRightColor: '#000' }),
              v(H(Text, { style: { fontSize: 9 } }, item.nama), { flex: 1, padding: 2, borderRightWidth: 1, borderRightColor: '#000' }),
              v(H(Text, { style: { fontSize: 9, textAlign: 'center' } }, item.satuan || '-'), { width: 50, padding: 2, borderRightWidth: 1, borderRightColor: '#000' }),
              v(H(Text, { style: { fontSize: 9, textAlign: 'center' } }, String(item.jumlah)), { width: 35, padding: 2, borderRightWidth: 1, borderRightColor: '#000' }),
              v(H(Text, { style: { fontSize: 9, textAlign: 'right' } }, 'Rp ' + formatCurrency(item.hargaSatuan)), { width: 65, padding: 2, borderRightWidth: 1, borderRightColor: '#000' }),
              v(H(Text, { style: { fontSize: 9, textAlign: 'right' } }, 'Rp ' + formatCurrency(subtotal)), { width: 70, padding: 2, borderRightWidth: 1, borderRightColor: '#000' }),
              v(H(Text, { style: { fontSize: 9 } }, item.keterangan || ''), { width: 80, padding: 2 }),
            )
          }),
          isLastPage ? H(View, { style: { flexDirection: 'row' } },
            H(View, { style: { flex: 1, padding: 2, justifyContent: 'center' } },
              H(Text, { style: { fontSize: 9, fontWeight: 'bold', textAlign: 'right' } }, 'GRAND TOTAL')
            ),
            H(View, { style: { width: 70, padding: 2, justifyContent: 'center' } },
              H(Text, { style: { fontSize: 9, fontWeight: 'bold', textAlign: 'right' } }, 'Rp ' + formatCurrency(data.grandTotal))
            ),
            H(View, { style: { width: 80, padding: 2 } }, null),
          ) : null,
        ),

        isLastPage ? penutupSection : null,
        isLastPage ? signatureBlock : null,

        footerView,
        H(Text, { style: styles.pageNum }, `Page ${pageNumber} of ${totalPages}`)
      )
    }),
  )
}
