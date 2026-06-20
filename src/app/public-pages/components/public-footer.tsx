import { supabaseAdmin } from '@/lib/api/supabase-server'
import { getDictionary } from '@/lib/i18n'
import { FooterClient } from './footer-client'

const CONTACT_KEYS = ['company_alamat', 'company_email', 'company_no_hp'] as const

export async function PublicFooter() {
  const dict = getDictionary('id')

  const { data } = await supabaseAdmin
    .from('site_settings')
    .select('key, value')
    .in('key', CONTACT_KEYS)

  const settings = new Map((data ?? []).map(r => [r.key, r.value]))
  const alamat = settings.get('company_alamat') || dict.footer.alamat
  const email = settings.get('company_email') || 'info@pt-rri.com'
  const noHp = settings.get('company_no_hp') || '+62 812 607 5500'

  return (
    <footer className="relative bg-gradient-to-b from-[#0F172A] via-[#0B1528] to-[#020617] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#CA8A04]/3 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-[400px] w-[400px] rounded-full bg-[#3B82F6]/3 blur-[100px]" />
      </div>
      <div className="relative mx-auto max-w-[1280px] px-5 py-14 sm:px-8 md:px-10 lg:py-16">
        <FooterClient
          alamat={alamat}
          email={email}
          noHp={noHp}
          hakCipta={dict.footer.hakCipta}
        />
      </div>
    </footer>
  )
}
