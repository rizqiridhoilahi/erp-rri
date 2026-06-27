'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FileSearch, FileText, ShieldCheck, Undo2 } from 'lucide-react'
import { getDictionary } from '@/lib/i18n'
import { useCustomerAuth } from '@/lib/hooks/use-customer-auth'
import { Skeleton, SkeletonCard } from '@/components/skeleton'

interface DashboardData {
  profile: {
    nama_perusahaan: string
    status_verifikasi: string
  }
  stats: {
    rfqCount: number
    sphCount: number
    poCount: number
    invoiceCount: number
    totalDocuments: number
  }
  recentRfqs: { id: string; nomor: string; status: string; createdAt: string }[]
}

export default function PortalDashboardPage() {
  const dict = getDictionary('id')
  const { token } = useCustomerAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) return
    ;(async () => {
      try {
        const res = await fetch('/api/v1/public/portal/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) { setError('Gagal memuat data'); return }
        const json = await res.json()
        setData(json.data)
      } catch {
        setError('Gagal memuat data')
      } finally {
        setLoading(false)
      }
    })()
  }, [token])

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-[12px] border border-[#c5c4db]/30 rounded-xl p-6 shadow-sm">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center justify-between p-3 bg-[#f2f4f6] rounded-lg">
                  <div>
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-[12px] border border-[#c5c4db]/30 rounded-xl p-6 shadow-sm">
            <Skeleton className="h-6 w-28 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 font-[family-name:var(--font-body)]">{error || 'Gagal memuat data'}</p>
      </div>
    )
  }

  const statusLabel = data.profile.status_verifikasi === 'approved' ? '✅ Terverifikasi' : '⏳ Menunggu Verifikasi'
  const statusColor = data.profile.status_verifikasi === 'approved' ? 'text-green-600 bg-green-50' : 'text-yellow-600 bg-yellow-50'

  const quickActions = [
    { href: '/portal/dokumen', icon: FileText, label: dict.portal.viewDocuments },
    { href: '/portal/sph-history', icon: FileSearch, label: dict.portal.viewSphHistory },
    { href: '/portal/retur', icon: Undo2, label: dict.portal.submitReturn },
  ]

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1528] font-[family-name:var(--font-heading)]">
            {dict.portal.overview}
          </h1>
          <p className="text-[#64748B] text-sm font-[family-name:var(--font-body)] mt-1">
            {dict.portal.subtitle}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor} font-[family-name:var(--font-body)]`}>
          {statusLabel}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white/80 backdrop-blur-[12px] border border-[#c5c4db]/30 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-lg bg-[#0001bb]/10 flex items-center justify-center text-[#0001bb]">
              <FileSearch className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-xs uppercase tracking-wider text-[#555e75] mb-1 font-[family-name:var(--font-body)]">{dict.portal.activeRfq}</h3>
          <p className="text-3xl font-bold text-[#0B1528] font-[family-name:var(--font-heading)]">{data.stats.rfqCount}</p>
          <p className="text-xs text-[#555e75] mt-1 font-[family-name:var(--font-body)]">{dict.portal.activeRfqDesc}</p>
        </div>

        <div className="bg-white/80 backdrop-blur-[12px] border border-[#c5c4db]/30 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-lg bg-[#283648]/10 flex items-center justify-center text-[#283648]">
              <FileText className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-xs uppercase tracking-wider text-[#555e75] mb-1 font-[family-name:var(--font-body)]">{dict.portal.readyDocuments}</h3>
          <p className="text-3xl font-bold text-[#0B1528] font-[family-name:var(--font-heading)]">{data.stats.totalDocuments}</p>
          <p className="text-xs text-[#555e75] mt-1 font-[family-name:var(--font-body)]">{dict.portal.readyDocumentsDesc}</p>
        </div>

        <div className="bg-white/80 backdrop-blur-[12px] border border-[#c5c4db]/30 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center text-green-700">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-xs uppercase tracking-wider text-[#555e75] mb-1 font-[family-name:var(--font-body)]">{dict.portal.accountStatus}</h3>
          <p className="text-3xl font-bold text-[#0B1528] font-[family-name:var(--font-heading)]">
            {data.profile.status_verifikasi === 'approved' ? 'Aktif' : 'Pending'}
          </p>
          <p className="text-xs text-[#555e75] mt-1 font-[family-name:var(--font-body)]">{dict.portal.accountStatusDesc}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-[12px] border border-[#c5c4db]/30 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#0B1528] mb-4 font-[family-name:var(--font-heading)]">{dict.portal.recentActivity}</h2>
          {data.recentRfqs.length === 0 ? (
            <p className="text-sm text-[#64748B] font-[family-name:var(--font-body)]">{dict.portal.noRecentActivity}</p>
          ) : (
            <div className="space-y-3">
              {data.recentRfqs.map((rfq) => (
                <div key={rfq.id} className="flex items-center justify-between p-3 bg-[#f2f4f6] rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-[#0B1528] font-[family-name:var(--font-body)]">{rfq.nomor}</p>
                    <p className="text-xs text-[#64748B] font-[family-name:var(--font-body)]">{new Date(rfq.createdAt).toLocaleDateString('id-ID')}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    rfq.status === 'approved' ? 'bg-green-50 text-green-700' :
                    rfq.status === 'draft' ? 'bg-yellow-50 text-yellow-700' :
                    'bg-gray-50 text-gray-600'
                  }`}>
                    {rfq.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white/80 backdrop-blur-[12px] border border-[#c5c4db]/30 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#0B1528] mb-4 font-[family-name:var(--font-heading)]">{dict.portal.quickActions}</h2>
          <div className="space-y-3">
            {quickActions.map(action => {
              const Icon = action.icon
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-3 p-3 rounded-lg bg-[#f2f4f6] hover:bg-[#e0e3e5] transition-colors group"
                >
                  <Icon className="w-5 h-5 text-[#0001bb]" />
                  <span className="text-sm font-medium text-[#0B1528] font-[family-name:var(--font-body)] group-hover:text-[#0001bb] transition-colors">
                    {action.label}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
