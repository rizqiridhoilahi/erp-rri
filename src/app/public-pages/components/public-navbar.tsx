'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getDictionary } from '@/lib/i18n'
import { LocaleSwitcher } from './locale-switcher'
import { useCustomerAuth } from '@/lib/hooks/use-customer-auth'

export function PublicNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const dict = getDictionary('id')
  const { isLoggedIn, profile, logout } = useCustomerAuth()

  const handleLogout = () => {
    logout()
  }

  const navLinks = [
    { href: '/', label: dict.nav.beranda },
    { href: '/tentang-kami', label: dict.nav.tentangKami },
    { href: '/layanan', label: dict.nav.layanan },
    { href: '/katalog', label: dict.nav.katalog },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-outline-variant/20">
      <nav className="flex justify-between items-center max-w-[1280px] mx-auto px-[40px] h-20">
          <Link href="/" className="flex items-center gap-3 group shrink-0">
          <img
            src="/logo/logo-rri-bg-transparan.png"
            alt="PT RRI"
            className="h-[70px] w-auto"
          />
          </Link>

        <div className="hidden md:flex items-center gap-2">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-lg text-[14px] font-semibold uppercase tracking-wider font-[family-name:var(--font-heading)] transition-all duration-200 ${
                isActive(link.href)
                  ? 'bg-[#CA8A04] text-white'
                  : 'text-[#0000ff] hover:bg-[#CA8A04] hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {isLoggedIn && (
            <>
              <Link
                href="/portal"
                className={`px-3 py-1.5 rounded-lg text-[14px] font-semibold uppercase tracking-wider font-[family-name:var(--font-heading)] transition-all duration-200 ${
                  pathname.startsWith('/portal')
                    ? 'bg-[#CA8A04] text-white'
                    : 'text-[#0000ff] hover:bg-[#CA8A04] hover:text-white'
                }`}
              >
                {dict.nav.portal}
              </Link>
              <Link
                href="/inquiry"
                className={`px-3 py-1.5 rounded-lg text-[14px] font-semibold uppercase tracking-wider font-[family-name:var(--font-heading)] transition-all duration-200 ${
                  isActive('/inquiry') || isActive('/inquiry/konfirmasi') || pathname.startsWith('/inquiry')
                    ? 'bg-[#CA8A04] text-white'
                    : 'text-[#0000ff] hover:bg-[#CA8A04] hover:text-white'
                }`}
              >
                {dict.auth.cart}
              </Link>
              <Link
                href="/quick-order"
                className={`px-3 py-1.5 rounded-lg text-[14px] font-semibold uppercase tracking-wider font-[family-name:var(--font-heading)] transition-all duration-200 ${
                  isActive('/quick-order')
                    ? 'bg-[#CA8A04] text-white'
                    : 'text-[#0000ff] hover:bg-[#CA8A04] hover:text-white'
                }`}
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
                className="text-[14px] font-semibold text-red-500 hover:text-red-700 transition-colors uppercase tracking-wider font-[family-name:var(--font-heading)] cursor-pointer"
              >
                {dict.auth.logoutButton}
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/customer-login"
                className="hidden md:inline-flex text-[14px] font-semibold text-[#0000ff] hover:opacity-70 transition-opacity uppercase tracking-wider font-[family-name:var(--font-heading)]"
              >
                {dict.nav.login}
              </Link>
              <Link
                href="/customer-register"
                className="bg-[#0000ff] text-white px-6 py-2.5 rounded-lg font-bold text-[14px] hover:bg-[#0001bb] transition-all duration-200 font-[family-name:var(--font-heading)]"
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
            <svg className="w-6 h-6 text-[#0000ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-[14px] font-semibold uppercase tracking-wider font-[family-name:var(--font-heading)] transition-all duration-200 ${
                  isActive(link.href)
                    ? 'bg-[#CA8A04] text-white'
                    : 'text-[#0000ff] hover:bg-[#CA8A04] hover:text-white'
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {isLoggedIn ? (
              <>
                <Link href="/portal" onClick={() => setMobileOpen(false)} className={`px-3 py-2 rounded-lg text-[14px] font-semibold uppercase tracking-wider font-[family-name:var(--font-heading)] transition-all duration-200 ${pathname.startsWith('/portal') ? 'bg-[#CA8A04] text-white' : 'text-[#0000ff] hover:bg-[#CA8A04] hover:text-white'}`}>{dict.nav.portal}</Link>
                <Link href="/inquiry" onClick={() => setMobileOpen(false)} className={`px-3 py-2 rounded-lg text-[14px] font-semibold uppercase tracking-wider font-[family-name:var(--font-heading)] transition-all duration-200 ${isActive('/inquiry') || pathname.startsWith('/inquiry') ? 'bg-[#CA8A04] text-white' : 'text-[#0000ff] hover:bg-[#CA8A04] hover:text-white'}`}>{dict.auth.cart}</Link>
                <Link href="/quick-order" onClick={() => setMobileOpen(false)} className={`px-3 py-2 rounded-lg text-[14px] font-semibold uppercase tracking-wider font-[family-name:var(--font-heading)] transition-all duration-200 ${isActive('/quick-order') ? 'bg-[#CA8A04] text-white' : 'text-[#0000ff] hover:bg-[#CA8A04] hover:text-white'}`}>{dict.auth.quickOrder}</Link>
                <button onClick={() => { handleLogout(); setMobileOpen(false) }} className="text-red-500 font-medium text-left hover:text-red-700 transition-colors cursor-pointer">{dict.auth.logoutButton}</button>
              </>
            ) : (
              <>
                <Link href="/customer-login" className="text-[#0000ff] font-medium hover:opacity-70 transition-opacity" onClick={() => setMobileOpen(false)}>{dict.nav.login}</Link>
                <Link href="/customer-register" className="text-[#0000ff] font-medium hover:opacity-70 transition-opacity" onClick={() => setMobileOpen(false)}>{dict.nav.daftar}</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
