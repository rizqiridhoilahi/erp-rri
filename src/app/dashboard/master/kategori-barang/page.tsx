import Link from "next/link"
import { supabase } from "@/lib/db/client"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/empty-state"
import { BreadcrumbNav, BreadcrumbItem } from "@/components/breadcrumb-nav"
import { PageHeader } from "@/components/page-header"
import { KategoriBarangTableRow } from "./table-row"

const breadcrumbItems: BreadcrumbItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Master Data" },
  { label: "Kategori Barang" },
]

export default async function KategoriBarangPage() {
  const { data, error } = await supabase
    .from("kategori_barang")
    .select("*")
    .order("nama")

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <BreadcrumbNav items={breadcrumbItems} />
        <PageHeader
          title="Kategori Barang"
          description="Error loading data"
        />
        <EmptyState
          title="Gagal memuat data"
          description={error.message}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <BreadcrumbNav items={breadcrumbItems} />
      <PageHeader
        title="Kategori Barang"
        description={`${data?.length || 0} kategori terdaftar`}
        actions={
          <Link href="/dashboard/master/kategori-barang/tambah">
            <Button>Tambah Kategori</Button>
          </Link>
        }
      />

      {!data || data.length === 0 ? (
        <EmptyState
          title="Belum ada data kategori"
          description="Tambahkan kategori pertama Anda untuk memulai."
        />
      ) : (
        <div className="bg-card rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Keterangan
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.map((item) => (
                  <KategoriBarangTableRow key={item.id} kategori={item} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}