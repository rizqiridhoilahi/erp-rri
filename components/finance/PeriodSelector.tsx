'use client'

import { useState } from 'react'
import { Calendar, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'

export type PeriodType = 'monthly' | 'quarterly' | 'yearly'

export interface PeriodSelection {
  type: PeriodType
  year: number
  month?: number
  quarter?: number
  startDate: string
  endDate: string
}

interface PeriodSelectorProps {
  value: PeriodSelection
  onChange: (period: PeriodSelection) => void
  showComparison?: boolean
  comparisonPeriod?: PeriodSelection
  onComparisonChange?: (period: PeriodSelection) => void
}

const currentYear = new Date().getFullYear()
const currentMonth = new Date().getMonth() + 1
const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

export function PeriodSelector({ 
  value, 
  onChange,
  showComparison = false,
  comparisonPeriod,
  onComparisonChange
}: PeriodSelectorProps) {
  const [periodType, setPeriodType] = useState<PeriodType>(value.type)
  const [year, setYear] = useState(value.year)
  const [month, setMonth] = useState(value.month || currentMonth)
  const [quarter, setQuarter] = useState(value.quarter || Math.ceil(currentMonth / 3))
  const [showCompare, setShowCompare] = useState(!!comparisonPeriod)

  const calculatePeriodFor = (y: number, m: number, q: number): PeriodSelection => {
    let startDate: Date
    let endDate: Date

    switch (periodType) {
      case 'monthly':
        startDate = new Date(y, m - 1, 1)
        endDate = new Date(y, m, 0)
        break
      case 'quarterly':
        const qStartMonth = (q - 1) * 3 + 1
        startDate = new Date(y, qStartMonth - 1, 1)
        endDate = new Date(y, qStartMonth + 2, 0)
        break
      case 'yearly':
        startDate = new Date(y, 0, 1)
        endDate = new Date(y, 11, 31)
        break
    }

    return {
      type: periodType,
      year: y,
      month: periodType === 'monthly' ? m : undefined,
      quarter: periodType === 'quarterly' ? q : undefined,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    }
  }

  const handleTypeChange = (newType: PeriodType) => {
    setPeriodType(newType)
    const period = calculatePeriodFor(year, month, quarter)
    onChange({ ...period, type: newType })
  }

  const handleYearChange = (newYear: number) => {
    setYear(newYear)
    const period = calculatePeriodFor(newYear, month, quarter)
    onChange(period)
  }

  const handleMonthChange = (newMonth: number) => {
    setMonth(newMonth)
    const period = calculatePeriodFor(year, newMonth, quarter)
    onChange(period)
  }

  const handleQuarterChange = (newQuarter: number) => {
    setQuarter(newQuarter)
    const period = calculatePeriodFor(year, month, newQuarter)
    onChange(period)
  }

  const goToPrevious = () => {
    let newYear = year
    let newMonth = month
    let newQuarter = quarter

    switch (periodType) {
      case 'monthly':
        newMonth--
        if (newMonth < 1) { newMonth = 12; newYear-- }
        break
      case 'quarterly':
        newQuarter--
        if (newQuarter < 1) { newQuarter = 4; newYear-- }
        break
      case 'yearly':
        newYear--
        break
    }

    setYear(newYear)
    setMonth(newMonth)
    setQuarter(newQuarter)
    onChange(calculatePeriodFor(newYear, newMonth, newQuarter))
  }

  const goToNext = () => {
    let newYear = year
    let newMonth = month
    let newQuarter = quarter

    switch (periodType) {
      case 'monthly':
        newMonth++
        if (newMonth > 12) { newMonth = 1; newYear++ }
        break
      case 'quarterly':
        newQuarter++
        if (newQuarter > 4) { newQuarter = 1; newYear++ }
        break
      case 'yearly':
        newYear++
        break
    }

    setYear(newYear)
    setMonth(newMonth)
    setQuarter(newQuarter)
    onChange(calculatePeriodFor(newYear, newMonth, newQuarter))
  }

  const getPeriodLabel = () => {
    switch (periodType) {
      case 'monthly':
        return `${monthNames[month - 1]} ${year}`
      case 'quarterly':
        return `Q${quarter} ${year}`
      case 'yearly':
        return `Tahun ${year}`
    }
  }

  const handleComparisonToggle = (checked: boolean) => {
    setShowCompare(checked)
    if (checked) {
      const prevYear = periodType === 'yearly' ? year - 1 : year
      let prevMonth = month - 1
      let prevQuarter = quarter - 1
      if (periodType === 'monthly' && prevMonth < 1) prevMonth = 12
      if (periodType === 'quarterly' && prevQuarter < 1) prevQuarter = 4
      onComparisonChange?.(calculatePeriodFor(prevYear, prevMonth, prevQuarter))
    } else {
      onComparisonChange?.(undefined as any)
    }
  }

  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i)

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <Select value={periodType} onValueChange={(v) => handleTypeChange(v as PeriodType)}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Bulanan</SelectItem>
                <SelectItem value="quarterly">Triwulanan</SelectItem>
                <SelectItem value="yearly">Tahunan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={goToPrevious}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="min-w-[150px] text-center font-semibold">{getPeriodLabel()}</div>
            <Button variant="outline" size="icon" onClick={goToNext}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {periodType === 'monthly' && (
            <Select value={month.toString()} onValueChange={(v) => handleMonthChange(parseInt(v))}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {monthNames.map((name, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {periodType === 'quarterly' && (
            <Select value={quarter.toString()} onValueChange={(v) => handleQuarterChange(parseInt(v))}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Q1 (Jan-Mar)</SelectItem>
                <SelectItem value="2">Q2 (Apr-Jun)</SelectItem>
                <SelectItem value="3">Q3 (Jul-Sep)</SelectItem>
                <SelectItem value="4">Q4 (Okt-Des)</SelectItem>
              </SelectContent>
            </Select>
          )}

          <Select value={year.toString()} onValueChange={(v) => handleYearChange(parseInt(v))}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((y) => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="ghost" size="sm" onClick={() => {
            setYear(currentYear)
            setMonth(currentMonth)
            setQuarter(Math.ceil(currentMonth / 3))
            onChange(calculatePeriodFor(currentYear, currentMonth, Math.ceil(currentMonth / 3)))
          }}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Sekarang
          </Button>
        </div>

        {showComparison && (
          <div className="mt-4 pt-4 border-t">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={showCompare}
                onChange={(e) => handleComparisonToggle(e.target.checked)}
                className="rounded"
              />
              <span>Bandingkan dengan periode sebelumnya</span>
            </label>
            {comparisonPeriod && (
              <div className="mt-2 text-sm text-gray-500">
                Periode perbandingan: {comparisonPeriod.startDate} s/d {comparisonPeriod.endDate}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
