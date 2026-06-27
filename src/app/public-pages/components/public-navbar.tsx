'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, FileSearch, Undo2, ShoppingCart } from 'lucide-react'
import { getDictionary } from '@/lib/i18n'
import { LocaleSwitcher } from './locale-switcher'
import { useCustomerAuth } from '@/lib/hooks/use-customer-auth'

const portalLinks = [
  { href: '/portal', icon: LayoutDashboard, key: 'dashboard' },
  { href: '/portal/dokumen', icon: FileText, key: 'dokumen' },
  { href: '/portal/sph-history', icon: FileSearch, key: 'sphHistory' },
  { href: '/portal/retur', icon: Undo2, key: 'retur' },
]

export function PublicNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [portalOpen, setPortalOpen] = useState(false)
  const portalTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const portalRef = useRef<HTMLDivElement>(null)
  const [cartCount, setCartCount] = useState<number | null>(null)
  const pathname = usePathname()
  const dict = getDictionary('id')
  const { isLoggedIn, token, profile, logout } = useCustomerAuth()

  useEffect(() => {
    if (!isLoggedIn || !token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCartCount(null)
      return
    }
    fetch('/api/v1/public/cart', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => setCartCount(Array.isArray(d.data) ? d.data.length : 0))
      .catch(() => setCartCount(0))
  }, [isLoggedIn, token])

  useEffect(() => {
    return () => {
      if (portalTimer.current) clearTimeout(portalTimer.current)
    }
  }, [])

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

  const showPortal = () => {
    if (portalTimer.current) clearTimeout(portalTimer.current)
    setPortalOpen(true)
  }

  const hidePortal = () => {
    portalTimer.current = setTimeout(() => setPortalOpen(false), 150)
  }

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
              <div
                ref={portalRef}
                className="relative"
                onMouseEnter={showPortal}
                onMouseLeave={hidePortal}
              >
                <button
                  className={`px-3 py-1.5 rounded-lg text-[14px] font-semibold uppercase tracking-wider font-[family-name:var(--font-heading)] transition-all duration-200 flex items-center gap-1 cursor-pointer ${
                    pathname.startsWith('/portal')
                      ? 'bg-[#CA8A04] text-white'
                      : 'text-[#0000ff] hover:bg-[#CA8A04] hover:text-white'
                  }`}
                >
                  {dict.nav.portal}
                  <svg className={`w-3.5 h-3.5 transition-transform ${portalOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {portalOpen && (
                  <div
                    className="absolute left-0 top-full mt-1 w-52 bg-white rounded-xl shadow-lg border border-[#c5c4db]/30 py-2 z-20"
                    onMouseEnter={showPortal}
                    onMouseLeave={hidePortal}
                  >
                    {portalLinks.map(link => {
                      const Icon = link.icon
                      const isPortalActive = pathname === link.href
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setPortalOpen(false)}
                          className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                            isPortalActive
                              ? 'text-[#0001bb] font-semibold bg-[#f2f4f6]'
                              : 'text-[#555e75] hover:bg-[#f2f4f6]'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {dict.portal[link.key as keyof typeof dict.portal] as string}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
              <Link
                href="/inquiry"
                className={`relative p-2 rounded-lg transition-all duration-200 ${
                  isActive('/inquiry') || pathname.startsWith('/inquiry')
                    ? 'text-white bg-[#CA8A04]'
                    : 'text-[#0000ff] hover:bg-[#CA8A04] hover:text-white'
                }`}
                title={dict.auth.cart}
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount !== null && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-[17px] h-[17px] flex items-center justify-center rounded-full leading-none">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
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
                {portalLinks.map(link => {
                  const Icon = link.icon
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 pl-8 text-sm text-[#64748B] hover:text-[#0000ff] transition-colors font-[family-name:var(--font-body)]"
                    >
                      <Icon className="w-4 h-4" />
                      {dict.portal[link.key as keyof typeof dict.portal] as string}
                    </Link>
                  )
                })}
                <Link href="/inquiry" onClick={() => setMobileOpen(false)} className={`relative px-3 py-2 rounded-lg text-[14px] font-semibold uppercase tracking-wider font-[family-name:var(--font-heading)] transition-all duration-200 ${isActive('/inquiry') || pathname.startsWith('/inquiry') ? 'bg-[#CA8A04] text-white' : 'text-[#0000ff] hover:bg-[#CA8A04] hover:text-white'}`}>
                  <ShoppingCart className="w-4 h-4 inline-block -mt-0.5 mr-1.5" />
                  {dict.auth.cart}
                  {cartCount !== null && cartCount > 0 && (
                    <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold min-w-[17px] h-[17px] flex items-center justify-center rounded-full leading-none">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Link>
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
