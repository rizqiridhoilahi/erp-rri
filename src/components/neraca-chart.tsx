"use client"

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

function rupiah(v: number) {
  return `Rp ${v.toLocaleString('id-ID')}`
}

const COLORS = ['#3b82f6', '#f59e0b', '#10b981']

interface NeracaChartProps {
  data: { name: string; value: number }[]
}

export function NeracaChart({ data }: NeracaChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0)
  if (!total) return null
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
          label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i]} />
          ))}
        </Pie>
        <Tooltip formatter={(v) => rupiah(Number(v) || 0)} contentStyle={{ fontSize: 13, borderRadius: 8 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}
