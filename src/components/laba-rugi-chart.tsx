"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

function rupiah(v: number) {
  return `Rp ${v.toLocaleString('id-ID')}`
}

interface LabaRugiChartProps {
  data: { label: string; revenue: number; cogs: number }[]
}

export function LabaRugiChart({ data }: LabaRugiChartProps) {
  if (!data.length) return null
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={v => rupiah(v)} />
        <Tooltip formatter={(v) => rupiah(Number(v) || 0)} contentStyle={{ fontSize: 13, borderRadius: 8 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={50} name="Pendapatan" />
        <Bar dataKey="cogs" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={50} name="HPP/Beban" />
      </BarChart>
    </ResponsiveContainer>
  )
}
