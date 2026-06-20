import { getDictionary } from '@/lib/i18n'

export function PublicFooter() {
  const dict = getDictionary('id')

  return (
    <footer className="bg-[#0B1528] text-white">
      <div className="max-w-[1280px] mx-auto px-[40px] py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-[20px] font-bold font-[family-name:var(--font-heading)]">RRI</h3>
            <p className="text-[14px] text-[#94A3B8] leading-relaxed font-[family-name:var(--font-body)]">
              {dict.hero.subtitle}
            </p>
          </div>
          <div>
            <h4 className="text-[16px] font-semibold mb-4 font-[family-name:var(--font-heading)]">{dict.nav.layanan}</h4>
            <ul className="space-y-2 text-[14px] text-[#94A3B8] font-[family-name:var(--font-body)]">
              <li><a href="/layanan" className="hover:text-white transition-colors duration-200">{dict.layanan.industrialCleaning.title}</a></li>
              <li><a href="/layanan" className="hover:text-white transition-colors duration-200">{dict.layanan.bulkSupply.title}</a></li>
              <li><a href="/layanan" className="hover:text-white transition-colors duration-200">{dict.layanan.spareParts.title}</a></li>
              <li><a href="/katalog" className="hover:text-white transition-colors duration-200">{dict.nav.katalog}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[16px] font-semibold mb-4 font-[family-name:var(--font-heading)]">{dict.nav.tentangKami}</h4>
            <ul className="space-y-2 text-[14px] text-[#94A3B8] font-[family-name:var(--font-body)]">
              <li><a href="/tentang-kami" className="hover:text-white transition-colors duration-200">{dict.tentang.profil}</a></li>
              <li><a href="/tentang-kami" className="hover:text-white transition-colors duration-200">{dict.tentang.legalitas}</a></li>
              <li><a href="/tentang-kami" className="hover:text-white transition-colors duration-200">{dict.tentang.antiBribery}</a></li>
              <li><a href="/tentang-kami" className="hover:text-white transition-colors duration-200">{dict.tentang.k3}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[16px] font-semibold mb-4 font-[family-name:var(--font-heading)]">{dict.nav.kontak}</h4>
            <ul className="space-y-3 text-[14px] text-[#94A3B8] font-[family-name:var(--font-body)]">
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 shrink-0 text-[#343DFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{dict.footer.alamat}</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0 text-[#343DFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>info@pt-rri.com</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[12px] text-[#94A3B8] font-[family-name:var(--font-body)]">
            {dict.footer.hakCipta}
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-[#94A3B8] hover:text-white transition-colors duration-200" aria-label="LinkedIn">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
            <a href="#" className="text-[#94A3B8] hover:text-white transition-colors duration-200" aria-label="Email">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
