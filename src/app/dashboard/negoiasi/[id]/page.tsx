import Link from 'next/link'
import { supabase } from '@/lib/db/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { ArrowLeft, Handshake } from 'lucide-react'

const s: Record<string, { label: string; v: 'secondary' | 'warning' | 'success' | 'outline' }> = {
  draft: { label: 'Draft', v: 'secondary' }, approved: { label: 'Disetujui', v: 'success' }, rejected: { label: 'Ditolak', v: 'outline' },
}

export default async function NegoiasiDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: neg, error } = await supabase.from('negoiasi').select('*, quotation!quotation_id(nomor)').eq('id', id).single()
  if (error || !neg) return <div className="text-center py-20 text-muted-foreground">Negosiasi tidak ditemukan</div>
  const { data: items } = await supabase.from('negoiasi_item').select('*, quotation_item!quotation_item_id(id)').eq('negoiasi_id', id)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link href="/dashboard/negoiasi"><ArrowLeft className="h-5 w-5" /></Link></Button>
        <div><h1 className="text-3xl font-heading font-bold">Detail Negosiasi</h1><p className="text-muted-foreground mt-1">{neg.nomor}</p></div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Nomor</p>
              <p className="font-medium">{neg.nomor}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={s[neg.status]?.v ?? 'outline'}>{s[neg.status]?.label ?? neg.status}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tanggal</p>
              <p className="font-medium">{new Date(neg.tanggal).toLocaleDateString('id-ID')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Quotation</p>
              <p className="font-medium">{neg.quotation?.nomor ?? '-'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-muted-foreground">Keterangan</p>
              <p className="font-medium">{neg.keterangan ?? '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {!!items?.length && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Handshake className="h-4 w-4" />Item Negosiasi</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quotation Item</TableHead>
                  <TableHead className="text-right">Harga Baru</TableHead>
                  <TableHead className="text-right">Diskon Baru</TableHead>
                  <TableHead>Alasan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.quotation_item?.id ?? '-'}</TableCell>
                    <TableCell className="text-right">{item.harga_satuan_baru?.toLocaleString('id-ID')}</TableCell>
                    <TableCell className="text-right">{item.diskon_baru ?? 0}%</TableCell>
                    <TableCell className="text-muted-foreground">{item.alasan ?? '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
