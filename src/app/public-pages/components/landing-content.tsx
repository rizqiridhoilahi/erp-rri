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

export function LandingContent() {
  const searchParams = useSearchParams()
  const lang = searchParams.get('lang') ?? 'id'
  const dict = getDictionary(lang)

  const [statsRef, statsInView] = useInView()
  const [layananRef, layananVisible] = useInView()
  const [keunggulanRef, keunggulanVisible] = useInView()
  const [klienRef, klienVisible] = useInView()
  const [testimonialRef, testimonialVisible] = useInView()

  const stats = [
    { value: 32, suffix: '+', label: dict.stats.proyekSelesai, icon: 'check-circle' },
    { value: 3, suffix: '+', label: dict.stats.klienUtama, icon: 'users' },
    { value: 50, suffix: '+', label: dict.stats.mitraSupplier, icon: 'globe' },
    { value: 14, suffix: '+', label: dict.stats.tahunPengalaman, icon: 'calendar' },
  ]

  const services = [
    {
      icon: 'sparkles',
      title: dict.layanan.industrialCleaning.title,
      desc: dict.layanan.industrialCleaning.desc,
      href: '/layanan',
    },
    {
      icon: 'package',
      title: dict.layanan.bulkSupply.title,
      desc: dict.layanan.bulkSupply.desc,
      href: '/layanan',
    },
    {
      icon: 'wrench',
      title: dict.layanan.spareParts.title,
      desc: dict.layanan.spareParts.desc,
      href: '/layanan',
    },
  ]

  const keunggulan = [
    { icon: 'shield-check', title: dict.keunggulan.kualitas.title, desc: dict.keunggulan.kualitas.desc },
    { icon: 'clock', title: dict.keunggulan.tepatWaktu.title, desc: dict.keunggulan.tepatWaktu.desc },
    { icon: 'globe', title: dict.keunggulan.jaringan.title, desc: dict.keunggulan.jaringan.desc },
    { icon: 'award', title: dict.keunggulan.pengalaman.title, desc: dict.keunggulan.pengalaman.desc },
  ]

  return (
    <>
      <section className="relative min-h-screen flex items-center overflow-hidden bg-[#0B1528]">
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            preload="auto"
          >
            <source src="/video/hero-industrial.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 diagonal-grid">
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B1528]/80 via-[#0B1528]/40 to-[#0B1528]/60" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1528]/80 via-transparent to-[#0B1528]/40" />
            <div className="hero-circle top-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#343DFF]" />
            <div className="hero-circle bottom-[10%] right-[-5%] w-[400px] h-[400px] bg-[#0000FF]" />
            <div className="hero-circle top-[40%] right-[20%] w-[300px] h-[300px] bg-[#343DFF]" />
          </div>
        </div>
        <div className="relative z-10 max-w-[1280px] mx-auto px-[40px] w-full pt-32 pb-20">
          <div className="max-w-3xl space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#343dff]/20 border border-[#343dff]/30 backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-[#343dff] animate-pulse" />
              <span className="text-[#bec2ff] text-[12px] tracking-widest uppercase font-[family-name:var(--font-body)]">
                {dict.hero.tagline}
              </span>
            </div>
            <h1 className="text-[40px] md:text-[56px] font-bold text-white leading-tight font-[family-name:var(--font-heading)]">
              {dict.hero.title}
            </h1>
            <p className="text-[18px] text-[#b9c8de] max-w-2xl leading-relaxed font-[family-name:var(--font-body)]">
              {dict.hero.subtitle}
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href="/katalog"
                className="px-8 py-4 bg-[#0001bb] text-white font-bold rounded-lg shadow-xl shadow-[#0001bb]/20 hover:translate-y-[-2px] hover:shadow-[#0001bb]/30 transition-all duration-300 font-[family-name:var(--font-body)]"
              >
                {dict.hero.ctaStart}
              </Link>
              <Link
                href="/layanan"
                className="px-8 py-4 border border-[#c5c4db]/30 text-white font-bold rounded-lg bg-white/5 backdrop-blur-md hover:bg-white/10 hover:translate-y-[-2px] transition-all duration-300 font-[family-name:var(--font-body)]"
              >
                {dict.hero.ctaSolutions}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section ref={statsRef} className="relative z-20 -mt-16 max-w-[1280px] mx-auto px-[40px]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gradient-to-r from-[#343DFF]/30 via-[#0000FF]/20 to-[#343DFF]/30 rounded-xl overflow-hidden shadow-2xl shadow-[#0B1528]/30">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col items-center text-center space-y-3 bg-[#0B1528]/60 backdrop-blur-xl p-8">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#343DFF] to-[#0000FF] flex items-center justify-center">
                <svg className={`w-5 h-5 text-white ${statsInView ? 'stat-visible' : ''}`} style={{ animationDelay: `${i * 100}ms` }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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

      <section ref={layananRef} className="relative py-24 bg-[#f7f9fb] overflow-hidden">
        <div className="absolute inset-0 diagonal-grid opacity-[0.03]" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#343DFF]/5 to-[#0000FF]/5 blur-3xl" />
        <div className="relative max-w-[1280px] mx-auto px-[40px]">
          <div className="text-center mb-16">
            <h2 className="text-[32px] font-bold text-[#191c1e] mb-4 font-[family-name:var(--font-heading)]">
              {dict.layanan.title}
            </h2>
            <p className="text-[#454558] text-[16px] max-w-2xl mx-auto font-[family-name:var(--font-body)]">
              {dict.layanan.subtitle}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, i) => (
              <Link
                key={i}
                href={service.href}
                className={`rounded-2xl bg-white p-8 shadow-lg shadow-[#0B1528]/5 hover:shadow-xl hover:shadow-[#0B1528]/10 hover:-translate-y-1.5 border border-[#e2e8f0] transition-all duration-300 cursor-pointer group block ${layananVisible ? 'reveal-visible' : 'reveal'}`}
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#343DFF]/10 to-[#0000FF]/10 flex items-center justify-center mb-5 group-hover:from-[#343DFF]/20 group-hover:to-[#0000FF]/20 transition-all duration-300">
                  <svg className="w-7 h-7 text-[#0000ff] group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    {service.icon === 'sparkles' && <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />}
                    {service.icon === 'package' && <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />}
                    {service.icon === 'wrench' && <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-7.138 7.138a2.016 2.016 0 01-2.852 0 2.016 2.016 0 010-2.852l7.138-7.138m2.852-2.852l7.138-7.138a2.016 2.016 0 012.852 0 2.016 2.016 0 010 2.852l-7.138 7.138M12 12l3.5-3.5" />}
                  </svg>
                </div>
                <h3 className="text-[20px] font-semibold text-[#191c1e] mb-3 font-[family-name:var(--font-heading)] group-hover:text-[#0000ff] transition-colors duration-300">
                  {service.title}
                </h3>
                <p className="text-[#454558] text-[14px] leading-relaxed font-[family-name:var(--font-body)]">
                  {service.desc}
                </p>
                <div className="flex items-center gap-2 mt-4 text-[#0000ff] text-[14px] font-semibold font-[family-name:var(--font-body)] group-hover:gap-3 transition-all duration-300">
                  <span>{dict.nav.layanan}</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section ref={keunggulanRef} className="relative py-24 bg-[#0B1528] overflow-hidden">
        <div className="absolute inset-0 diagonal-grid opacity-30" />
        <div className="hero-circle top-[20%] left-[10%] w-[400px] h-[400px] bg-[#343DFF]/20" />
        <div className="hero-circle bottom-[10%] right-[5%] w-[300px] h-[300px] bg-[#0000FF]/15" />
        <div className="relative max-w-[1280px] mx-auto px-[40px]">
          <div className="text-center mb-16">
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
                className={`rounded-xl p-6 bg-white/5 backdrop-blur-sm border border-white/10 border-t-2 border-t-[#343DFF] hover:bg-white/10 hover:border-t-[#0000FF] hover:shadow-lg hover:shadow-[#343DFF]/10 transition-all duration-300 cursor-pointer ${keunggulanVisible ? 'reveal-visible' : 'reveal'}`}
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

      <section ref={klienRef} className="py-24 bg-white">
        <div className="max-w-[1280px] mx-auto px-[40px]">
          <div className="text-center mb-16">
            <h2 className="text-[32px] font-bold text-[#191c1e] mb-4 font-[family-name:var(--font-heading)]">
              {dict.klien.title}
            </h2>
            <p className="text-[#454558] text-[16px] max-w-2xl mx-auto font-[family-name:var(--font-body)]">
              {dict.klien.subtitle}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {[
              { src: '/image/client/BJP.png', alt: 'BJP' },
              { src: '/image/client/BJS.png', alt: 'BJS' },
              { src: '/image/client/MKP.png', alt: 'MKP' },
              { src: '/image/client/kpjb.png', alt: 'KPJB' },
              { src: '/image/client/EGT.png', alt: 'EGT' },
            ].map((logo, i) => (
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

      <section ref={testimonialRef} className="py-24 bg-[#f7f9fb]">
        <div className="max-w-[1280px] mx-auto px-[40px]">
          <div className="text-center mb-16">
            <h2 className="text-[32px] font-bold text-[#191c1e] mb-4 font-[family-name:var(--font-heading)]">
              {dict.testimonial.title}
            </h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-8">
            {dict.testimonial.items.map((item, i) => (
              <div
                key={i}
                className={`relative ${testimonialVisible ? 'reveal-visible' : 'reveal'}`}
              >
                <div className="absolute -top-3 -left-3 text-[#343DFF]/10 z-10">
                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
                  </svg>
                </div>
                <div className="relative bg-white rounded-2xl p-8 border border-[#e2e8f0] shadow-lg shadow-[#0B1528]/5 border-l-4 border-l-[#343DFF]">
                  <p className="text-[#454558] text-[16px] leading-relaxed italic mb-6 font-[family-name:var(--font-body)]">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#343DFF] to-[#0000FF] flex items-center justify-center text-white font-bold text-[16px] ring-2 ring-[#343DFF]/20 font-[family-name:var(--font-heading)]">
                      {item.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[#191c1e] font-semibold text-[14px] font-[family-name:var(--font-heading)]">
                        {item.name}
                      </p>
                      <p className="text-[#64748B] text-[13px] font-[family-name:var(--font-body)]">
                        {item.role}
                      </p>
                    </div>
                    <div className="ml-auto flex gap-1">
                      {[...Array(5)].map((_, s) => (
                        <svg key={s} className="w-5 h-5 text-[#F59E0B]" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#0B1528] relative overflow-hidden">
        <div className="absolute inset-0 diagonal-grid opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1528]/80 to-transparent" />
        <div className="hero-circle top-[-10%] left-[10%] w-[500px] h-[500px] bg-[#343DFF]/15" />
        <div className="hero-circle bottom-[-10%] right-[5%] w-[400px] h-[400px] bg-[#0000FF]/10" />
        <div className="relative max-w-[1280px] mx-auto px-[40px] text-center">
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
