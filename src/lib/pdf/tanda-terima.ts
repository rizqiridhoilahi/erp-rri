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
  title: { fontSize: 14, fontWeight: 'bold', textDecoration: 'underline', textAlign: 'center', marginBottom: 18 },
  bodyText: { fontSize: 11, marginBottom: 14, textAlign: 'justify' },
  signatureSection: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 32, marginBottom: 4 },
  signatureCol: { width: '45%', alignItems: 'center' },
  signatureTitle: { fontSize: 11, marginBottom: 2, textAlign: 'center' },
  signatureCompany: { fontSize: 11, fontWeight: 'bold', marginBottom: 2, textAlign: 'center' },
  signatureName: { fontSize: 11, fontWeight: 'bold', textDecoration: 'underline', textAlign: 'center' },
  signatureJabatan: { fontSize: 11, textAlign: 'center' },
  signatureLabel: { fontSize: 11, textAlign: 'center', marginTop: 2 },
  footer: { position: 'absolute', bottom: 24, left: 50, right: 50, borderTopWidth: 1.5, borderTopColor: '#000', paddingTop: 6, alignItems: 'center' },
  footerText: { fontSize: 10 },
  table: { width: '100%', borderStyle: 'solid', borderWidth: 1, borderColor: '#000' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f0f0f0', borderBottomWidth: 1, borderBottomColor: '#000' },
  tableHeaderCell: { fontSize: 8, fontWeight: 'bold', padding: 4, textAlign: 'center', borderRightWidth: 1, borderRightColor: '#000' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#000' },
  tableCell: { fontSize: 8, padding: 4, borderRightWidth: 1, borderRightColor: '#000' },
  tableCellCenter: { fontSize: 8, padding: 4, textAlign: 'center', borderRightWidth: 1, borderRightColor: '#000' },
  checkbox: { width: 8, height: 8, borderWidth: 1, borderColor: '#000', marginRight: 1 },
  checkboxLabel: { fontSize: 7 },
  checkboxGroup: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3, flexWrap: 'wrap' },
  checkboxItem: { flexDirection: 'row', alignItems: 'center' },
})

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
}

interface TandaTerimaData {
  nomor: string
  nomorInvoice: string
  tanggal: string
  customerNama: string
  company: CompanyData
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

const CHECKBOX = createEl(View, { style: styles.checkbox })

const DOKUMEN_LIST = [
  'Tanda Terima Dokumen',
  'RFQ (Request For Quotation)',
  'SPH (Surat Penawaran Harga)',
  'PO (Purchase Order)',
  'Kontrak',
  'DI (Delivery Instruction)',
  'Delivery Slip',
  'Surat Jalan',
  'GRN (Good Receipt Note)',
  'Invoice',
  'Kwitansi',
]

export function TandaTerimaPDF({ data }: { data: TandaTerimaData }) {
  const H = createEl
  const c = data.company
  const bidangUsaha = c.company_bidang_usaha || 'Furniture, Welding, General Trading, Services'
  const bidangLines = bidangUsaha.includes('\n')
    ? bidangUsaha.split('\n').map(s => s.trim()).filter(Boolean)
    : bidangUsaha.split(',').map(s => s.trim()).filter(Boolean)

  const tableHeaderCells = [
    H(Text, { style: [styles.tableHeaderCell, { width: '5%' }] }, 'No'),
    H(Text, { style: [styles.tableHeaderCell, { width: '27%' }] }, 'Jenis Dokumen'),
    H(Text, { style: [styles.tableHeaderCell, { width: '33%' }] }, 'Kelengkapan'),
    H(Text, { style: [styles.tableHeaderCell, { width: '10%' }] }, 'Asli'),
    H(Text, { style: [styles.tableHeaderCell, { width: '10%' }] }, 'Copy'),
    H(Text, { style: [styles.tableHeaderCell, { width: '15%', borderRightWidth: 0 }] }, 'Keterangan'),
  ]

  return H(Document, null,
    H(Page, { size: 'A4', style: styles.page },
      H(View, { style: { marginBottom: 18 } },
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
      ),

      H(Text, { style: styles.title }, 'Tanda Terima Dokumen Penagihan'),

      H(View, { style: { flexDirection: 'row', marginBottom: 14 } },
        H(View, null,
          H(View, { style: styles.labelValueRow },
            H(Text, { style: styles.labelText }, 'No. Tanda Terima'),
            H(Text, { style: styles.colonText }, ':'),
            H(Text, { style: styles.valueText }, data.nomor)
          ),
          H(View, { style: styles.labelValueRow },
            H(Text, { style: styles.labelText }, 'No. Invoice'),
            H(Text, { style: styles.colonText }, ':'),
            H(Text, { style: styles.valueText }, data.nomorInvoice)
          ),
          H(View, { style: styles.labelValueRow },
            H(Text, { style: styles.labelText }, 'Tanggal'),
            H(Text, { style: styles.colonText }, ':'),
            H(Text, { style: styles.valueText }, data.tanggal)
          ),
        ),
      ),

      H(Text, { style: styles.bodyText },
        'Telah diserahkan / diterima dokumen-dokumen penagihan (Invoice Documents) dengan rincian kelengkapan sebagai berikut:'
      ),

      H(View, { style: styles.table },
        H(View, { style: styles.tableHeader }, ...tableHeaderCells),
        ...DOKUMEN_LIST.map((nama, idx) =>
          H(View, { key: idx, style: styles.tableRow },
            H(View, { style: [styles.tableCellCenter, { width: '5%', justifyContent: 'center' }] },
              H(Text, { style: { fontSize: 8 } }, String(idx + 1))
            ),
            H(View, { style: [styles.tableCell, { width: '27%', justifyContent: 'center' }] },
              H(Text, { style: { fontSize: 8 } }, nama)
            ),
            H(View, { style: [styles.tableCellCenter, { width: '33%', justifyContent: 'center' }] },
              H(View, { style: styles.checkboxGroup },
                H(View, { style: styles.checkboxItem }, CHECKBOX, H(Text, { style: styles.checkboxLabel }, ' Ada')),
                H(View, { style: styles.checkboxItem }, CHECKBOX, H(Text, { style: styles.checkboxLabel }, ' Tidak')),
                H(View, { style: styles.checkboxItem }, CHECKBOX, H(Text, { style: styles.checkboxLabel }, ' Tidak Perlu')),
              )
            ),
            H(View, { style: [styles.tableCellCenter, { width: '10%', justifyContent: 'center' }] }, CHECKBOX),
            H(View, { style: [styles.tableCellCenter, { width: '10%', justifyContent: 'center' }] }, CHECKBOX),
            H(View, { style: [styles.tableCell, { width: '15%', borderRightWidth: 0 }] },
              H(Text, { style: { fontSize: 8 } }, '')
            ),
          )
        ),
      ),

      H(View, { style: styles.signatureSection },
        H(View, { style: styles.signatureCol },
          H(Text, { style: styles.signatureTitle }, 'Yang Menyerahkan,'),
          H(Text, { style: styles.signatureCompany }, c.company_nama || 'PT. RIZQI RIDHO ILAHI'),
          H(View, { style: { height: 40 } }),
          H(Text, { style: styles.signatureName }, c.penandatangan_nama || 'Mohamad Marzuqi'),
          H(Text, { style: styles.signatureJabatan }, c.penandatangan_jabatan || 'Direktur'),
        ),
        H(View, { style: styles.signatureCol },
          H(Text, { style: styles.signatureTitle }, 'Diterima Oleh,'),
          H(Text, { style: styles.signatureCompany }, data.customerNama),
          H(View, { style: { height: 40 } }),
          H(Text, { style: styles.signatureName }, '....................................................'),
          H(Text, { style: styles.signatureLabel }, 'Nama Jelas & Tanda Tangan'),
        ),
      ),

      H(View, { style: styles.footer },
        H(Text, { style: styles.footerText }, c.company_alamat || 'Jerukwangi - Bangsri, Jepara'),
        H(Text, { style: styles.footerText },
          (c.company_no_hp || '+6281 2607 5500') + ', ' + (c.company_email || 'mazzjoeq@gmail.com')
        ),
      ),
    ),
  )
}
