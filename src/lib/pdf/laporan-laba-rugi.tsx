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

interface MonthlyRow { bulan: string; pendapatan: number; hpp: number }
interface LabaRugiData {
  tahun: string; bulan: string | null
  pendapatan: number; hpp: number; labaRugi: number
  prevPendapatan: number; prevHpp: number; prevLabaRugi: number
  monthly: MonthlyRow[]
}

export function LaporanLabaRugiPDF({ data }: { data: LabaRugiData }) {
  const periodText = data.bulan ? `${data.bulan} ${data.tahun}` : `Tahun ${data.tahun}`
  const diffPendapatan = data.pendapatan - data.prevPendapatan
  const pctPendapatan = data.prevPendapatan ? ((diffPendapatan / data.prevPendapatan) * 100).toFixed(1) : '-'

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Laporan Laba / Rugi</Text>
          <Text style={styles.subtitle}>Periode: {periodText}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ringkasan</Text>
          <View style={[styles.kpiRow, { marginHorizontal: -4 }]}>
            <View style={[styles.kpiCard, { borderColor: '#22c55e' }]}>
              <Text style={styles.kpiLabel}>Pendapatan</Text>
              <Text style={[styles.kpiValue, { color: '#16a34a' }]}>Rp {data.pendapatan.toLocaleString('id-ID')}</Text>
              {data.prevPendapatan > 0 && <Text style={{ fontSize: 7, color: '#94A3B8', marginTop: 2 }}>vs lalu: {diffPendapatan >= 0 ? '+' : ''}{diffPendapatan.toLocaleString('id-ID')} ({pctPendapatan}%)</Text>}
            </View>
            <View style={[styles.kpiCard, { borderColor: '#ef4444' }]}>
              <Text style={styles.kpiLabel}>HPP / Beban</Text>
              <Text style={[styles.kpiValue, { color: '#dc2626' }]}>Rp {data.hpp.toLocaleString('id-ID')}</Text>
            </View>
            <View style={[styles.kpiCard, { borderColor: data.labaRugi >= 0 ? '#22c55e' : '#ef4444' }]}>
              <Text style={styles.kpiLabel}>Laba / Rugi Kotor</Text>
              <Text style={[styles.kpiValue, { color: data.labaRugi >= 0 ? '#16a34a' : '#dc2626' }]}>Rp {data.labaRugi.toLocaleString('id-ID')}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rincian per Bulan</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { flex: 0.8 }]}>Bulan</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Pendapatan</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1 }]}>HPP</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Laba / Rugi</Text>
            </View>
            {data.monthly.map((m, i) => {
              const laba = m.pendapatan - m.hpp
              return (
              <View key={i} style={[styles.tableRow, i === data.monthly.length - 1 ? { borderBottomWidth: 0 } : {}]}>              
                  <Text style={[styles.tableCell, { flex: 0.8 }]}>{m.bulan}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{m.pendapatan.toLocaleString('id-ID')}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{m.hpp.toLocaleString('id-ID')}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{laba.toLocaleString('id-ID')}</Text>
                </View>
              )
            })}
          </View>
        </View>

        <View style={styles.totalSection}>
          <View style={styles.totalRow}><Text style={styles.totalLabel}>Total Pendapatan</Text><Text style={styles.totalValue}>Rp {data.pendapatan.toLocaleString('id-ID')}</Text></View>
          <View style={styles.totalRow}><Text style={styles.totalLabel}>Total HPP</Text><Text style={styles.totalValue}>Rp {data.hpp.toLocaleString('id-ID')}</Text></View>
          <View style={styles.grandTotal}><Text style={[styles.totalLabel, { fontWeight: 'bold' }]}>Laba / Rugi Kotor</Text><Text style={styles.totalValue}>Rp {data.labaRugi.toLocaleString('id-ID')}</Text></View>
        </View>

        <Text style={styles.footer}>Dicetak dari ERP RRI - PT. Rizki Ridho Ilahi | Periode {periodText}</Text>
      </Page>
    </Document>
  )
}
