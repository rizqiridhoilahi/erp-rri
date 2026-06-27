'use client'

import { ReactNode, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCustomerAuth } from '@/lib/hooks/use-customer-auth'
import { PortalSidebar } from './components/sidebar'
import { PortalTopbar } from './components/topbar'

export default function PortalLayout({ children }: { children: ReactNode }) {
  const { isLoggedIn, loading, profileLoading } = useCustomerAuth()
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

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <PortalSidebar />
      <PortalTopbar />
      <main className="pt-16 lg:pl-64 min-h-screen">
        <div className="px-4 lg:px-10 py-6 max-w-[1280px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
