"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { supabase } from "@/lib/db/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Plus, Pencil, Eye } from "lucide-react"
import { ExportButton } from "@/components/export-button"
import { ItemsPopover } from "@/components/customer-po-items-popover"
import { DataTable, type DataTableFilter } from "@/components/data-table"

const statusMap: Record<string, { label: string; v: "secondary" | "warning" | "success" | "destructive" | "outline" }> = {
  draft: { label: "Draft", v: "secondary" },
  sent: { label: "Belum Dibayar", v: "warning" },
  partial: { label: "Dibayar Sebagian", v: "warning" },
  paid: { label: "Lunas", v: "success" },
  overdue: { label: "Overdue", v: "destructive" },
}

const statusFilterOptions = Object.entries(statusMap).map(([value, s]) => ({
  value,
  label: s.label,
}))

interface ProcessedRow {
  id: string
  nomor: string
  customerName: string
  customer_id: string
  picLabel: string
  grn_customer_nomor: string
  status: string
  diffDays: number | null
  hariStr: string
  fmtDueDate: string
  fmtPaymentDate: string
  tanggal: string
  top: string | null
  total: string
  item: Record<string, unknown>
  invoice_item: Array<{ id: string; nama: string | null; satuan: string | null; jumlah: number; harga_satuan: number }>
}

export default function InvoicePage() {
  const [rawData, setRawData] = useState<Array<Record<string, unknown>>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    const fetchData = async () => {
      const { data, error: err } = await supabase
        .from("invoice")
        .select("*, sales_order!sales_order_id(di!fk_sales_order_di(nomor_di_customer, customer_pic!pic_customer_id(nama, jabatan)), customer_po!customer_po_id(nomor_po_customer, customer_pic!pic_customer_id(nama, jabatan))), customer!customer_id(nama), invoice_item(id, nama_barang, satuan, jumlah, harga_satuan), invoice_payment!invoice_id(id, tanggal, amount), invoice_payment_schedule!invoice_id(id, urutan, due_date, status, deskripsi)")
      if (err) setError(err.message)
      else setRawData(data ?? [])
      setLoading(false)
    }
    fetchData()
  }, [])

  const today = useMemo(() => new Date(), [])

  const rows = useMemo((): ProcessedRow[] => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (rawData ?? []).map((item: any) => {
      const scheduleItems = item.invoice_payment_schedule ?? []
      const payments = item.invoice_payment ?? []

      let dueDate: Date | null = null
      let dueLabel = ""

      if (scheduleItems.length > 0) {
        const pending = [...scheduleItems]
          .filter((s: { status: string; due_date: string | null }) => s.status === "pending" && s.due_date)
          .sort((a: { due_date: string }, b: { due_date: string }) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
        if (pending.length > 0) {
          dueDate = new Date(pending[0].due_date)
          dueLabel = ` (${pending[0].deskripsi})`
        } else {
          const paidItems = [...scheduleItems].filter((s: { due_date: string | null }) => s.due_date)
          if (paidItems.length > 0) {
            const last = paidItems.reduce((a: { urutan: number }, b: { urutan: number }) => a.urutan > b.urutan ? a : b)
            dueDate = new Date(last.due_date)
            dueLabel = ` (${last.deskripsi})`
          }
        }
      }

      if (!dueDate) {
        const topMatch = String(item.top ?? "").match(/\d+/)
        const topDays = topMatch ? parseInt(topMatch[0]) : 0
        if (topDays > 0 && item.tanggal) {
          dueDate = new Date(new Date(item.tanggal).getTime() + topDays * 86400000)
        }
      }

      const paymentDates = (payments as Array<{ tanggal: string }>)
        .filter((p) => p.tanggal)
        .map((p) => new Date(p.tanggal))
      const latestPaymentDate = paymentDates.length > 0
        ? new Date(Math.max(...paymentDates.map((d) => d.getTime())))
        : null

      const refDate = item.status === "paid" && latestPaymentDate ? latestPaymentDate : today
      const diffMs = dueDate ? dueDate.getTime() - refDate.getTime() : 0
      const diffDays = dueDate ? Math.round(diffMs / 86400000) : null

      const customerName = item.customer?.nama ?? ""
      const diPic = item.sales_order?.di?.customer_pic?.nama
      const poPic = item.sales_order?.customer_po?.customer_pic?.nama

      const invoiceItems = (item.invoice_item ?? []).map(
        (i: { id: string; nama_barang: string | null; satuan: string | null; jumlah: number; harga_satuan: number }) => ({
          id: i.id,
          nama: i.nama_barang,
          satuan: i.satuan,
          jumlah: i.jumlah,
          harga_satuan: i.harga_satuan,
        }),
      )

      const total = (invoiceItems as Array<{ jumlah: number; harga_satuan: number }>)
        .reduce((sum: number, i: { jumlah: number; harga_satuan: number }) => sum + (i.jumlah || 0) * (i.harga_satuan || 0), 0)

      return {
        id: item.id,
        nomor: item.nomor,
        customerName,
        customer_id: item.customer_id ?? "",
        picLabel: diPic ?? poPic ?? "-",
        grn_customer_nomor: item.grn_customer_nomor ?? "-",
        status: item.status,
        diffDays,
        hariStr: diffDays !== null
          ? diffDays > 0 ? `H-${diffDays}` : diffDays === 0 ? "H-0" : `H+${Math.abs(diffDays)}`
          : "-",
        fmtDueDate: dueDate ? `${dueDate.toLocaleDateString("id-ID")}${dueLabel}` : "-",
        fmtPaymentDate: latestPaymentDate ? latestPaymentDate.toLocaleDateString("id-ID") : "-",
        tanggal: item.tanggal,
        top: item.top,
        total: `Rp ${total.toLocaleString("id-ID")}`,
        item,
        invoice_item: invoiceItems,
      }
    }).sort((a, b) => {
      if (a.status === "paid" && b.status !== "paid") return 1
      if (a.status !== "paid" && b.status === "paid") return -1
      if (a.diffDays === null && b.diffDays === null) return 0
      if (a.diffDays === null) return 1
      if (b.diffDays === null) return -1
      return a.diffDays - b.diffDays
    })
    // eslint-enable @typescript-eslint/no-explicit-any
  }, [rawData, today])

  const customerFilterOptions = useMemo(() => {
    const seen = new Set<string>()
    return rows
      .filter((r) => r.customer_id && !seen.has(r.customer_id) && seen.add(r.customer_id))
      .map((r) => ({ value: r.customer_id, label: r.customerName }))
  }, [rows])

  const picFilterOptions = useMemo(() => {
    const seen = new Set<string>()
    return rows
      .filter((r) => r.picLabel !== "-" && !seen.has(r.picLabel) && seen.add(r.picLabel))
      .map((r) => ({ value: r.picLabel, label: r.picLabel }))
  }, [rows])

  const filters: DataTableFilter[] = [
    { key: "customer_id", label: "Customer", options: customerFilterOptions },
    { key: "picLabel", label: "PIC", options: picFilterOptions },
    { key: "status", label: "Status", options: statusFilterOptions },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Invoice</h1>
          <p className="text-muted-foreground mt-1">Tagihan penjualan</p>
        </div>
        <ExportButton table="invoice" />
        <Button asChild>
          <Link href="/dashboard/invoice/tambah"><Plus className="h-4 w-4 mr-2" />Tambah Invoice</Link>
        </Button>
      </div>
      <DataTable<ProcessedRow>
        data={rows}
        loading={loading}
        error={error}
        searchFields={["nomor", "customerName", "picLabel", "grn_customer_nomor"]}
        searchPlaceholder="Cari nomor, customer, PIC..."
        filters={filters}
        pageSize={20}
      >
        {(paginatedRows) => (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nomor</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Customer PO / DI</TableHead>
                <TableHead>PIC</TableHead>
                <TableHead>GRN Cust</TableHead>
                <TableHead>Tgl</TableHead>
                <TableHead>TOP</TableHead>
                <TableHead>Tgl Jatuh Tempo</TableHead>
                <TableHead>Hari</TableHead>
                <TableHead>Tgl Pembayaran</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Item Barang</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRows.map((r) => {
                const item = r.item as Record<string, unknown>
                const isLate = r.diffDays !== null && r.diffDays < 0
                const customerPoDi = (item.sales_order as Record<string, unknown>)?.di
                  ? ((item.sales_order as Record<string, unknown>).di as Record<string, unknown>)?.nomor_di_customer
                  : ((item.sales_order as Record<string, unknown>).customer_po as Record<string, unknown>)?.nomor_po_customer
                return (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.nomor}</TableCell>
                    <TableCell className="font-medium">{r.customerName}</TableCell>
                    <TableCell className="font-medium">{String(customerPoDi ?? "-")}</TableCell>
                    <TableCell className="font-medium">{r.picLabel}</TableCell>
                    <TableCell className="font-medium">{r.grn_customer_nomor}</TableCell>
                    <TableCell className="font-medium">{r.tanggal ? new Date(r.tanggal).toLocaleDateString("id-ID") : "-"}</TableCell>
                    <TableCell className="font-medium">{r.top ?? "-"}</TableCell>
                    <TableCell className="font-medium">{r.fmtDueDate}</TableCell>
                    <TableCell className={`font-medium ${!isLate ? "text-primary" : "text-red-600"}`}>{r.hariStr}</TableCell>
                    <TableCell className="font-medium">{r.fmtPaymentDate}</TableCell>
                    <TableCell><Badge variant={statusMap[r.status]?.v ?? "outline"}>{statusMap[r.status]?.label ?? r.status}</Badge></TableCell>
                    <TableCell><ItemsPopover items={r.invoice_item} /></TableCell>
                    <TableCell className="text-right font-medium text-primary">{r.total}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="sm" asChild><Link href={`/dashboard/invoice/${r.id}`}><Eye className="h-4 w-4" /></Link></Button>
                      <Button variant="ghost" size="sm" asChild><Link href={`/dashboard/invoice/${r.id}/edit`}><Pencil className="h-4 w-4" /></Link></Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </DataTable>
    </div>
  )
}
