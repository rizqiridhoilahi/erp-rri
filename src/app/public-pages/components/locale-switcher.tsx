'use client'

import { Suspense, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'

function LocaleSwitcherInner() {
  const searchParams = useSearchParams()
  const current = searchParams.get('lang') ?? 'id'

  const toggleLang = useCallback(() => {
    const next = current === 'id' ? 'en' : 'id'
    const params = new URLSearchParams(searchParams.toString())
    params.set('lang', next)
    window.location.search = params.toString()
  }, [current, searchParams])

  return (
    <button
      onClick={toggleLang}
      className="flex items-center gap-1.5 text-[12px] font-semibold text-[#0000ff] hover:opacity-70 transition-opacity uppercase tracking-wider font-[family-name:var(--font-heading)]"
      aria-label="Switch language"
    >
      {current === 'id' ? (
        <>
          <svg className="w-5 h-5 rounded-sm" viewBox="0 0 6 4" xmlns="http://www.w3.org/2000/svg">
            <rect width="6" height="4" fill="#fff" />
            <rect width="6" height="2" fill="#e30a17" />
          </svg>
          <span>ID</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5 rounded-sm" viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg">
            <clipPath id="uk-flag"><path d="M0 0v30h60V0z" /></clipPath>
            <g clipPath="url(#uk-flag)">
              <path d="M0 0v30h60V0z" fill="#012169" />
              <path d="M0 0l60 30m0-30L0 30" stroke="#fff" strokeWidth="6" />
              <path d="M0 0l60 30m0-30L0 30" clipPath="url(#uk-flag)" stroke="#c8102e" strokeWidth="4" />
              <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10" />
              <path d="M30 0v30M0 15h60" stroke="#c8102e" strokeWidth="6" />
            </g>
          </svg>
          <span>EN</span>
        </>
      )}
    </button>
  )
}

export function LocaleSwitcher() {
  return (
    <Suspense fallback={null}>
      <LocaleSwitcherInner />
    </Suspense>
  )
}
