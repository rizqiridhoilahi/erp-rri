"use client"

import { useEffect, useState, useCallback } from "react"
import { apiFetch } from "@/lib/api/client"
import { Button } from "@/components/ui/button"
import { BreadcrumbNav, BreadcrumbItem } from "@/components/breadcrumb-nav"
import { PageHeader } from "@/components/page-header"
import { TableSkeleton } from "@/components/ui/skeleton"
import { Check, X, ExternalLink } from "lucide-react"
import Link from "next/link"

const breadcrumbItems: BreadcrumbItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Master Data" },
  { label: "Registrasi Customer" },
]

interface CustomerProfile {
  id: string
  auth_user_id: string | null
  customer_id: string | null
  nama_perusahaan: string
  penanggung_jawab_pic: string
  no_whatsapp_pic: string
  alamat_perusahaan: string
  npwp_perusahaan: string | null
  status_verifikasi: string
  created_at: string
}

export default function CustomerProfilesPage() {
  const [data, setData] = useState<CustomerProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<'pending' | 'approved' | 'rejected'>('pending')

  const fetchData = useCallback(async (status: string) => {
    setLoading(true)
    try {
      const { data: result } = await apiFetch<CustomerProfile[]>(
        `/api/v1/master/customer-profiles?status=${status}`
      )
      setData(result ?? [])
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    ;(async () => {
      await fetchData(tab)
    })()
  }, [tab, fetchData])

  const handleApprove = async (id: string) => {
    await apiFetch('/api/v1/master/customer-profiles', {
      method: 'PUT',
      body: JSON.stringify({ id, action: 'approve' }),
    })
    fetchData(tab)
  }

  const handleReject = async (id: string) => {
    await apiFetch('/api/v1/master/customer-profiles', {
      method: 'PUT',
      body: JSON.stringify({ id, action: 'reject' }),
    })
    fetchData(tab)
  }

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    }
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status] ?? 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    )
  }

  return (
    <div className="p-6">
      <BreadcrumbNav items={breadcrumbItems} />
      <PageHeader
        title="Registrasi Customer"
        description="Kelola pendaftaran akun customer portal"
      />

      <div className="flex gap-2 mb-6">
        <Button variant={tab === 'pending' ? 'default' : 'outline'} onClick={() => setTab('pending')}>Pending</Button>
        <Button variant={tab === 'approved' ? 'default' : 'outline'} onClick={() => setTab('approved')}>Disetujui</Button>
        <Button variant={tab === 'rejected' ? 'default' : 'outline'} onClick={() => setTab('rejected')}>Ditolak</Button>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : error ? (
        <div className="text-center text-red-500 py-8">{error}</div>
      ) : data.length === 0 ? (
        <div className="text-center text-[#64748B] py-12">Tidak ada data</div>
      ) : (
        <div className="rounded-xl border border-[#e2e8f0] overflow-hidden bg-white">
          <table className="w-full text-sm">
            <thead className="bg-[#F8FAFC] border-b border-[#e2e8f0]">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-[#0B1528]">Perusahaan</th>
                <th className="text-left px-4 py-3 font-medium text-[#0B1528]">PIC</th>
                <th className="text-left px-4 py-3 font-medium text-[#0B1528]">WhatsApp</th>
                <th className="text-left px-4 py-3 font-medium text-[#0B1528]">Status</th>
                <th className="text-left px-4 py-3 font-medium text-[#0B1528]">Tanggal</th>
                <th className="text-right px-4 py-3 font-medium text-[#0B1528]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]">
              {data.map((item) => (
                <tr key={item.id} className="hover:bg-[#F8FAFC]">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#0B1528]">{item.nama_perusahaan}</p>
                    {item.npwp_perusahaan && (
                      <p className="text-xs text-[#64748B]">NPWP: {item.npwp_perusahaan}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[#0B1528]">{item.penanggung_jawab_pic}</p>
                    <p className="text-xs text-[#64748B]">{item.alamat_perusahaan?.slice(0, 50)}...</p>
                  </td>
                  <td className="px-4 py-3 text-[#0B1528]">{item.no_whatsapp_pic}</td>
                  <td className="px-4 py-3">{statusBadge(item.status_verifikasi)}</td>
                  <td className="px-4 py-3 text-[#64748B]">{new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {item.customer_id && (
                        <Link
                          href={`/dashboard/master/customer/${item.customer_id}`}
                          className="p-2 hover:bg-[#F1F5F9] rounded-lg"
                        >
                          <ExternalLink className="h-4 w-4 text-[#64748B]" />
                        </Link>
                      )}
                      {tab === 'pending' && (
                        <>
                          <Button size="sm" variant="ghost" className="text-green-600" onClick={() => handleApprove(item.id)}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleReject(item.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
