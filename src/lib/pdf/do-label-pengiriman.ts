/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ReactElement } from 'react'
import { Document, Page, Text, View, Image, StyleSheet, Font } from '@react-pdf/renderer'

Font.register({
  family: 'Arial',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/@canvas-fonts/arial@1.0.4/Arial.ttf', fontWeight: 'normal', fontStyle: 'normal' },
    { src: 'https://cdn.jsdelivr.net/npm/@canvas-fonts/arial-bold@1.0.4/Arial%20Bold.ttf', fontWeight: 'bold', fontStyle: 'normal' },
  ],
})

Font.registerHyphenationCallback((word) => [word])

const COLORS = {
  primary: '#1E3A5F',
  accent: '#C8A951',
  border: '#333',
  lightBg: '#F8F6F0',
  muted: '#666',
}

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontFamily: 'Arial',
    fontSize: 8,
    lineHeight: 1.3,
  },
  pageContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  // Cut lines
  cutH: {
    position: 'absolute',
    top: '50%',
    left: 0,
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#bbb',
    borderStyle: 'dashed',
  },
  cutV: {
    position: 'absolute',
    top: 0,
    left: '50%',
    height: '100%',
    borderLeftWidth: 1,
    borderLeftColor: '#bbb',
    borderStyle: 'dashed',
  },
  crosshair: {
    position: 'absolute',
    width: 8,
    height: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  crosshairText: {
    fontSize: 6,
    color: '#999',
    lineHeight: 1,
  },
  // Quadrant container
  quadrant: {
    position: 'absolute',
    width: '50%',
    height: '50%',
    padding: 8,
  },
  // Label content
  accentBar: {
    height: 2.5,
    backgroundColor: COLORS.accent,
    marginBottom: 5,
    marginHorizontal: -8,
    marginTop: -8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  logo: {
    width: 22,
    height: 22,
    marginRight: 6,
    objectFit: 'contain',
  },
  logoPlaceholder: {
    width: 22,
    height: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
    borderRadius: 2,
  },
  logoPlaceholderText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 8.5,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 1,
  },
  companyDetail: {
    fontSize: 5.5,
    color: COLORS.muted,
    marginBottom: 0.5,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.accent,
    paddingBottom: 3,
  },
  titleText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: COLORS.primary,
    letterSpacing: 1.5,
  },
  doRef: {
    fontSize: 5.5,
    color: COLORS.muted,
    marginTop: 1,
  },
  recipientBox: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 3,
    padding: '5 8',
    marginBottom: 5,
    backgroundColor: COLORS.lightBg,
  },
  recipientLabel: {
    fontSize: 5,
    fontWeight: 'bold',
    color: COLORS.accent,
    letterSpacing: 1,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  recipientName: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 1,
  },
  recipientLine: {
    fontSize: 5.5,
    color: '#444',
    marginBottom: 0.5,
  },
  senderSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 0.5,
    borderTopColor: '#ccc',
    paddingTop: 3,
  },
  senderLeft: {
    flex: 1,
  },
  senderLabel: {
    fontSize: 4.5,
    fontWeight: 'bold',
    color: COLORS.muted,
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  senderName: {
    fontSize: 6,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  senderDetail: {
    fontSize: 5,
    color: COLORS.muted,
  },
  stampBox: {
    width: 28,
    height: 28,
    borderWidth: 0.5,
    borderColor: '#ccc',
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stampPlaceholder: {
    fontSize: 4,
    color: '#bbb',
    textAlign: 'center',
  },
})

const QPOS = {
  '00': { top: 0, left: 0 },
  '10': { top: 0, left: '50%' },
  '01': { top: '50%', left: 0 },
  '11': { top: '50%', left: '50%' },
} as const

interface LabelCompany {
  company_nama: string | null
  company_alamat: string | null
  company_no_hp: string | null
  company_email: string | null
  company_logo_url: string | null
}

interface LabelPIC {
  nama: string
  jabatan: string | null
  no_hp: string | null
  jenis_kelamin: string | null
}

interface CustomerInfo {
  nama: string
  alamat: string | null
}

interface LabelData {
  do_nomor: string
  tanggal: string
  customer: CustomerInfo
  pic: LabelPIC
  company: LabelCompany
}

interface PDFProps {
  data: LabelData
  row?: number
  col?: number
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

function formatDate(d: string): string {
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  const date = new Date(d)
  if (isNaN(date.getTime())) return d
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
}

function sapaan(jk: string | null): string {
  if (jk === 'Laki-laki' || jk === 'L') return 'Bapak'
  if (jk === 'Perempuan' || jk === 'P') return 'Ibu'
  return 'Bapak/Ibu'
}

function singleLabel(data: LabelData, key: string): ReactElement {
  const H = createEl
  const c = data.company
  const pic = data.pic
  const cust = data.customer

  return H(View, { key, style: { flex: 1 } },
    H(View, { style: styles.accentBar }),

    H(View, { style: styles.headerRow },
      c.company_logo_url
        ? H(Image, { src: c.company_logo_url, style: styles.logo })
        : H(View, { style: styles.logoPlaceholder },
            H(Text, { style: styles.logoPlaceholderText }, 'RRI')
          ),
      H(View, { style: styles.companyInfo },
        H(Text, { style: styles.companyName }, c.company_nama || 'PT. RIZQI RIDHO ILAHI'),
        H(Text, { style: styles.companyDetail }, c.company_alamat || ''),
        H(Text, { style: styles.companyDetail }, `${c.company_no_hp || ''}${c.company_no_hp && c.company_email ? ' · ' : ''}${c.company_email || ''}`),
      ),
    ),

    H(View, { style: styles.titleSection },
      H(Text, { style: styles.titleText }, 'LABEL PENGIRIMAN'),
      H(Text, { style: styles.doRef }, `${data.do_nomor} · ${formatDate(data.tanggal)}`),
    ),

    H(View, { style: styles.recipientBox },
      H(Text, { style: styles.recipientLabel }, 'PENERIMA'),
      H(Text, { style: styles.recipientName },
        `${sapaan(pic.jenis_kelamin)} ${pic.nama}${pic.jabatan ? ` (${pic.jabatan})` : ''}`
      ),
      H(Text, { style: styles.recipientLine }, cust.nama),
      H(Text, { style: styles.recipientLine }, cust.alamat || ''),
      pic.no_hp ? H(Text, { style: styles.recipientLine }, `Telp/WA: ${pic.no_hp}`) : null,
    ),

    H(View, { style: styles.senderSection },
      H(View, { style: styles.senderLeft },
        H(Text, { style: styles.senderLabel }, 'PENGIRIM'),
        H(Text, { style: styles.senderName }, c.company_nama || 'PT. RIZQI RIDHO ILAHI'),
        H(Text, { style: styles.senderDetail }, c.company_alamat || ''),
        H(Text, { style: styles.senderDetail }, `Telp: ${c.company_no_hp || ''}`),
      ),
      H(View, { style: styles.stampBox },
        H(Text, { style: styles.stampPlaceholder }, '[STEMPEL\nPERUSAHAAN]'),
      ),
    ),
  )
}

export function DOLabelPengirimanPDF({ data, row, col }: PDFProps): ReactElement {
  const H = createEl

  const showAll = row === undefined || col === undefined
  const renderPositions: { r: number; c: number }[] = showAll
    ? [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 1, c: 0 }, { r: 1, c: 1 }]
    : [{ r: row!, c: col! }]

  function quadrantPos(r: number, c: number) {
    return QPOS[`${c}${r}` as keyof typeof QPOS] || QPOS['00']
  }

  return H(Document, null,
    H(Page, { size: 'A4', style: styles.page },
      H(View, { style: styles.pageContainer },

        // Cut lines
        H(View, { style: styles.cutH }),
        H(View, { style: styles.cutV }),

        // Crosshairs
        H(View, { key: 'ch-c', style: { ...styles.crosshair, top: '50%', left: '50%', marginTop: -4, marginLeft: -4 } },
          H(Text, { style: styles.crosshairText }, '+'),
        ),
        H(View, { key: 'ch-t', style: { ...styles.crosshair, top: 0, left: '50%', marginLeft: -4 } },
          H(Text, { style: styles.crosshairText }, '+'),
        ),
        H(View, { key: 'ch-b', style: { ...styles.crosshair, top: '100%', left: '50%', marginTop: -8, marginLeft: -4 } },
          H(Text, { style: styles.crosshairText }, '+'),
        ),
        H(View, { key: 'ch-l', style: { ...styles.crosshair, top: '50%', left: 0, marginTop: -4 } },
          H(Text, { style: styles.crosshairText }, '+'),
        ),
        H(View, { key: 'ch-r', style: { ...styles.crosshair, top: '50%', left: '100%', marginTop: -4, marginLeft: -8 } },
          H(Text, { style: styles.crosshairText }, '+'),
        ),

        // Quadrants
        ...renderPositions.map(({ r, c }) => {
          const pos = quadrantPos(r, c)
          return H(View, { key: `q-${r}-${c}`, style: { ...styles.quadrant, ...pos } },
            singleLabel(data, `${r}-${c}`),
          )
        }),

        // Empty quadrants (when single position selected)
        ...(!showAll
          ? ([
              { r: 0, c: 0 }, { r: 0, c: 1 }, { r: 1, c: 0 }, { r: 1, c: 1 }
            ].filter(({ r, c }) => !(r === row && c === col))
             .map(({ r, c }) => {
               const pos = quadrantPos(r, c)
               return H(View, { key: `empty-${r}-${c}`, style: { ...styles.quadrant, ...pos } })
             }))
          : []
        ),
      ),
    ),
  )
}
