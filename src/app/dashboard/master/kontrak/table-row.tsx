"use client"

import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api/client"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Pencil, Trash2 } from "lucide-react"

interface Kontrak {
  id: string
  nama: string
  customer: { nama: string }[]
  tanggal_mulai: string | null
  tanggal_selesai: string | null
  is_active: boolean
  created_at: string
}

interface KontrakTableRowProps {
  kontrak: Kontrak
}

export function KontrakTableRow({ kontrak }: KontrakTableRowProps) {
  const router = useRouter()

  const handleDelete = async () => {
    try {
      await apiFetch(`/api/v1/master/kontrak/${kontrak.id}`, {
        method: "DELETE",
      })
      router.refresh()
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Gagal menghapus")
    }
  }

  const formatDate = (date: string | null) => {
    if (!date) return "-"
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <tr className="hover:bg-muted/30 transition-colors">
      <td className="px-4 py-3 text-sm font-medium">{kontrak.nama}</td>
      <td className="px-4 py-3 text-sm">
        {kontrak.customer?.[0]?.nama || "-"}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {formatDate(kontrak.tanggal_mulai)}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {formatDate(kontrak.tanggal_selesai)}
      </td>
      <td className="px-4 py-3 text-sm">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            kontrak.is_active
              ? "bg-success/10 text-success"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          {kontrak.is_active ? "Active" : "Non-Active"}
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
                  router.push(`/dashboard/master/kontrak/${kontrak.id}/edit`)
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
            itemName={kontrak.nama}
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