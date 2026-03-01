'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, Printer, TrendingUp, TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PeriodSelector, PeriodSelection, PeriodType } from '@/components/finance/PeriodSelector'

// Sample data for income statement
const sampleData = {
  revenue: [
    { code: '4-1000', name: 'Penjualan Barang', amount: 150000000, previousAmount: 125000000 },
    { code: '4-2000', name: 'Pendapatan Jasa', amount: 50000000, previousAmount: 45000000 },
  ],
  costOfGoodsSold: [
    { code: '5-1000', name: 'Pembelian Bahan Baku', amount: 80000000, previousAmount: 70000000 },
    { code: '5-2000', name: 'Biaya Angkut Pembelian', amount: 5000000, previousAmount: 4500000 },
  ],
  operatingExpenses: [
    { code: '6-1000', name: 'Gaji Karyawan', amount: 25000000, previousAmount: 24000000 },
    { code: '6-2000', name: 'Sewa Gedung', amount: 12000000, previousAmount: 12000000 },
    { code: '6-3000', name: 'Listrik & Air', amount: 3000000, previousAmount: 2800000 },
    { code: '6-4000', name: 'Perlengkapan Kantor', amount: 2000000, previousAmount: 1800000 },
    { code: '6-5000', name: 'Biaya Komunikasi', amount: 1500000, previousAmount: 1400000 },
  ],
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

function calculateChange(current: number, previous: number): { value: number; percentage: number; direction: 'up' | 'down' | 'flat' } {
  const change = current - previous
  const percentage = previous !== 0 ? (change / previous) * 100 : 0
  return {
    value: change,
    percentage: Math.abs(percentage),
    direction: change > 0 ? 'up' : change < 0 ? 'down' : 'flat'
  }
}

export default function IncomeStatementPage() {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1
  
  const [period, setPeriod] = useState<PeriodSelection>({
    type: 'monthly',
    year: currentYear,
    month: currentMonth,
    startDate: `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`,
    endDate: `${currentYear}-${String(currentMonth).padStart(2, '0')}-31`,
  })
  
  const [comparisonPeriod, setComparisonPeriod] = useState<PeriodSelection | undefined>()

  // Calculate totals
  const totalRevenue = sampleData.revenue.reduce((sum, item) => sum + item.amount, 0)
  const totalPreviousRevenue = sampleData.revenue.reduce((sum, item) => sum + item.previousAmount, 0)
  
  const totalCOGS = sampleData.costOfGoodsSold.reduce((sum, item) => sum + item.amount, 0)
  const totalPreviousCOGS = sampleData.costOfGoodsSold.reduce((sum, item) => sum + item.previousAmount, 0)
  
  const grossProfit = totalRevenue - totalCOGS
  const previousGrossProfit = totalPreviousRevenue - totalPreviousCOGS
  
  const totalOperatingExpenses = sampleData.operatingExpenses.reduce((sum, item) => sum + item.amount, 0)
  const totalPreviousOperatingExpenses = sampleData.operatingExpenses.reduce((sum, item) => sum + item.previousAmount, 0)
  
  const operatingIncome = grossProfit - totalOperatingExpenses
  const previousOperatingIncome = previousGrossProfit - totalPreviousOperatingExpenses

  const sections = [
    {
      title: 'PENDAPATAN (REVENUE)',
      items: sampleData.revenue,
      total: totalRevenue,
      previousTotal: totalPreviousRevenue,
      color: 'green'
    },
    {
      title: 'HARGA POKOK PENJUALAN (HPP)',
      items: sampleData.costOfGoodsSold,
      total: totalCOGS,
      previousTotal: totalPreviousCOGS,
      color: 'red',
      isCost: true
    },
    {
      title: 'LABA KOTOR (GROSS PROFIT)',
      total: grossProfit,
      previousTotal: previousGrossProfit,
      color: 'blue',
      isBold: true
    },
    {
      title: 'BEBAN USAHA (OPERATING EXPENSES)',
      items: sampleData.operatingExpenses,
      total: totalOperatingExpenses,
      previousTotal: totalPreviousOperatingExpenses,
      color: 'red'
    },
    {
      title: 'LABA USAHA (OPERATING INCOME)',
      total: operatingIncome,
      previousTotal: previousOperatingIncome,
      color: 'green',
      isBold: true
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/finance">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Laporan Laba Rugi (Income Statement)</h1>
            <p className="text-gray-600">Laporan keuangan periode {period.startDate} s/d {period.endDate}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Cetak
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Period Selector */}
      <PeriodSelector
        value={period}
        onChange={setPeriod}
        showComparison={true}
        comparisonPeriod={comparisonPeriod}
        onComparisonChange={setComparisonPeriod}
      />

      {/* Income Statement Card */}
      <Card>
        <CardHeader>
          <CardTitle>Laporan Laba Rugi</CardTitle>
          <CardDescription>
            Periode: {period.startDate} s/d {period.endDate}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className={section.isBold ? 'pt-4 border-t-2' : ''}>
                <div className={`flex items-center justify-between font-semibold ${
                  section.isBold ? 'text-lg' : 'text-base'
                } ${section.color === 'green' ? 'text-green-700' : section.color === 'red' ? 'text-red-700' : section.color === 'blue' ? 'text-blue-700' : ''}`}>
                  <div className="flex items-center gap-2">
                    <span>{section.title}</span>
                    {comparisonPeriod && !section.items && (
                      section.total > section.previousTotal 
                        ? <TrendingUp className="w-4 h-4 text-green-600" />
                        : <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-mono">{formatCurrency(section.total)}</div>
                    {comparisonPeriod && (
                      <div className={`text-xs ${
                        section.total > section.previousTotal ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {section.total > section.previousTotal ? '+' : ''}
                        {formatCurrency(section.total - section.previousTotal)}
                        ({((section.total - section.previousTotal) / (section.previousTotal || 1) * 100).toFixed(1)}%)
                      </div>
                    )}
                  </div>
                </div>

                {/* Line Items */}
                {section.items && (
                  <div className="ml-4 mt-2 space-y-1">
                    {section.items.map((item, itemIndex) => {
                      const change = calculateChange(item.amount, item.previousAmount)
                      return (
                        <div key={itemIndex} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <span className="font-mono w-16">{item.code}</span>
                            <span>{item.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-mono">{formatCurrency(item.amount)}</span>
                            {comparisonPeriod && (
                              <span className={`ml-2 text-xs ${
                                change.direction === 'up' ? 'text-green-600' : change.direction === 'down' ? 'text-red-600' : 'text-gray-400'
                              }`}>
                                {change.direction === 'up' ? '+' : change.direction === 'down' ? '-' : ''}
                                {change.percentage.toFixed(1)}%
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}

            {/* Summary Box */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-blue-600">Laba Kotor</p>
                  <p className="text-xl font-bold text-blue-700">{formatCurrency(grossProfit)}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-600">Laba Usaha</p>
                  <p className="text-xl font-bold text-blue-700">{formatCurrency(operatingIncome)}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-600">Margin Laba Usaha</p>
                  <p className="text-xl font-bold text-blue-700">
                    {totalRevenue > 0 ? ((operatingIncome / totalRevenue) * 100).toFixed(1) : 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
