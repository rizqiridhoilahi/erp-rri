/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ReactElement } from 'react'
import { Document, Page, Text, View, Image, StyleSheet, Font } from '@react-pdf/renderer'

Font.register({
  family: 'Arial',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/@canvas-fonts/arial@1.0.4/Arial.ttf', fontWeight: 'normal' },
    { src: 'https://cdn.jsdelivr.net/npm/@canvas-fonts/arial-bold@1.0.4/Arial%20Bold.ttf', fontWeight: 'bold' },
  ],
})

Font.registerHyphenationCallback((word) => [word])

const styles = StyleSheet.create({
  page: { padding: '40 50', fontFamily: 'Arial', fontSize: 10, lineHeight: 1.4 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: 1 },
  logoBox: { width: 90, height: 90, backgroundColor: '#1E3A5F', justifyContent: 'center', alignItems: 'center' },
  logoText: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  headerRight: { alignItems: 'flex-end' },
  companyName: { fontSize: 14, fontWeight: 'bold', marginBottom: 4, color: '#0000FF', textDecoration: 'underline' },
  companyLine: { fontSize: 11, fontWeight: 'bold', marginBottom: 1 },
  labelValueRow: { flexDirection: 'row', marginBottom: 2 },
  labelText: { fontSize: 10, width: 100 },
  colonText: { fontSize: 10, width: 10 },
  valueText: { fontSize: 10 },
  titleSection: { marginVertical: 10 },
  titleText: { fontSize: 14, fontWeight: 'bold', textAlign: 'center', textDecoration: 'underline' },
  customerSection: { marginBottom: 10 },
  sectionLabel: { fontSize: 10, fontWeight: 'bold', marginBottom: 2 },
  bodyText: { fontSize: 10, marginBottom: 2, textAlign: 'justify' },
  table: { width: '100%', borderStyle: 'solid', borderWidth: 1, borderColor: '#000', marginTop: 4 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f0f0f0', borderBottomWidth: 1, borderBottomColor: '#000' },
  tableHeaderCell: { fontSize: 8, fontWeight: 'bold', padding: 3, textAlign: 'center', borderRightWidth: 1, borderRightColor: '#000' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#000' },
  tableTotalRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#000' },
  termsSection: { marginTop: 10 },
  termsTitle: { fontSize: 10, fontWeight: 'bold', marginBottom: 4 },
  termsText: { fontSize: 9, marginBottom: 2, marginLeft: 10 },
  signatureSection: { marginTop: 20 },
  signatureName: { fontSize: 10, fontWeight: 'bold', textDecoration: 'underline' },
  signatureJabatan: { fontSize: 10 },
  footer: { position: 'absolute', bottom: 24, left: 50, right: 50, borderTopWidth: 1.5, borderTopColor: '#000', paddingTop: 6, alignItems: 'center' },
  footerText: { fontSize: 9 },
  footerContact: { fontSize: 9 },
  pageNum: { position: 'absolute', bottom: 28, right: 50, fontSize: 9, color: '#0000FF' },
})

const REACT_ELEMENT_TYPE = Symbol.for('react.element')

function h(type: any, props: Record<string, unknown> | null, ...children: unknown[]): ReactElement {
  const merged: Record<string, unknown> = { ...props }
  const childArr = children.flat(Infinity).filter(c => c !== false && c !== null && c !== undefined)
  merged.children = childArr.length === 0 ? undefined : childArr.length === 1 ? childArr[0] : childArr
  const key = (merged.key as string | null) ?? null
  delete merged.key
  return { $$typeof: REACT_ELEMENT_TYPE, type, key, ref: null, props: merged, _owner: null, _store: {} } as ReactElement
}

function fmount(v: number): string {
  if (v == null) return '0'
  return v.toLocaleString('id-ID')
}

interface CPOItem {
  urutan: number
  nama_barang: string
  kode_barang: string
  satuan: string
  jumlah: number
  harga_satuan: number
}

interface CPOData {
  nomor: string
  nomor_po_customer: string | null
  tanggal: string
  customerNama: string
  customerAlamat: string
  picNama: string | null
  picJabatan: string | null
  termsOfPayment: string | null
  waktuPengiriman: number | null
  keterangan: string | null
  items: CPOItem[]
  grandTotal: number
  company: {
    company_nama: string | null
    company_alamat: string | null
    company_no_hp: string | null
    company_email: string | null
    company_logo_url: string | null
    penandatangan_nama: string | null
    penandatangan_jabatan: string | null
  }
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function CustomerPdfPO({ data }: { data: CPOData }) {
  const H = h
  const c = data.company

  return H(Document, null,
    H(Page, { size: 'A4', style: styles.page },
      H(View, { style: { marginBottom: 8 } },
        H(View, { style: styles.header },
          c.company_logo_url
            ? H(Image, { src: c.company_logo_url, style: { width: 80, height: 80, marginTop: -5 } })
            : H(View, { style: styles.logoBox }, H(Text, { style: styles.logoText }, 'R')),
          H(View, { style: styles.headerRight },
            H(Text, { style: styles.companyName }, c.company_nama || 'PT. RIZQI RIDHO ILAHI'),
            H(Text, { style: styles.companyLine }, 'Furniture, Welding, General Trading, Services'),
          ),
        ),
        H(View, { style: { borderBottomWidth: 2, borderBottomColor: '#000', marginTop: 3 } }),
        H(View, { style: { height: 3 } }),
        H(View, { style: { borderBottomWidth: 0.5, borderBottomColor: '#000' } }),
      ),

      H(View, { style: styles.titleSection },
        H(Text, { style: styles.titleText }, 'PURCHASE ORDER'),
      ),

      H(View, { style: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 } },
        H(View, null,
          H(View, { style: styles.labelValueRow },
            H(Text, { style: styles.labelText }, 'No. PO'),
            H(Text, { style: styles.colonText }, ':'),
            H(Text, { style: [styles.valueText, { fontWeight: 'bold' }] }, data.nomor),
          ),
          ...(data.nomor_po_customer
            ? [H(View, { style: styles.labelValueRow },
                H(Text, { style: styles.labelText }, 'No. PO Customer'),
                H(Text, { style: styles.colonText }, ':'),
                H(Text, { style: styles.valueText }, data.nomor_po_customer),
              )]
            : []
          ),
          ...(data.termsOfPayment
            ? [H(View, { style: styles.labelValueRow },
                H(Text, { style: styles.labelText }, 'Term of Payment'),
                H(Text, { style: styles.colonText }, ':'),
                H(Text, { style: styles.valueText }, data.termsOfPayment),
              )]
            : []
          ),
          ...(data.waktuPengiriman
            ? [H(View, { style: styles.labelValueRow },
                H(Text, { style: styles.labelText }, 'Waktu Pengiriman'),
                H(Text, { style: styles.colonText }, ':'),
                H(Text, { style: styles.valueText }, `${data.waktuPengiriman} hari`),
              )]
            : []
          ),
        ),
        H(Text, { style: styles.valueText }, formatDate(data.tanggal)),
      ),

      H(View, { style: styles.customerSection },
        H(Text, { style: styles.sectionLabel }, 'Kepada Yth.'),
        H(Text, { style: [styles.valueText, { fontWeight: 'bold' }] }, data.customerNama),
        data.picNama ? H(Text, { style: styles.valueText }, `u.p. ${data.picNama}${data.picJabatan ? ` — ${data.picJabatan}` : ''}`) : null,
        H(Text, { style: styles.valueText }, data.customerAlamat),
      ),

      H(Text, { style: styles.bodyText }, 'Dengan hormat,'),
      H(Text, { style: styles.bodyText }, 'Kami sampaikan Pesanan Pembelian (Purchase Order) sebagai berikut:'),

      H(View, { style: styles.table },
        H(View, { style: styles.tableHeader },
          H(Text, { style: [styles.tableHeaderCell, { width: 20 }] }, 'No'),
          H(Text, { style: [styles.tableHeaderCell, { flex: 1 }] }, 'Nama Barang'),
          H(Text, { style: [styles.tableHeaderCell, { width: 60 }] }, 'Kode'),
          H(Text, { style: [styles.tableHeaderCell, { width: 40 }] }, 'Qty'),
          H(Text, { style: [styles.tableHeaderCell, { width: 55 }] }, 'Satuan'),
          H(Text, { style: [styles.tableHeaderCell, { width: 70 }] }, 'Harga'),
          H(Text, { style: [styles.tableHeaderCell, { width: 75, borderRightWidth: 0 }] }, 'Total'),
        ),
        ...data.items.map((item) => {
          const total = item.jumlah * item.harga_satuan
          return H(View, { key: item.urutan, style: styles.tableRow },
            H(View, { style: { width: 20, padding: 2, justifyContent: 'center', borderRightWidth: 1, borderRightColor: '#000' } },
              H(Text, { style: { fontSize: 9, textAlign: 'center' } }, String(item.urutan)),
            ),
            H(View, { style: { flex: 1, padding: 2, justifyContent: 'center', borderRightWidth: 1, borderRightColor: '#000' } },
              H(Text, { style: { fontSize: 9 } }, item.nama_barang),
            ),
            H(View, { style: { width: 60, padding: 2, justifyContent: 'center', borderRightWidth: 1, borderRightColor: '#000' } },
              H(Text, { style: { fontSize: 9, textAlign: 'center' } }, item.kode_barang || '-'),
            ),
            H(View, { style: { width: 40, padding: 2, justifyContent: 'center', borderRightWidth: 1, borderRightColor: '#000' } },
              H(Text, { style: { fontSize: 9, textAlign: 'center' } }, String(item.jumlah)),
            ),
            H(View, { style: { width: 55, padding: 2, justifyContent: 'center', borderRightWidth: 1, borderRightColor: '#000' } },
              H(Text, { style: { fontSize: 9, textAlign: 'center' } }, item.satuan || '-'),
            ),
            H(View, { style: { width: 70, padding: 2, justifyContent: 'center', borderRightWidth: 1, borderRightColor: '#000' } },
              H(Text, { style: { fontSize: 9, textAlign: 'right' } }, 'Rp ' + fmount(item.harga_satuan)),
            ),
            H(View, { style: { width: 75, padding: 2, justifyContent: 'center' } },
              H(Text, { style: { fontSize: 9, textAlign: 'right', fontWeight: 'bold' } }, 'Rp ' + fmount(total)),
            ),
          )
        }),
        H(View, { style: styles.tableTotalRow },
          H(View, { style: { flex: 1, padding: 3, justifyContent: 'center' } },
            H(Text, { style: { fontSize: 9, fontWeight: 'bold', textAlign: 'right' } }, 'GRAND TOTAL'),
          ),
          H(View, { style: { width: 75, padding: 3, justifyContent: 'center' } },
            H(Text, { style: { fontSize: 9, fontWeight: 'bold', textAlign: 'right' } }, 'Rp ' + fmount(data.grandTotal)),
          ),
        ),
      ),

      data.keterangan ? H(View, { style: { marginTop: 8 } },
        H(Text, { style: { fontSize: 9, fontStyle: 'italic' } }, `Catatan: ${data.keterangan}`),
      ) : null,

      H(View, { style: styles.termsSection },
        H(Text, { style: styles.termsTitle }, 'Ketentuan:'),
        H(Text, { style: styles.termsText }, '1. Harga sudah termasuk PPN (jika ada).'),
        H(Text, { style: styles.termsText }, '2. Barang akan dikirim setelah pembayaran diterima.'),
        H(Text, { style: styles.termsText }, '3. Klaim barang tidak sesuai maksimal 3 hari setelah barang diterima.'),
      ),

      H(View, { style: styles.signatureSection },
        H(Text, { style: { fontSize: 10 } }, 'Hormat kami,'),
        H(Text, { style: { fontSize: 10, marginTop: 3 } }, c.company_nama || 'PT. RIZQI RIDHO ILAHI'),
        H(View, { style: { marginTop: 60 } },
          H(Text, { style: styles.signatureName }, c.penandatangan_nama || 'Mohamad Marzuqi'),
          H(Text, { style: styles.signatureJabatan }, c.penandatangan_jabatan || 'Direktur'),
        ),
      ),

      H(View, { style: styles.footer },
        H(Text, { style: styles.footerText }, c.company_alamat || 'Jerukwangi - Bangsri, Jepara'),
        H(Text, { style: styles.footerContact }, (c.company_no_hp || '+6281 2607 5500') + ', ' + (c.company_email || 'mazzjoeq@gmail.com')),
      ),
      H(Text, { style: styles.pageNum }, 'Page 1 of 1'),
    ),
  )
}
