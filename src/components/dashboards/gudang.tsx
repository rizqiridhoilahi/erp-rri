import Link from 'next/link'
import { supabase } from '@/lib/db/client'
import { StatCard } from '@/components/stat-card'
import { ChartCard } from '@/components/chart-card'
import { StockCategoryChart } from '@/components/stock-category-chart'
import { LowStockChart } from '@/components/low-stock-chart'
import { Package, AlertTriangle, Building2, ClipboardList, PieChart, TrendingDown } from 'lucide-react'

export default async function GudangDashboard() {
  const [barangs, stoksRaw, dos, barangsAll, kategoriBarang] = await Promise.all([
    supabase.from('barang').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('stok').select('*'),
    supabase.from('delivery_order').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('barang').select('id, nama, kategori_id'),
    supabase.from('kategori_barang').select('id, nama'),
  ])

  const stoksData = (Array.isArray(stoksRaw.data) ? stoksRaw.data : []) as { barang_id: string; jumlah: number }[]
  const totalStok = stoksData.reduce((s, i) => s + (i.jumlah ?? 0), 0)
  const lowStockItems = stoksData.filter(s => s.jumlah <= 0)

  const kategoriMap = new Map((kategoriBarang.data ?? []).map((k: { id: string; nama: string }) => [k.id, k.nama]))
  const stokByKategori: Record<string, number> = {}
  const barangKategoriMap = new Map((barangsAll.data ?? []).map((b: { id: string; kategori_id: string }) => [b.id, b.kategori_id]))
  for (const s of stoksData) {
    const katId = barangKategoriMap.get(s.barang_id) || ''
    stokByKategori[katId] = (stokByKategori[katId] ?? 0) + (s.jumlah ?? 0)
  }
  const stockCategoryData = Object.entries(stokByKategori)
    .map(([id, value]) => ({ name: kategoriMap.get(id) || 'Tanpa Kategori', value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)

  const barangNamaMap = new Map((barangsAll.data ?? []).map((b: { id: string; nama: string }) => [b.id, b.nama]))
  const lowStockChartData = stoksData
    .filter(s => s.jumlah <= 5)
    .sort((a, b) => a.jumlah - b.jumlah)
    .slice(0, 10)
    .map(s => ({ name: barangNamaMap.get(s.barang_id) || '-', stock: s.jumlah }))

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-heading font-bold">Dashboard Gudang</h1><p className="text-muted-foreground mt-1">Inventaris & pergerakan stok</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Barang" value={barangs.count ?? 0} icon={Package} iconVariant="info" />
        <StatCard label="Total Stok" value={totalStok.toLocaleString('id-ID')} icon={Building2} iconVariant="info" subtitle="Unit tersedia" />
        <StatCard label="Stok Kosong" value={lowStockItems.length} icon={AlertTriangle} iconVariant="destructive" subtitle="Perlu re-stock" />
        <StatCard label="DO Pending" value={dos.count ?? 0} icon={ClipboardList} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard title="Komposisi Stok per Kategori" icon={PieChart} iconVariant="info" subtitle="Distribusi unit stok">
          {stockCategoryData.length > 0 ? <StockCategoryChart data={stockCategoryData} /> : <p className="text-sm text-muted-foreground text-center py-8">Belum ada data stok.</p>}
        </ChartCard>
        <ChartCard title="Peringkat Stok Menipis" icon={TrendingDown} iconVariant="destructive" subtitle="Barang dengan stok paling rendah">
          {lowStockChartData.length > 0 ? <LowStockChart data={lowStockChartData} /> : <p className="text-sm text-muted-foreground text-center py-8">Semua stok aman.</p>}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white dark:bg-primary/10 dark:backdrop-blur-sm border border-primary/10 dark:border-primary/20">
          <div className="flex items-center justify-between px-6 pt-6 pb-0">
            <p className="text-sm font-semibold uppercase tracking-wider text-foreground">Akses Cepat</p>
            <div className="bg-primary/20 p-3 rounded-lg">
              <Package className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="p-6 pt-4 grid grid-cols-2 gap-2">
            {[
              { href: '/dashboard/inventory/stok/masuk', label: 'Stok Masuk', icon: Package },
              { href: '/dashboard/inventory/stok/keluar', label: 'Stok Keluar', icon: Package },
              { href: '/dashboard/inventory/stok', label: 'Kartu Stok', icon: ClipboardList },
              { href: '/dashboard/inventory/gudang', label: 'Master Gudang', icon: Building2 },
              { href: '/dashboard/delivery-order', label: 'List DO', icon: ClipboardList },
              { href: '/dashboard/delivery-order/tambah', label: 'Buat DO', icon: Package },
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

        <div className="rounded-2xl bg-white dark:bg-primary/10 dark:backdrop-blur-sm border border-primary/10 dark:border-primary/20">
          <div className="flex items-center justify-between px-6 pt-6 pb-0">
            <p className="text-sm font-semibold uppercase tracking-wider text-foreground">Modul</p>
            <div className="bg-primary/20 p-3 rounded-lg">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="p-6 pt-4 grid grid-cols-2 gap-2">
            {[
              { href: '/dashboard/master/barang', label: 'Master Barang', icon: Package },
              { href: '/dashboard/inventory/gudang', label: 'Gudang', icon: Building2 },
              { href: '/dashboard/purchase-receiving', label: 'Penerimaan', icon: Package },
              { href: '/dashboard/grn', label: 'GRN', icon: ClipboardList },
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
    </div>
  )
}
