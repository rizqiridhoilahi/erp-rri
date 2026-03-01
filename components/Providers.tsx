'use client'

import React, { ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { getQueryClient } from '@/lib/query-client'

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-right"
        richColors
        theme="light"
        closeButton
        expand={false}
      />
    </QueryClientProvider>
  )
}
