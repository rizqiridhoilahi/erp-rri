import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10 },
  header: { marginBottom: 24 },
   title: { fontSize: 18, fontWeight: 'bold', color: 'hsl(var(--foreground))', marginBottom: 4 },
   subtitle: { fontSize: 10, color: 'hsl(var(--muted-foreground))', marginBottom: 4 },
   sectionTitle: { fontSize: 11, fontWeight: 'bold', color: 'hsl(var(--foreground))', marginBottom: 6, borderBottomWidth: 1, borderBottomColor: 'hsl(var(--border))', paddingBottom: 4 },
   row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
   label: { fontSize: 9, color: 'hsl(var(--muted-foreground))' },
   value: { fontSize: 9, color: 'hsl(var(--foreground))' },
   table: { borderWidth: 1, borderColor: 'hsl(var(--border))', marginTop: 8 },
   tableHeader: { flexDirection: 'row', backgroundColor: 'hsl(var(--muted))', borderBottomWidth: 1, borderBottomColor: 'hsl(var(--border))', padding: '6 8' },
   tableHeaderCell: { flex: 1, fontSize: 8, fontWeight: 'bold', color: 'hsl(var(--muted-foreground))' },
   tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'hsl(var(--border))', padding: '6 8' },
   tableCell: { flex: 1, fontSize: 8, color: 'hsl(var(--foreground))' },
   footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: 'hsl(var(--muted-foreground))', borderTopWidth: 1, borderTopColor: 'hsl(var(--border))', paddingTop: 10 },
})

interface DokumenUmumData {
  judul: string
  nomor: string
  tanggal: string
  infoRows: Array<{ label: string; value: string }>
  columns: Array<{ key: string; label: string; flex?: number }>
  items: Array<Record<string, string | number>>
  total?: number
  totalLabel?: string
}

export function DokumenUmumPDF({ data }: { data: DokumenUmumData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{data.judul}</Text>
          <Text style={styles.subtitle}>No. {data.nomor}</Text>
          <Text style={styles.subtitle}>Tanggal: {new Date(data.tanggal).toLocaleDateString('id-ID')}</Text>
         </View>
        {data.items.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Item</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                {data.columns.map((col, i) => (
                  <Text key={i} style={[styles.tableHeaderCell, { flex: col.flex ?? 1 }]}>{col.label}</Text>
                ))}
              </View>
              {data.items.map((item, i) => (
                <View key={i} style={styles.tableRow}>
                  {data.columns.map((col, j) => (
                    <Text key={j} style={[styles.tableCell, { flex: col.flex ?? 1 }]}>
                      {typeof item[col.key] === 'number' ? (item[col.key] as number).toLocaleString('id-ID') : String(item[col.key] ?? '')}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          </View>
        )}
        {data.total != null && (
          <View style={{ alignItems: 'flex-end', marginTop: 12 }}>
            <Text style={{ fontSize: 11, fontWeight: 'bold' }}>{data.totalLabel ?? 'Total'}: Rp {data.total.toLocaleString('id-ID')}</Text>
          </View>
        )}
        <Text style={styles.footer}>Dicetak dari ERP RRI - PT. Rizki Ridho Ilahi</Text>
      </Page>
    </Document>
  )
}
