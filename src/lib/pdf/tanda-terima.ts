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
  page: { padding: '30 40', fontFamily: 'Arial', fontSize: 11, lineHeight: 1.3 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: 1 },
  logoBox: { width: 90, height: 90, backgroundColor: '#1E3A5F', justifyContent: 'center', alignItems: 'center' },
  logoText: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  headerRight: { alignItems: 'flex-end' },
  companyName: { fontSize: 16, fontWeight: 'bold', marginBottom: 6, color: '#0000FF', textDecoration: 'underline' },
  companyLine: { fontSize: 13, fontWeight: 'bold', marginBottom: 2 },
  labelValueRow: { flexDirection: 'row', marginBottom: 2 },
  labelText: { fontSize: 10, width: 105 },
  colonText: { fontSize: 10, width: 10 },
  valueText: { fontSize: 10 },
  title: { fontSize: 14, fontWeight: 'bold', textDecoration: 'underline', textAlign: 'center', marginBottom: 15 },
  bodyText: { fontSize: 10, marginBottom: 8, textAlign: 'justify' },
  signatureSection: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, marginBottom: 2 },
  signatureCol: { width: '45%', alignItems: 'center', minHeight: 130 },
  signatureTitle: { fontSize: 10, marginBottom: 2, textAlign: 'center' },
  signatureCompany: { fontSize: 10, fontWeight: 'bold', marginBottom: 2, textAlign: 'center' },
  signatureImage: { height: 80, marginBottom: 2, objectFit: 'contain' },
  signatureWrap: { position: 'relative', marginTop: 4, minHeight: 105 },
  signatureName: { fontSize: 10, fontWeight: 'bold', textDecoration: 'underline', textAlign: 'center' },
  signatureJabatan: { fontSize: 10, textAlign: 'center' },
  signatureLabel: { fontSize: 10, textAlign: 'center', marginTop: 2 },
  footer: { position: 'absolute', bottom: 24, left: 50, right: 50, borderTopWidth: 1.5, borderTopColor: '#000', paddingTop: 6, alignItems: 'center' },
  footerText: { fontSize: 10 },
  pageNum: { position: 'absolute', bottom: 28, right: 50, fontSize: 10, color: '#0000FF' },
  table: { width: '100%', borderStyle: 'solid', borderWidth: 1, borderColor: '#000' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f0f0f0', borderBottomWidth: 1, borderBottomColor: '#000' },
  tableHeaderCell: { fontSize: 9, fontWeight: 'bold', padding: 3, textAlign: 'center', borderRightWidth: 1, borderRightColor: '#000' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#000' },
  tableCell: { fontSize: 9, padding: 3, borderRightWidth: 1, borderRightColor: '#000' },
  tableCellCenter: { fontSize: 9, padding: 3, textAlign: 'center', borderRightWidth: 1, borderRightColor: '#000' },
  checkbox: { width: 8, height: 8, borderWidth: 1, borderColor: '#000' },
  checkboxLabel: { fontSize: 9 },
  checkboxGroup: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' },
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
  tanda_tangan_stempel_url: string | null
}

interface DokumenRow {
  nama: string
  nomor: string
}

interface TandaTerimaData {
  nomor: string
  nomorInvoice: string
  referensiJenis: string | null
  referensiNomor: string | null
  tanggal: string
  customerNama: string
  company: CompanyData
  dokumenList: DokumenRow[]
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

export function TandaTerimaPDF({ data }: { data: TandaTerimaData }) {
  const H = createEl
  const c = data.company
  const bidangUsaha = c.company_bidang_usaha || 'Furniture, Welding, General Trading, Services'
  const bidangLines = bidangUsaha.includes('\n')
    ? bidangUsaha.split('\n').map(s => s.trim()).filter(Boolean)
    : bidangUsaha.split(',').map(s => s.trim()).filter(Boolean)

  const tableHeaderCells = [
    H(Text, { style: [styles.tableHeaderCell, { width: '5%' }] }, 'No'),
    H(Text, { style: [styles.tableHeaderCell, { width: '13%' }] }, 'Nama Dokumen'),
    H(Text, { style: [styles.tableHeaderCell, { width: '23%' }] }, 'Nomor Dokumen'),
    H(Text, { style: [styles.tableHeaderCell, { width: '30%' }] }, 'Kelengkapan'),
    H(Text, { style: [styles.tableHeaderCell, { width: '7%' }] }, 'Asli'),
    H(Text, { style: [styles.tableHeaderCell, { width: '7%' }] }, 'Copy'),
    H(Text, { style: [styles.tableHeaderCell, { width: '15%', borderRightWidth: 0 }] }, 'Keterangan'),
  ]

  return H(Document, null,
    H(Page, { size: 'A4', style: styles.page },
      H(View, { style: { marginBottom: 12 } },
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

      H(View, { style: { flexDirection: 'row', marginBottom: 8 } },
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
      data.referensiJenis ? H(View, { style: styles.labelValueRow },
        H(Text, { style: styles.labelText }, 'No. ' + data.referensiJenis + ' Ref.'),
        H(Text, { style: styles.colonText }, ':'),
        H(Text, { style: styles.valueText }, data.referensiNomor || '-')
      ) : null,
      H(View, { style: styles.labelValueRow },
            H(Text, { style: styles.labelText }, 'Tempat/Tanggal'),
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
        ...data.dokumenList.map((row: DokumenRow, idx: number) =>
          H(View, { key: idx, style: styles.tableRow },
            H(View, { style: [styles.tableCellCenter, { width: '5%', justifyContent: 'center' }] },
              H(Text, { style: { fontSize: 9 } }, String(idx + 1))
            ),
            H(View, { style: [styles.tableCell, { width: '13%', justifyContent: 'center' }] },
              H(Text, { style: { fontSize: 9 } }, row.nama)
            ),
            H(View, { style: [styles.tableCell, { width: '23%', justifyContent: 'center' }] },
              H(Text, { style: { fontSize: 9 } }, row.nomor)
            ),
            H(View, { style: [styles.tableCellCenter, { width: '30%', justifyContent: 'center' }] },
              H(View, { style: styles.checkboxGroup },
                H(View, { style: styles.checkboxItem }, CHECKBOX, H(Text, { style: styles.checkboxLabel }, ' Ada')),
                H(View, { style: styles.checkboxItem }, CHECKBOX, H(Text, { style: styles.checkboxLabel }, ' Tidak')),
                H(View, { style: styles.checkboxItem }, CHECKBOX, H(Text, { style: styles.checkboxLabel }, ' Tidak Perlu')),
              )
            ),
            H(View, { style: [styles.tableCellCenter, { width: '7%', justifyContent: 'center', alignItems: 'center' }] }, CHECKBOX),
            H(View, { style: [styles.tableCellCenter, { width: '7%', justifyContent: 'center', alignItems: 'center' }] }, CHECKBOX),
            H(View, { style: [styles.tableCell, { width: '15%', borderRightWidth: 0 }] },
              H(Text, { style: { fontSize: 9 } }, '')
            ),
          )
        ),
      ),

      H(View, { style: styles.signatureSection },
        H(View, { style: styles.signatureCol },
          H(Text, { style: styles.signatureTitle }, 'Yang Menyerahkan,'),
          H(Text, { style: styles.signatureCompany }, c.company_nama || 'PT. RIZQI RIDHO ILAHI'),
          c.tanda_tangan_stempel_url
            ? H(Image, { src: c.tanda_tangan_stempel_url, style: styles.signatureImage })
            : H(View, { style: { height: 80 } }),
          H(Text, { style: styles.signatureName }, c.penandatangan_nama || 'Mohamad Marzuqi'),
          H(Text, { style: styles.signatureJabatan }, c.penandatangan_jabatan || 'Direktur'),
        ),
        H(View, { style: styles.signatureCol },
          H(Text, { style: styles.signatureTitle }, 'Diterima Oleh,'),
          H(Text, { style: styles.signatureCompany }, data.customerNama),
          H(View, { style: { height: 80 } }),
          H(Text, { style: styles.signatureName }, '....................................................'),
        ),
      ),

      H(View, { style: styles.footer },
        H(Text, { style: styles.footerText }, c.company_alamat || 'Jerukwangi - Bangsri, Jepara'),
        H(Text, { style: styles.footerText },
          (c.company_no_hp || '+6281 2607 5500') + ', ' + (c.company_email || 'mazzjoeq@gmail.com')
        ),
      ),
      H(Text, { style: styles.pageNum }, 'Page 1 of 1'),
    ),
  )
}
