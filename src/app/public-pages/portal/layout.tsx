'use client'

import { ReactNode, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCustomerAuth } from '@/lib/hooks/use-customer-auth'
import { PortalTopbar } from './components/topbar'

export default function PortalLayout({ children }: { children: ReactNode }) {
  const { isLoggedIn, profile, loading, profileLoading } = useCustomerAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(timeout)
  }, [])

  const shouldRedirect = mounted && !loading && !profileLoading && !isLoggedIn
  useEffect(() => {
    if (shouldRedirect) {
      router.replace('/customer-login')
    }
  }, [shouldRedirect, router])

  if (!mounted || loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#0000ff] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-[#64748B] font-[family-name:var(--font-body)]">Loading...</span>
        </div>
      </div>
    )
  }

  if (!isLoggedIn) return null

  if (profile?.status_verifikasi === 'pending') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-amber-600 text-3xl">!</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0B1528] mb-2 font-[family-name:var(--font-heading)]">Akun Menunggu Persetujuan</h1>
          <p className="text-[#64748B] mb-4 font-[family-name:var(--font-body)]">
            Akun Anda masih menunggu persetujuan admin. Silakan coba lagi nanti atau hubungi admin.
          </p>
          <p className="text-[#64748B] text-sm mb-6 font-[family-name:var(--font-body)]">
            Sementara itu, Anda sudah bisa mengakses <strong>Katalog Produk</strong> dan mengirim <strong>Inquiry</strong>.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/katalog"
              className="bg-[#0000ff] text-white px-6 py-2.5 rounded-lg font-bold hover:opacity-90 transition-all font-[family-name:var(--font-body)]"
            >
              Katalog
            </Link>
            <Link
              href="/inquiry"
              className="border border-[#0000ff] text-[#0000ff] px-6 py-2.5 rounded-lg font-bold hover:bg-blue-50 transition-all font-[family-name:var(--font-body)]"
            >
              Inquiry Saya
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <PortalTopbar />
      <main className="pt-16 min-h-screen">
        <div className="px-4 lg:px-10 py-6 pb-8 max-w-[1280px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
