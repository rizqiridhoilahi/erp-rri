import Link from 'next/link'
import { supabase } from '@/lib/db/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ClipboardList, FileCheck, Package, FileText, ArrowRight, Bot, Clock, Eye } from 'lucide-react'

export default async function ProcurementDashboard() {
  const today = new Date().toISOString().split('T')[0]

  const [pr, po, receiving, , pendingPrRes, pendingPoRes, receivingTodayRes] = await Promise.all([
    supabase.from('purchase_request').select('*', { count: 'exact', head: true }).neq('status', 'ordered'),
    supabase.from('purchase_order').select('*', { count: 'exact', head: true }).in('status', ['draft', 'sent']),
    supabase.from('purchase_receiving').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('grn').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('purchase_request').select('id, nomor, status, tanggal').eq('status', 'draft').order('created_at', { ascending: false }).limit(5),
    supabase.from('purchase_order').select('id, nomor, status, tanggal, supplier!supplier_id(nama)').in('status', ['draft', 'sent']).order('created_at', { ascending: false }).limit(5),
    supabase.from('purchase_receiving').select('id, nomor, tanggal, purchase_order!purchase_order_id(nomor)').gte('tanggal', today).order('created_at', { ascending: false }),
  ])

  const pendingPrList = pendingPrRes.data ?? []
  const pendingPoList = pendingPoRes.data ?? []
  const receivingToday = receivingTodayRes.data ?? []

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
        <Card className={(pr.count ?? 0) > 0 ? 'border-amber-200' : ''}>
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm text-muted-foreground">PR Butuh Persetujuan</CardTitle><ClipboardList className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><p className="text-2xl font-bold">{pendingPrList.length}</p></CardContent></Card>
        <Card className={(po.count ?? 0) > 0 ? 'border-amber-200' : ''}>
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm text-muted-foreground">PO Perlu Tindakan</CardTitle><FileCheck className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><p className="text-2xl font-bold">{po.count ?? 0}</p></CardContent></Card>
        <Card className={(receiving.count ?? 0) > 0 ? 'border-amber-200' : ''}>
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm text-muted-foreground">Pending Receiving</CardTitle><Package className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><p className="text-2xl font-bold">{receiving.count ?? 0}</p></CardContent></Card>
        <Card className={receivingToday.length > 0 ? 'border-emerald-200' : ''}>
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm text-muted-foreground">Receiving Hari Ini</CardTitle><Clock className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><p className="text-2xl font-bold">{receivingToday.length}</p></CardContent></Card>
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

      <Card><CardHeader><CardTitle className="text-base">Akses Cepat</CardTitle></CardHeader><CardContent className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {[
          { href: '/dashboard/purchase-request/tambah', label: 'Buat PR', icon: ClipboardList },
          { href: '/dashboard/purchase-order/tambah', label: 'Buat PO', icon: FileCheck },
          { href: '/dashboard/purchase-receiving/tambah', label: 'Input Receiving', icon: Package },
          { href: '/dashboard/grn/tambah', label: 'Input GRN', icon: FileText },
          { href: '/dashboard/ai/search-harga', label: 'AI Search Harga', icon: Bot },
          { href: '/dashboard/retur-pembelian/tambah', label: 'Retur Pembelian', icon: ArrowRight },
        ].map(item => (
          <Button key={item.href} variant="outline" className="justify-start h-auto py-3" asChild>
            <Link href={item.href}><item.icon className="h-4 w-4 mr-2" />{item.label}</Link>
          </Button>
        ))}
      </CardContent></Card>
    </div>
  )
}
