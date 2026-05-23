"use client"

import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api/client"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Pencil, Trash2 } from "lucide-react"

interface Supplier {
  id: string
  nama: string
  kode: string
  nama_toko: string | null
  link_toko: string | null
  no_rekening: string | null
  kontak: string | null
  terms_of_payment: string | null
  is_marketplace: boolean
  is_active: boolean
  created_at: string
}

interface SupplierTableRowProps {
  supplier: Supplier
}

export function SupplierTableRow({ supplier }: SupplierTableRowProps) {
  const router = useRouter()

  const handleDelete = async () => {
    try {
      await apiFetch(`/api/v1/master/supplier/${supplier.id}`, {
        method: "DELETE",
      })
      router.refresh()
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Gagal menghapus")
    }
  }

  return (
    <tr className="hover:bg-muted/30 transition-colors">
      <td className="px-4 py-3 text-sm font-medium">{supplier.kode}</td>
      <td className="px-4 py-3 text-sm">{supplier.nama}</td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {supplier.nama_toko || "-"}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {supplier.no_rekening || "-"}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {supplier.kontak || "-"}
      </td>
      <td className="px-4 py-3 text-sm">
        {supplier.is_marketplace ? (
          <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full">
            Ya
          </span>
        ) : (
          <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
            Tidak
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-sm">
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
          supplier.is_active
            ? "bg-success/10 text-success"
            : "bg-destructive/10 text-destructive"
        }`}>
          {supplier.is_active ? "Active" : "Non-Active"}
        </span>
      </td>
      <td className="px-4 py-3 text-sm">
        <div className="flex items-center justify-end gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push(`/dashboard/master/supplier/${supplier.id}/edit`)}
                className="hover:bg-accent"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit</TooltipContent>
          </Tooltip>
          <DeleteConfirmationDialog
            onConfirm={handleDelete}
            itemName={supplier.nama}
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