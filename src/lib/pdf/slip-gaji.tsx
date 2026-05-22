import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

Font.register({ family: 'Helvetica' })

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10 },
  header: { marginBottom: 30, borderBottomWidth: 2, borderBottomColor: '#0F172A', paddingBottom: 10 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#0F172A' },
  subtitle: { fontSize: 9, color: '#64748B', marginTop: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  infoBox: { fontSize: 9 },
  infoLabel: { color: '#64748B', marginBottom: 2 },
  infoValue: { color: '#0F172A', fontWeight: 'bold', marginBottom: 4 },
  sectionTitle: { fontSize: 11, fontWeight: 'bold', color: '#0F172A', marginBottom: 8, marginTop: 8, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  table: { borderWidth: 1, borderColor: '#E2E8F0' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', padding: '6 12' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#F8FAFC', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', padding: '6 12' },
  tableCell: { flex: 1, fontSize: 9, color: '#0F172A' },
  tableCellRight: { flex: 1, fontSize: 9, color: '#0F172A', textAlign: 'right' },
  totalBox: { marginTop: 16, padding: 12, backgroundColor: '#F8FAFC', borderRadius: 4, alignItems: 'flex-end' },
  totalText: { fontSize: 14, fontWeight: 'bold', color: '#0F172A' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: '#94A3B8', borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 10 },
})

interface SlipGajiData { nomor: string; karyawan_nama: string; karyawan_nik: string; bulan: number; tahun: number; gaji_pokok: number; tunjangan: number; potongan: number; gaji_bersih: number; tanggal_pembayaran: string | null }

export function SlipGajiPDF({ data }: { data: SlipGajiData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>SLIP GAJI</Text>
          <Text style={styles.subtitle}>{data.nomor}</Text>
        </View>
        <View style={styles.row}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Karyawan</Text>
            <Text style={styles.infoValue}>{data.karyawan_nama}</Text>
            <Text style={styles.infoLabel}>NIK</Text>
            <Text style={styles.infoValue}>{data.karyawan_nik}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Periode</Text>
            <Text style={styles.infoValue}>{data.bulan}/{data.tahun}</Text>
            {data.tanggal_pembayaran && <><Text style={styles.infoLabel}>Tgl Bayar</Text><Text style={styles.infoValue}>{data.tanggal_pembayaran}</Text></>}
          </View>
        </View>
        <Text style={styles.sectionTitle}>Rincian Gaji</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}><Text style={styles.tableCell}>Komponen</Text><Text style={styles.tableCellRight}>Jumlah</Text></View>
          <View style={styles.tableRow}><Text style={styles.tableCell}>Gaji Pokok</Text><Text style={styles.tableCellRight}>Rp {data.gaji_pokok.toLocaleString('id-ID')}</Text></View>
          {data.tunjangan > 0 && <View style={styles.tableRow}><Text style={styles.tableCell}>Tunjangan</Text><Text style={styles.tableCellRight}>Rp {data.tunjangan.toLocaleString('id-ID')}</Text></View>}
          {data.potongan > 0 && <View style={styles.tableRow}><Text style={styles.tableCell}>Potongan</Text><Text style={styles.tableCellRight}>-Rp {data.potongan.toLocaleString('id-ID')}</Text></View>}
        </View>
        <View style={styles.totalBox}><Text style={styles.totalText}>Gaji Bersih: Rp {data.gaji_bersih.toLocaleString('id-ID')}</Text></View>
        <Text style={styles.footer}>Dokumen ini sah dan diproses secara elektronik | ERP RRI - PT. Rizki Ridho Ilahi</Text>
      </Page>
    </Document>
  )
}
