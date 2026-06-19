import { getDictionary } from '@/lib/i18n'

export function PublicFooter() {
  const dict = getDictionary('id')

  return (
    <footer className="bg-[#0B1528] text-white">
      <div className="max-w-[1280px] mx-auto px-[40px] py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h3 className="text-[20px] font-bold mb-4 font-[family-name:var(--font-heading)]">RRI</h3>
            <p className="text-[14px] text-[#94A3B8] leading-relaxed font-[family-name:var(--font-body)]">
              {dict.hero.subtitle}
            </p>
          </div>
          <div>
            <h4 className="text-[16px] font-semibold mb-4 font-[family-name:var(--font-heading)]">{dict.nav.tentangKami}</h4>
            <ul className="space-y-2 text-[14px] text-[#94A3B8] font-[family-name:var(--font-body)]">
              <li><a href="/tentang-kami" className="hover:text-white transition-colors">{dict.tentang.profil}</a></li>
              <li><a href="/tentang-kami" className="hover:text-white transition-colors">{dict.tentang.legalitas}</a></li>
              <li><a href="/layanan" className="hover:text-white transition-colors">{dict.nav.layanan}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[16px] font-semibold mb-4 font-[family-name:var(--font-heading)]">{dict.nav.kontak}</h4>
            <ul className="space-y-2 text-[14px] text-[#94A3B8] font-[family-name:var(--font-body)]">
              <li>{dict.footer.alamat}</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-[#ffffff]/10 text-center text-[12px] text-[#94A3B8] font-[family-name:var(--font-body)]">
          {dict.footer.hakCipta}
        </div>
      </div>
    </footer>
  )
}
