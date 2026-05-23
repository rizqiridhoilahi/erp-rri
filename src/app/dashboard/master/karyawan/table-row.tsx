"use client"

import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api/client"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Pencil, Trash2 } from "lucide-react"

interface Karyawan {
  id: string
  nik: string
  nama: string
  email: string
  no_hp: string | null
  jabatan: { nama: string }[]
  is_active: boolean
  created_at: string
}

interface KaryawanTableRowProps {
  karyawan: Karyawan
}

export function KaryawanTableRow({ karyawan }: KaryawanTableRowProps) {
  const router = useRouter()

  const handleDelete = async () => {
    try {
      await apiFetch(`/api/v1/master/karyawan/${karyawan.id}`, {
        method: "DELETE",
      })
      router.refresh()
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Gagal menghapus")
    }
  }

  return (
    <tr className="hover:bg-muted/30 transition-colors">
      <td className="px-4 py-3 text-sm font-medium">{karyawan.nik}</td>
      <td className="px-4 py-3 text-sm">{karyawan.nama}</td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {karyawan.email}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {karyawan.no_hp || "-"}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {karyawan.jabatan?.[0]?.nama || "-"}
      </td>
      <td className="px-4 py-3 text-sm">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            karyawan.is_active
              ? "bg-success/10 text-success"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          {karyawan.is_active ? "Aktif" : "Non-Aktif"}
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
                  router.push(`/dashboard/master/karyawan/${karyawan.id}/edit`)
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
            itemName={karyawan.nama}
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