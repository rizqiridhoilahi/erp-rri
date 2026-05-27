"use client"

import { Moon, Sun } from 'lucide-react'
import { useTheme } from './theme-provider'

export function DarkModeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
      title={theme === 'light' ? 'Mode Gelap' : 'Mode Terang'}
    >
      {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      {theme === 'light' ? 'Mode Gelap' : 'Mode Terang'}
    </button>
  )
}
