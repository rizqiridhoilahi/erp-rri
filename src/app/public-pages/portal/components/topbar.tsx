'use client'

import { useCustomerAuth } from '@/lib/hooks/use-customer-auth'

export function PortalTopbar() {
  const { profile } = useCustomerAuth()

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-white/70 backdrop-blur-md border-b border-[#c5c4db]/30 flex items-center justify-between px-4 lg:px-10 z-40 shadow-sm">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-bold text-[#0B1528] font-[family-name:var(--font-heading)] hidden lg:block">
          {profile?.nama_perusahaan || 'Client Portal'}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-[#eceef0]/50 rounded-full transition-all text-[#454558]">
          <span className="material-symbols-outlined text-[22px]">notifications</span>
        </button>
        <button className="p-2 hover:bg-[#eceef0]/50 rounded-full transition-all text-[#454558] hidden sm:block">
          <span className="material-symbols-outlined text-[22px]">settings</span>
        </button>
        <div className="h-8 w-px bg-[#c5c4db]/30 mx-1"></div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#0000ff] flex items-center justify-center text-white text-sm font-bold">
            {profile?.nama_perusahaan?.charAt(0) || 'C'}
          </div>
          <span className="text-sm font-medium text-[#0B1528] font-[family-name:var(--font-body)] hidden sm:block">
            {profile?.penanggung_jawab_pic || 'Client'}
          </span>
        </div>
      </div>
    </header>
  )
}
