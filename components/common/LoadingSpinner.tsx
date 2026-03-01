'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  label?: string
  fullPage?: boolean
  className?: string
}

export function LoadingSpinner({
  size = 'md',
  label = 'Loading...',
  fullPage = false,
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
  }

  const spinner = (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      {/* Spinner */}
      <div className={cn('relative', sizeClasses[size])}>
        <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-blue-600 animate-spin" />
      </div>

      {/* Label */}
      {label && <p className="mt-4 text-sm text-gray-600">{label}</p>}
    </div>
  )

  if (fullPage) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        {spinner}
      </div>
    )
  }

  return spinner
}
