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
  noRow: { flexDirection: 'row', marginBottom: 2 },
  noLabel: { fontSize: 11, width: 35 },
  noColon: { fontSize: 11, width: 15 },
  noValue: { fontSize: 11 },
  halLabel: { fontSize: 11, width: 35 },
  halColon: { fontSize: 11, width: 15 },
  halValue: { fontSize: 11, fontWeight: 'bold' },
  pembuka: { fontSize: 11, marginBottom: 16, marginTop: 12 },
  identityRow: { flexDirection: 'row', marginBottom: 3 },
  identityLabel: { fontSize: 11, width: 65 },
  identityColon: { fontSize: 11, width: 15 },
  identityValue: { fontSize: 11 },
  identityValueBold: { fontSize: 11, fontWeight: 'bold' },
  paragraf1: { fontSize: 11, marginBottom: 12, textAlign: 'justify' },
  penutup: { fontSize: 11, marginBottom: 2, textAlign: 'justify' },
  signatureSection: { marginTop: 30 },
  signatureDate: { fontSize: 11, marginBottom: 2 },
  signatureCompany: { fontSize: 11, fontWeight: 'bold', marginBottom: 100 },
  signatureName: { fontSize: 11, fontWeight: 'bold', textDecoration: 'underline' },
  signatureJabatan: { fontSize: 11 },
  footer: { position: 'absolute', bottom: 24, left: 50, right: 50, borderTopWidth: 1.5, borderTopColor: '#000', paddingTop: 6, alignItems: 'center' },
  footerText: { fontSize: 10 },
  pageNum: { position: 'absolute', bottom: 28, right: 50, fontSize: 10, color: '#0000FF' },
})

interface SuratPernyataanNonPkpData {
  nomor: string
  tanggal: string
  penandatanganNama: string
  penandatanganJabatan: string
  alamat: string
  npwp: string
  companyNama: string
  companyBidangUsaha: string | null
  companyLogoUrl: string | null
  companyAlamat: string | null
  companyNoHp: string | null
  companyEmail: string | null
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

export function SuratPernyataanNonPkpPDF({ data }: { data: SuratPernyataanNonPkpData }) {
  const H = createEl
  const c = data
  const bidangUsaha = c.companyBidangUsaha || 'Furniture, Welding, General Trading, Services'
  const bidangLines = bidangUsaha.includes('\n')
    ? bidangUsaha.split('\n').map(s => s.trim()).filter(Boolean)
    : bidangUsaha.split(',').map(s => s.trim()).filter(Boolean)

  const alamatLines = c.alamat.split('\n').filter(Boolean)

  return H(Document, null,
    H(Page, { size: 'A4', style: styles.page },
      H(View, { style: { marginBottom: 12 } },
        H(View, { style: styles.header },
          c.companyLogoUrl
            ? H(Image, { src: c.companyLogoUrl, style: { width: 80, height: 80, marginTop: -5 } })
            : H(View, { style: styles.logoBox },
                H(Text, { style: styles.logoText }, 'R')
              ),
          H(View, { style: styles.headerRight },
            H(Text, { style: styles.companyName }, c.companyNama || 'PT. RIZQI RIDHO ILAHI'),
            ...bidangLines.map((line, i) =>
              H(Text, { key: i, style: styles.companyLine }, line)
            )
          )
        ),
        H(View, { style: { borderBottomWidth: 2, borderBottomColor: '#000', marginTop: 3 } }),
        H(View, { style: { height: 3 } }),
        H(View, { style: { borderBottomWidth: 0.5, borderBottomColor: '#000' } }),
      ),

      H(View, { style: { marginBottom: 24 } },
        H(View, { style: styles.noRow },
          H(Text, { style: styles.noLabel }, 'No'),
          H(Text, { style: styles.noColon }, ':'),
          H(Text, { style: styles.noValue }, data.nomor),
        ),
        H(View, { style: styles.noRow },
          H(Text, { style: styles.halLabel }, 'Hal'),
          H(Text, { style: styles.halColon }, ':'),
          H(Text, { style: styles.halValue }, 'Surat Pernyataan Non - PKP'),
        ),
      ),

      H(Text, { style: styles.pembuka }, 'Saya yang bertanda tangan di bawah ini:'),

      H(View, { style: { marginBottom: 24, marginLeft: 20 } },
        H(View, { style: styles.identityRow },
          H(Text, { style: styles.identityLabel }, 'Nama'),
          H(Text, { style: styles.identityColon }, ':'),
          H(Text, { style: styles.identityValueBold }, c.penandatanganNama),
        ),
        H(View, { style: styles.identityRow },
          H(Text, { style: styles.identityLabel }, 'Jabatan'),
          H(Text, { style: styles.identityColon }, ':'),
          H(Text, { style: styles.identityValue }, c.penandatanganJabatan),
        ),
        H(View, { style: styles.identityRow },
          H(Text, { style: styles.identityLabel }, 'Alamat'),
          H(Text, { style: styles.identityColon }, ':'),
          H(Text, { style: styles.identityValue }, alamatLines[0] || c.alamat),
        ),
        ...alamatLines.slice(1).map((line, i) =>
          H(View, { key: i, style: styles.identityRow },
            H(Text, { style: styles.identityLabel }, ''),
            H(Text, { style: styles.identityColon }, ':'),
            H(Text, { style: styles.identityValue }, line),
          )
        ),
        H(View, { style: styles.identityRow },
          H(Text, { style: styles.identityLabel }, 'NPWP'),
          H(Text, { style: styles.identityColon }, ':'),
          H(Text, { style: styles.identityValue }, c.npwp),
        ),
      ),

      H(Text, { style: styles.paragraf1 },
        'Dengan ini menyatakan bahwa ',
        H(Text, { style: { fontWeight: 'bold' } }, 'PT. RIZQI RIDHO ILAHI (RRI)'),
        ' bukan merupakan Pengusaha Kena Pajak sebagaimana yang diatur dalam Undang Undang Pajak Pertambahan Nilai (PPn). Terkait dengan transaksi penjualan barang kena pajak atau jasa kena pajak yang kami lakukan kepada Perusahaan, Kami tidak dapat menerbitkan Faktur Pajak.',
      ),

      H(Text, { style: styles.penutup },
        'Demikian surat ini kami buat sesuai dengan keadaan yang sesungguhnya untuk dapat digunaakan sebagaimana mestinya dan dapat dipertanggungjawabkan secara aturan dan hukum.',
      ),

      H(View, { style: styles.signatureSection },
        H(Text, { style: styles.signatureDate }, data.tanggal),
        H(Text, { style: styles.signatureCompany }, c.companyNama || 'PT RIZQI RIDHO ILAHI'),
        H(Text, { style: styles.signatureName }, c.penandatanganNama),
        H(Text, { style: styles.signatureJabatan }, c.penandatanganJabatan),
      ),

      H(View, { style: styles.footer },
        H(Text, { style: styles.footerText }, c.companyAlamat || 'Jerukwangi - Bangsri, Jepara'),
        H(Text, { style: styles.footerText },
          (c.companyNoHp || '+6281 2607 5500') + ', ' + (c.companyEmail || 'mazzjoeq@gmail.com')
        ),
      ),
      H(Text, { style: styles.pageNum }, 'Page 1 of 1'),
    ),
  )
}
