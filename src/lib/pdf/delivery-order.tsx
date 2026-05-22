import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10 },
  header: { marginBottom: 30 },
  perusahaan: { fontSize: 12, fontWeight: 'bold', color: '#0F172A', marginBottom: 2 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0F172A' },
  subtitle: { fontSize: 10, color: '#64748B', marginTop: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  infoBox: { fontSize: 9 },
  infoLabel: { color: '#64748B', marginBottom: 2 },
  infoValue: { color: '#0F172A', fontWeight: 'bold', marginBottom: 6 },
  table: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#F8FAFC', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', padding: '8 12' },
  tableHeaderCell: { flex: 1, fontSize: 8, fontWeight: 'bold', color: '#64748B', textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', padding: '8 12' },
  tableCell: { flex: 1, fontSize: 9, color: '#0F172A' },
  signSection: { marginTop: 40, flexDirection: 'row', justifyContent: 'space-between' },
  signBox: { width: '30%' },
  signLabel: { fontSize: 9, color: '#64748B', marginBottom: 40 },
  signLine: { borderBottomWidth: 1, borderBottomColor: '#0F172A', marginBottom: 4 },
  signName: { fontSize: 9, color: '#0F172A', textAlign: 'center' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: '#94A3B8', borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 10 },
})

interface DOItem { nama: string; kode: string; satuan: string; jumlah: number }
interface DOData { nomor: string; customer: string; soNomor: string; tanggal: string; keterangan: string; items: DOItem[] }

export function DeliveryOrderPDF({ data }: { data: DOData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.perusahaan}>PT. RIZKI RIDHO ILAHI</Text>
          <Text style={styles.title}>SURAT JALAN</Text>
          <Text style={styles.subtitle}>{data.nomor}</Text>
        </View>
        <View style={styles.row}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Kepada Yth.</Text>
            <Text style={styles.infoValue}>{data.customer}</Text>
            <Text style={styles.infoLabel}>Ref. Sales Order</Text>
            <Text style={styles.infoValue}>{data.soNomor}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Tanggal</Text>
            <Text style={styles.infoValue}>{data.tanggal}</Text>
          </View>
        </View>
        <Text style={{ fontSize: 10, color: '#0F172A', fontWeight: 'bold', marginBottom: 8 }}>Dengan ini dikirimkan barang sebagai berikut:</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { flex: 0.5 }]}>No</Text>
            <Text style={[styles.tableHeaderCell, { flex: 0.8 }]}>Kode</Text>
            <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Nama Barang</Text>
            <Text style={[styles.tableHeaderCell, { flex: 0.6 }]}>Satuan</Text>
            <Text style={[styles.tableHeaderCell, { flex: 0.6 }]}>Jumlah</Text>
          </View>
          {data.items.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 0.5 }]}>{i + 1}</Text>
              <Text style={[styles.tableCell, { flex: 0.8 }]}>{item.kode}</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{item.nama}</Text>
              <Text style={[styles.tableCell, { flex: 0.6 }]}>{item.satuan}</Text>
              <Text style={[styles.tableCell, { flex: 0.6 }]}>{item.jumlah}</Text>
            </View>
          ))}
        </View>
        {data.keterangan && <Text style={{ fontSize: 9, color: '#475569', marginTop: 12 }}>Keterangan: {data.keterangan}</Text>}
        <View style={styles.signSection}>
          <View style={styles.signBox}>
            <Text style={styles.signLabel}>Pengirim</Text>
            <View style={styles.signLine} />
            <Text style={styles.signName}>(...................)</Text>
          </View>
          <View style={styles.signBox}>
            <Text style={styles.signLabel}>Penerima</Text>
            <View style={styles.signLine} />
            <Text style={styles.signName}>(...................)</Text>
          </View>
          <View style={styles.signBox}>
            <Text style={styles.signLabel}>Mengetahui</Text>
            <View style={styles.signLine} />
            <Text style={styles.signName}>(...................)</Text>
          </View>
        </View>
        <Text style={styles.footer}>Dokumen ini sah dan diproses secara elektronik | ERP RRI - PT. Rizki Ridho Ilahi</Text>
      </Page>
    </Document>
  )
}
