import Link from 'next/link'
import { supabase } from '@/lib/db/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/stat-card'
import { ChartCard } from '@/components/chart-card'
import { TopSuppliersChart } from '@/components/top-suppliers-chart'
import { ProcurementCycleChart } from '@/components/procurement-cycle-chart'
import { ClipboardList, FileCheck, Package, FileText, ArrowRight, Bot, Clock, Eye, DollarSign, TrendingUp } from 'lucide-react'

export default async function ProcurementDashboard() {
  const today = new Date().toISOString().split('T')[0]

  const [po, receiving, , pendingPrRes, pendingPoRes, receivingTodayRes, suppliers, poItems] = await Promise.all([
    supabase.from('purchase_order').select('*', { count: 'exact', head: true }).in('status', ['draft', 'sent']),
    supabase.from('purchase_receiving').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('grn').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('purchase_request').select('id, nomor, status, tanggal').eq('status', 'draft').order('created_at', { ascending: false }).limit(5),
    supabase.from('purchase_order').select('id, nomor, status, tanggal, supplier!supplier_id(nama)').in('status', ['draft', 'sent']).order('created_at', { ascending: false }).limit(5),
    supabase.from('purchase_receiving').select('id, nomor, tanggal, purchase_order!purchase_order_id(nomor)').gte('tanggal', today).order('created_at', { ascending: false }),
    supabase.from('supplier').select('id, nama'),
    supabase.from('purchase_order').select('id, supplier_id, nomor, tanggal').in('status', ['sent', 'confirmed']).order('created_at', { ascending: false }),
  ])

  const pendingPrList = pendingPrRes.data ?? []
  const pendingPoList = pendingPoRes.data ?? []
  const receivingToday = receivingTodayRes.data ?? []
  const suppliersData = (suppliers.data ?? []) as { id: string; nama: string }[]
  const poList = (poItems.data ?? []) as { id: string; supplier_id: string; nomor: string; tanggal: string }[]

  const poIds = poList.map(p => p.id)
  const { data: poItemDetails } = poIds.length
    ? await supabase.from('purchase_order_item').select('purchase_order_id, harga_satuan, jumlah').in('purchase_order_id', poIds)
    : { data: [] }

  const supplierSpend: Record<string, number> = {}
  for (const item of poItemDetails ?? []) {
    const po = poList.find(p => p.id === item.purchase_order_id)
    if (po) {
      supplierSpend[po.supplier_id] = (supplierSpend[po.supplier_id] ?? 0) + (item.harga_satuan ?? 0) * (item.jumlah ?? 0)
    }
  }

  const supplierMap = new Map(suppliersData.map(s => [s.id, s.nama]))
  const topSuppliersData = Object.entries(supplierSpend)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([id, spend]) => ({ name: supplierMap.get(id) || '-', spend }))

  const prList = (await supabase.from('purchase_request').select('id, tanggal').neq('status', 'ordered')).data ?? []
  const prDates = new Map((prList as { id: string; tanggal: string }[]).map(p => [p.id, new Date(p.tanggal)]))
  const cycleDays: number[] = []
  for (const po of poList.slice(0, 50)) {
    const prId = po.id.replace('PO', 'PR')
    const prDate = prDates.get(prId)
    if (prDate) {
      const poDate = new Date(po.tanggal)
      const days = Math.floor((poDate.getTime() - prDate.getTime()) / (1000 * 60 * 60 * 24))
      if (days >= 0 && days < 365) cycleDays.push(days)
    }
  }

  const cycleBuckets = [
    { label: '0-3 hr', min: 0, max: 3 },
    { label: '4-7 hr', min: 4, max: 7 },
    { label: '8-14 hr', min: 8, max: 14 },
    { label: '15-30 hr', min: 15, max: 30 },
    { label: '>30 hr', min: 31, max: Infinity },
  ]
  const cycleChartData = cycleBuckets.map(b => ({
    label: b.label,
    days: cycleDays.filter(d => d >= b.min && d <= b.max).length,
  }))

  const sBadge: Record<string, 'secondary' | 'warning' | 'success' | 'destructive' | 'outline'> = {
    draft: 'secondary', approved: 'success', rejected: 'destructive', ordered: 'warning',
    sent: 'warning', confirmed: 'success', partial: 'outline', completed: 'outline',
  }
  const sLabel: Record<string, string> = {
    draft: 'Draft', approved: 'Disetujui', rejected: 'Ditolak', ordered: 'Sudah diPO',
    sent: 'Terkirim', confirmed: 'Dikonfirmasi', partial: 'Parsial', completed: 'Selesai',
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-heading font-bold">Dashboard Procurement</h1><p className="text-muted-foreground mt-1">Pembelian & pengadaan barang — {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p></div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="PR Butuh Persetujuan" value={pendingPrList.length} icon={ClipboardList} iconVariant="warning" subtitle="Menunggu approval" />
        <StatCard label="PO Perlu Tindakan" value={po.count ?? 0} icon={FileCheck} iconVariant="warning" subtitle="Draft / Terkirim" />
        <StatCard label="Pending Receiving" value={receiving.count ?? 0} icon={Package} iconVariant="warning" subtitle="Belum diterima" />
        <StatCard label="Receiving Hari Ini" value={receivingToday.length} icon={Clock} iconVariant="info" subtitle={receivingToday.length > 0 ? `${receivingToday.length} pengiriman` : 'Tidak ada'} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard title="Top 5 Supplier by Spend" icon={DollarSign} iconVariant="warning" subtitle="Total pengeluaran per supplier">
          {topSuppliersData.length > 0 ? <TopSuppliersChart data={topSuppliersData} /> : <p className="text-sm text-muted-foreground text-center py-8">Belum ada data PO.</p>}
        </ChartCard>
        <ChartCard title="PR → PO Cycle Time" icon={TrendingUp} iconVariant="info" subtitle="Distribusi waktu proses pengadaan">
          {cycleChartData.some(d => d.days > 0) ? <ProcurementCycleChart data={cycleChartData} /> : <p className="text-sm text-muted-foreground text-center py-8">Belum cukup data.</p>}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2"><ClipboardList className="h-4 w-4" />PR Menunggu Persetujuan</CardTitle>
            <Button variant="ghost" size="sm" asChild><Link href="/dashboard/purchase-request">Lihat Semua <ArrowRight className="h-3 w-3 ml-1" /></Link></Button>
          </CardHeader>
          <CardContent>
            {!pendingPrList.length ? <p className="text-sm text-muted-foreground">Semua PR sudah diproses.</p> :
            <div className="space-y-1">{pendingPrList.map((item: { id: string; nomor: string; status: string; tanggal: string }) => (
              <Link key={item.id} href={`/dashboard/purchase-request/${item.id}`} className="flex items-center justify-between py-2 px-2 rounded-md hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <p className="text-sm font-medium">{item.nomor}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{new Date(item.tanggal).toLocaleDateString('id-ID')}</span>
                  <Badge variant={sBadge[item.status] ?? 'outline'}>{sLabel[item.status] ?? item.status}</Badge>
                  <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </Link>
            ))}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2"><FileCheck className="h-4 w-4" />PO Perlu Tindakan</CardTitle>
            <Button variant="ghost" size="sm" asChild><Link href="/dashboard/purchase-order">Lihat Semua <ArrowRight className="h-3 w-3 ml-1" /></Link></Button>
          </CardHeader>
          <CardContent>
            {!pendingPoList.length ? <p className="text-sm text-muted-foreground">Semua PO sudah dikonfirmasi.</p> :
            <div className="space-y-1">{pendingPoList.map((item: { id: string; nomor: string; status: string; tanggal: string; supplier: { nama: string }[] | null }) => (
              <Link key={item.id} href={`/dashboard/purchase-order/${item.id}`} className="flex items-center justify-between py-2 px-2 rounded-md hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <p className="text-sm font-medium">{item.nomor}</p>
                  <span className="text-xs text-muted-foreground">{item.supplier?.[0]?.nama ?? '-'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{new Date(item.tanggal).toLocaleDateString('id-ID')}</span>
                  <Badge variant={sBadge[item.status] ?? 'outline'}>{sLabel[item.status] ?? item.status}</Badge>
                  <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </Link>
            ))}</div>}
          </CardContent>
        </Card>
      </div>

      {receivingToday.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2"><Package className="h-4 w-4" />Receiving Hari Ini</CardTitle>
            <Button variant="ghost" size="sm" asChild><Link href="/dashboard/purchase-receiving">Lihat Semua <ArrowRight className="h-3 w-3 ml-1" /></Link></Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">{receivingToday.map((item: { id: string; nomor: string; tanggal: string; purchase_order: { nomor: string }[] | null }) => (
              <Link key={item.id} href={`/dashboard/purchase-receiving/${item.id}`} className="flex items-center justify-between py-2 px-2 rounded-md hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <p className="text-sm font-medium">{item.nomor}</p>
                  <span className="text-xs text-muted-foreground">PO: {item.purchase_order?.[0]?.nomor ?? '-'}</span>
                </div>
                <Eye className="h-3.5 w-3.5 text-muted-foreground" />
              </Link>
            ))}</div>
          </CardContent>
        </Card>
      )}

      <div className="rounded-2xl bg-white dark:bg-primary/10 dark:backdrop-blur-sm border border-primary/10 dark:border-primary/20">
        <div className="flex items-center justify-between px-6 pt-6 pb-0">
          <p className="text-sm font-semibold uppercase tracking-wider text-foreground">Akses Cepat</p>
          <div className="bg-primary/20 p-3 rounded-lg">
            <Package className="h-5 w-5 text-primary" />
          </div>
        </div>
        <div className="p-6 pt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
          {[
            { href: '/dashboard/purchase-request/tambah', label: 'Buat PR', icon: ClipboardList },
            { href: '/dashboard/purchase-order/tambah', label: 'Buat PO', icon: FileCheck },
            { href: '/dashboard/purchase-receiving/tambah', label: 'Input Receiving', icon: Package },
            { href: '/dashboard/grn/tambah', label: 'Input GRN', icon: FileText },
            { href: '/dashboard/ai/search-harga', label: 'AI Search Harga', icon: Bot },
            { href: '/dashboard/retur-pembelian/tambah', label: 'Retur Pembelian', icon: ArrowRight },
          ].map(item => (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-xl bg-white dark:bg-primary/5 border border-primary/10 dark:border-primary/20 p-3 hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(0,0,255,0.06)] dark:hover:shadow-xl transition-all duration-200">
              <div className="bg-primary/10 p-2 rounded-lg">
                <item.icon className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
