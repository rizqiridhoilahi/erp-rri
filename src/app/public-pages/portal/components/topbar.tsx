'use client'

import { useState } from 'react'
import { Bell, LogOut } from 'lucide-react'
import { useCustomerAuth } from '@/lib/hooks/use-customer-auth'

export function PortalTopbar() {
  const { profile, logout } = useCustomerAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-white/70 backdrop-blur-md border-b border-[#c5c4db]/30 flex items-center justify-between px-4 lg:px-10 z-40 shadow-sm">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-bold text-[#0B1528] font-[family-name:var(--font-heading)] hidden lg:block">
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
