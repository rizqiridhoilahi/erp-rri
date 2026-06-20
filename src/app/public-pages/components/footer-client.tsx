'use client'

import { useState, useEffect } from 'react'

const CLIENT_LOGOS = [
  { src: '/image/client/BJP.png', alt: 'BJP' },
  { src: '/image/client/BJS.png', alt: 'BJS' },
  { src: '/image/client/MKP.png', alt: 'MKP' },
  { src: '/image/client/kpjb.png', alt: 'KPJB' },
  { src: '/image/client/EGT.png', alt: 'EGT' },
]

function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 1200)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-[#CA8A04] text-white shadow-lg shadow-[#CA8A04]/25 transition-all duration-300 hover:bg-[#B45309] hover:shadow-xl hover:shadow-[#CA8A04]/40 ${visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'}`}
      aria-label="Kembali ke atas"
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
    </button>
  )
}

function AccordionSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="md:block">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-left md:cursor-default md:pointer-events-none"
      >
        <h4 className="relative inline-block text-[13px] font-semibold uppercase tracking-[0.08em] text-[#F1F5F9] font-[family-name:var(--font-heading)] after:block after:h-[2px] after:w-6 after:bg-[#CA8A04] after:mt-1.5">
          {title}
        </h4>
        <svg
          className={`h-4 w-4 text-[#94A3B8] transition-transform duration-200 md:hidden ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className={`mt-4 overflow-hidden transition-all duration-300 ${open ? 'max-h-96 opacity-100' : 'max-h-0 md:max-h-96 md:opacity-100'}`}>
        {children}
      </div>
    </div>
  )
}

interface FooterClientProps {
  alamat: string
  email: string
  noHp: string
  hakCipta: string
}

export function FooterClient({ alamat, email, noHp, hakCipta }: FooterClientProps) {
  const [emailValue, setEmailValue] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (emailValue) {
      setSubscribed(true)
      setEmailValue('')
      setTimeout(() => setSubscribed(false), 3000)
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-8">
        <div className="space-y-4 md:col-span-4">
          <h3 className="text-[20px] font-bold text-white font-[family-name:var(--font-heading)]">
            PT. Rizqi Ridho Ilahi
          </h3>
          <p className="text-[13px] leading-relaxed text-[#94A3B8] font-[family-name:var(--font-body)]">
            Perusahaan penyedia solusi industrial cleaning, bulk supply bahan kimia, dan spare part terpercaya untuk berbagai sektor industri di Indonesia.
          </p>
          <div className="pt-2">
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="email"
                  value={emailValue}
                  onChange={e => setEmailValue(e.target.value)}
                  placeholder="Langganan newsletter..."
                  className="w-full rounded-lg border border-[#1E293B] bg-[#0F172A]/60 px-3 py-2 text-[12px] text-[#F1F5F9] placeholder-[#475569] outline-none transition-all duration-200 focus:border-[#CA8A04]/50 focus:ring-1 focus:ring-[#CA8A04]/30 font-[family-name:var(--font-body)]"
                  required
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-gradient-to-r from-[#CA8A04] to-[#B45309] px-3.5 py-2 text-[12px] font-semibold text-white transition-all duration-200 hover:from-[#B45309] hover:to-[#92400E] hover:shadow-lg hover:shadow-[#CA8A04]/25 font-[family-name:var(--font-body)]"
              >
                {subscribed ? '✓' : 'Kirim'}
              </button>
            </form>
            {subscribed && (
              <p className="mt-1.5 text-[11px] text-[#22C55E] font-[family-name:var(--font-body)]">
                ✓ Berhasil berlangganan newsletter
              </p>
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          <AccordionSection title="Layanan" defaultOpen>
            <ul className="space-y-2.5">
              {[
                { href: '/layanan', label: 'Industrial Cleaning' },
                { href: '/layanan', label: 'Bulk Supply' },
                { href: '/layanan', label: 'Spare Parts' },
                { href: '/katalog', label: 'Katalog Produk' },
              ].map(item => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="group inline-flex items-center gap-1.5 text-[13px] text-[#94A3B8] transition-all duration-200 hover:text-[#CA8A04] font-[family-name:var(--font-body)]"
                  >
                    <span className="h-0 w-0 border-t-[3px] border-r-[3px] border-b-[3px] border-l-transparent border-r-transparent border-t-[#CA8A04] opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:mr-0.5" />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </AccordionSection>
        </div>

        <div className="md:col-span-2">
          <AccordionSection title="Perusahaan" defaultOpen>
            <ul className="space-y-2.5">
              {[
                { href: '/tentang-kami', label: 'Profil Perusahaan' },
                { href: '/tentang-kami', label: 'Legalitas' },
                { href: '/tentang-kami', label: 'Anti Bribery' },
                { href: '/tentang-kami', label: 'K3 & Lingkungan' },
              ].map(item => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="group inline-flex items-center gap-1.5 text-[13px] text-[#94A3B8] transition-all duration-200 hover:text-[#CA8A04] font-[family-name:var(--font-body)]"
                  >
                    <span className="h-0 w-0 border-t-[3px] border-r-[3px] border-b-[3px] border-l-transparent border-r-transparent border-t-[#CA8A04] opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:mr-0.5" />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </AccordionSection>
        </div>

        <div className="md:col-span-4">
          <AccordionSection title="Kontak" defaultOpen>
            <ul className="space-y-3.5">
              <li className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#CA8A04]/10">
                  <svg className="h-3.5 w-3.5 text-[#CA8A04]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-[13px] leading-relaxed text-[#94A3B8] font-[family-name:var(--font-body)]">{alamat}</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#CA8A04]/10">
                  <svg className="h-3.5 w-3.5 text-[#CA8A04]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <a href={`mailto:${email}`} className="text-[13px] text-[#94A3B8] transition-colors duration-200 hover:text-[#CA8A04] font-[family-name:var(--font-body)]">{email}</a>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#CA8A04]/10">
                  <svg className="h-3.5 w-3.5 text-[#CA8A04]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <a href={`tel:${noHp.replace(/\s/g, '')}`} className="text-[13px] text-[#94A3B8] transition-colors duration-200 hover:text-[#CA8A04] font-[family-name:var(--font-body)]">{noHp}</a>
              </li>
            </ul>
          </AccordionSection>
        </div>
      </div>

      <div className="mt-12 border-t border-[#1E293B] pt-10">
        <p className="mb-6 text-center text-[12px] font-medium uppercase tracking-[0.06em] text-[#64748B] font-[family-name:var(--font-body)]">
          Mitra & Klien Kami
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {CLIENT_LOGOS.map(logo => (
            <div
              key={logo.alt}
              className="group relative"
            >
              <img
                src={logo.src}
                alt={logo.alt}
                className="h-10 w-auto object-contain opacity-40 grayscale transition-all duration-500 group-hover:opacity-100 group-hover:grayscale-0"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-[#1E293B] pt-6 md:flex-row">
        <p className="text-[11px] text-[#64748B] font-[family-name:var(--font-body)]">
          {hakCipta.replace('2024', String(new Date().getFullYear()))}
        </p>
      </div>

      <BackToTop />
    </>
  )
}
