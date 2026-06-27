'use client'

import { useEffect, useState } from 'react'
import { ChevronRight, FileText, Download, ChevronLeft } from 'lucide-react'
import { getDictionary } from '@/lib/i18n'
import { useCustomerAuth } from '@/lib/hooks/use-customer-auth'
import { Skeleton, SkeletonTableRow } from '@/components/skeleton'

interface Document {
  id: string
  type: string
  nomor: string
  tanggal: string
  status: string
  pdfUrl: string | null
}

interface DokumenData {
  documents: Document[]
  stats: { total: number; sph: number; po: number; invoice: number }
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

export default function PortalDokumenPage() {
  const dict = getDictionary('id')
  const { token } = useCustomerAuth()
  const [data, setData] = useState<DokumenData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (!token) return
    ;(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/v1/public/portal/dokumen?type=${activeTab}&page=${page}`, {
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
  }, [token, activeTab, page])

  const tabs = [
    { key: 'all', label: dict.portal.allDocuments },
    { key: 'sph', label: dict.portal.sph },
    { key: 'po', label: dict.portal.po },
    { key: 'invoice', label: dict.portal.invoice },
  ]

  const statusBadge = (status: string) => {
    const cls = status === 'approved'
      ? 'bg-green-50 text-green-700 border-green-200'
      : status === 'draft' || status === 'pending'
      ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
      : 'bg-gray-50 text-gray-600 border-gray-200'
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
        {status}
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
            <span className="text-[#1E40AF] font-medium">{dict.portal.dokumen}</span>
          </nav>
          <h1 className="text-2xl font-bold text-[#0B1528] font-[family-name:var(--font-heading)]">{dict.portal.dokumen}</h1>
          <p className="text-sm text-[#64748B] font-[family-name:var(--font-body)] mt-1">{dict.portal.readyDocumentsDesc}</p>
        </div>
      </div>

      {data?.stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/80 backdrop-blur-[12px] border border-[#c5c4db]/30 rounded-xl p-4 shadow-sm border-l-4 hover:scale-[1.02] transition-all duration-200 cursor-pointer border-l-[#1E40AF]">
            <p className="text-xs text-[#555e75] uppercase tracking-wider font-semibold font-[family-name:var(--font-body)]">{dict.portal.totalOutstanding}</p>
            <p className="text-2xl font-bold text-[#0B1528] mt-1 font-[family-name:var(--font-heading)]">{data.stats.total}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-[12px] border border-[#c5c4db]/30 rounded-xl p-4 shadow-sm border-l-4 hover:scale-[1.02] transition-all duration-200 cursor-pointer border-l-green-500">
            <p className="text-xs text-[#555e75] uppercase tracking-wider font-semibold font-[family-name:var(--font-body)]">{dict.portal.sph}</p>
            <p className="text-2xl font-bold text-[#0B1528] mt-1 font-[family-name:var(--font-heading)]">{data.stats.sph}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-[12px] border border-[#c5c4db]/30 rounded-xl p-4 shadow-sm border-l-4 hover:scale-[1.02] transition-all duration-200 cursor-pointer border-l-[#1E40AF]">
            <p className="text-xs text-[#555e75] uppercase tracking-wider font-semibold font-[family-name:var(--font-body)]">{dict.portal.po}</p>
            <p className="text-2xl font-bold text-[#0B1528] mt-1 font-[family-name:var(--font-heading)]">{data.stats.po}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-[12px] border border-[#c5c4db]/30 rounded-xl p-4 shadow-sm border-l-4 hover:scale-[1.02] transition-all duration-200 cursor-pointer border-l-[#D97706]">
            <p className="text-xs text-[#555e75] uppercase tracking-wider font-semibold font-[family-name:var(--font-body)]">{dict.portal.invoice}</p>
            <p className="text-2xl font-bold text-[#0B1528] mt-1 font-[family-name:var(--font-heading)]">{data.stats.invoice}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-[#c5c4db]/30 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#c5c4db]/30 flex flex-wrap items-center justify-between gap-4">
          <div className="flex bg-[#f2f4f6] p-1 rounded-lg">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setPage(1) }}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all font-[family-name:var(--font-body)] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/20 ${
                  activeTab === tab.key
                    ? 'bg-white shadow-sm text-[#1E40AF]'
                    : 'text-[#555e75] hover:text-[#1E40AF]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div>
            <div className="p-4 border-b border-[#c5c4db]/30">
              <Skeleton className="h-10 w-full max-w-md rounded-lg" />
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f2f4f6] border-b border-[#c5c4db]/50">
                  {['Nomor', 'Tipe', 'Tanggal', 'Status', 'Aksi'].map(h => (
                    <th key={h} className="px-6 py-3"><Skeleton className="h-3 w-16" /></th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c5c4db]/20">
                {[1, 2, 3, 4].map(i => <SkeletonTableRow key={i} cols={5} />)}
              </tbody>
            </table>
          </div>
        ) : !data || data.documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <FileText className="w-12 h-12 text-[#757589] mb-3" />
            <p className="text-sm text-[#64748B] font-[family-name:var(--font-body)]">{dict.portal.noDocuments}</p>
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
                  <th className="px-6 py-3 text-xs uppercase tracking-wider text-[#0B1528] font-semibold font-[family-name:var(--font-body)]">{dict.portal.documentNumber}</th>
                  <th className="px-6 py-3 text-xs uppercase tracking-wider text-[#0B1528] font-semibold font-[family-name:var(--font-body)]">{dict.portal.documentType}</th>
                  <th className="px-6 py-3 text-xs uppercase tracking-wider text-[#0B1528] font-semibold font-[family-name:var(--font-body)]">{dict.portal.date}</th>
                  <th className="px-6 py-3 text-xs uppercase tracking-wider text-[#0B1528] font-semibold font-[family-name:var(--font-body)]">{dict.portal.status}</th>
                  <th className="px-6 py-3 text-xs uppercase tracking-wider text-[#0B1528] font-semibold font-[family-name:var(--font-body)]">{dict.portal.action}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c5c4db]/20">
                {data.documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-[#f2f4f6]/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-[#1E40AF] font-[family-name:var(--font-body)]">{doc.nomor}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        doc.type === 'SPH' ? 'bg-green-50 text-green-700' :
                        doc.type === 'PO' ? 'bg-blue-50 text-blue-700' :
                        'bg-yellow-50 text-yellow-700'
                      }`}>{doc.type}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#555e75] font-[family-name:var(--font-body)]">
                      {new Date(doc.tanggal).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4">{statusBadge(doc.status)}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => downloadFile(doc.pdfUrl!, `${doc.nomor}.pdf`, token!)}
                        className="p-2 rounded-full hover:bg-[#1E40AF]/10 text-[#555e75] hover:text-[#1E40AF] transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/20"
                        title="Download PDF"
                      >
                        <Download className="w-[18px] h-[18px]" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && data.documents.length > 0 && (
          <div className="px-6 py-3 bg-[#f2f4f6] border-t border-[#c5c4db]/30 flex items-center justify-between">
            <p className="text-xs text-[#555e75] font-[family-name:var(--font-body)]">
              Menampilkan {data.documents.length} dokumen
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
    </div>
  )
}
