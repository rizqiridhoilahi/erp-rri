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
      className="text-[12px] font-medium text-[#0B1528] hover:text-[#0000ff] transition-colors uppercase tracking-wider font-[family-name:var(--font-body)]"
      aria-label="Switch language"
    >
      {current === 'id' ? 'EN' : 'ID'}
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
