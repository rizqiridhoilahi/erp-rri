import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10 },
  header: { marginBottom: 24 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#0F172A' },
  subtitle: { fontSize: 10, color: '#64748B', marginTop: 4 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#0F172A', marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', paddingBottom: 4 },
  kpiRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  kpiCard: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 4, padding: '12 16', flex: 1, marginHorizontal: 4 },
  kpiLabel: { fontSize: 8, color: '#64748B', marginBottom: 4, textTransform: 'uppercase' },
  kpiValue: { fontSize: 14, fontWeight: 'bold', color: '#0F172A' },
  table: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#F8FAFC', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', padding: '8 12' },
  tableHeaderCell: { flex: 1, fontSize: 8, fontWeight: 'bold', color: '#64748B', textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', padding: '8 12' },
  tableCell: { flex: 1, fontSize: 9, color: '#0F172A' },
  totalSection: { marginTop: 20, alignItems: 'flex-end' },
  totalRow: { flexDirection: 'row', justifyContent: 'flex-end', padding: '4 0' },
  totalLabel: { fontSize: 10, color: '#64748B', width: 120 },
  totalValue: { fontSize: 10, fontWeight: 'bold', width: 120, textAlign: 'right' },
  grandTotal: { fontSize: 13, fontWeight: 'bold', color: '#0F172A', marginTop: 8, borderTopWidth: 2, borderTopColor: '#0F172A', paddingTop: 8 },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: '#94A3B8', borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 10 },
})

interface MonthlyRow { bulan: string; pemasukan: number; pengeluaran: number }
interface ArusKasData {
  tahun: string; bulan: string | null
  pemasukan: number; pengeluaran: number; bersih: number
  monthly: MonthlyRow[]
}

export function LaporanArusKasPDF({ data }: { data: ArusKasData }) {
  const periodText = data.bulan ? `${data.bulan} ${data.tahun}` : `Tahun ${data.tahun}`

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Laporan Arus Kas</Text>
          <Text style={styles.subtitle}>Periode: {periodText}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ringkasan</Text>
          <View style={[styles.kpiRow, { marginHorizontal: -4 }]}>
            <View style={[styles.kpiCard, { borderColor: '#22c55e' }]}>
              <Text style={styles.kpiLabel}>Pemasukan</Text>
              <Text style={[styles.kpiValue, { color: '#16a34a' }]}>Rp {data.pemasukan.toLocaleString('id-ID')}</Text>
            </View>
            <View style={[styles.kpiCard, { borderColor: '#ef4444' }]}>
              <Text style={styles.kpiLabel}>Pengeluaran</Text>
              <Text style={[styles.kpiValue, { color: '#dc2626' }]}>Rp {data.pengeluaran.toLocaleString('id-ID')}</Text>
            </View>
            <View style={[styles.kpiCard, { borderColor: data.bersih >= 0 ? '#22c55e' : '#ef4444' }]}>
              <Text style={styles.kpiLabel}>Arus Kas Bersih</Text>
              <Text style={[styles.kpiValue, { color: data.bersih >= 0 ? '#16a34a' : '#dc2626' }]}>Rp {data.bersih.toLocaleString('id-ID')}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rincian per Bulan</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { flex: 0.8 }]}>Bulan</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Pemasukan</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Pengeluaran</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Bersih</Text>
            </View>
            {data.monthly.map((m, i) => {
              const bersihBulan = m.pemasukan - m.pengeluaran
              return (
              <View key={i} style={[styles.tableRow, i === data.monthly.length - 1 ? { borderBottomWidth: 0 } : {}]}>              
                  <Text style={[styles.tableCell, { flex: 0.8 }]}>{m.bulan}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{m.pemasukan.toLocaleString('id-ID')}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{m.pengeluaran.toLocaleString('id-ID')}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{bersihBulan.toLocaleString('id-ID')}</Text>
                </View>
              )
            })}
          </View>
        </View>

        <View style={styles.totalSection}>
          <View style={styles.totalRow}><Text style={styles.totalLabel}>Total Pemasukan</Text><Text style={styles.totalValue}>Rp {data.pemasukan.toLocaleString('id-ID')}</Text></View>
          <View style={styles.totalRow}><Text style={styles.totalLabel}>Total Pengeluaran</Text><Text style={styles.totalValue}>Rp {data.pengeluaran.toLocaleString('id-ID')}</Text></View>
          <View style={styles.grandTotal}><Text style={[styles.totalLabel, { fontWeight: 'bold' }]}>Arus Kas Bersih</Text><Text style={styles.totalValue}>Rp {data.bersih.toLocaleString('id-ID')}</Text></View>
        </View>

        <Text style={styles.footer}>Dicetak dari ERP RRI - PT. Rizki Ridho Ilahi | Periode {periodText}</Text>
      </Page>
    </Document>
  )
}
