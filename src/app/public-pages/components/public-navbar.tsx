'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getDictionary } from '@/lib/i18n'
import { LocaleSwitcher } from './locale-switcher'
import { useCustomerAuth } from '@/lib/hooks/use-customer-auth'

export function PublicNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const dict = getDictionary('id')
  const { isLoggedIn, profile, logout } = useCustomerAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-outline-variant/20">
      <nav className="flex justify-between items-center max-w-[1280px] mx-auto px-[40px] h-20">
        <Link href="/" className="flex items-center gap-3 group">
          <span className="text-[20px] font-semibold tracking-tight text-[#0B1528] font-[family-name:var(--font-heading)] group-hover:text-[#0000ff] transition-colors duration-200">
            RRI
          </span>
          <div className="flex h-2 w-2 rounded-full bg-[#0000ff] animate-pulse" />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className="font-medium text-[14px] text-[#0B1528] hover:text-[#0000ff] transition-colors duration-200 uppercase tracking-wider font-[family-name:var(--font-body)]"
          >
            {dict.nav.beranda}
          </Link>
          <Link
            href="/tentang-kami"
            className="font-medium text-[14px] text-[#0B1528] hover:text-[#0000ff] transition-colors duration-200 uppercase tracking-wider font-[family-name:var(--font-body)]"
          >
            {dict.nav.tentangKami}
          </Link>
          <Link
            href="/layanan"
            className="font-medium text-[14px] text-[#0B1528] hover:text-[#0000ff] transition-colors duration-200 uppercase tracking-wider font-[family-name:var(--font-body)]"
          >
            {dict.nav.layanan}
          </Link>
          <Link
            href="/katalog"
            className="font-medium text-[14px] text-[#0B1528] hover:text-[#0000ff] transition-colors duration-200 uppercase tracking-wider font-[family-name:var(--font-body)]"
          >
            {dict.nav.katalog}
          </Link>
          {isLoggedIn && (
            <>
              <Link
                href="/inquiry"
                className="font-medium text-[14px] text-[#0B1528] hover:text-[#0000ff] transition-colors duration-200 uppercase tracking-wider font-[family-name:var(--font-body)]"
              >
                {dict.auth.cart}
              </Link>
              <Link
                href="/quick-order"
                className="font-medium text-[14px] text-[#0B1528] hover:text-[#0000ff] transition-colors duration-200 uppercase tracking-wider font-[family-name:var(--font-body)]"
              >
                {dict.auth.quickOrder}
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          <LocaleSwitcher />
          {isLoggedIn ? (
            <div className="hidden md:flex items-center gap-3">
              <span className="text-[14px] text-[#64748B] font-[family-name:var(--font-body)]">
                {profile?.nama_perusahaan}
              </span>
              <button
                onClick={handleLogout}
                className="text-[14px] font-medium text-red-500 hover:text-red-700 transition-colors uppercase tracking-wider font-[family-name:var(--font-body)] cursor-pointer"
              >
                {dict.auth.logoutButton}
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/customer-login"
                className="hidden md:inline-flex text-[14px] font-medium text-[#0B1528] hover:text-[#0000ff] transition-colors uppercase tracking-wider font-[family-name:var(--font-body)]"
              >
                {dict.nav.login}
              </Link>
              <Link
                href="/customer-register"
                className="bg-[#0000ff] text-white px-6 py-2.5 rounded-lg font-bold text-[14px] hover:bg-[#0001bb] transition-all duration-200 font-[family-name:var(--font-body)]"
              >
                {dict.nav.daftar}
              </Link>
            </>
          )}
          <button
            className="md:hidden flex items-center cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6 text-[#0B1528]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-outline-variant/20 px-[40px] py-4">
          <div className="flex flex-col gap-4">
            <Link href="/" className="text-[#0B1528] font-medium hover:text-[#0000ff] transition-colors" onClick={() => setMobileOpen(false)}>{dict.nav.beranda}</Link>
            <Link href="/tentang-kami" className="text-[#0B1528] font-medium hover:text-[#0000ff] transition-colors" onClick={() => setMobileOpen(false)}>{dict.nav.tentangKami}</Link>
            <Link href="/layanan" className="text-[#0B1528] font-medium hover:text-[#0000ff] transition-colors" onClick={() => setMobileOpen(false)}>{dict.nav.layanan}</Link>
            <Link href="/katalog" className="text-[#0B1528] font-medium hover:text-[#0000ff] transition-colors" onClick={() => setMobileOpen(false)}>{dict.nav.katalog}</Link>
            {isLoggedIn ? (
              <>
                <Link href="/inquiry" className="text-[#0B1528] font-medium hover:text-[#0000ff] transition-colors" onClick={() => setMobileOpen(false)}>{dict.auth.cart}</Link>
                <Link href="/quick-order" className="text-[#0B1528] font-medium hover:text-[#0000ff] transition-colors" onClick={() => setMobileOpen(false)}>{dict.auth.quickOrder}</Link>
                <button onClick={() => { handleLogout(); setMobileOpen(false) }} className="text-red-500 font-medium text-left hover:text-red-700 transition-colors cursor-pointer">{dict.auth.logoutButton}</button>
              </>
            ) : (
              <>
                <Link href="/customer-login" className="text-[#0B1528] font-medium hover:text-[#0000ff] transition-colors" onClick={() => setMobileOpen(false)}>{dict.nav.login}</Link>
                <Link href="/customer-register" className="text-[#0B1528] font-medium hover:text-[#0000ff] transition-colors" onClick={() => setMobileOpen(false)}>{dict.nav.daftar}</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
