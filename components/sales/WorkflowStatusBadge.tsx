'use client'

import { Badge } from '@/components/ui/badge'
import { Check, Clock, AlertCircle, X, Truck, Package } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WorkflowStatusBadgeProps {
  status: string
  variant?: 'quotation' | 'sales-order' | 'delivery-order'
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  className?: string
}

// Status configurations for different workflows
const QUOTATION_STATUSES = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: Clock },
  sent: { label: 'Dikirim', color: 'bg-blue-100 text-blue-800', icon: Package },
  accepted: { label: 'Diterima', color: 'bg-green-100 text-green-800', icon: Check },
  rejected: { label: 'Ditolak', color: 'bg-red-100 text-red-800', icon: X },
  expired: { label: 'Expired', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
}

const SALES_ORDER_STATUSES = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: Clock },
  confirmed: { label: 'Dikonfirmasi', color: 'bg-blue-100 text-blue-800', icon: Check },
  'in-production': {
    label: 'Produksi',
    color: 'bg-purple-100 text-purple-800',
    icon: Package,
  },
  ready: { label: 'Siap', color: 'bg-green-100 text-green-800', icon: Check },
  cancelled: { label: 'Dibatalkan', color: 'bg-red-100 text-red-800', icon: X },
}

const DELIVERY_ORDER_STATUSES = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: Clock },
  ready: { label: 'Siap Kirim', color: 'bg-blue-100 text-blue-800', icon: Package },
  'in-transit': {
    label: 'Dalam Pengiriman',
    color: 'bg-orange-100 text-orange-800',
    icon: Truck,
  },
  delivered: { label: 'Diterima', color: 'bg-green-100 text-green-800', icon: Check },
  cancelled: { label: 'Dibatalkan', color: 'bg-red-100 text-red-800', icon: X },
}

export function WorkflowStatusBadge({
  status,
  variant = 'sales-order',
  size = 'md',
  showIcon = true,
  className,
}: WorkflowStatusBadgeProps) {
  let statusConfig

  switch (variant) {
    case 'quotation':
      statusConfig = QUOTATION_STATUSES[status as keyof typeof QUOTATION_STATUSES]
      break
    case 'delivery-order':
      statusConfig = DELIVERY_ORDER_STATUSES[status as keyof typeof DELIVERY_ORDER_STATUSES]
      break
    case 'sales-order':
    default:
      statusConfig = SALES_ORDER_STATUSES[status as keyof typeof SALES_ORDER_STATUSES]
  }

  if (!statusConfig) {
    return <Badge variant="outline">{status}</Badge>
  }

  const Icon = statusConfig.icon

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-3 py-1 font-medium',
        statusConfig.color,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Icon size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} />}
      <span>{statusConfig.label}</span>
    </div>
  )
}

// Workflow Timeline Component
interface WorkflowTimelineStep {
  label: string
  status: 'completed' | 'current' | 'upcoming'
  date?: string
}

interface WorkflowTimelineProps {
  steps: WorkflowTimelineStep[]
  className?: string
}

export function WorkflowTimeline({ steps, className }: WorkflowTimelineProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {steps.map((step, index) => (
        <div key={index} className="flex gap-4">
          {/* Timeline dot */}
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center font-semibold',
                step.status === 'completed' && 'bg-green-100 text-green-800',
                step.status === 'current' && 'bg-blue-100 text-blue-800 ring-2 ring-blue-500',
                step.status === 'upcoming' && 'bg-gray-100 text-gray-600'
              )}
            >
              {step.status === 'completed' ? (
                <Check size={20} />
              ) : step.status === 'current' ? (
                <Clock size={20} />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'w-0.5 h-12 my-1',
                  step.status === 'completed' ? 'bg-green-300' : 'bg-gray-300'
                )}
              />
            )}
          </div>
          {/* Timeline content */}
          <div className="pt-2">
            <p className="font-medium text-gray-900">{step.label}</p>
            {step.date && <p className="text-sm text-gray-600">{step.date}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}

// Status history component
interface StatusHistoryEntry {
  status: string
  timestamp: string
  changedBy?: string
  notes?: string
}

interface StatusHistoryProps {
  entries: StatusHistoryEntry[]
  variant?: 'quotation' | 'sales-order' | 'delivery-order'
  className?: string
}

export function StatusHistory({
  entries,
  variant = 'sales-order',
  className,
}: StatusHistoryProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <h4 className="font-semibold text-gray-900">Riwayat Status</h4>
      <div className="space-y-2">
        {entries.map((entry, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-3 bg-gray-50"
          >
            <div className="flex items-center justify-between mb-1">
              <WorkflowStatusBadge
                status={entry.status}
                variant={variant}
                size="sm"
              />
              <span className="text-xs text-gray-600">{entry.timestamp}</span>
            </div>
            {entry.changedBy && (
              <p className="text-xs text-gray-600">by {entry.changedBy}</p>
            )}
            {entry.notes && (
              <p className="text-sm text-gray-700 mt-1">{entry.notes}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
