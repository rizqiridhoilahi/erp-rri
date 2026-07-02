"use client"

import * as React from "react"
import Link from "next/link"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { ChevronRight, Wallet, CalendarRange } from "lucide-react"

interface PaymentData {
  id: string
  invoice_id: string
  invoice_nomor: string
  customer_nama: string
  tanggal: string
  amount: number
  metode: string
}

interface PaymentDetailSheetProps {
  children: React.ReactNode
  payments: PaymentData[]
  totalPayment: number
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
  success: Wallet,
  primary: CalendarRange,
} as const

export function PaymentDetailSheet({ children, payments, totalPayment, count, titleLabel, iconVariant }: PaymentDetailSheetProps) {
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
                <Icon className="h-5 w-5 text-success" />
                <span>{titleLabel}</span>
              </div>
              <span className="text-base font-bold text-success">{fmtCurrency(totalPayment)}</span>
            </SheetTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {count} pembayaran
            </p>
          </SheetHeader>

          <div className="p-6">
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-xs uppercase tracking-wider">No. Invoice</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider">Customer</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-center">Tgl Bayar</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-right">Jumlah</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-center">Metode</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        Tidak ada pembayaran
                      </TableCell>
                    </TableRow>
                  )}
                  {payments.map((p) => (
                    <TableRow key={p.id} className="hover:bg-muted/30">
                      <TableCell className="whitespace-nowrap">
                        <Link href={`/dashboard/invoice/${p.invoice_id}/edit`} className="text-primary hover:underline font-medium">
                          {p.invoice_nomor}
                        </Link>
                      </TableCell>
                      <TableCell className="font-medium whitespace-nowrap">{p.customer_nama}</TableCell>
                      <TableCell className="text-center whitespace-nowrap">{fmtDate(p.tanggal)}</TableCell>
                      <TableCell className="text-right whitespace-nowrap tabular-nums font-medium">{fmtCurrency(p.amount)}</TableCell>
                      <TableCell className="text-center whitespace-nowrap">
                        <span className="text-xs uppercase tracking-wider text-muted-foreground">{p.metode}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
