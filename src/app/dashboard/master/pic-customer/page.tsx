import Link from "next/link"
import { supabase } from "@/lib/db/client"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/empty-state"
import { BreadcrumbNav, BreadcrumbItem } from "@/components/breadcrumb-nav"
import { PageHeader } from "@/components/page-header"
import { PicCustomerTableRow } from "./table-row"

const breadcrumbItems: BreadcrumbItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Master Data" },
  { label: "PIC Customer" },
]

export default async function PicCustomerPage() {
  const { data: picData, error } = await supabase
    .from("customer_pic")
    .select(
      `
      id,
      customer!inner(nama),
      nama,
      jabatan,
      no_hp,
      email,
      is_active,
      created_at
    `
    )
    .order("created_at", { ascending: false })

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <BreadcrumbNav items={breadcrumbItems} />
        <PageHeader
          title="Data PIC Customer"
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
        title="Data PIC Customer"
        description={`${picData?.length || 0} PIC customer terdaftar`}
        actions={
          <Link href="/dashboard/master/pic-customer/tambah">
            <Button>Tambah PIC Customer</Button>
          </Link>
        }
      />

      {!picData || picData.length === 0 ? (
        <EmptyState
          title="Belum ada data PIC customer"
          description="Tambahkan PIC customer pertama Anda untuk memulai."
        />
      ) : (
        <div className="bg-card rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Nama PIC
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Jabatan
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    No. HP
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Email
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
                {picData.map((item) => (
                  <PicCustomerTableRow key={item.id} pic={item} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}