import Link from 'next/link'
import { supabase } from '@/lib/db/client'
import { ArapChart } from '@/components/arap-chart'
import { CashflowChart } from '@/components/cashflow-chart'
import { AgingChart } from '@/components/aging-chart'
import { StatCard } from '@/components/stat-card'
import { ChartCard } from '@/components/chart-card'
import { InvoiceVelocityChart } from '@/components/invoice-velocity-chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, ReceiptText, DollarSign, PieChart, Banknote, Receipt, Clock, TrendingUpIcon } from 'lucide-react'

const AGING_BUCKETS = [
  { label: '0-30', min: 0, max: 30 },
  { label: '31-60', min: 31, max: 60 },
  { label: '61-90', min: 61, max: 90 },
  { label: '>90', min: 91, max: Infinity },
]

function computeAging(
  items: Array<{ id: string; tanggal: string }>,
  totals: Record<string, number>,
) {
  const now = new Date()
  return AGING_BUCKETS.map(b => {
    const filtered = items.filter(i => {
      const d = Math.floor((now.getTime() - new Date(i.tanggal).getTime()) / (1000 * 60 * 60 * 24))
      return d >= b.min && d <= b.max
    })
    return { label: b.label, total: filtered.reduce((s, i) => s + (totals[i.id] ?? 0), 0) }
  })
}

function computeMonthly(
  items: Array<{ id: string; tanggal: string }>,
  totals: Record<string, number>,
  months: string[],
) {
  const map: Record<string, number> = {}
  for (const it of items) {
    const m = new Date(it.tanggal).toISOString().slice(0, 7)
    map[m] = (map[m] ?? 0) + (totals[it.id] ?? 0)
  }
  return months.map(m => ({ bulan: m, revenue: map[m] ?? 0 }))
}

function rupiah(v: number) {
  return `Rp ${v.toLocaleString('id-ID')}`
}

export default async function FinanceDashboard() {
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const sixMonths: string[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    sixMonths.push(d.toISOString().slice(0, 7))
  }
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString()

  const [invoices, kwitansis, fakturPajaks, allPos, paidInvoices, confirmedPos, kwitansiAll] = await Promise.all([
    supabase.from('invoice').select('*').in('status', ['sent', 'partial', 'overdue']),
    supabase.from('kwitansi').select('*').gte('created_at', firstDay),
    supabase.from('faktur_pajak').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('purchase_order').select('*').in('status', ['sent', 'confirmed']).gte('tanggal', sixMonthsAgo),
    supabase.from('invoice').select('*').in('status', ['paid', 'sent', 'partial', 'overdue']).gte('tanggal', sixMonthsAgo),
    supabase.from('purchase_order').select('*').in('status', ['sent', 'confirmed']),
    supabase.from('kwitansi').select('*'),
  ])

  const invIds = (invoices.data ?? []).map(i => i.id)
  const { data: invItems } = invIds.length
    ? await supabase.from('invoice_item').select('invoice_id, harga_satuan, jumlah, diskon, ppn, pph').in('invoice_id', invIds)
    : { data: [] }
  const arTotals: Record<string, number> = {}
  for (const it of invItems ?? []) {
    const dpp = it.harga_satuan * it.jumlah - (it.diskon ?? 0)
    arTotals[it.invoice_id] = (arTotals[it.invoice_id] ?? 0) + dpp + (it.ppn ?? 0) - (it.pph ?? 0)
  }
  const totalPiutang = invIds.reduce((s, id) => s + (arTotals[id] ?? 0), 0)
  const piutangCount = invoices.data?.length ?? 0
  const totalHutang = (confirmedPos.data ?? []).length
  const arAging = computeAging(invoices.data ?? [], arTotals)

  const poIds = (allPos.data ?? []).map(p => p.id)
  const { data: poItems } = poIds.length
    ? await supabase.from('purchase_order_item').select('purchase_order_id, harga_satuan, jumlah').in('purchase_order_id', poIds)
    : { data: [] }
  const apTotals: Record<string, number> = {}
  for (const it of poItems ?? []) {
    apTotals[it.purchase_order_id] = (apTotals[it.purchase_order_id] ?? 0) + it.harga_satuan * it.jumlah
  }
  const apAging = computeAging(allPos.data ?? [], apTotals)

  const paidIds = (paidInvoices.data ?? []).map(i => i.id)
  const { data: paidItems } = paidIds.length
    ? await supabase.from('invoice_item').select('invoice_id, harga_satuan, jumlah, diskon, ppn, pph').in('invoice_id', paidIds)
    : { data: [] }
  const revTotals: Record<string, number> = {}
  for (const it of paidItems ?? []) {
    const dpp = it.harga_satuan * it.jumlah - (it.diskon ?? 0)
    revTotals[it.invoice_id] = (revTotals[it.invoice_id] ?? 0) + dpp + (it.ppn ?? 0) - (it.pph ?? 0)
  }
  const monthlyRev = computeMonthly(paidInvoices.data ?? [], revTotals, sixMonths)

  const poAllIds = (allPos.data ?? []).map(p => p.id)
  const { data: poAllItems } = poAllIds.length
    ? await supabase.from('purchase_order_item').select('purchase_order_id, harga_satuan, jumlah').in('purchase_order_id', poAllIds)
    : { data: [] }
  const expTotals: Record<string, number> = {}
  for (const it of poAllItems ?? []) {
    expTotals[it.purchase_order_id] = (expTotals[it.purchase_order_id] ?? 0) + it.harga_satuan * it.jumlah
  }
  const monthlyExp = computeMonthly(allPos.data ?? [], expTotals, sixMonths)

  const cashflowData = monthlyRev.map((r, i) => ({
    bulan: r.bulan,
    revenue: r.revenue,
    expense: monthlyExp[i]?.revenue ?? 0,
  }))

  // Invoice velocity: days between invoice.tanggal and kwitansi.tanggal
  const kwitansiList = (Array.isArray(kwitansiAll.data) ? kwitansiAll.data : []) as Array<{ id: string; invoice_id: string; tanggal: string }>
  const velocityDays: number[] = []
  for (const kw of kwitansiList) {
    if (kw.invoice_id) {
      const inv = (invoices.data ?? []).find(i => i.id === kw.invoice_id)
      if (inv) {
        const days = Math.floor((new Date(kw.tanggal).getTime() - new Date(inv.tanggal).getTime()) / (1000 * 60 * 60 * 24))
        if (days >= 0 && days < 365) velocityDays.push(days)
      }
    }
  }
  const velBuckets = [
    { label: '0-7 hr', min: 0, max: 7 },
    { label: '8-14 hr', min: 8, max: 14 },
    { label: '15-30 hr', min: 15, max: 30 },
    { label: '31-60 hr', min: 31, max: 60 },
    { label: '>60 hr', min: 61, max: Infinity },
  ]
  const velocityData = velBuckets.map(b => ({
    label: b.label,
    count: velocityDays.filter(d => d >= b.min && d <= b.max).length,
  }))

  const arAgingChartData = arAging.map(a => ({ label: a.label, total: a.total }))

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-heading font-bold">Dashboard Finance</h1><p className="text-muted-foreground mt-1">Keuangan & pembayaran</p></div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Piutang (AR)" value={rupiah(totalPiutang)} icon={TrendingUp} iconVariant="success" subtitle={`${piutangCount} faktur outstanding`} />
        <StatCard label="Hutang (AP)" value={totalHutang} icon={TrendingDown} iconVariant="destructive" subtitle="PO belum lunas" />
        <StatCard label="Kwitansi Bulan Ini" value={kwitansis.data?.length ?? 0} icon={Receipt} iconVariant="info" subtitle="transaksi" />
        <StatCard label="Faktur Pajak Pending" value={fakturPajaks.count ?? 0} icon={ReceiptText} iconVariant="warning" subtitle="Perlu diterbitkan" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ringkasan AR / AP — Aging</CardTitle>
          </CardHeader>
          <CardContent>
            <ArapChart ar={arAging} ap={apAging} />
            <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
              <div className="space-y-1">
                <p className="font-medium text-emerald-600 text-xs uppercase tracking-wider dark:text-emerald-400">Piutang (AR)</p>
                {arAging.map(b => (
                  <div key={b.label} className="flex justify-between">
                    <span className="text-muted-foreground">{b.label} hari</span>
                    <span className="font-medium">{rupiah(b.total)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-1">
                <p className="font-medium text-red-600 text-xs uppercase tracking-wider dark:text-red-400">Hutang (AP)</p>
                {apAging.map(b => (
                  <div key={b.label} className="flex justify-between">
                    <span className="text-muted-foreground">{b.label} hari</span>
                    <span className="font-medium">{rupiah(b.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <ChartCard title="Invoice Payment Velocity" icon={Clock} iconVariant="info" subtitle="Waktu pelunasan faktur oleh customer">
          {velocityData.some(d => d.count > 0) ? <InvoiceVelocityChart data={velocityData} /> : <p className="text-sm text-muted-foreground text-center py-8">Belum cukup data.</p>}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Arus Kas (6 Bulan)</CardTitle>
          </CardHeader>
          <CardContent>
            <CashflowChart data={cashflowData} />
          </CardContent>
        </Card>

        <ChartCard title="AR Aging Distribution" icon={PieChart} iconVariant="warning" subtitle="Piutang berdasarkan umur">
          {arAgingChartData.some(d => d.total > 0) ? <AgingChart data={arAgingChartData} formatCurrency /> : <p className="text-sm text-muted-foreground text-center py-8">Tidak ada piutang outstanding.</p>}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white dark:bg-primary/10 dark:backdrop-blur-sm border border-primary/10 dark:border-primary/20">
          <div className="flex items-center justify-between px-6 pt-6 pb-0">
            <p className="text-sm font-semibold uppercase tracking-wider text-foreground">Akses Cepat</p>
            <div className="bg-primary/20 p-3 rounded-lg">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="p-6 pt-4 grid grid-cols-2 gap-2">
            {[
              { href: '/dashboard/invoice/tambah', label: 'Buat Invoice', icon: Receipt },
              { href: '/dashboard/kwitansi/tambah', label: 'Buat Kwitansi', icon: Banknote },
              { href: '/dashboard/faktur-pajak/tambah', label: 'Buat Faktur Pajak', icon: ReceiptText },
              { href: '/dashboard/jurnal/tambah', label: 'Input Jurnal', icon: TrendingUpIcon },
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
            <p className="text-sm font-semibold uppercase tracking-wider text-foreground">Laporan</p>
            <div className="bg-primary/20 p-3 rounded-lg">
              <PieChart className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="p-6 pt-4 grid grid-cols-2 gap-2">
            {[
              { href: '/dashboard/laporan/ar-aging', label: 'AR Aging', icon: TrendingUp },
              { href: '/dashboard/laporan/ap-aging', label: 'AP Aging', icon: TrendingDown },
              { href: '/dashboard/laporan/laba-rugi', label: 'Laba/Rugi', icon: Banknote },
              { href: '/dashboard/laporan/neraca', label: 'Neraca', icon: PieChart },
              { href: '/dashboard/laporan/arus-kas', label: 'Arus Kas', icon: DollarSign },
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
