"use client"
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? '0.0.0'
const LS_KEY = 'erp_rri_version_notified'

export function VersionCheck() {
  const notifiedRef = useRef(localStorage.getItem(LS_KEY) === APP_VERSION)

  useEffect(() => {
    let mounted = true

    const check = async () => {
      try {
        const res = await fetch('/api/v1/system/version')
        if (!res.ok) return
        const json = await res.json()
        const serverVersion: string = json.data?.version

        if (!serverVersion || serverVersion === APP_VERSION) return
        if (notifiedRef.current) return

        const isWin = navigator.platform.includes('Win')
        const shortcut = isWin ? 'Ctrl+Shift+R' : 'Cmd+Shift+R'

        notifiedRef.current = true
        localStorage.setItem(LS_KEY, APP_VERSION)

        if (!mounted) return

        toast.info('Versi Baru Tersedia!', {
          description: `Aplikasi telah diperbarui ke v${serverVersion}. Tekan ${shortcut} atau klik tombol di bawah untuk refresh.`,
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
