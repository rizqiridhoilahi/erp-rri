'use client'

import { useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'

function getPathPrefix(pathname: string): string | null {
  const parts = pathname.split('/')
  const tambahIndex = parts.indexOf('tambah')
  if (tambahIndex >= 0) return null
  const listPath = parts.slice(0, parts.length - (parts[parts.length - 1] === 'edit' ? 2 : parts[parts.length - 1] === '' ? 1 : 0)).join('/')
  return `${listPath}/tambah`
}

export function KeyboardShortcuts() {
  const router = useRouter()
  const pathname = usePathname()
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable

    if (e.key === '/' && !isInput && !e.ctrlKey && !e.metaKey) {
      e.preventDefault()
      const search = document.querySelector<HTMLInputElement>('[data-search-input]')
      if (search) {
        search.focus()
        search.closest<HTMLDivElement>('[data-search-trigger]')?.click()
      }
      return
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault()
      const link = document.querySelector<HTMLAnchorElement>('a[href$="/tambah"]')
      if (link) { link.click(); return }
      const prefix = getPathPrefix(pathname)
      if (prefix) router.push(prefix)
      return
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      if (isInput || target.tagName === 'FORM') {
        e.preventDefault()
        const form = target.closest('form')
        form?.requestSubmit()
      }
      return
    }

    if (e.key === '?' && !isInput) {
      e.preventDefault()
    }
  }, [router, pathname])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return null
}
