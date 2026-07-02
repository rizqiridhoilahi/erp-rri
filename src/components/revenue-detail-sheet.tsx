"use client"

import * as React from "react"
import Link from "next/link"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { StatusBadge } from "@/components/status-badge"
import { ChevronRight, TrendingUp, CalendarRange } from "lucide-react"

interface RevenueInvoiceData {
  id: string
  nomor: string
  customer_nama: string
  tanggal: string
  total: number
  status: string
}

interface RevenueDetailSheetProps {
  children: React.ReactNode
  invoices: RevenueInvoiceData[]
  totalRevenue: number
  count: number
  titleLabel: string
  iconVariant: "success" | "primary"
}

function fmtCurrency(v: number): string {
  return "Rp " + v.toLocaleString("id-ID")
}

function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

const iconMap = {
  success: TrendingUp,
  primary: CalendarRange,
} as const

export function RevenueDetailSheet({ children, invoices, totalRevenue, count, titleLabel, iconVariant }: RevenueDetailSheetProps) {
  const [open, setOpen] = React.useState(false)
  const Icon = iconMap[iconVariant]

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
                <Icon className="h-5 w-5 text-muted-foreground" />
                <span>{titleLabel}</span>
              </div>
              <span className="text-base font-bold text-primary">{fmtCurrency(totalRevenue)}</span>
            </SheetTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {count} invoice
            </p>
          </SheetHeader>

          <div className="p-6">
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-xs uppercase tracking-wider">No. Invoice</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider">Customer</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-center">Tgl Invoice</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-right">Total</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        Tidak ada invoice
                      </TableCell>
                    </TableRow>
                  )}
                  {invoices.map((inv) => (
                    <TableRow key={inv.id} className="hover:bg-muted/30">
                      <TableCell className="whitespace-nowrap">
                        <Link href={`/dashboard/invoice/${inv.id}/edit`} className="text-primary hover:underline font-medium">
                          {inv.nomor}
                        </Link>
                      </TableCell>
                      <TableCell className="font-medium whitespace-nowrap">{inv.customer_nama}</TableCell>
                      <TableCell className="text-center whitespace-nowrap">{fmtDate(inv.tanggal)}</TableCell>
                      <TableCell className="text-right whitespace-nowrap tabular-nums">{fmtCurrency(inv.total)}</TableCell>
                      <TableCell className="text-center whitespace-nowrap">
                        <StatusBadge status={inv.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-end border-t pt-4 mt-4">
              <Link
                href="/dashboard/invoice"
                className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
              >
                Lihat Semua Invoice
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
