"use client"

import { useRouter, useSearchParams } from 'next/navigation'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

const MONTHS = [
  { value: '', label: 'Semua Bulan' },
  ...Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: new Date(0, i).toLocaleDateString('id-ID', { month: 'long' }) })),
]

const QUARTERS = [
  { value: '', label: 'Semua Kuartal' },
  { value: '1', label: 'Q1 (Jan-Mar)' },
  { value: '2', label: 'Q2 (Apr-Jun)' },
  { value: '3', label: 'Q3 (Jul-Sep)' },
  { value: '4', label: 'Q4 (Okt-Des)' },
]

function range(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

interface PeriodFilterProps {
  mode?: 'monthly' | 'quarterly'
}

export function PeriodFilter({ mode = 'monthly' }: PeriodFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tahun = searchParams.get('tahun') || ''
  const bulan = searchParams.get('bulan') || ''
  const kuartal = searchParams.get('kuartal') || ''
  const now = new Date()
  const years = range(now.getFullYear() - 3, now.getFullYear())

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Select value={tahun} onValueChange={v => update('tahun', v)}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Tahun" />
        </SelectTrigger>
        <SelectContent>
          {years.map(y => (
            <SelectItem key={y} value={String(y)}>{y}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {mode === 'monthly' ? (
        <Select value={bulan} onValueChange={v => update('bulan', v)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Bulan" />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map(m => (
              <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Select value={kuartal} onValueChange={v => update('kuartal', v)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Kuartal" />
          </SelectTrigger>
          <SelectContent>
            {QUARTERS.map(q => (
              <SelectItem key={q.value} value={q.value}>{q.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  )
}
