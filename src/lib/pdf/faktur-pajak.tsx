import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10 },
  header: { marginBottom: 24, textAlign: 'center' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { fontSize: 10, marginBottom: 2 },
  section: { marginTop: 16 },
  sectionTitle: { fontSize: 11, fontWeight: 'bold', marginBottom: 6, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', paddingBottom: 4 },
  infoGrid: { flexDirection: 'row', gap: 20, marginTop: 8 },
  infoCol: { flex: 1, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 4, padding: 10 },
  infoLabel: { fontSize: 8, color: '#64748B', marginBottom: 2 },
  infoValue: { fontSize: 9, fontWeight: 'bold', marginBottom: 4 },
  infoValueMono: { fontSize: 8, fontFamily: 'Courier', marginBottom: 4 },
  table: { borderWidth: 1, borderColor: '#E2E8F0', marginTop: 8 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', padding: '6 8' },
  tableHeaderCell: { fontSize: 8, fontWeight: 'bold', color: '#64748B' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', padding: '6 8' },
  tableCell: { fontSize: 8 },
  totalSection: { marginTop: 16, alignItems: 'flex-end' },
  totalRow: { flexDirection: 'row', padding: '3 0' },
  totalLabel: { fontSize: 9, color: '#64748B', width: 100 },
  totalValue: { fontSize: 9, fontWeight: 'bold', width: 100, textAlign: 'right' },
  grandTotal: { fontSize: 11, fontWeight: 'bold', marginTop: 6, borderTopWidth: 2, borderTopColor: '#0F172A', paddingTop: 6 },
  refRow: { fontSize: 8, color: '#64748B', marginTop: 8, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 4, padding: 8, textAlign: 'center' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: '#94A3B8', borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 10 },
})

interface FakturPajakItem {
  nama: string
  kode: string
  satuan: string
  jumlah: number
  hargaSatuan: number
  dpp: number
  ppn: number
  pph: number | null
}

interface FakturPajakData {
  nomor: string
  nomorFaktur: string
  tanggal: string
  dpp: number
  ppn: number
  pph: number | null
  companyNama: string
  companyAlamat: string
  companyNpwp: string
  customerNama: string
  customerAlamat: string
  invoiceNomor: string
  items: FakturPajakItem[]
}

function rupiah(v: number) {
  return v.toLocaleString('id-ID')
}

export function FakturPajakPDF({ data }: { data: FakturPajakData }) {
  const total = data.dpp + data.ppn - (data.pph ?? 0)
  const ppnRate = data.dpp > 0 ? Math.round((data.ppn / data.dpp) * 100) : 11
  const pphRate = data.pph && data.dpp > 0 ? Math.round((data.pph / data.dpp) * 100) : null

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>FAKTUR PAJAK</Text>
          <Text style={styles.subtitle}>Kode dan Nomor Seri Faktur Pajak: {data.nomorFaktur}</Text>
          <Text style={styles.subtitle}>Tanggal: {new Date(data.tanggal).toLocaleDateString('id-ID')}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.infoGrid}>
            <View style={styles.infoCol}>
              <Text style={styles.sectionTitle}>PKP Penjual</Text>
              <Text style={styles.infoLabel}>Nama</Text>
              <Text style={styles.infoValue}>{data.companyNama}</Text>
              <Text style={styles.infoLabel}>NPWP</Text>
              <Text style={styles.infoValueMono}>{data.companyNpwp || '-'}</Text>
              <Text style={styles.infoLabel}>Alamat</Text>
              <Text style={styles.infoValue}>{data.companyAlamat || '-'}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.sectionTitle}>Pembeli</Text>
              <Text style={styles.infoLabel}>Nama</Text>
              <Text style={styles.infoValue}>{data.customerNama}</Text>
              <Text style={styles.infoLabel}>NPWP</Text>
              <Text style={styles.infoValueMono}>-</Text>
              <Text style={styles.infoLabel}>Alamat</Text>
              <Text style={styles.infoValue}>{data.customerAlamat || '-'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.refRow}>
          <Text>Referensi: Invoice {data.invoiceNomor}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detail Item</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Nama Barang/Jasa</Text>
              <Text style={[styles.tableHeaderCell, { flex: 0.4 }]}>Jml</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Harga Satuan</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1 }]}>DPP</Text>
              <Text style={[styles.tableHeaderCell, { flex: 0.4 }]}>%PPN</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1 }]}>PPN</Text>
              {pphRate && <Text style={[styles.tableHeaderCell, { flex: 0.4 }]}>%PPh</Text>}
              {pphRate && <Text style={[styles.tableHeaderCell, { flex: 1 }]}>PPh</Text>}
            </View>
            {data.items.map((item, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 2 }]}>{item.nama}</Text>
                <Text style={[styles.tableCell, { flex: 0.4 }]}>{item.jumlah}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{rupiah(item.hargaSatuan)}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{rupiah(item.dpp)}</Text>
                <Text style={[styles.tableCell, { flex: 0.4 }]}>{ppnRate}%</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{rupiah(item.ppn)}</Text>
                {pphRate && <Text style={[styles.tableCell, { flex: 0.4 }]}>{pphRate}%</Text>}
                {pphRate && <Text style={[styles.tableCell, { flex: 1 }]}>{rupiah(item.pph ?? 0)}</Text>}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.totalSection}>
          <View style={styles.totalRow}><Text style={styles.totalLabel}>DPP</Text><Text style={styles.totalValue}>{rupiah(data.dpp)}</Text></View>
          <View style={styles.totalRow}><Text style={styles.totalLabel}>PPN {ppnRate}%</Text><Text style={styles.totalValue}>{rupiah(data.ppn)}</Text></View>
          {pphRate && <View style={styles.totalRow}><Text style={styles.totalLabel}>PPh {pphRate}%</Text><Text style={styles.totalValue}>{rupiah(data.pph ?? 0)}</Text></View>}
          <View style={styles.grandTotal}><Text style={styles.totalLabel}>Total</Text><Text style={styles.totalValue}>{rupiah(total)}</Text></View>
        </View>

        <Text style={styles.footer}>
          Dokumen ini dibuat secara elektronik dan tidak memerlukan tanda tangan basah.
          Faktur Pajak ini sah menurut ketentuan peraturan perundang-undangan perpajakan.
        </Text>
      </Page>
    </Document>
  )
}
