'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, LogOut, Menu, LayoutDashboard, FileText, FileSearch, Undo2, Settings } from 'lucide-react'
import { getDictionary } from '@/lib/i18n'
import { useCustomerAuth } from '@/lib/hooks/use-customer-auth'

const navLinks = [
  { href: '/portal', icon: LayoutDashboard, key: 'dashboard' },
  { href: '/portal/dokumen', icon: FileText, key: 'dokumen' },
  { href: '/portal/sph-history', icon: FileSearch, key: 'sphHistory' },
  { href: '/portal/retur', icon: Undo2, key: 'retur' },
]

export function PortalTopbar() {
  const { profile, logout } = useCustomerAuth()
  const [navOpen, setNavOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const pathname = usePathname()
  const dict = getDictionary('id')

  return (
    <header className="fixed top-0 right-0 left-0 h-16 bg-white/70 backdrop-blur-md border-b border-[#c5c4db]/30 flex items-center justify-between px-4 lg:px-10 z-40 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => setNavOpen(!navOpen)}
            className="p-2 hover:bg-[#eceef0]/50 rounded-lg transition-all text-[#454558] cursor-pointer"
            title="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {navOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setNavOpen(false)} />
              <div className="absolute left-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-[#c5c4db]/30 py-2 z-20">
                {navLinks.map(link => {
                  const Icon = link.icon
                  const isActive = pathname === link.href
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setNavOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                        isActive
                          ? 'text-[#0001bb] font-semibold bg-[#f2f4f6]'
                          : 'text-[#555e75] hover:bg-[#f2f4f6]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {dict.portal[link.key as keyof typeof dict.portal] as string}
                    </Link>
                  )
                })}
                <div className="my-1 border-t border-[#c5c4db]/20" />
                <Link
                  href="/portal/settings"
                  onClick={() => setNavOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                    pathname === '/portal/settings'
                      ? 'text-[#0001bb] font-semibold bg-[#f2f4f6]'
                      : 'text-[#555e75] hover:bg-[#f2f4f6]'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  {dict.portal.settings}
                </Link>
              </div>
            </>
          )}
        </div>

        <h2 className="text-lg font-bold text-[#0B1528] font-[family-name:var(--font-heading)]">
          {profile?.nama_perusahaan || 'Client Portal'}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-[#eceef0]/50 rounded-full transition-all text-[#454558]">
          <Bell className="w-[22px] h-[22px]" />
        </button>
        <div className="h-8 w-px bg-[#c5c4db]/30 mx-1"></div>
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-[#0000ff] flex items-center justify-center text-white text-sm font-bold">
              {profile?.nama_perusahaan?.charAt(0) || 'C'}
            </div>
            <span className="text-sm font-medium text-[#0B1528] font-[family-name:var(--font-body)] hidden sm:block">
              {profile?.penanggung_jawab_pic || 'Client'}
            </span>
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-[#c5c4db]/30 py-2 z-20">
                <div className="px-4 py-2 border-b border-[#c5c4db]/20">
                  <p className="text-sm font-semibold text-[#0B1528] truncate">{profile?.penanggung_jawab_pic}</p>
                  <p className="text-xs text-[#64748B] truncate">{profile?.nama_perusahaan}</p>
                </div>
                <button
                  onClick={() => logout()}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
