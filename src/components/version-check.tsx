"use client"
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

export function VersionCheck() {
  const baselineRef = useRef<string | null>(null)
  const notifiedRef = useRef(false)

  useEffect(() => {
    let mounted = true

    const check = async () => {
      try {
        const res = await fetch('/api/v1/system/version')
        if (!res.ok) return
        const json = await res.json()
        const version: string = json.data?.version
        if (!version) return

        if (baselineRef.current === null) {
          baselineRef.current = version
          return
        }

        if (version === baselineRef.current) return
        if (notifiedRef.current) return

        notifiedRef.current = true
        const isWin = navigator.platform.includes('Win')
        const shortcut = isWin ? 'Ctrl+Shift+R' : 'Cmd+Shift+R'

        if (!mounted) return

        toast.info('Versi Baru Tersedia!', {
          description: `Aplikasi telah diperbarui ke v${version}. Tekan ${shortcut} atau klik tombol di bawah untuk refresh.`,
          action: {
            label: '↻ Refresh Sekarang',
            onClick: () => window.location.reload(),
          },
          duration: 15000,
        })
      } catch {
        // ignore
      }
    }

    check()
    const interval = setInterval(check, 60000)
    return () => { mounted = false; clearInterval(interval) }
  }, [])

  return null
}
