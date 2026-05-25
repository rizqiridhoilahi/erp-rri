"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface TopCustomersChartProps {
  data: { name: string; revenue: number }[]
}

function formatRupiah(v: number) {
  if (v >= 1_000_000_000) return `Rp ${(v / 1_000_000_000).toFixed(1)}M`
  if (v >= 1_000_000) return `Rp ${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `Rp ${(v / 1_000).toFixed(0)}K`
  return `Rp ${v.toLocaleString('id-ID')}`
}

export function TopCustomersChart({ data }: TopCustomersChartProps) {
  if (!data.length) return null
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1_000_000 ? `${(v/1_000_000).toFixed(0)}M` : v >= 1_000 ? `${(v/1_000).toFixed(0)}K` : String(v)} />
        <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} width={90} />
        <Tooltip
          formatter={(v) => [formatRupiah(Number(v) || 0), 'Revenue']}
          contentStyle={{ fontSize: 12, borderRadius: 8, backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
        />
        <Bar dataKey="revenue" radius={[0, 6, 6, 0]} maxBarSize={24} fill="var(--primary)" />
      </BarChart>
    </ResponsiveContainer>
  )
}
