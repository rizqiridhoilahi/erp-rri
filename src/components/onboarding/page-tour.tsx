"use client"

import { useState, useCallback, useEffect, useMemo, type ReactNode } from 'react'
import dynamic from 'next/dynamic'
import type { Step, EventHandler } from 'react-joyride'
import { HelpCircle } from 'lucide-react'

const Joyride = dynamic(() => import('react-joyride').then(m => ({ default: m.Joyride })), { ssr: false })

interface PageTourProps {
  pageKey: string
  steps: Step[]
  autoShow?: boolean
  children?: ReactNode
}

function getCSSVar(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
}

export function PageTour({ pageKey, steps, autoShow = true, children }: PageTourProps) {
  const [run, setRun] = useState(false)

  useEffect(() => {
    if (autoShow && typeof window !== 'undefined') {
      const done = localStorage.getItem(`tour_${pageKey}_done`)
      if (done !== 'true') {
        const timer = setTimeout(() => setRun(true), 600)
        return () => clearTimeout(timer)
      }
    }
  }, [autoShow, pageKey])

  const colors = useMemo(() => {
    const primary = getCSSVar('--primary', '#0000FF')
    const primaryForeground = getCSSVar('--primary-foreground', '#FFFFFF')
    return { primary, primaryForeground }
  }, [run])

  const handleEvent = useCallback<EventHandler>((data) => {
    if (data.status === 'finished' || data.status === 'skipped') {
      setRun(false)
      localStorage.setItem(`tour_${pageKey}_done`, 'true')
    }
  }, [pageKey])

  const start = () => setRun(true)

  return (
    <>
      <Joyride
        steps={steps}
        run={run}
        continuous
        onEvent={handleEvent}
        options={{
          showProgress: true,
          buttons: ['back', 'primary', 'skip'],
          spotlightPadding: 8,
          backgroundColor: colors.primary,
          textColor: colors.primaryForeground,
          primaryColor: colors.primary,
          arrowColor: colors.primary,
          overlayColor: 'rgba(0,0,0,0.5)',
        }}
        locale={{
          back: 'Kembali',
          last: 'Selesai',
          next: 'Lanjut',
          skip: 'Lewati',
        }}
        styles={{
          buttonPrimary: {
            backgroundColor: colors.primaryForeground,
            color: colors.primary,
            borderRadius: '8px',
            fontSize: '14px',
            padding: '8px 16px',
          },
          buttonBack: {
            color: colors.primaryForeground,
            fontSize: '14px',
            opacity: 0.85,
          },
          buttonSkip: {
            color: colors.primaryForeground,
            fontSize: '14px',
            opacity: 0.85,
          },
          tooltipContainer: { textAlign: 'left' },
          tooltip: {
            borderRadius: '12px',
            padding: '20px',
          },
          tooltipContent: {
            fontSize: '14px',
            lineHeight: '1.6',
          },
          tooltipTitle: {
            fontSize: '18px',
            fontWeight: 600,
          },
        }}
      />
      {children ? (
        <span onClick={start}>{children}</span>
      ) : (
        <button
          onClick={start}
          className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-input bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          title="Panduan Halaman"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      )}
    </>
  )
}
