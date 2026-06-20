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
          {hakCipta}
        </p>
        <div className="flex items-center gap-4">
          <a
            href="#"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1E293B] text-[#94A3B8] transition-all duration-200 hover:bg-[#CA8A04] hover:text-white hover:shadow-lg hover:shadow-[#CA8A04]/20"
            aria-label="LinkedIn"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>
          <a
            href="mailto:info@pt-rri.com"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1E293B] text-[#94A3B8] transition-all duration-200 hover:bg-[#CA8A04] hover:text-white hover:shadow-lg hover:shadow-[#CA8A04]/20"
            aria-label="Email"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </a>
          <a
            href="#"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1E293B] text-[#94A3B8] transition-all duration-200 hover:bg-[#CA8A04] hover:text-white hover:shadow-lg hover:shadow-[#CA8A04]/20"
            aria-label="Instagram"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>
        </div>
      </div>

      <BackToTop />
    </>
  )
}
