'use client'

import React from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card } from '@/components/ui/card'

interface RevenueChartProps {
  data?: Array<{
    month: string
    revenue: number
    target?: number
  }>
  loading?: boolean
  title?: string
  type?: 'line' | 'bar'
}

const defaultData = [
  { month: 'Jan', revenue: 45000000, target: 50000000 },
  { month: 'Feb', revenue: 52000000, target: 50000000 },
  { month: 'Mar', revenue: 48000000, target: 50000000 },
  { month: 'Apr', revenue: 61000000, target: 60000000 },
  { month: 'May', revenue: 55000000, target: 60000000 },
  { month: 'Jun', revenue: 67000000, target: 65000000 },
]

export function RevenueChart({
  data = defaultData,
  loading = false,
  title = 'Revenue Trend',
  type = 'line',
}: RevenueChartProps) {
  if (loading) {
    return (
      <Card className="p-6">
        <div className="h-80 bg-gray-100 rounded animate-pulse" />
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-600 mt-1">6 bulan terakhir</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        {type === 'line' ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="month"
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              formatter={(value) => `Rp${(value as number).toLocaleString('id-ID')}`}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
              name="Revenue"
            />
            {data[0]?.target && (
              <Line
                type="monotone"
                dataKey="target"
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#10b981', r: 4 }}
                activeDot={{ r: 6 }}
                name="Target"
              />
            )}
          </LineChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="month"
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              formatter={(value) => `Rp${(value as number).toLocaleString('id-ID')}`}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar
              dataKey="revenue"
              fill="#3b82f6"
              radius={[8, 8, 0, 0]}
              name="Revenue"
            />
            {data[0]?.target && (
              <Bar
                dataKey="target"
                fill="#10b981"
                radius={[8, 8, 0, 0]}
                name="Target"
              />
            )}
          </BarChart>
        )}
      </ResponsiveContainer>
    </Card>
  )
}
