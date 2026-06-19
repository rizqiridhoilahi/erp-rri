'use client'

import { useSearchParams } from 'next/navigation'
import { getDictionary } from '@/lib/i18n'

export function LayananContent() {
  const searchParams = useSearchParams()
  const lang = searchParams.get('lang') ?? 'id'
  const dict = getDictionary(lang)

  const services = [
    {
      icon: 'cleaning_services',
      title: dict.layanan.industrialCleaning.title,
      desc: dict.layanan.industrialCleaning.desc,
      features: [
        'Pembersihan area produksi',
        'Pembersihan gudang & penyimpanan',
        'Pengelolaan limbah industri',
        'Jadwal pembersihan rutin',
      ],
    },
    {
      icon: 'inventory_2',
      title: dict.layanan.bulkSupply.title,
      desc: dict.layanan.bulkSupply.desc,
      features: [
        'Kontrak tahunan ATK & perlengkapan kantor',
        'Material habis pakai industri',
        'Pengiriman terjadwal',
        'Harga kompetitif volume besar',
      ],
    },
    {
      icon: 'handyman',
      title: dict.layanan.spareParts.title,
      desc: dict.layanan.spareParts.desc,
      features: [
        'Jaringan supplier global terverifikasi',
        'Suku cadang mesin industri',
        'Komponen elektrikal & mekanikal',
        'Pengadaan khusus sesuai spesifikasi',
      ],
    },
  ]

  return (
    <>
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden bg-[#0B1528]">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_50%_50%,#343DFF_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0B1528]/60" />
        <div className="relative z-10 text-center max-w-4xl px-4">
          <span className="inline-block text-[#343dff] text-[14px] tracking-[0.2em] mb-6 uppercase font-[family-name:var(--font-body)] font-medium">
            Industrial Excellence
          </span>
          <h1 className="text-[48px] font-bold text-white mb-4 leading-tight font-[family-name:var(--font-heading)]">
            {dict.layanan.title}
          </h1>
          <p className="text-[18px] text-white/70 max-w-2xl mx-auto font-[family-name:var(--font-body)]">
            {dict.layanan.subtitle}
          </p>
        </div>
      </section>

      <section className="py-20 bg-[#f7f9fb]">
        <div className="max-w-[1280px] mx-auto px-[40px]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, i) => (
              <div
                key={i}
                className="glass-card rounded-xl p-8 hover:translate-y-[-4px] transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-xl bg-[#0000ff]/10 flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[#0000ff] text-[32px]">
                    {service.icon}
                  </span>
                </div>
                <h3 className="text-[24px] font-semibold text-[#191c1e] mb-4 font-[family-name:var(--font-heading)]">
                  {service.title}
                </h3>
                <p className="text-[#454558] text-[14px] leading-relaxed mb-6 font-[family-name:var(--font-body)]">
                  {service.desc}
                </p>
                <ul className="space-y-3">
                  {service.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3 text-[#454558] text-[14px] font-[family-name:var(--font-body)]">
                      <span className="material-symbols-outlined text-[#0000ff] text-[18px]">check</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
