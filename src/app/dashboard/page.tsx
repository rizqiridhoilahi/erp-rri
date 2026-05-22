import Link from 'next/link'
import { supabase } from '@/lib/db/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, Package, Users, Building2, Users2, ShoppingCart, Landmark, ArrowRight } from 'lucide-react'

export default async function DashboardPage() {
  const [barang, invoice, cust, supp, karyawan, absen] = await Promise.all([
    supabase.from('barang').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('invoice').select('ppn_rate', { count: 'exact', head: true }).in('status', ['sent', 'overdue']),
    supabase.from('customer').select('*', { count: 'exact', head: true }),
    supabase.from('supplier').select('*', { count: 'exact', head: true }),
    supabase.from('karyawan').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('absensi').select('*', { count: 'exact', head: true }).eq('status', 'hadir'),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-heading font-bold">Dashboard</h1><p className="text-muted-foreground mt-1">Overview ERP RRI</p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild><a href="/api/v1/export?table=barang" target="_blank">Export Barang</a></Button>
          <Button variant="outline" size="sm" asChild><a href="/api/v1/export?table=invoice" target="_blank">Export Invoice</a></Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm text-muted-foreground">Barang Aktif</CardTitle><Package className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><p className="text-2xl font-bold">{barang.count ?? 0}</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm text-muted-foreground">Customer</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><p className="text-2xl font-bold">{cust.count ?? 0}</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm text-muted-foreground">Supplier</CardTitle><Building2 className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><p className="text-2xl font-bold">{supp.count ?? 0}</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm text-muted-foreground">Karyawan Aktif</CardTitle><Users2 className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><p className="text-2xl font-bold">{karyawan.count ?? 0}</p></CardContent></Card>
        <Card className="border-emerald-200"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm text-emerald-600">Piutang (Outstanding)</CardTitle><TrendingUp className="h-4 w-4 text-emerald-600" /></CardHeader>
          <CardContent><p className="text-2xl font-bold">{invoice.count ?? 0}</p><p className="text-xs text-muted-foreground">Faktur</p></CardContent></Card>
        <Card className="border-amber-200"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm text-amber-600">Hadir Hari Ini</CardTitle><TrendingDown className="h-4 w-4 text-amber-600" /></CardHeader>
          <CardContent><p className="text-2xl font-bold">{absen.count ?? 0}</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card><CardHeader><CardTitle className="text-base">Akses Cepat</CardTitle></CardHeader><CardContent className="grid grid-cols-2 gap-2">
          {[
            { href: '/dashboard/absensi/tambah', label: 'Input Absensi' },
            { href: '/dashboard/penggajian/tambah', label: 'Input Gaji' },
            { href: '/dashboard/invoice/tambah', label: 'Buat Invoice' },
            { href: '/dashboard/quotation/tambah', label: 'Buat Quotation' },
            { href: '/dashboard/purchase-order/tambah', label: 'Buat PO' },
            { href: '/dashboard/ai/search-harga', label: 'Search Harga' },
          ].map(item => (
            <Button key={item.href} variant="outline" className="justify-start h-auto py-3" asChild>
              <Link href={item.href}><ArrowRight className="h-4 w-4 mr-2" />{item.label}</Link>
            </Button>
          ))}
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Modul</CardTitle></CardHeader><CardContent className="grid grid-cols-2 gap-2">
          {[
            { href: '/dashboard/master/barang', label: 'Master Barang', icon: Package },
            { href: '/dashboard/master/supplier', label: 'Supplier', icon: Building2 },
            { href: '/dashboard/master/karyawan', label: 'Karyawan', icon: Users2 },
            { href: '/dashboard/laporan/laba-rugi', label: 'Laba/Rugi', icon: Landmark },
          ].map(item => (
            <Button key={item.href} variant="ghost" className="justify-start h-auto py-2" asChild>
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </CardContent></Card>
      </div>
    </div>
  )
}
