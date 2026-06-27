'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, FileSearch, Undo2, Settings, LogOut } from 'lucide-react'
import { getDictionary } from '@/lib/i18n'
import { useCustomerAuth } from '@/lib/hooks/use-customer-auth'

const sidebarLinks = [
  { href: '/portal', icon: LayoutDashboard, key: 'dashboard' },
  { href: '/portal/dokumen', icon: FileText, key: 'dokumen' },
  { href: '/portal/sph-history', icon: FileSearch, key: 'sphHistory' },
  { href: '/portal/retur', icon: Undo2, key: 'retur' },
]

export function PortalSidebar() {
  const pathname = usePathname()
  const dict = getDictionary('id')
  const { logout } = useCustomerAuth()

  const handleLogout = () => logout()

  return (
    <aside className="hidden lg:flex flex-col h-screen w-64 bg-[#283648] fixed left-0 top-0 z-50 border-r border-white/10 shadow-xl">
      <div className="px-6 py-8">
        <Link href="/portal" className="flex items-center gap-3">
          <img
            src="/logo/logo-rri-bg-transparan.png"
            alt="PT RRI"
            className="h-10 w-auto"
          />
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {sidebarLinks.map(link => {
          const Icon = link.icon
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all ${
                isActive
                  ? 'bg-[#0001bb] text-white font-semibold shadow-lg shadow-[#0001bb]/20'
                  : 'text-[#b9c8de] hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-[family-name:var(--font-heading)] text-sm tracking-wide">
                {dict.portal[link.key as keyof typeof dict.portal] as string}
              </span>
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-6 border-t border-white/10 space-y-1">
        <Link
          href="/portal/settings"
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-[#b9c8de] hover:text-white hover:bg-white/10 transition-all"
        >
          <Settings className="w-5 h-5" />
          <span className="font-[family-name:var(--font-heading)] text-sm tracking-wide">
            {dict.portal.settings}
          </span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-[#ffdad6] hover:text-white hover:bg-red-500/20 transition-all cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-[family-name:var(--font-heading)] text-sm tracking-wide">
            {dict.portal.logout}
          </span>
        </button>
      </div>
    </aside>
  )
}
