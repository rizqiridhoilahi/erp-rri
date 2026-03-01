'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface ComparisonChartProps {
  title: string
  currentValue: number
  previousValue: number
  format?: 'currency' | 'percentage' | 'number'
  showBar?: boolean
  height?: number
}

export function ComparisonChart({
  title,
  currentValue,
  previousValue,
  format = 'currency',
  showBar = true,
  height = 60
}: ComparisonChartProps) {
  const difference = currentValue - previousValue
  const percentageChange = previousValue !== 0 
    ? ((difference / Math.abs(previousValue)) * 100)
    : 0
  
  const isPositive = difference > 0
  const isNegative = difference < 0
  const isFlat = difference === 0

  const formatValue = (value: number): string => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          maximumFractionDigits: 0,
        }).format(value)
      case 'percentage':
        return `${value.toFixed(1)}%`
      default:
        return new Intl.NumberFormat('id-ID').format(value)
    }
  }

  // Calculate bar width (max 100%)
  const maxValue = Math.max(Math.abs(currentValue), Math.abs(previousValue))
  const currentBarWidth = maxValue > 0 ? (Math.abs(currentValue) / maxValue) * 100 : 0
  const previousBarWidth = maxValue > 0 ? (Math.abs(previousValue) / maxValue) * 100 : 0

  return (
    <div className="w-full">
      {/* Title */}
      <div className="text-sm font-medium text-gray-600 mb-2">{title}</div>
      
      {/* Values */}
      <div className="flex items-end justify-between mb-2">
        <div>
          <div className="text-lg font-bold">{formatValue(currentValue)}</div>
          <div className="text-xs text-gray-500">Periode Saat Ini</div>
        </div>
        
        <div className="text-right">
          <div className={`flex items-center gap-1 ${
            isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-500'
          }`}>
            {isPositive && <TrendingUp className="w-4 h-4" />}
            {isNegative && <TrendingDown className="w-4 h-4" />}
            {isFlat && <Minus className="w-4 h-4" />}
            <span className="font-semibold">
              {isPositive ? '+' : ''}{formatValue(difference)}
            </span>
          </div>
          <div className={`text-xs ${
            isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-500'
          }`}>
            ({isPositive ? '+' : ''}{percentageChange.toFixed(1)}%)
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      {showBar && (
        <div className="space-y-1">
          {/* Current Period Bar */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-16">Saat Ini</span>
            <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  isPositive ? 'bg-green-500' : isNegative ? 'bg-red-500' : 'bg-gray-400'
                }`}
                style={{ width: `${currentBarWidth}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 w-20 text-right">
              {formatValue(currentValue)}
            </span>
          </div>
          
          {/* Previous Period Bar */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-16">Sebelumnya</span>
            <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gray-400 rounded-full"
                style={{ width: `${previousBarWidth}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 w-20 text-right">
              {formatValue(previousValue)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// Multiple comparison chart for side-by-side comparison
interface MultiComparisonChartProps {
  items: {
    title: string
    currentValue: number
    previousValue: number
    format?: 'currency' | 'percentage' | 'number'
  }[]
  columns?: 2 | 3 | 4
}

export function MultiComparisonChart({ items, columns = 2 }: MultiComparisonChartProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  }

  return (
    <div className={`grid ${gridCols[columns]} gap-4`}>
      {items.map((item, index) => (
        <ComparisonChart
          key={index}
          title={item.title}
          currentValue={item.currentValue}
          previousValue={item.previousValue}
          format={item.format || 'currency'}
        />
      ))}
    </div>
  )
}

// Line chart comparison for trend visualization
interface TrendLineChartProps {
  data: {
    label: string
    current: number
    previous: number
  }[]
  height?: number
}

export function TrendLineChart({ data, height = 200 }: TrendLineChartProps) {
  const maxValue = Math.max(...data.map(d => Math.max(d.current, d.previous)))
  
  const getY = (value: number) => {
    return height - (value / maxValue) * (height - 20) - 10
  }

  const currentPath = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = getY(d.current)
    return `${i === 0 ? 'M' : 'L'} ${x}% ${y}`
  }).join(' ')

  const previousPath = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = getY(d.previous)
    return `${i === 0 ? 'M' : 'L'} ${x}% ${y}`
  }).join(' ')

  return (
    <div className="w-full">
      <svg 
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
        className="w-full"
        style={{ height }}
      >
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((y) => (
          <line
            key={y}
            x1="0"
            y1={`${y}%`}
            x2="100%"
            y2={`${y}%`}
            stroke="#e5e7eb"
            strokeWidth="0.5"
          />
        ))}
        
        {/* Previous period line (dashed, gray) */}
        <path
          d={previousPath}
          fill="none"
          stroke="#9ca3af"
          strokeWidth="1"
          strokeDasharray="4 2"
        />
        
        {/* Current period line (solid, blue) */}
        <path
          d={currentPath}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="1.5"
        />
        
        {/* Data points */}
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * 100
          return (
            <g key={i}>
              <circle
                cx={`${x}%`}
                cy={`${getY(d.previous)}%`}
                r="2"
                fill="#9ca3af"
              />
              <circle
                cx={`${x}%`}
                cy={`${getY(d.current)}%`}
                r="2"
                fill="#3b82f6"
              />
            </g>
          )
        })}
      </svg>
      
      {/* Legend */}
      <div className="flex justify-center gap-6 mt-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-gray-400" />
          <span className="text-xs text-gray-500">Periode Sebelumnya</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-blue-500" />
          <span className="text-xs text-gray-500">Periode Saat Ini</span>
        </div>
      </div>
    </div>
  )
}
