'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'erp_rri_theme'

type ThemeContext = {
  theme: Theme
  toggleTheme: () => void
}

const Ctx = createContext<ThemeContext>({ theme: 'light', toggleTheme: () => {} })

export const useTheme = () => useContext(Ctx)

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
  if (stored === 'dark' || stored === 'light') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light'
      localStorage.setItem(STORAGE_KEY, next)
      document.documentElement.classList.toggle('dark', next === 'dark')
      return next
    })
  }, [])

  return (
    <Ctx.Provider value={{ theme, toggleTheme }}>
      {children}
    </Ctx.Provider>
  )
}
