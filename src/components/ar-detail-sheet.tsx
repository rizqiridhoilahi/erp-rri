"use client"

import * as React from "react"
import Link from "next/link"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { StatusBadge } from "@/components/status-badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChevronRight, Banknote, Wallet } from "lucide-react"

interface ScheduleInfo {
  urutan: number
  deskripsi: string
  persentase: number
  jumlah: number
  due_date: string | null
  status: string
  paid_amount: number
}

interface ArInvoiceData {
  id: string
  nomor: string
  tanggal: string
  customer_nama: string
  status: string
  total: number
  paid: number
  outstanding: number
  jatuh_tempo: string | null
  aging_hari: number
  top: string | null
  schedules: ScheduleInfo[]
}

interface ArDetailSheetProps {
  children: React.ReactNode
  invoices: ArInvoiceData[]
  totalPiutang: number
  piutangCount: number
  agingData: Array<{ label: string; total: number }>
}

function fmtCurrency(v: number): string {
  return "Rp " + v.toLocaleString("id-ID")
}

function fmtDate(d: string | null): string {
  if (!d) return "-"
  return new Date(d).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function fmtPct(v: number): string {
  return v.toFixed(1) + "%"
}

function TopCell({ schedules, top }: { schedules: ScheduleInfo[]; top: string | null }) {
  if (schedules.length > 0) {
    const unpaid = schedules.filter(s => s.status !== 'paid')

    if (unpaid.length === 0) {
      return <span className="text-xs text-muted-foreground">Lunas</span>
    }

    return (
      <Popover>
        <PopoverTrigger asChild>
          <div className="flex gap-1 cursor-pointer">
            {schedules.map((s, i) => (
              <span
                key={i}
                className={`px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap ${
                  s.status === 'paid' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
                }`}
              >
                {`T${s.urutan}`}
              </span>
            ))}
          </div>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-80" align="start">
          <div className="p-3 border-b bg-muted/30">
            <p className="text-sm font-medium">Detail Termin</p>
          </div>
          <div className="p-1">
            <div className="max-h-[200px] overflow-y-auto space-y-1">
              {schedules.map((s, i) => (
                <div key={i} className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-muted/50 text-xs">
                  <div className="flex flex-col">
                    <span className="font-medium">{`Term ${s.urutan}`}</span>
                    {s.deskripsi && <span className="text-muted-foreground">{s.deskripsi}</span>}
                  </div>
                  <div className="text-right">
                    <span className={s.status === 'paid' ? 'text-success' : 'text-foreground'}>
                      {s.status === 'paid' ? 'Lunas' : 'Belum'}
                    </span>
                  </div>
                  <div className="text-right ml-4">
                    <span className="block font-medium tabular-nums">{fmtCurrency(s.jumlah)}</span>
                    <span className="block text-muted-foreground">{fmtPct(s.persentase)}</span>
                  </div>
                  <div className="text-right ml-4">
                    <span className="block text-muted-foreground tabular-nums">{fmtDate(s.due_date)}</span>
                    {s.status === 'paid' && (
                      <span className="block text-success tabular-nums">{fmtCurrency(s.paid_amount)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  if (top) {
    return <span className="text-xs">{top}</span>
  }

  return <span className="text-xs text-muted-foreground">-</span>
}

export function ArDetailSheet({ children, invoices, totalPiutang, piutangCount, agingData }: ArDetailSheetProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <div className="cursor-pointer" onClick={() => setOpen(true)}>
        {children}
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-[900px] p-0">
          <SheetHeader className="px-6 py-4 border-b">
            <SheetTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Banknote className="h-5 w-5 text-warning" />
                <span>Piutang (AR)</span>
              </div>
              <span className="text-base font-bold text-primary">{fmtCurrency(totalPiutang)}</span>
            </SheetTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {piutangCount} invoice outstanding
            </p>
          </SheetHeader>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {agingData.map((b, i) => (
                <div key={i} className="rounded-lg border bg-card p-3 text-center">
                  <p className="text-sm font-bold">{fmtCurrency(b.total)}</p>
                  <p className="text-xs text-muted-foreground">{b.label}</p>
                </div>
              ))}
            </div>

            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-xs uppercase tracking-wider">Customer</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider">No. Invoice</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-center">Tgl Invoice</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-center">TOP (Termin)</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-center">Jatuh Tempo</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-center">Aging (hari)</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-right">Total</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-right">Terbayar</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-right">Outstanding</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                        Tidak ada invoice outstanding
                      </TableCell>
                    </TableRow>
                  )}
                  {invoices.map((inv) => (
                    <TableRow key={inv.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium whitespace-nowrap">{inv.customer_nama}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Link href={`/dashboard/invoice/${inv.id}/edit`} className="text-primary hover:underline font-medium">
                          {inv.nomor}
                        </Link>
                      </TableCell>
                      <TableCell className="text-center whitespace-nowrap">{fmtDate(inv.tanggal)}</TableCell>
                      <TableCell className="text-center whitespace-nowrap">
                        <TopCell schedules={inv.schedules} top={inv.top} />
                      </TableCell>
                      <TableCell className="text-center whitespace-nowrap">{fmtDate(inv.jatuh_tempo)}</TableCell>
                      <TableCell className={`text-center whitespace-nowrap font-semibold tabular-nums ${
                        inv.aging_hari > 0 ? "text-destructive" : "text-success"
                      }`}>
                        {inv.aging_hari > 0 ? `+${inv.aging_hari}` : inv.aging_hari}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap tabular-nums">{fmtCurrency(inv.total)}</TableCell>
                      <TableCell className="text-right whitespace-nowrap tabular-nums">{fmtCurrency(inv.paid)}</TableCell>
                      <TableCell className="text-right whitespace-nowrap font-bold tabular-nums">{fmtCurrency(inv.outstanding)}</TableCell>
                      <TableCell className="text-center whitespace-nowrap">
                        <StatusBadge status={inv.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-sm">
                  <Wallet className="h-4 w-4 text-success" />
                  <span className="text-muted-foreground">Total terbayar:</span>
                  <span className="font-semibold">{fmtCurrency(invoices.reduce((s, i) => s + i.paid, 0))}</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Banknote className="h-4 w-4 text-warning" />
                  <span className="text-muted-foreground">Sisa piutang:</span>
                  <span className="font-semibold">{fmtCurrency(invoices.reduce((s, i) => s + i.outstanding, 0))}</span>
                </div>
              </div>
              <Link
                href="/dashboard/laporan/ar-aging"
                className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
              >
                Lihat AR Aging Report
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
