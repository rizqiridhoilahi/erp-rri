"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface LowStockChartProps {
  data: { name: string; stock: number }[]
}

export function LowStockChart({ data }: LowStockChartProps) {
  if (!data.length) return null
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} allowDecimals={false} />
        <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} width={100} />
        <Tooltip
          formatter={(v) => [String(v), 'Stok']}
          contentStyle={{ fontSize: 12, borderRadius: 8, backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
        />
        <Bar dataKey="stock" radius={[0, 6, 6, 0]} maxBarSize={20} fill="var(--destructive)" />
      </BarChart>
    </ResponsiveContainer>
  )
}
