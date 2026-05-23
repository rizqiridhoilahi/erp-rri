import Link from "next/link"
import { supabase } from "@/lib/db/client"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/empty-state"
import { BreadcrumbNav, BreadcrumbItem } from "@/components/breadcrumb-nav"
import { PageHeader } from "@/components/page-header"
import { KaryawanTableRow } from "./table-row"

const breadcrumbItems: BreadcrumbItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Master Data" },
  { label: "Karyawan" },
]

export default async function KaryawanPage() {
  const { data, error } = await supabase
    .from("karyawan")
    .select("*, jabatan!jabatan_id(nama)")
    .order("nama")

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <BreadcrumbNav items={breadcrumbItems} />
        <PageHeader
          title="Karyawan"
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
        title="Karyawan"
        description={`${data?.length || 0} karyawan terdaftar`}
        actions={
          <Link href="/dashboard/master/karyawan/tambah">
            <Button>Tambah Karyawan</Button>
          </Link>
        }
      />

      {!data || data.length === 0 ? (
        <EmptyState
          title="Belum ada data karyawan"
          description="Tambahkan karyawan pertama Anda untuk memulai."
        />
      ) : (
        <div className="bg-card rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    NIK
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    No. HP
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Jabatan
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.map((item) => (
                  <KaryawanTableRow key={item.id} karyawan={item} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}