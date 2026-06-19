'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getDictionary } from '@/lib/i18n'

export function LandingContent() {
  const searchParams = useSearchParams()
  const lang = searchParams.get('lang') ?? 'id'
  const dict = getDictionary(lang)

  return (
    <>
      <section className="relative h-[921px] flex items-center overflow-hidden bg-[#0B1528]">
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-[#0B1528]">
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B1528] via-transparent to-[#0B1528]/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1528] to-transparent" />
          </div>
        </div>
        <div className="relative z-10 max-w-[1280px] mx-auto px-[40px] w-full">
          <div className="max-w-3xl space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#343dff]/20 border border-[#343dff]/30 backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-[#343dff] animate-pulse" />
              <span className="text-[#bec2ff] text-[12px] tracking-widest uppercase font-[family-name:var(--font-body)]">
                {dict.hero.tagline}
              </span>
            </div>
            <h1 className="text-[48px] font-bold text-white leading-tight font-[family-name:var(--font-heading)]">
              {dict.hero.title}
            </h1>
            <p className="text-[18px] text-[#b9c8de] max-w-xl leading-relaxed font-[family-name:var(--font-body)]">
              {dict.hero.subtitle}
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href="/katalog"
                className="px-8 py-4 bg-[#0001bb] text-white font-bold rounded-lg shadow-xl shadow-[#0001bb]/20 hover:translate-y-[-2px] transition-all font-[family-name:var(--font-body)]"
              >
                {dict.hero.ctaStart}
              </Link>
              <Link
                href="/layanan"
                className="px-8 py-4 border border-[#c5c4db]/30 text-white font-bold rounded-lg bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all font-[family-name:var(--font-body)]"
              >
                {dict.hero.ctaSolutions}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-20 -mt-16 max-w-[1280px] mx-auto px-[40px]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white/95 backdrop-blur-xl border border-[#c5c4db]/30 rounded-xl p-8 shadow-2xl shadow-[#0B1528]/5">
          {[
            { value: '32+', label: dict.stats.proyekSelesai },
            { value: '3+', label: dict.stats.klienUtama },
            { value: '50+', label: dict.stats.mitraSupplier },
            { value: '14+', label: dict.stats.tahunPengalaman },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center text-center space-y-2 border-r border-[#e0e3e5]/20 last:border-0">
              <span className="text-[#0001bb] text-[32px] font-bold font-[family-name:var(--font-heading)]">
                {stat.value}
              </span>
              <span className="text-[#454558] text-[14px] uppercase tracking-wider font-[family-name:var(--font-body)]">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 bg-[#f7f9fb]">
        <div className="max-w-[1280px] mx-auto px-[40px]">
          <div className="text-center mb-16">
            <h2 className="text-[32px] font-bold text-[#191c1e] mb-4 font-[family-name:var(--font-heading)]">
              {dict.layanan.title}
            </h2>
            <p className="text-[#454558] text-[16px] max-w-2xl mx-auto font-[family-name:var(--font-body)]">
              {dict.layanan.subtitle}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: 'cleaning_services',
                title: dict.layanan.industrialCleaning.title,
                desc: dict.layanan.industrialCleaning.desc,
              },
              {
                icon: 'inventory_2',
                title: dict.layanan.bulkSupply.title,
                desc: dict.layanan.bulkSupply.desc,
              },
              {
                icon: 'handyman',
                title: dict.layanan.spareParts.title,
                desc: dict.layanan.spareParts.desc,
              },
            ].map((service, i) => (
              <div
                key={i}
                className="glass-card rounded-xl p-8 hover:translate-y-[-4px] transition-all duration-300"
              >
                <span className="material-symbols-outlined text-[#0000ff] text-[40px] mb-4 block">
                  {service.icon}
                </span>
                <h3 className="text-[20px] font-semibold text-[#191c1e] mb-3 font-[family-name:var(--font-heading)]">
                  {service.title}
                </h3>
                <p className="text-[#454558] text-[14px] leading-relaxed font-[family-name:var(--font-body)]">
                  {service.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#0B1528]">
        <div className="max-w-[1280px] mx-auto px-[40px] text-center">
          <h2 className="text-[32px] font-bold text-white mb-4 font-[family-name:var(--font-heading)]">
            {dict.hero.title}
          </h2>
          <p className="text-[#94A3B8] text-[16px] max-w-2xl mx-auto mb-8 font-[family-name:var(--font-body)]">
            {dict.hero.subtitle}
          </p>
          <Link
            href="/customer-register"
            className="inline-block px-8 py-4 bg-[#0000ff] text-white font-bold rounded-lg hover:opacity-90 transition-all font-[family-name:var(--font-body)]"
          >
            {dict.nav.daftar}
          </Link>
        </div>
      </section>
    </>
  )
}
