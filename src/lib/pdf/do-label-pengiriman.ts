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
  primary: '#0000FF',
  accent: '#0000FF',
  border: '#333',
  lightBg: '#F8F6F0',
  foreground: '#000',
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
  cutH: {
    position: 'absolute',
    borderTopWidth: 1,
    borderTopColor: '#bbb',
    borderStyle: 'dashed',
  },
  cutV: {
    position: 'absolute',
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
    color: '#666',
    lineHeight: 1,
  },
  quadrant: {
    position: 'absolute',
    width: '50%',
    height: '25%',
    padding: 6,
  },
  bidangUsahaSection: {
    marginBottom: 2,
  },
  bidangUsahaLine: {
    fontSize: 3.5,
    color: COLORS.foreground,
  },
  accentBar: {
    height: 2,
    backgroundColor: COLORS.primary,
    marginBottom: 4,
    marginHorizontal: -6,
    marginTop: -6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  logo: {
    width: 16,
    height: 16,
    marginRight: 4,
    objectFit: 'contain',
  },
  logoPlaceholder: {
    width: 16,
    height: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
    borderRadius: 2,
  },
  logoPlaceholderText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 6.5,
    fontWeight: 'bold',
    color: '#0000FF',
    marginBottom: 0.5,
  },
  companyDetail: {
    fontSize: 4.5,
    color: COLORS.foreground,
    marginBottom: 0.3,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.primary,
    paddingBottom: 2,
  },
  titleText: {
    fontSize: 6,
    fontWeight: 'bold',
    color: '#0000FF',
    letterSpacing: 1,
  },
  doRef: {
    fontSize: 4.5,
    color: COLORS.foreground,
    marginTop: 0.5,
  },
  recipientBox: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 2,
    padding: '3 6',
    marginBottom: 4,
    backgroundColor: COLORS.lightBg,
  },
  recipientLabel: {
    fontSize: 4,
    fontWeight: 'bold',
    color: COLORS.foreground,
    letterSpacing: 0.8,
    marginBottom: 1,
    textTransform: 'uppercase',
  },
  recipientName: {
    fontSize: 5.5,
    fontWeight: 'bold',
    color: '#0000FF',
    marginBottom: 0.5,
  },
  recipientCompanyName: {
    fontSize: 6.5,
    fontWeight: 'bold',
    color: '#0000FF',
    marginBottom: 0.5,
  },
  recipientLine: {
    fontSize: 4,
    color: COLORS.foreground,
    marginBottom: 0.3,
  },
  senderSection: {
    borderTopWidth: 0.5,
    borderTopColor: '#ccc',
    paddingTop: 2,
  },
  senderLabel: {
    fontSize: 3.5,
    fontWeight: 'bold',
    color: COLORS.foreground,
    letterSpacing: 0.5,
    marginBottom: 0.5,
  },
  senderName: {
    fontSize: 5,
    fontWeight: 'bold',
    color: '#0000FF',
  },
  senderDetail: {
    fontSize: 4,
    color: COLORS.foreground,
  },
})

const QPOS: Record<string, { top: string; left: string }> = {
  '00': { top: '0%', left: '0%' },
  '10': { top: '0%', left: '50%' },
  '01': { top: '25%', left: '0%' },
  '11': { top: '25%', left: '50%' },
  '02': { top: '50%', left: '0%' },
  '12': { top: '50%', left: '50%' },
  '03': { top: '75%', left: '0%' },
  '13': { top: '75%', left: '50%' },
}

const ALL_POSITIONS: { r: number; c: number }[] = [
  { r: 0, c: 0 }, { r: 0, c: 1 },
  { r: 1, c: 0 }, { r: 1, c: 1 },
  { r: 2, c: 0 }, { r: 2, c: 1 },
  { r: 3, c: 0 }, { r: 3, c: 1 },
]

interface LabelCompany {
  company_nama: string | null
  company_bidang_usaha: string | null
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

function getBidangLines(bidangUsaha: string | null): string[] {
  if (!bidangUsaha) return []
  const lines = bidangUsaha.includes('\n')
    ? bidangUsaha.split('\n').map(s => s.trim()).filter(Boolean)
    : bidangUsaha.split(',').map(s => s.trim()).filter(Boolean)
  return lines
}

function singleLabel(data: LabelData, key: string): ReactElement {
  const H = createEl
  const c = data.company
  const pic = data.pic
  const cust = data.customer
  const bidangLines = getBidangLines(c.company_bidang_usaha)

  return H(View, { key, style: { flex: 1 } },
    H(View, { style: styles.accentBar }),

    bidangLines.length > 0
      ? H(View, { style: styles.bidangUsahaSection },
          ...bidangLines.map((line, i) =>
            H(Text, { key: i, style: styles.bidangUsahaLine }, line)
          ),
        )
      : null,

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
      H(Text, { style: styles.recipientCompanyName }, cust.nama),
      H(Text, { style: styles.recipientLine }, cust.alamat || ''),
      pic.no_hp ? H(Text, { style: styles.recipientLine }, `Telp/WA: ${pic.no_hp}`) : null,
    ),

    H(View, { style: styles.senderSection },
      H(Text, { style: styles.senderLabel }, 'PENGIRIM'),
      H(Text, { style: styles.senderName }, c.company_nama || 'PT. RIZQI RIDHO ILAHI'),
      H(Text, { style: styles.senderDetail }, c.company_alamat || ''),
      H(Text, { style: styles.senderDetail }, `Telp: ${c.company_no_hp || ''}`),
    ),
  )
}

interface CutLineH { top: string; left: string; width: string }
interface CutLineV { top: string; left: string; height: string }
interface Crosshair { top: string; left: string }

function getCutLines(showAll: boolean, row?: number, col?: number) {
  const hCuts: CutLineH[] = []
  const vCuts: CutLineV[] = []
  const crosshairs: Crosshair[] = []

  if (showAll) {
    hCuts.push(
      { top: '25%', left: '0%', width: '100%' },
      { top: '50%', left: '0%', width: '100%' },
      { top: '75%', left: '0%', width: '100%' },
    )
    vCuts.push({ top: '0%', left: '50%', height: '100%' })
    crosshairs.push(
      { top: '0%', left: '50%' },
      { top: '25%', left: '50%' },
      { top: '50%', left: '50%' },
      { top: '75%', left: '50%' },
      { top: '100%', left: '50%' },
      { top: '50%', left: '0%' },
      { top: '50%', left: '100%' },
    )
    return { hCuts, vCuts, crosshairs }
  }

  const r = row!
  const c = col!

  if (r > 0) {
    hCuts.push({ top: `${r * 25}%`, left: `${c * 50}%`, width: '50%' })
  }
  if (r < 3) {
    hCuts.push({ top: `${(r + 1) * 25}%`, left: `${c * 50}%`, width: '50%' })
  }

  if (c > 0) {
    vCuts.push({ top: `${r * 25}%`, left: `${c * 50}%`, height: '25%' })
  }
  if (c < 1) {
    vCuts.push({ top: `${r * 25}%`, left: `${(c + 1) * 50}%`, height: '25%' })
  }

  for (const h of hCuts) {
    crosshairs.push({ top: h.top, left: `${c * 50}%` })
    crosshairs.push({ top: h.top, left: `${(c + 1) * 50}%` })
  }

  for (const v of vCuts) {
    crosshairs.push({ top: `${r * 25}%`, left: v.left })
    crosshairs.push({ top: `${(r + 1) * 25}%`, left: v.left })
  }

  const seen = new Set<string>()
  const deduped = crosshairs.filter(ch => {
    const key = `${ch.top}-${ch.left}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return { hCuts, vCuts, crosshairs: deduped }
}

export function DOLabelPengirimanPDF({ data, row, col }: PDFProps): ReactElement {
  const H = createEl

  const showAll = row === undefined || col === undefined
  const renderPositions = showAll ? ALL_POSITIONS : [{ r: row!, c: col! }]
  const emptyPositions = showAll ? [] : ALL_POSITIONS.filter(p => !(p.r === row && p.c === col))
  const { hCuts, vCuts, crosshairs } = getCutLines(showAll, row, col)

  function qpos(r: number, c: number) {
    return QPOS[`${c}${r}`] || QPOS['00']
  }

  return H(Document, null,
    H(Page, { size: 'A4', style: styles.page },
      H(View, { style: styles.pageContainer },

        ...hCuts.map((h, i) =>
          H(View, { key: `h-${i}`, style: { ...styles.cutH, top: h.top, left: h.left, width: h.width } })
        ),
        ...vCuts.map((v, i) =>
          H(View, { key: `v-${i}`, style: { ...styles.cutV, top: v.top, left: v.left, height: v.height } })
        ),

        ...crosshairs.map((ch, i) =>
          H(View, {
            key: `ch-${i}`,
            style: { ...styles.crosshair, top: ch.top, left: ch.left, marginTop: -4, marginLeft: -4 },
          },
            H(Text, { style: styles.crosshairText }, '+'),
          )
        ),

        ...renderPositions.map(({ r, c }) => {
          const pos = qpos(r, c)
          return H(View, { key: `q-${r}-${c}`, style: { ...styles.quadrant, ...pos } },
            singleLabel(data, `${r}-${c}`),
          )
        }),

        ...emptyPositions.map(({ r, c }) => {
          const pos = qpos(r, c)
          return H(View, { key: `empty-${r}-${c}`, style: { ...styles.quadrant, ...pos } })
        }),
      ),
    ),
  )
}
