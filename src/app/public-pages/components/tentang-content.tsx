'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getDictionary } from '@/lib/i18n'

function StatCounter({ target, suffix, isVisible }: { target: number; suffix: string; isVisible: boolean }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!isVisible) return
    let current = 0
    const step = Math.max(1, Math.ceil(target / (1500 / 16)))
    const timer = setInterval(() => {
      current += step
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(current)
      }
    }, 16)
    return () => clearInterval(timer)
  }, [isVisible, target])
  return <>{count}{suffix}</>
}

function useInView(): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement | null>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return [ref, inView]
}

export function TentangContent() {
  const searchParams = useSearchParams()
  const lang = searchParams.get('lang') ?? 'id'
  const dict = getDictionary(lang)

  const [statsRef, statsInView] = useInView()
  const [keunggulanRef, keunggulanVisible] = useInView()
  const [klienRef, klienVisible] = useInView()
  const [timelineRef, timelineVisible] = useInView()

  const stats = [
    { value: 14, suffix: '+', label: 'Tahun Pengalaman', icon: 'calendar' },
    { value: 100, suffix: '+', label: 'Proyek Selesai', icon: 'check-circle' },
    { value: 5, suffix: '+', label: 'Mitra Utama', icon: 'users' },
    { value: 50, suffix: '+', label: 'Supplier Global', icon: 'globe' },
  ]

  const keunggulan = [
    { icon: 'shield-check', title: dict.keunggulan.kualitas.title, desc: dict.keunggulan.kualitas.desc },
    { icon: 'clock', title: dict.keunggulan.tepatWaktu.title, desc: dict.keunggulan.tepatWaktu.desc },
    { icon: 'globe', title: dict.keunggulan.jaringan.title, desc: dict.keunggulan.jaringan.desc },
    { icon: 'award', title: dict.keunggulan.pengalaman.title, desc: dict.keunggulan.pengalaman.desc },
  ]

  const clientLogos = [
    { src: '/image/client/BJP.png', alt: 'BJP' },
    { src: '/image/client/BJS.png', alt: 'BJS' },
    { src: '/image/client/MKP.png', alt: 'MKP' },
    { src: '/image/client/kpjb.png', alt: 'KPJB' },
    { src: '/image/client/EGT.png', alt: 'EGT' },
  ]

  const timeline = [
    { year: '2010', title: 'Berdiri', desc: 'PT. Rizki Ridho Ilahi didirikan di Jepara, Jawa Tengah sebagai perusahaan General Supplier & Trading Services.' },
    { year: '2014', title: 'Mitra PLTU', desc: 'Menjadi mitra penyedia utama untuk PLTU Tanjung Jati B Jepara, salah satu pembangkit listrik terbesar di Indonesia.' },
    { year: '2018', title: 'Ekspansi Layanan', desc: 'Memperluas portofolio mencakup bulk supply bahan kimia, industrial cleaning, dan pengadaan suku cadang.' },
    { year: '2022', title: 'Digitalisasi', desc: 'Meluncurkan platform ERP untuk memudahkan pelanggan dalam pengadaan, tracking, dan dokumentasi secara digital.' },
    { year: '2025', title: 'Mitra Nasional', desc: 'Melayani lebih dari 100 proyek dan menjalin kemitraan dengan berbagai perusahaan terkemuka di Indonesia.' },
  ]

  return (
    <>
      <section className="relative h-[360px] flex items-center justify-center overflow-hidden bg-[#0B1528]">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_50%_50%,#343DFF_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0B1528]/60" />
        <div className="relative z-10 text-center max-w-4xl px-4">
          <span className="inline-block text-[#343dff] text-[14px] tracking-[0.2em] mb-6 uppercase font-[family-name:var(--font-body)] font-medium">
            About Us
          </span>
          <h1 className="text-[48px] font-bold text-white mb-4 leading-tight font-[family-name:var(--font-heading)]">
            {dict.tentang.title}
          </h1>
          <p className="text-[18px] text-white/70 max-w-2xl mx-auto font-[family-name:var(--font-body)]">
            {dict.tentang.subtitle}
          </p>
        </div>
      </section>

      <section ref={statsRef} className="relative z-20 -mt-16 max-w-[1280px] mx-auto px-5 sm:px-8 md:px-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gradient-to-r from-[#343DFF]/30 via-[#0000FF]/20 to-[#343DFF]/30 rounded-xl overflow-hidden shadow-2xl shadow-[#0B1528]/30">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col items-center text-center space-y-3 bg-[#0B1528]/60 backdrop-blur-xl p-6 sm:p-8">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#343DFF] to-[#0000FF] flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  {stat.icon === 'check-circle' && <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
                  {stat.icon === 'users' && <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />}
                  {stat.icon === 'globe' && <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
                  {stat.icon === 'calendar' && <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />}
                </svg>
              </div>
              <span className="bg-gradient-to-r from-[#343DFF] to-[#8085FF] bg-clip-text text-transparent text-[32px] font-bold font-[family-name:var(--font-heading)]">
                {statsInView ? <StatCounter target={stat.value} suffix={stat.suffix} isVisible={statsInView} /> : `0${stat.suffix}`}
              </span>
              <span className="text-[#94A3B8] text-[14px] uppercase tracking-widest font-[family-name:var(--font-body)]">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="relative py-20 bg-[#f7f9fb] overflow-hidden">
        <div className="absolute top-[15%] right-[-10%] w-[350px] h-[350px] rounded-full bg-[#343DFF]/5 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[20%] left-[-10%] w-[300px] h-[300px] rounded-full bg-[#0000FF]/5 blur-[80px] pointer-events-none" />
        <div className="relative max-w-[1280px] mx-auto px-5 sm:px-8 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="relative inline-block text-[24px] font-semibold text-[#191c1e] mb-6 font-[family-name:var(--font-heading)] after:block after:h-[2px] after:w-8 after:bg-[#343DFF] after:mt-2">
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
            <div className="space-y-6">
              <div className="rounded-2xl bg-white p-8 shadow-lg shadow-[#0B1528]/5 border border-[#e2e8f0] hover:shadow-xl hover:shadow-[#0B1528]/10 hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#343DFF]/10 to-[#0000FF]/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#0000ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-[20px] font-semibold text-[#191c1e] font-[family-name:var(--font-heading)]">Visi</h3>
                </div>
                <p className="text-[#454558] text-[14px] leading-relaxed font-[family-name:var(--font-body)]">
                  Menjadi mitra pengadaan dan logistik terdepan di Indonesia yang dikenal karena integritas, keandalan, dan inovasi dalam setiap solusi yang diberikan.
                </p>
              </div>
              <div className="rounded-2xl bg-white p-8 shadow-lg shadow-[#0B1528]/5 border border-[#e2e8f0] hover:shadow-xl hover:shadow-[#0B1528]/10 hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#343DFF]/10 to-[#0000FF]/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#0000ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    </svg>
                  </div>
                  <h3 className="text-[20px] font-semibold text-[#191c1e] font-[family-name:var(--font-heading)]">Misi</h3>
                </div>
                <p className="text-[#454558] text-[14px] leading-relaxed font-[family-name:var(--font-body)]">
                  Memberikan solusi pengadaan yang efisien, tepat waktu, dan berkualitas melalui jaringan supplier global, inovasi digital, dan pelayanan yang berorientasi pada kepuasan pelanggan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section ref={keunggulanRef} className="relative py-20 bg-[#0B1528] overflow-hidden">
        <div className="absolute inset-0 diagonal-grid opacity-30" />
        <div className="hero-circle top-[20%] left-[10%] w-[400px] h-[400px] bg-[#343DFF]/20" />
        <div className="hero-circle bottom-[10%] right-[5%] w-[300px] h-[300px] bg-[#0000FF]/15" />
        <div className="relative max-w-[1280px] mx-auto px-5 sm:px-8 md:px-10">
          <div className="text-center mb-12">
            <h2 className="text-[32px] font-bold text-white mb-4 font-[family-name:var(--font-heading)]">
              {dict.keunggulan.title}
            </h2>
            <p className="text-[#94A3B8] text-[16px] max-w-2xl mx-auto font-[family-name:var(--font-body)]">
              {dict.keunggulan.subtitle}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {keunggulan.map((item, i) => (
              <div
                key={i}
                className={`rounded-xl p-6 bg-white/5 backdrop-blur-sm border border-white/10 border-t-2 border-t-[#343DFF] hover:bg-white/10 hover:border-t-[#0000FF] hover:shadow-lg hover:shadow-[#343DFF]/10 transition-all duration-300 ${keunggulanVisible ? 'reveal-visible' : 'reveal'}`}
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#343DFF]/20 to-[#0000FF]/20 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-[#8085FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    {item.icon === 'shield-check' && <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />}
                    {item.icon === 'clock' && <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
                    {item.icon === 'globe' && <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />}
                    {item.icon === 'award' && <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />}
                  </svg>
                </div>
                <h3 className="text-[18px] font-semibold text-white mb-2 font-[family-name:var(--font-heading)]">
                  {item.title}
                </h3>
                <p className="text-[#94A3B8] text-[14px] leading-relaxed font-[family-name:var(--font-body)]">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-20 bg-[#f7f9fb] overflow-hidden">
        <div className="absolute top-[10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-[#343DFF]/5 blur-[100px] pointer-events-none" />
        <div className="relative max-w-[1280px] mx-auto px-5 sm:px-8 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="rounded-2xl bg-white p-8 shadow-lg shadow-[#0B1528]/5 border border-[#e2e8f0] hover:shadow-xl hover:shadow-[#0B1528]/10 hover:-translate-y-1.5 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#343DFF]/10 to-[#0000FF]/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#0000ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <h3 className="text-[20px] font-semibold text-[#191c1e] font-[family-name:var(--font-heading)]">
                  {dict.tentang.legalitas}
                </h3>
              </div>
              <ul className="space-y-3.5 text-[#454558] text-[14px] font-[family-name:var(--font-body)]">
                <li className="flex items-center gap-3 group/item">
                  <svg className="w-5 h-5 shrink-0 text-[#0000ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="group-hover/item:text-[#191c1e] transition-colors">Akta Pendirian &amp; SK Kemenkumham</span>
                </li>
                <li className="flex items-center gap-3 group/item">
                  <svg className="w-5 h-5 shrink-0 text-[#0000ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="group-hover/item:text-[#191c1e] transition-colors">NPWP &amp; PKP</span>
                </li>
                <li className="flex items-center gap-3 group/item">
                  <svg className="w-5 h-5 shrink-0 text-[#0000ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="group-hover/item:text-[#191c1e] transition-colors">Sertifikat Badan Usaha (SBU)</span>
                </li>
              </ul>
            </div>
            <div className="rounded-2xl bg-white p-8 shadow-lg shadow-[#0B1528]/5 border border-[#e2e8f0] hover:shadow-xl hover:shadow-[#0B1528]/10 hover:-translate-y-1.5 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#343DFF]/10 to-[#0000FF]/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#0000ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                </div>
                <h3 className="text-[20px] font-semibold text-[#191c1e] font-[family-name:var(--font-heading)]">
                  {dict.tentang.antiBribery}
                </h3>
              </div>
              <p className="text-[#454558] text-[14px] leading-relaxed font-[family-name:var(--font-body)]">
                RRI berkomitmen penuh terhadap praktik bisnis anti-penyuapan dan kepatuhan terhadap
                regulasi yang berlaku. Kami menerapkan kebijakan nol toleransi terhadap korupsi,
                suap, dan gratifikasi dalam setiap aktivitas bisnis.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section ref={klienRef} className="py-16 bg-white overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 md:px-10">
          <div className="text-center mb-12">
            <h2 className="text-[32px] font-bold text-[#191c1e] mb-4 font-[family-name:var(--font-heading)]">
              {dict.klien.title}
            </h2>
            <p className="text-[#454558] text-[16px] max-w-2xl mx-auto font-[family-name:var(--font-body)]">
              {dict.klien.subtitle}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {clientLogos.map((logo, i) => (
              <div
                key={i}
                className={`h-28 rounded-2xl bg-gradient-to-br from-[#f8fafc] to-white border border-[#e2e8f0] shadow-md shadow-[#0B1528]/5 flex items-center justify-center p-2 hover:border-[#343DFF]/30 hover:shadow-lg hover:shadow-[#343DFF]/5 hover:scale-105 transition-all duration-300 ${klienVisible ? 'logo-placeholder' : 'opacity-0'}`}
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <img
                  src={logo.src}
                  alt={logo.alt}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section ref={timelineRef} className="relative py-20 bg-[#f7f9fb] overflow-hidden">
        <div className="absolute bottom-[20%] right-[-10%] w-[350px] h-[350px] rounded-full bg-[#343DFF]/5 blur-[100px] pointer-events-none" />
        <div className="relative max-w-[1280px] mx-auto px-5 sm:px-8 md:px-10">
          <div className="text-center mb-12">
            <h2 className="text-[32px] font-bold text-[#191c1e] mb-4 font-[family-name:var(--font-heading)]">
              Perjalanan Perusahaan
            </h2>
            <p className="text-[#454558] text-[16px] max-w-2xl mx-auto font-[family-name:var(--font-body)]">
              Tonggak penting dalam perjalanan RRI menjadi mitra industri terpercaya.
            </p>
          </div>
          <div className="relative">
            <div className="absolute left-[23px] md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#343DFF]/40 via-[#0000FF]/30 to-[#343DFF]/40 -translate-x-1/2" />
            {timeline.map((item, i) => (
              <div
                key={i}
                className={`relative flex flex-col md:flex-row items-start gap-6 pb-12 last:pb-0 ${timelineVisible ? 'reveal-visible' : 'reveal'}`}
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div className={`hidden md:flex w-1/2 ${i % 2 === 0 ? 'justify-end pr-10' : 'order-1 justify-start pl-10'}`}>
                  <div className={`${i % 2 === 0 ? 'text-right' : 'text-left'}`}>
                    <span className="text-[28px] font-bold text-[#343DFF] font-[family-name:var(--font-heading)]">
                      {item.year}
                    </span>
                  </div>
                </div>
                <div className="absolute left-0 md:left-1/2 top-0 w-[14px] h-[14px] rounded-full bg-[#343DFF] border-4 border-[#f7f9fb] shadow-md shadow-[#343DFF]/30 -translate-x-1/2 z-10 md:mt-1.5" />
                <div className="md:hidden pl-10">
                  <span className="text-[20px] font-bold text-[#343DFF] font-[family-name:var(--font-heading)]">
                    {item.year}
                  </span>
                </div>
                <div className={`rounded-2xl bg-white p-6 shadow-lg shadow-[#0B1528]/5 border border-[#e2e8f0] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ml-8 md:ml-0 md:w-1/2 ${i % 2 === 0 ? 'md:mr-auto' : 'md:ml-auto'}`}>
                  <h3 className="text-[16px] font-semibold text-[#191c1e] mb-2 font-[family-name:var(--font-heading)]">
                    {item.title}
                  </h3>
                  <p className="text-[#454558] text-[14px] leading-relaxed font-[family-name:var(--font-body)]">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-20 bg-[#0B1528] overflow-hidden">
        <div className="absolute inset-0 diagonal-grid opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1528]/80 to-transparent" />
        <div className="hero-circle top-[-10%] left-[10%] w-[500px] h-[500px] bg-[#343DFF]/15" />
        <div className="hero-circle bottom-[-10%] right-[5%] w-[400px] h-[400px] bg-[#0000FF]/10" />
        <div className="relative max-w-[1280px] mx-auto px-5 sm:px-8 md:px-10 text-center">
          <h2 className="text-[32px] md:text-[40px] font-bold text-white mb-4 font-[family-name:var(--font-heading)]">
            {dict.hero.title}
          </h2>
          <p className="text-[#94A3B8] text-[16px] md:text-[18px] max-w-2xl mx-auto mb-10 font-[family-name:var(--font-body)]">
            {dict.hero.subtitle}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/customer-register"
              className="inline-block px-10 py-4 bg-[#0000ff] text-white font-bold rounded-lg hover:bg-[#0001bb] hover:translate-y-[-2px] shadow-xl shadow-[#0000ff]/20 transition-all duration-300 font-[family-name:var(--font-body)]"
            >
              {dict.nav.daftar}
            </Link>
            <Link
              href="/katalog"
              className="inline-block px-10 py-4 border border-[#c5c4db]/30 text-white font-bold rounded-lg bg-white/5 backdrop-blur-md hover:bg-white/10 hover:translate-y-[-2px] transition-all duration-300 font-[family-name:var(--font-body)]"
            >
              {dict.nav.katalog}
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
