"use client"

import * as React from "react"
import Link from "next/link"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { StatusBadge } from "@/components/status-badge"
import { ChevronRight, Banknote, Wallet, Calendar } from "lucide-react"

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

export function ArDetailSheet({ children, invoices, totalPiutang, piutangCount, agingData }: ArDetailSheetProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <div className="cursor-pointer" onClick={() => setOpen(true)}>
        {children}
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-[800px] p-0">
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
                      <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
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
