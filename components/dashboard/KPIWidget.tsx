'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface KPIWidgetProps {
  title: string
  value: string | number
  change?: number
  icon: React.ReactNode
  loading?: boolean
  description?: string
}

export function KPIWidget({
  title,
  value,
  change = 0,
  icon,
  loading = false,
  description,
}: KPIWidgetProps) {
  const isPositive = change >= 0

  if (loading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="space-y-4">
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
          <div className="h-8 w-32 bg-gray-200 rounded"></div>
          <div className="h-4 w-16 bg-gray-100 rounded"></div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          
          {change !== undefined && change !== 0 && (
            <div className={`mt-2 flex items-center gap-1 text-sm font-semibold ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {isPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span>{isPositive ? '+' : ''}{change}%</span>
            </div>
          )}
          
          {description && (
            <p className="mt-2 text-xs text-gray-500">{description}</p>
          )}
        </div>
        
        <div className="rounded-lg bg-blue-50 p-3 text-blue-600 flex-shrink-0">
          {icon}
        </div>
      </div>
    </Card>
  )
}
