"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Eye } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface TableActionsProps {
  editUrl: string
  viewUrl?: string
  onDelete: () => Promise<void>
  deleteTitle?: string
  deleteDescription?: string
}

export function TableActions({
  editUrl,
  viewUrl,
  onDelete,
  deleteTitle = "Konfirmasi Hapus",
  deleteDescription = "Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.",
}: TableActionsProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    const toastId = toast.loading("Menghapus...")
    try {
      await onDelete()
      toast.success("Berhasil dihapus", { id: toastId })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menghapus", { id: toastId })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex items-center gap-1">
      {viewUrl && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(viewUrl)}
              className="hover:bg-accent"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Lihat Detail</TooltipContent>
        </Tooltip>
      )}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(editUrl)}
            className="hover:bg-accent"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Edit</TooltipContent>
      </Tooltip>
      <DeleteConfirmationDialog
        onConfirm={handleDelete}
        isLoading={isDeleting}
        itemName={deleteTitle}
        title={deleteTitle}
        description={deleteDescription}
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
  )
}
