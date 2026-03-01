'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
  actions?: React.ReactNode
}

export function PageHeader({
  title,
  description,
  children,
  className,
  actions,
}: PageHeaderProps) {
  return (
    <div className={cn('mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between', className)}>
      <div className="flex-1">
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        {description && <p className="mt-1 text-gray-600">{description}</p>}
      </div>

      {/* Actions - usually buttons on the right */}
      {actions && <div className="flex gap-2 md:ml-4">{actions}</div>}

      {children}
    </div>
  )
}
