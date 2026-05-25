import Link from 'next/link'
import { supabase } from '@/lib/db/client'
import { StatCard } from '@/components/stat-card'
import { ChartCard } from '@/components/chart-card'
import { SalesFunnelChart } from '@/components/sales-funnel-chart'
import { FileText, Search, ShoppingCart, DollarSign, TrendingUp, Package, Truck } from 'lucide-react'

export default async function SalesDashboard() {
  const [rfqs, quotations, custPos, sos, dos] = await Promise.all([
    supabase.from('rfq').select('*', { count: 'exact', head: true }).eq('status', 'sent'),
    supabase.from('quotation').select('*', { count: 'exact', head: true }).in('status', ['sent', 'approved']),
    supabase.from('customer_po').select('*', { count: 'exact', head: true }).eq('status', 'confirmed'),
    supabase.from('sales_order').select('*', { count: 'exact', head: true }).eq('status', 'confirmed'),
    supabase.from('delivery_order').select('*', { count: 'exact', head: true }).in('status', ['draft', 'processed']),
  ])
  const [recentQuotations] = await Promise.all([
    supabase.from('quotation').select('id, nomor, tanggal, status').order('created_at', { ascending: false }).limit(5),
  ])

  const funnelData = [
    { stage: 'Quotation\nDikirim', count: quotations.count ?? 0, fill: 'var(--info)' },
    { stage: 'PO Customer\nDeal', count: custPos.count ?? 0, fill: 'var(--primary)' },
    { stage: 'Sales Order\nAktif', count: sos.count ?? 0, fill: 'var(--success)' },
    { stage: 'DO\nPending', count: dos.count ?? 0, fill: 'var(--warning)' },
  ]

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-heading font-bold">Dashboard Sales</h1><p className="text-muted-foreground mt-1">Pipeline penjualan & aktivitas</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="RFQ Masuk" value={rfqs.count ?? 0} icon={Search} iconVariant="info" subtitle="Permintaan dari customer" />
        <StatCard label="Quotation Terkirim" value={quotations.count ?? 0} icon={FileText} iconVariant="primary" subtitle="Menunggu respon" />
        <StatCard label="PO Customer Deal" value={custPos.count ?? 0} icon={ShoppingCart} iconVariant="success" subtitle="Confirmed" />
        <StatCard label="DO Pending" value={dos.count ?? 0} icon={Truck} iconVariant="warning" subtitle="Siap dikirim" />
      </div>

      <ChartCard title="Sales Pipeline Funnel" icon={TrendingUp} iconVariant="primary" subtitle="Konversi penjualan per tahap">
        <SalesFunnelChart data={funnelData} />
      </ChartCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white dark:bg-primary/10 dark:backdrop-blur-sm border border-primary/10 dark:border-primary/20">
          <div className="flex items-center justify-between px-6 pt-6 pb-0">
            <p className="text-sm font-semibold uppercase tracking-wider text-foreground">Quotation Terbaru</p>
            <div className="bg-primary/20 p-3 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="p-6 pt-4">
            {!recentQuotations.data?.length ? <p className="text-sm text-muted-foreground">Belum ada quotation.</p> :
            <div className="space-y-1">{(recentQuotations.data ?? []).map((q: { id: string; nomor: string; tanggal: string; status: string }) => (
              <Link key={q.id} href={`/dashboard/quotation/${q.id}/edit`} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-primary/5 hover:scale-[1.01] transition-all duration-200">
                <p className="text-sm font-medium text-foreground">{q.nomor}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{new Date(q.tanggal).toLocaleDateString('id-ID')}</span>
                  <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary font-medium">{q.status}</span>
                </div>
              </Link>
            ))}</div>}
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-primary/10 dark:backdrop-blur-sm border border-primary/10 dark:border-primary/20">
          <div className="flex items-center justify-between px-6 pt-6 pb-0">
            <p className="text-sm font-semibold uppercase tracking-wider text-foreground">Akses Cepat</p>
            <div className="bg-primary/20 p-3 rounded-lg">
              <Package className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="p-6 pt-4 grid grid-cols-2 gap-2">
            {[
              { href: '/dashboard/rfq/tambah', label: 'Buat RFQ', icon: Search },
              { href: '/dashboard/quotation/tambah', label: 'Buat Quotation', icon: FileText },
              { href: '/dashboard/negoiasi/tambah', label: 'Negosiasi', icon: TrendingUp },
              { href: '/dashboard/sales-order/tambah', label: 'Buat SO', icon: DollarSign },
              { href: '/dashboard/delivery-order/tambah', label: 'Buat DO', icon: Truck },
              { href: '/dashboard/customer-po/tambah', label: 'Input PO Customer', icon: ShoppingCart },
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
