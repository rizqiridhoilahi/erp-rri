'use client'

import { useEffect, useState } from 'react'
import { ChevronRight, Undo2, ChevronUp, ChevronDown, Waypoints, Check, Clock, Truck, CheckCheck } from 'lucide-react'
import { getDictionary } from '@/lib/i18n'
import { useCustomerAuth } from '@/lib/hooks/use-customer-auth'
import { Skeleton } from '@/components/skeleton'

interface ReturItem {
  id: string
  barang_id: string
  jumlah: number
  nama_barang: string | null
  kode_barang: string | null
  satuan: string | null
  keterangan: string | null
  barang: { nama: string; kode: string; satuan: string; image_url: string | null } | null
}

interface ReturEntry {
  id: string
  nomor: string
  tanggal: string
  status: string
  keterangan: string | null
  delivery_order: { nomor: string } | null
  items: ReturItem[]
}

const stepIconMap: Record<string, React.ElementType> = {
  check: Check,
  pending: Clock,
  local_shipping: Truck,
  done_all: CheckCheck,
}

export default function PortalReturPage() {
  const dict = getDictionary('id')
  const { token } = useCustomerAuth()
  const [returs, setReturs] = useState<ReturEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRetur, setSelectedRetur] = useState<ReturEntry | null>(null)

  useEffect(() => {
    if (!token) return
    ;(async () => {
      try {
        const res = await fetch('/api/v1/public/retur', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) return
        const json = await res.json()
        setReturs(json.data ?? [])
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    })()
  }, [token])

  const stepConfig = [
    { key: 'draft', label: dict.portal.requested, icon: 'check' },
    { key: 'processed', label: dict.portal.verified, icon: 'pending' },
    { key: 'pickup', label: dict.portal.pickup, icon: 'local_shipping' },
    { key: 'closed', label: dict.portal.resolved, icon: 'done_all' },
  ]

  const statusToStep = (status: string): number => {
    if (status === 'draft') return 0
    if (status === 'processed') return 1
    if (status === 'pickup') return 2
    if (status === 'closed') return 3
    return 0
  }

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      draft: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      processed: 'bg-blue-50 text-blue-700 border-blue-200',
      pickup: 'bg-purple-50 text-purple-700 border-purple-200',
      closed: 'bg-green-50 text-green-700 border-green-200',
    }
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${map[status] || map.draft}`}>
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
            <span className="text-[#0001bb] font-medium">{dict.portal.retur}</span>
          </nav>
          <h1 className="text-2xl font-bold text-[#0B1528] font-[family-name:var(--font-heading)]">{dict.portal.retur}</h1>
          <p className="text-sm text-[#64748B] font-[family-name:var(--font-body)] mt-1">
            Ajukan dan lacak pengembalian barang Anda.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="bg-white/80 backdrop-blur-[12px] border border-[#c5c4db]/30 rounded-xl overflow-hidden shadow-sm">
              <div className="p-5 flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-56" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : returs.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-[12px] border border-[#c5c4db]/30 rounded-xl p-12 text-center shadow-sm">
          <Undo2 className="w-12 h-12 text-[#757589] mx-auto mb-3" />
          <p className="text-sm text-[#64748B] font-[family-name:var(--font-body)]">{dict.portal.noDocuments}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {returs.map(retur => (
            <div
              key={retur.id}
              className="bg-white/80 backdrop-blur-[12px] border border-[#c5c4db]/30 rounded-xl overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setSelectedRetur(selectedRetur?.id === retur.id ? null : retur)}
                className="w-full flex items-center justify-between p-5 hover:bg-[#f2f4f6]/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm font-semibold text-[#0001bb] font-[family-name:var(--font-body)]">{retur.nomor}</p>
                    <p className="text-xs text-[#64748B] font-[family-name:var(--font-body)]">
                      {new Date(retur.tanggal).toLocaleDateString('id-ID')}
                      {retur.delivery_order && ` — DO: ${retur.delivery_order.nomor}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {statusBadge(retur.status)}
                  {selectedRetur?.id === retur.id ? (
                    <ChevronUp className="w-5 h-5 text-[#757589]" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[#757589]" />
                  )}
                </div>
              </button>

              {selectedRetur?.id === retur.id && (
                <div className="border-t border-[#c5c4db]/30 p-5">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <h4 className="text-sm font-semibold text-[#0B1528] mb-3 font-[family-name:var(--font-body)]">{dict.portal.selectItems}</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-[#f2f4f6] text-xs text-[#555e75]">
                              <th className="px-4 py-2 font-semibold">{dict.portal.productDetail}</th>
                              <th className="px-4 py-2 font-semibold">{dict.portal.originalQty}</th>
                              <th className="px-4 py-2 font-semibold">{dict.portal.reason}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#c5c4db]/20">
                            {retur.items.map(item => (
                              <tr key={item.id} className="text-sm">
                                <td className="px-4 py-3">
                                  <p className="font-medium text-[#0B1528] font-[family-name:var(--font-body)]">
                                    {item.nama_barang || item.barang?.nama || '-'}
                                  </p>
                                  <p className="text-xs text-[#64748B] font-[family-name:var(--font-body)]">
                                    {item.kode_barang || item.barang?.kode || ''}
                                  </p>
                                </td>
                                <td className="px-4 py-3 text-[#555e75] font-[family-name:var(--font-body)]">{item.jumlah} {item.satuan || item.barang?.satuan || ''}</td>
                                <td className="px-4 py-3 text-[#555e75] font-[family-name:var(--font-body)]">{item.keterangan || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {retur.keterangan && (
                        <div className="mt-4 p-3 bg-[#f2f4f6] rounded-lg">
                          <p className="text-xs text-[#555e75] font-[family-name:var(--font-body)]">
                            <span className="font-semibold">Catatan:</span> {retur.keterangan}
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="bg-white border border-[#c5c4db]/30 rounded-xl p-5 sticky top-24">
                        <h4 className="text-sm font-semibold text-[#0B1528] mb-6 flex items-center gap-2 font-[family-name:var(--font-heading)]">
                          <Waypoints className="w-5 h-5 text-[#0001bb]" />
                          {dict.portal.returnProgress}
                        </h4>
                        <div className="relative space-y-8 pl-2">
                          {stepConfig.map((step, idx) => {
                            const StepIcon = stepIconMap[step.icon]
                            const currentStep = statusToStep(retur.status)
                            const isActive = idx <= currentStep
                            const isLast = idx === stepConfig.length - 1
                            return (
                              <div key={step.key} className="relative flex items-start gap-4">
                                {!isLast && (
                                  <div className={`absolute left-[11px] top-6 bottom-[-2rem] w-[2px] ${isActive ? 'bg-[#0000ff]' : 'bg-[#c5c4db]'}`} />
                                )}
                                <div className={`z-10 w-6 h-6 rounded-full flex items-center justify-center border-4 shrink-0 ${
                                  isActive
                                    ? 'bg-[#0001bb] border-[#e0e0ff] shadow-md'
                                    : 'bg-[#c5c4db] border-white shadow-sm'
                                }`}>
                                  <StepIcon className="w-3 h-3 text-white" />
                                </div>
                                <div className={`-mt-0.5 ${isActive ? '' : 'opacity-40'}`}>
                                  <p className={`text-sm font-semibold ${isActive ? 'text-[#0001bb]' : 'text-[#0B1528]'} font-[family-name:var(--font-body)]`}>
                                    {step.label}
                                  </p>
                                  <p className="text-xs text-[#555e75] mt-0.5 font-[family-name:var(--font-body)]">
                                    {idx === 0 && `${dict.portal.requestedDesc} ${new Date(retur.tanggal).toLocaleDateString('id-ID')}`}
                                    {idx === 1 && dict.portal.verifiedDesc}
                                    {idx === 2 && dict.portal.pickupDesc}
                                    {idx === 3 && dict.portal.resolvedDesc}
                                  </p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/80 backdrop-blur-[12px] border-l-4 border-l-[#0001bb] rounded-xl p-5 shadow-sm">
          <h5 className="text-sm font-bold text-[#0B1528] mb-2 font-[family-name:var(--font-heading)]">{dict.portal.returnPolicy}</h5>
          <p className="text-xs text-[#555e75] font-[family-name:var(--font-body)]">{dict.portal.returnPolicyDesc}</p>
        </div>
        <div className="bg-white/80 backdrop-blur-[12px] border-l-4 border-l-[#0001bb] rounded-xl p-5 shadow-sm">
          <h5 className="text-sm font-bold text-[#0B1528] mb-2 font-[family-name:var(--font-heading)]">{dict.portal.instantCredits}</h5>
          <p className="text-xs text-[#555e75] font-[family-name:var(--font-body)]">{dict.portal.instantCreditsDesc}</p>
        </div>
        <div className="bg-white/80 backdrop-blur-[12px] border-l-4 border-l-[#0001bb] rounded-xl p-5 shadow-sm">
          <h5 className="text-sm font-bold text-[#0B1528] mb-2 font-[family-name:var(--font-heading)]">{dict.portal.freeLogistics}</h5>
          <p className="text-xs text-[#555e75] font-[family-name:var(--font-body)]">{dict.portal.freeLogisticsDesc}</p>
        </div>
      </div>
    </div>
  )
}
