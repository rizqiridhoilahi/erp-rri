'use client'

import { useState } from 'react'
import { MoreVertical, GripVertical, X, Settings, Maximize2, Minimize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { DashboardWidget, WidgetSize, ThresholdStatus } from '@/store/dashboardStore'
import { cn } from '@/lib/utils'

interface WidgetProps {
  widget: DashboardWidget
  onRemove?: () => void
  onConfigure?: () => void
  onResize?: (size: WidgetSize) => void
  isEditable?: boolean
  children?: React.ReactNode
}

const sizeClasses: Record<WidgetSize, string> = {
  small: 'col-span-1',
  medium: 'col-span-2',
  large: 'col-span-3',
  full: 'col-span-4',
}

export function Widget({ 
  widget, 
  onRemove, 
  onConfigure, 
  onResize, 
  isEditable = false,
  children 
}: WidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Calculate threshold status based on config
  const getThresholdStatus = (): ThresholdStatus | null => {
    if (!widget.config.threshold) return null
    
    // This would typically take actual data as a prop
    // For now, return null (no threshold indicator)
    return null
  }

  const thresholdStatus = getThresholdStatus()

  const getThresholdColor = (status: ThresholdStatus) => {
    switch (status) {
      case 'green':
        return 'border-l-4 border-l-green-500'
      case 'yellow':
        return 'border-l-4 border-l-yellow-500'
      case 'red':
        return 'border-l-4 border-l-red-500'
      default:
        return ''
    }
  }

  return (
    <div
      className={cn(
        sizeClasses[widget.size],
        'transition-all duration-200',
        isEditable && 'ring-2 ring-transparent hover:ring-blue-300 cursor-move rounded-lg',
        thresholdStatus && getThresholdColor(thresholdStatus)
      )}
    >
      <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
        {/* Widget Header */}
        <CardHeader className="p-3 pb-0 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
          
          <div className="flex items-center gap-1">
            {isEditable && (
              <Button variant="ghost" size="icon" className="h-6 w-6 cursor-grab">
                <GripVertical className="w-3 h-3" />
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <Minimize2 className="w-3 h-3" />
              ) : (
                <Maximize2 className="w-3 h-3" />
              )}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreVertical className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onConfigure && (
                  <DropdownMenuItem onClick={onConfigure}>
                    <Settings className="w-4 h-4 mr-2" />
                    Configure
                  </DropdownMenuItem>
                )}
                
                {onResize && (
                  <>
                    <DropdownMenuItem onClick={() => onResize('small')}>
                      Small Size
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onResize('medium')}>
                      Medium Size
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onResize('large')}>
                      Large Size
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onResize('full')}>
                      Full Width
                    </DropdownMenuItem>
                  </>
                )}
                
                {onRemove && (
                  <DropdownMenuItem onClick={onRemove} className="text-red-600">
                    <X className="w-4 h-4 mr-2" />
                    Remove
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        {/* Widget Content */}
        <CardContent className={cn("p-3", isExpanded ? "h-[400px]" : "h-[200px]")}>
          {children}
        </CardContent>
      </Card>
    </div>
  )
}

// KPI Card Widget Content
interface KPIWidgetContentProps {
  value: string | number
  change?: number // percentage change
  changeLabel?: string
  isCurrency?: boolean
}

export function KPIWidgetContent({ value, change, changeLabel, isCurrency }: KPIWidgetContentProps) {
  const formatValue = (val: string | number) => {
    if (isCurrency) {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
      }).format(Number(val))
    }
    return val
  }

  const isPositive = change && change > 0
  const isNegative = change && change < 0

  return (
    <div className="flex flex-col h-full justify-center">
      <div className="text-2xl font-bold">{formatValue(value)}</div>
      {change !== undefined && (
        <div className={cn(
          "text-sm",
          isPositive && "text-green-600",
          isNegative && "text-red-600",
          !isPositive && !isNegative && "text-gray-500"
        )}>
          {isPositive && "+"}{change}% {changeLabel || 'vs last period'}
        </div>
      )}
    </div>
  )
}

// Placeholder widget content for when there's no actual data
export function WidgetPlaceholder({ type }: { type: string }) {
  return (
    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
      <div className="text-center">
        <p>Widget: {type}</p>
        <p className="text-xs mt-1">Configure to display data</p>
      </div>
    </div>
  )
}
