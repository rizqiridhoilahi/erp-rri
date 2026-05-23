"use client"

import { ReactNode } from 'react'
import { ErrorBoundary as ErrorBoundaryComponent } from '@/components/error-boundary'

export function ErrorBoundaryProvider({ children }: { children: ReactNode }) {
  return <ErrorBoundaryComponent>{children}</ErrorBoundaryComponent>
}