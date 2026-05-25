"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface RevenueChartProps {
  data: { month: string; revenue: number }[]
}

function formatRupiah(value: number) {
  if (value >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(1)}M`
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `Rp ${(value / 1_000).toFixed(0)}K`
  return `Rp ${value.toLocaleString('id-ID')}`
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--success)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="var(--success)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
        <XAxis
          dataKey="month"
          axisLine={false}
          tickLine={false}
          tick={({ x, y, payload }) => (
            <text x={x} y={y} dy={12} textAnchor="middle" style={{ fill: 'var(--muted-foreground)', fontSize: 10 }}>
              {payload.value}
            </text>
          )}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={({ x, y, payload }) => {
            const v = Number(payload.value) || 0
            const label = v >= 1_000_000 ? `${(v / 1_000_000).toFixed(0)}M` : v >= 1_000 ? `${(v / 1_000).toFixed(0)}K` : `${v}`
            return (
              <text x={x} y={y} dy={3} textAnchor="end" style={{ fill: 'var(--muted-foreground)', fontSize: 10 }}>
                {label}
              </text>
            )
          }}
        />
        <Tooltip
          formatter={(value) => [formatRupiah(Number(value) || 0), 'Revenue']}
          labelFormatter={(label) => `Bulan: ${label}`}
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }}
          labelStyle={{ color: 'var(--muted-foreground)', marginBottom: 4 }}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="var(--success)"
          strokeWidth={2}
          fill="url(#revenueGradient)"
          dot={{ r: 3, fill: 'var(--success)', strokeWidth: 0 }}
          activeDot={{ r: 5, fill: 'var(--success)', strokeWidth: 2, stroke: 'var(--card)' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
