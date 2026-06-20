'use client'

import { useSearchParams } from 'next/navigation'
import { getDictionary } from '@/lib/i18n'

function ServiceIcon({ name }: { name: string }) {
  if (name === 'sparkles') {
    return (
      <svg className="w-7 h-7 text-[#0000ff] group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    )
  }
  if (name === 'package') {
    return (
      <svg className="w-7 h-7 text-[#0000ff] group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    )
  }
  if (name === 'wrench') {
    return (
      <svg className="w-7 h-7 text-[#0000ff] group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-7.138 7.138a2.016 2.016 0 01-2.852 0 2.016 2.016 0 010-2.852l7.138-7.138m2.852-2.852l7.138-7.138a2.016 2.016 0 012.852 0 2.016 2.016 0 010 2.852l-7.138 7.138M12 12l3.5-3.5" />
      </svg>
    )
  }
  return null
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4 shrink-0 text-[#0000ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

export function LayananContent() {
  const searchParams = useSearchParams()
  const lang = searchParams.get('lang') ?? 'id'
  const dict = getDictionary(lang)

  const services = [
    {
      icon: 'sparkles',
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
      icon: 'package',
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
      icon: 'wrench',
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
      <section className="relative h-[360px] flex items-center justify-center overflow-hidden bg-[#0B1528]">
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

      <section className="relative py-24 bg-[#f7f9fb] overflow-hidden">
        <div className="absolute top-[10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-[#343DFF]/5 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[10%] right-[-10%] w-[300px] h-[300px] rounded-full bg-[#0000FF]/5 blur-[80px] pointer-events-none" />
        <div className="relative max-w-[1280px] mx-auto px-[40px]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, i) => (
              <div
                key={i}
                className="rounded-2xl bg-white p-8 shadow-lg shadow-[#0B1528]/5 hover:shadow-xl hover:shadow-[#0B1528]/10 hover:-translate-y-1.5 border border-[#e2e8f0] transition-all duration-300 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#343DFF]/10 to-[#0000FF]/10 flex items-center justify-center mb-5 group-hover:from-[#343DFF]/20 group-hover:to-[#0000FF]/20 transition-all duration-300">
                  <ServiceIcon name={service.icon} />
                </div>
                <h3 className="text-[20px] font-semibold text-[#191c1e] mb-3 font-[family-name:var(--font-heading)] group-hover:text-[#0000ff] transition-colors duration-300">
                  {service.title}
                </h3>
                <p className="text-[#454558] text-[14px] leading-relaxed mb-5 font-[family-name:var(--font-body)]">
                  {service.desc}
                </p>
                <ul className="space-y-2.5">
                  {service.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2.5 text-[#454558] text-[14px] font-[family-name:var(--font-body)]">
                      <CheckIcon />
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
