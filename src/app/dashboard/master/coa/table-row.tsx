"use client"

import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api/client"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Pencil, Trash2 } from "lucide-react"

interface Coa {
  id: string
  kode: string
  nama: string
  tipe: string
  coa: { nama: string }[]
  keterangan: string | null
  is_active?: boolean
  created_at: string
}

interface CoaTableRowProps {
  coa: Coa
}

export function CoaTableRow({ coa }: CoaTableRowProps) {
  const router = useRouter()

  const handleDelete = async () => {
    try {
      await apiFetch(`/api/v1/master/coa/${coa.id}`, {
        method: "DELETE",
      })
      router.refresh()
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Gagal menghapus")
    }
  }

  return (
    <tr className="hover:bg-muted/30 transition-colors">
      <td className="px-4 py-3 text-sm font-medium">{coa.kode}</td>
      <td className="px-4 py-3 text-sm">{coa.nama}</td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {coa.tipe}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {coa.coa?.[0]?.nama || "-"}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {coa.keterangan || "-"}
      </td>
      <td className="px-4 py-3 text-sm">
        <span
          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-success/10 text-success"
        >
          Active
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
                  router.push(`/dashboard/master/coa/${coa.id}/edit`)
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
            itemName={coa.nama}
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