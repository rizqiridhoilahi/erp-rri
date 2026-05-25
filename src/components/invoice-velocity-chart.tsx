"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface InvoiceVelocityChartProps {
  data: { label: string; count: number }[]
}

export function InvoiceVelocityChart({ data }: InvoiceVelocityChartProps) {
  if (!data.length) return null
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip
          formatter={(v) => [String(v), 'Faktur']}
          contentStyle={{ fontSize: 12, borderRadius: 8, backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
        />
        <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={50} fill="var(--info)" />
      </BarChart>
    </ResponsiveContainer>
  )
}
