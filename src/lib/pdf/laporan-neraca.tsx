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
  table: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden', marginBottom: 12 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#F8FAFC', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', padding: '8 12' },
  tableHeaderCell: { flex: 1, fontSize: 8, fontWeight: 'bold', color: '#64748B', textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', padding: '8 12' },
  tableCell: { flex: 1, fontSize: 9, color: '#0F172A' },
  groupTotal: { flexDirection: 'row', backgroundColor: '#F8FAFC', padding: '8 12', borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: '#94A3B8', borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 10 },
})

interface AkunRow { kode: string; nama: string; saldo: number }
interface NeracaGroup { tipe: string; total: number; akuns: AkunRow[] }
interface NeracaData {
  tahun: string
  groups: NeracaGroup[]
  balanceDiff: number
}

const typeLabels: Record<string, string> = { aset: 'Aset', liabilitas: 'Liabilitas', ekuitas: 'Ekuitas' }

export function LaporanNeracaPDF({ data }: { data: NeracaData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Neraca</Text>
          <Text style={styles.subtitle}>Periode: Tahun {data.tahun}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ringkasan</Text>
          <View style={[styles.kpiRow, { marginHorizontal: -4 }]}>
            {data.groups.map(g => (
              <View key={g.tipe} style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>{typeLabels[g.tipe] ?? g.tipe}</Text>
                <Text style={styles.kpiValue}>Rp {g.total.toLocaleString('id-ID')}</Text>
                <Text style={{ fontSize: 7, color: '#94A3B8', marginTop: 2 }}>{g.akuns.length} akun</Text>
              </View>
            ))}
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Balance Check</Text>
              <Text style={[styles.kpiValue, { color: Math.abs(data.balanceDiff) < 1000 ? '#16a34a' : '#dc2626' }]}>
                {Math.abs(data.balanceDiff) < 1000 ? '✓ Balanced' : `Rp ${data.balanceDiff.toLocaleString('id-ID')}`}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rincian Akun</Text>
          {data.groups.map(g => (
            <View key={g.tipe} style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#0F172A', marginBottom: 4 }}>{typeLabels[g.tipe] ?? g.tipe}</Text>
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderCell, { flex: 0.5 }]}>Kode</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>Nama Akun</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Saldo</Text>
                </View>
                {g.akuns.map((a, i) => (
                  <View key={i} style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 0.5 }]}>{a.kode}</Text>
                    <Text style={[styles.tableCell, { flex: 1.5 }]}>{a.nama}</Text>
                    <Text style={[styles.tableCell, { flex: 1 }]}>Rp {a.saldo.toLocaleString('id-ID')}</Text>
                  </View>
                ))}
                <View style={styles.groupTotal}>
                  <Text style={[styles.tableCell, { flex: 2, fontWeight: 'bold' }]}>Total {typeLabels[g.tipe] ?? g.tipe}</Text>
                  <Text style={[styles.tableCell, { flex: 1, fontWeight: 'bold' }]}>Rp {g.total.toLocaleString('id-ID')}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>Dicetak dari ERP RRI - PT. Rizki Ridho Ilahi | Periode Tahun {data.tahun}</Text>
      </Page>
    </Document>
  )
}
