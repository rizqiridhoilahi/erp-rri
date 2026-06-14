"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/db/client"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/empty-state"
import { Badge } from "@/components/ui/badge"
import { BreadcrumbNav, BreadcrumbItem } from "@/components/breadcrumb-nav"
import { PageHeader } from "@/components/page-header"
import { MasterDataTable, Column } from "@/components/master-data-table"
import { apiFetch } from "@/lib/api/client"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { Eye, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react"
import { TableSkeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const breadcrumbItems: BreadcrumbItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Master Data" },
  { label: "Kategori Barang" },
]

interface KategoriBarang {
  id: string
  nama: string
  keterangan: string | null
  is_active: boolean
  created_at: string
}

export default function KategoriBarangPage() {
  const router = useRouter()
  const [data, setData] = useState<KategoriBarang[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from("kategori_barang")
      .select("*")
      .order("nama")
      .then(({ data: result, error: err }) => {
        if (err) setError(err.message)
        else setData((Array.isArray(result) ? result : []) as KategoriBarang[])
        setLoading(false)
      })
  }, [])

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      await apiFetch(`/api/v1/master/kategori-barang/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: !current }),
      })
      toast.success(`Kategori ${current ? 'dinonaktifkan' : 'diaktifkan'}`)
      setData((prev) => prev.map((item) => (item.id === id ? { ...item, is_active: !current } : item)))
    } catch {
      toast.error('Gagal mengubah status kategori')
    }
  }

  const handleDelete = (id: string) => async () => {
    await apiFetch(`/api/v1/master/kategori-barang/${id}`, { method: "DELETE" })
    setData((prev) => prev.filter((item) => item.id !== id))
  }

  const actionButtons = (id: string, name: string, isActive: boolean) => (
    <div className="flex items-center justify-end gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={() => handleToggleActive(id, isActive)} className="hover:bg-accent">
            {isActive ? <ToggleLeft className="h-4 w-4 text-muted-foreground" /> : <ToggleRight className="h-4 w-4 text-green-500" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{isActive ? 'Nonaktifkan' : 'Aktifkan'}</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/dashboard/master/kategori-barang/${id}`)}
            className="hover:bg-accent"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Lihat Detail</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/dashboard/master/kategori-barang/${id}/edit`)}
            className="hover:bg-accent"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Edit</TooltipContent>
      </Tooltip>
      <DeleteConfirmationDialog
        onConfirm={handleDelete(id)}
        itemName={name}
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

  if (loading) return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <BreadcrumbNav items={breadcrumbItems} />
      <PageHeader title="Kategori Barang" />
      <TableSkeleton rows={5} cols={2} actionsCols={3} headerHidden />
    </div>
  )

  if (error) return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <BreadcrumbNav items={breadcrumbItems} />
      <PageHeader title="Kategori Barang" description="Error loading data" />
      <EmptyState title="Gagal memuat data" description={error} />
    </div>
  )

  const columns: Column<KategoriBarang>[] = [
    { header: "Nama", accessor: (item) => item.nama, sortKey: "nama" },
    { header: "Keterangan", accessor: (item) => item.keterangan || "-", sortKey: "keterangan" },
    { header: "Status", accessor: (item) => (
      <Badge variant={item.is_active ? 'default' : 'secondary'}>
        {item.is_active ? 'Aktif' : 'Nonaktif'}
      </Badge>
    )},
    { header: "Aksi", accessor: (item) => actionButtons(item.id, item.nama, item.is_active), className: "text-right" },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <BreadcrumbNav items={breadcrumbItems} />
      <PageHeader
        title="Kategori Barang"
        description={`${data.length} kategori terdaftar`}
        actions={
          <Link href="/dashboard/master/kategori-barang/tambah">
            <Button>Tambah Kategori</Button>
          </Link>
        }
      />
      {!data.length ? (
        <EmptyState title="Belum ada data kategori" description="Tambahkan kategori pertama Anda untuk memulai." />
      ) : (
        <MasterDataTable
          data={data}
          columns={columns}
          searchFields={["nama"]}
          searchPlaceholder="Cari kategori..."
        />
      )}
    </div>
  )
}
