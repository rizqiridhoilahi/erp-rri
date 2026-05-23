import Link from "next/link"
import { supabase } from "@/lib/db/client"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/empty-state"
import { BreadcrumbNav, BreadcrumbItem } from "@/components/breadcrumb-nav"
import { PageHeader } from "@/components/page-header"
import { CoaTableRow } from "./table-row"

const breadcrumbItems: BreadcrumbItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Master Data" },
  { label: "Chart of Accounts" },
]

export default async function CoaPage() {
  const { data: coaData, error } = await supabase
    .from("coa")
    .select(
      `
      id,
      kode,
      nama,
      tipe,
      coa!induk_id(nama),
      keterangan,
      created_at
    `
    )
    .order("created_at", { ascending: false })

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <BreadcrumbNav items={breadcrumbItems} />
        <PageHeader
          title="Chart of Accounts"
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
        title="Chart of Accounts"
        description={`${coaData?.length || 0} akun terdaftar`}
        actions={
          <Link href="/dashboard/master/coa/tambah">
            <Button>Tambah Akun</Button>
          </Link>
        }
      />

      {!coaData || coaData.length === 0 ? (
        <EmptyState
          title="Belum ada data akun"
          description="Tambahkan akun pertama Anda untuk memulai."
        />
      ) : (
        <div className="bg-card rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Kode
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Nama Akun
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Tipe
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Akun Induk
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Keterangan
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
                {coaData.map((item) => (
                  <CoaTableRow key={item.id} coa={item} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}