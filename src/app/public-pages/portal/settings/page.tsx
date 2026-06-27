'use client'

import { useEffect, useState } from 'react'
import { getDictionary } from '@/lib/i18n'
import { useCustomerAuth } from '@/lib/hooks/use-customer-auth'
import { Skeleton } from '@/components/skeleton'

export default function PortalSettingsPage() {
  const dict = getDictionary('id')
  const { token } = useCustomerAuth()
  const [profile, setProfile] = useState<{
    nama_perusahaan: string
    penanggung_jawab_pic: string
    email: string
    telepon: string
    alamat: string
    status_verifikasi: string
    createdAt: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) return
    ;(async () => {
      try {
        const res = await fetch('/api/v1/public/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) { setError('Gagal memuat data'); return }
        const json = await res.json()
        setProfile(json.data.profile)
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
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64 mb-6" />
        <div className="bg-white/80 backdrop-blur-[12px] border border-[#c5c4db]/30 rounded-xl p-6 shadow-sm space-y-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
        </div>
      </div>
    )
  }

  if (error) {
    return <p className="text-red-500 text-center py-20">{error}</p>
  }

  const statusLabel = profile?.status_verifikasi === 'approved'
    ? '✅ Terverifikasi' : '⏳ Menunggu Verifikasi'
  const statusColor = profile?.status_verifikasi === 'approved'
    ? 'text-green-600 bg-green-50' : 'text-yellow-600 bg-yellow-50'

  const fields = [
    { label: 'Nama Perusahaan', value: profile?.nama_perusahaan },
    { label: 'PIC', value: profile?.penanggung_jawab_pic },
    { label: 'Email', value: profile?.email },
    { label: 'Telepon', value: profile?.telepon },
    { label: 'Alamat', value: profile?.alamat },
    { label: 'Bergabung Sejak', value: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-' },
  ]

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1528] font-[family-name:var(--font-heading)]">
            {dict.portal.settings}
          </h1>
          <p className="text-[#64748B] text-sm font-[family-name:var(--font-body)] mt-1">
            Informasi profil perusahaan Anda
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
          {statusLabel}
        </span>
      </div>

      <div className="bg-white/80 backdrop-blur-[12px] border border-[#c5c4db]/30 rounded-xl p-6 shadow-sm max-w-2xl">
        <div className="divide-y divide-[#c5c4db]/20">
          {fields.map(f => (
            <div key={f.label} className="flex items-center justify-between py-4">
              <span className="text-sm font-medium text-[#64748B]">{f.label}</span>
              <span className="text-sm font-semibold text-[#0B1528] text-right max-w-[60%] truncate">
                {f.value || '-'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
