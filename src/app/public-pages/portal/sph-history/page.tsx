'use client'

import { useEffect, useState } from 'react'
import { ChevronRight, FileText, Search, FileSearch, Download, ChevronLeft, ArrowRight, Info } from 'lucide-react'
import { getDictionary } from '@/lib/i18n'
import { useCustomerAuth } from '@/lib/hooks/use-customer-auth'
import { Skeleton, SkeletonTableRow } from '@/components/skeleton'

interface SphEntry {
  id: string
  nomor: string
  tanggal: string
  keterangan: string | null
  status: string
  sphNomor: string | null
  sphId: string | null
  pdfUrl: string | null
}

interface SphData {
  rfqs: SphEntry[]
  stats: { total: number; approved: number; pending: number; revised: number }
  page: number
  hasMore: boolean
}

function downloadFile(url: string, filename: string, token: string) {
  if (url.startsWith('/api/')) {
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.blob())
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = blobUrl
        a.download = filename
        a.click()
        URL.revokeObjectURL(blobUrl)
      })
  } else {
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
  }
}

export default function PortalSphHistoryPage() {
  const dict = getDictionary('id')
  const { token } = useCustomerAuth()
  const [data, setData] = useState<SphData | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!token) return
    ;(async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({ page: String(page) })
        if (search) params.set('search', search)
        const res = await fetch(`/api/v1/public/portal/sph-history?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) return
        const json = await res.json()
        setData(json.data)
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    })()
  }, [token, page, search])

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      approved: 'bg-green-50 text-green-700 border-green-200',
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      draft: 'bg-gray-50 text-gray-600 border-gray-200',
      revised: 'bg-red-50 text-red-700 border-red-200',
    }
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${map[status] || map.draft}`}>
        {status === 'approved' ? dict.portal.approved :
         status === 'revised' ? dict.portal.revised :
         dict.portal.pending}
      </span>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <nav className="flex items-center gap-2 text-xs text-[#555e75] mb-2">
            <span>{dict.portal.dashboard}</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#1E40AF] font-medium">{dict.portal.sphHistory}</span>
          </nav>
          <h1 className="text-2xl font-bold text-[#0B1528] font-[family-name:var(--font-heading)]">{dict.portal.sphHistory}</h1>
          <p className="text-sm text-[#64748B] font-[family-name:var(--font-body)] mt-1">
            Kelola dan lacak pengajuan Surat Penawaran Harga (SPH) Anda.
          </p>
        </div>
      </div>

      {data?.stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/80 backdrop-blur-[12px] border border-[#c5c4db]/30 rounded-xl p-5 shadow-sm border-l-4 hover:scale-[1.02] transition-all duration-200 cursor-pointer border-l-[#1E40AF]">
            <p className="text-xs text-[#555e75] uppercase tracking-wider font-semibold font-[family-name:var(--font-body)]">{dict.portal.totalRequests}</p>
            <p className="text-2xl font-bold text-[#0B1528] mt-1 font-[family-name:var(--font-heading)]">{data.stats.total}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-[12px] border border-[#c5c4db]/30 rounded-xl p-5 shadow-sm border-l-4 hover:scale-[1.02] transition-all duration-200 cursor-pointer border-l-green-500">
            <p className="text-xs text-[#555e75] uppercase tracking-wider font-semibold font-[family-name:var(--font-body)]">{dict.portal.approvedSph}</p>
            <p className="text-2xl font-bold text-[#0B1528] mt-1 font-[family-name:var(--font-heading)]">{data.stats.approved}</p>
          </div>
          <div className="md:col-span-2 bg-[#1E40AF]/5 border border-[#c5c4db]/30 rounded-xl p-5 shadow-sm relative overflow-hidden hover:scale-[1.02] transition-all duration-200 cursor-pointer">
            <div className="relative z-10">
              <p className="text-xs text-[#555e75] uppercase tracking-wider font-semibold font-[family-name:var(--font-body)]">{dict.portal.activeProcurements}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {data.rfqs.slice(0, 3).map(rfq => (
                  <span key={rfq.id} className="px-3 py-1 bg-white/60 border border-[#c5c4db] rounded-full text-xs font-medium">
                    {rfq.nomor} ({rfq.status})
                  </span>
                ))}
                {data.rfqs.length > 3 && (
                  <span className="px-3 py-1 bg-white/60 border border-[#c5c4db] rounded-full text-xs font-medium">
                    +{data.rfqs.length - 3} more
                  </span>
                )}
              </div>
            </div>
            <div className="absolute -right-8 -bottom-8 opacity-5">
              <FileText className="w-40 h-40" />
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-[#c5c4db]/30 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#c5c4db]/30">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#757589]" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder={dict.portal.search}
              className="w-full pl-10 pr-4 py-2 bg-[#f2f4f6] border border-[#c5c4db]/50 rounded-full text-sm focus:ring-2 focus:ring-[#1E40AF]/20 focus:border-[#1E40AF] outline-none transition-all font-[family-name:var(--font-body)]"
            />
          </div>
        </div>

        {loading ? (
          <div>
            <div className="p-4 border-b border-[#c5c4db]/30">
              <Skeleton className="h-10 w-full max-w-sm rounded-full" />
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f2f4f6] border-b border-[#c5c4db]/50">
                  {['ID RFQ', 'Tanggal', 'Subjek', 'Status', 'Aksi'].map(h => (
                    <th key={h} className="px-6 py-3"><Skeleton className="h-3 w-16" /></th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c5c4db]/20">
                {[1, 2, 3, 4].map(i => <SkeletonTableRow key={i} cols={5} />)}
              </tbody>
            </table>
          </div>
        ) : !data || data.rfqs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <FileSearch className="w-12 h-12 text-[#757589] mb-3" />
            <p className="text-sm text-[#64748B] font-[family-name:var(--font-body)]">{dict.portal.noSphHistory}</p>
            <a
              href="/public-pages/portal"
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#1E40AF] hover:underline transition-all font-[family-name:var(--font-body)]"
            >
              {dict.portal.dashboard}
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#f2f4f6] border-b border-[#c5c4db]/50">
                  <th className="px-6 py-3 text-xs uppercase tracking-wider text-[#0B1528] font-semibold font-[family-name:var(--font-body)]">{dict.portal.rfqId}</th>
                  <th className="px-6 py-3 text-xs uppercase tracking-wider text-[#0B1528] font-semibold font-[family-name:var(--font-body)]">{dict.portal.date}</th>
                  <th className="px-6 py-3 text-xs uppercase tracking-wider text-[#0B1528] font-semibold font-[family-name:var(--font-body)]">{dict.portal.subject}</th>
                  <th className="px-6 py-3 text-xs uppercase tracking-wider text-[#0B1528] font-semibold font-[family-name:var(--font-body)] text-center">{dict.portal.status}</th>
                  <th className="px-6 py-3 text-xs uppercase tracking-wider text-[#0B1528] font-semibold font-[family-name:var(--font-body)] text-right">{dict.portal.action}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c5c4db]/20">
                {data.rfqs.map((rfq) => (
                  <tr key={rfq.id} className="hover:bg-[#f2f4f6]/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-[#1E40AF] font-[family-name:var(--font-body)]">{rfq.nomor}</td>
                    <td className="px-6 py-4 text-sm text-[#555e75] font-[family-name:var(--font-body)]">
                      {new Date(rfq.tanggal).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-[#0B1528] font-[family-name:var(--font-body)]">{rfq.keterangan || '-'}</p>
                    </td>
                    <td className="px-6 py-4 text-center">{statusBadge(rfq.status)}</td>
                    <td className="px-6 py-4 text-right">
                      {rfq.pdfUrl ? (
                        <button
                          onClick={() => downloadFile(rfq.pdfUrl!, `${rfq.nomor}.pdf`, token!)}
                          className="bg-[#1E40AF] hover:bg-[#1B2EC4] text-white px-4 py-2 rounded-lg font-semibold text-xs shadow-lg shadow-[#1E40AF]/20 flex items-center gap-1.5 ml-auto transition-all active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/20"
                        >
                          <Download className="w-4 h-4" />
                          {dict.portal.download}
                        </button>
                      ) : (
                        <span className="text-xs text-[#64748B] font-[family-name:var(--font-body)]">{dict.portal.pending}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && data.rfqs.length > 0 && (
          <div className="px-6 py-3 bg-[#f2f4f6] border-t border-[#c5c4db]/30 flex items-center justify-between">
            <p className="text-xs text-[#555e75] font-[family-name:var(--font-body)]">
              Menampilkan {data.rfqs.length} dari {data.stats.total} entries
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-[#c5c4db] hover:bg-white transition-colors disabled:opacity-30 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/20"
              >
                <ChevronLeft className="w-[18px] h-[18px]" />
              </button>
              <span className="px-2 text-sm text-[#555e75] font-[family-name:var(--font-body)]">{page}</span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={!data.hasMore}
                className="p-1.5 rounded-lg border border-[#c5c4db] hover:bg-white transition-colors disabled:opacity-30 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/20"
              >
                <ChevronRight className="w-[18px] h-[18px]" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/80 backdrop-blur-[12px] border border-[#c5c4db]/30 rounded-xl p-6 relative overflow-hidden">
          <div className="relative z-10">
            <h4 className="text-lg font-bold text-[#0B1528] mb-2 font-[family-name:var(--font-heading)]">{dict.portal.needAssistance}</h4>
            <p className="text-sm text-[#64748B] mb-4 font-[family-name:var(--font-body)]">
              Tim akun manajer kami siap mendiskusikan penawaran dan memberikan klarifikasi teknis untuk RFQ Anda.
            </p>
            <a href="mailto:info@pt-rri.com" className="text-[#1E40AF] font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all cursor-pointer font-[family-name:var(--font-body)]">
              Contact Support
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
          <div className="absolute right-0 top-0 w-32 h-32 bg-[#1E40AF]/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        </div>
        <div className="bg-white/80 backdrop-blur-[12px] border-2 border-dashed border-[#c5c4db]/50 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#e0e3e5] rounded-lg">
              <Info className="w-5 h-5 text-[#1E40AF]" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-[#0B1528] mb-1 font-[family-name:var(--font-heading)]">{dict.portal.docValidityNotice}</h4>
              <p className="text-sm text-[#64748B] font-[family-name:var(--font-body)]">{dict.portal.docValidityDesc}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
