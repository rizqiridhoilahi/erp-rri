'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { getDictionary } from '@/lib/i18n'

export default function PublicNotFound() {
  const searchParams = useSearchParams()
  const lang = searchParams.get('lang') ?? 'id'
  const dict = getDictionary(lang)

  return (
    <main className="min-h-screen bg-[#0B1528] flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="hero-circle top-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#343DFF]" />
        <div className="hero-circle bottom-[10%] right-[-5%] w-[400px] h-[400px] bg-[#0000FF]" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center px-6"
      >
        <motion.h1
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-[120px] md:text-[180px] font-bold text-[#0000FF] leading-none font-[family-name:var(--font-heading)]"
        >
          404
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="text-[#94A3B8] text-[18px] md:text-[20px] max-w-md mx-auto mb-8 font-[family-name:var(--font-body)]"
        >
          {dict.notFound.description}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          whileHover={{ y: -2 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#0000ff] text-white font-bold rounded-lg shadow-xl shadow-[#0000ff]/20 font-[family-name:var(--font-body)] transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            {dict.notFound.cta}
          </Link>
        </motion.div>
      </motion.div>
    </main>
  )
}
