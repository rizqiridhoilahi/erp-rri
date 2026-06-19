'use client'

import { useSearchParams } from 'next/navigation'
import { getDictionary } from '@/lib/i18n'

export function TentangContent() {
  const searchParams = useSearchParams()
  const lang = searchParams.get('lang') ?? 'id'
  const dict = getDictionary(lang)

  return (
    <>
      <section className="relative h-[400px] flex items-center overflow-hidden bg-[#0B1528]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B1528] via-transparent to-[#0B1528]/40" />
        <div className="relative z-10 max-w-[1280px] mx-auto px-[40px] w-full">
          <h1 className="text-[48px] font-bold text-white font-[family-name:var(--font-heading)]">
            {dict.tentang.title}
          </h1>
          <p className="text-[18px] text-[#b9c8de] mt-4 max-w-xl font-[family-name:var(--font-body)]">
            {dict.tentang.subtitle}
          </p>
        </div>
      </section>

      <section className="py-20 bg-[#f7f9fb]">
        <div className="max-w-[1280px] mx-auto px-[40px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div>
              <h2 className="text-[24px] font-semibold text-[#191c1e] mb-6 font-[family-name:var(--font-heading)]">
                {dict.tentang.profil}
              </h2>
              <div className="space-y-4 text-[#454558] text-[16px] leading-relaxed font-[family-name:var(--font-body)]">
                <p>
                  PT. Rizki Ridho Ilahi (RRI) adalah perusahaan General Supplier &amp; Trading Services
                  yang berbasis di Jepara, Jawa Tengah. Sejak berdiri, kami telah menjadi mitra terpercaya
                  bagi industri besar di Indonesia, khususnya PLTU Tanjung Jati B Jepara.
                </p>
                <p>
                  Kami berkomitmen untuk menyediakan solusi pengadaan berkualitas tinggi dengan standar
                  integritas dan profesionalisme tertinggi.
                </p>
              </div>
            </div>
            <div className="space-y-8">
              <div className="glass-card rounded-xl p-8">
                <h3 className="text-[20px] font-semibold text-[#191c1e] mb-4 font-[family-name:var(--font-heading)]">
                  {dict.tentang.legalitas}
                </h3>
                <ul className="space-y-3 text-[#454558] text-[14px] font-[family-name:var(--font-body)]">
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#0000ff] text-[20px]">check_circle</span>
                    Akta Pendirian &amp; SK Kemenkumham
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#0000ff] text-[20px]">check_circle</span>
                    NPWP &amp; PKP
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#0000ff] text-[20px]">check_circle</span>
                    Sertifikat Badan Usaha (SBU)
                  </li>
                </ul>
              </div>
              <div className="glass-card rounded-xl p-8">
                <h3 className="text-[20px] font-semibold text-[#191c1e] mb-4 font-[family-name:var(--font-heading)]">
                  {dict.tentang.antiBribery}
                </h3>
                <p className="text-[#454558] text-[14px] leading-relaxed font-[family-name:var(--font-body)]">
                  RRI berkomitmen penuh terhadap praktik bisnis anti-penyuapan dan kepatuhan terhadap
                  regulasi yang berlaku. Kami menerapkan kebijakan nol toleransi terhadap korupsi,
                  suap, dan gratifikasi dalam setiap aktivitas bisnis.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
