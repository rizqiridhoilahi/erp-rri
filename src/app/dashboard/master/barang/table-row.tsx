"use client"

import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api/client"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Pencil, Trash2 } from "lucide-react"

interface Barang {
  id: string
  nama: string
  kode: string
  kategori_barang: { nama: string }[]
  satuan: string | null
  spesifikasi: string | null
  harga_beli_default: number | null
  harga_jual_default: number | null
  stok_minimum: number | null
  is_active: boolean
  created_at: string
}

interface BarangTableRowProps {
  barang: Barang
}

export function BarangTableRow({ barang }: BarangTableRowProps) {
  const router = useRouter()

  const handleDelete = async () => {
    try {
      await apiFetch(`/api/v1/master/barang/${barang.id}`, {
        method: "DELETE",
      })
      router.refresh()
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Gagal menghapus")
    }
  }

  const formatCurrency = (value: number | null) => {
    if (value === null) return "-"
    return `Rp ${Number(value).toLocaleString("id-ID")}`
  }

  return (
    <tr className="hover:bg-muted/30 transition-colors">
      <td className="px-4 py-3 text-sm font-medium">{barang.kode}</td>
      <td className="px-4 py-3 text-sm">{barang.nama}</td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {barang.kategori_barang?.[0]?.nama || "-"}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {barang.satuan || "-"}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {formatCurrency(barang.harga_beli_default)}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {formatCurrency(barang.harga_jual_default)}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {barang.stok_minimum ?? "-"}
      </td>
      <td className="px-4 py-3 text-sm">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            barang.is_active
              ? "bg-success/10 text-success"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          {barang.is_active ? "Active" : "Non-Active"}
        </span>
      </td>
      <td className="px-4 py-3 text-sm">
        <div className="flex items-center justify-end gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  router.push(`/dashboard/master/barang/${barang.id}/edit`)
                }
                className="hover:bg-accent"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit</TooltipContent>
          </Tooltip>
          <DeleteConfirmationDialog
            onConfirm={handleDelete}
            itemName={barang.nama}
            trigger={
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            }
          />
        </div>
      </td>
    </tr>
  )
}