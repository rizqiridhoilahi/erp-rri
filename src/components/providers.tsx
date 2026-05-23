"use client"

import { ReactNode } from 'react'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/lib/hooks/use-auth'
import { TooltipProvider } from '@/components/ui/tooltip'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <TooltipProvider delayDuration={300}>
        {children}
      </TooltipProvider>
      <Toaster position="top-right" richColors closeButton />
    </AuthProvider>
  )
}