"use client"

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface RevenueMixChartProps {
  data: { name: string; value: number }[]
}

const COLORS = ['var(--primary)', 'var(--success)', 'var(--warning)', 'var(--destructive)', 'var(--info)', '#8b5cf6', '#ec4899', '#14b8a6']

function formatRupiah(v: number) {
  if (v >= 1_000_000_000) return `Rp ${(v / 1_000_000_000).toFixed(1)}M`
  if (v >= 1_000_000) return `Rp ${(v / 1_000_000).toFixed(1)}M`
  return `Rp ${v.toLocaleString('id-ID')}`
}

export function RevenueMixChart({ data }: RevenueMixChartProps) {
  if (!data.length) return null
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={2}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(v) => [formatRupiah(Number(v) || 0), 'Revenue']}
          contentStyle={{ fontSize: 12, borderRadius: 8, backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
        />
        <Legend
          wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
          iconType="circle"
          iconSize={8}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
