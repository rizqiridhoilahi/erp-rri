'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, Printer, TrendingUp, TrendingDown, Scale } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PeriodSelector, PeriodSelection } from '@/components/finance/PeriodSelector'

// Sample data for balance sheet
const sampleData = {
  assets: {
    current: [
      { code: '1-1100', name: 'Kas dan Setara Kas', amount: 45000000, previousAmount: 38000000 },
      { code: '1-1200', name: 'Piutang Usaha', amount: 35000000, previousAmount: 32000000 },
      { code: '1-1300', name: 'Persediaan', amount: 28000000, previousAmount: 25000000 },
      { code: '1-1400', name: 'Uang Muka', amount: 5000000, previousAmount: 8000000 },
    ],
    fixed: [
      { code: '1-2100', name: 'Perlengkapan Kantor', amount: 15000000, previousAmount: 12000000 },
      { code: '1-2200', name: 'Kendaraan', amount: 250000000, previousAmount: 250000000 },
      { code: '1-2300', name: 'Akumulasi Penyusutan', amount: -25000000, previousAmount: -20000000 },
    ]
  },
  liabilities: {
    current: [
      { code: '2-1100', name: 'Utang Usaha', amount: 18000000, previousAmount: 22000000 },
      { code: '2-1200', name: 'Utang Pajak', amount: 8500000, previousAmount: 7000000 },
      { code: '2-1300', name: 'Beban Akrual', amount: 3500000, previousAmount: 4000000 },
    ],
    longTerm: [
      { code: '2-2100', name: 'Utang Bank', amount: 100000000, previousAmount: 120000000 },
    ]
  },
  equity: [
    { code: '3-1100', name: 'Modal Saham', amount: 200000000, previousAmount: 200000000 },
    { code: '3-1200', name: 'Laba Ditahan', amount: 95000000, previousAmount: 65000000 },
    { code: '3-1300', name: 'Laba Tahun Berjalan', amount: 45000000, previousAmount: 30000000 },
  ]
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function BalanceSheetPage() {
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
  const totalCurrentAssets = sampleData.assets.current.reduce((sum, item) => sum + item.amount, 0)
  const totalFixedAssets = sampleData.assets.fixed.reduce((sum, item) => sum + item.amount, 0)
  const totalAssets = totalCurrentAssets + totalFixedAssets

  const totalCurrentLiabilities = sampleData.liabilities.current.reduce((sum, item) => sum + item.amount, 0)
  const totalLongTermLiabilities = sampleData.liabilities.longTerm.reduce((sum, item) => sum + item.amount, 0)
  const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities

  const totalEquity = sampleData.equity.reduce((sum, item) => sum + item.amount, 0)

  // Previous period totals
  const prevTotalCurrentAssets = sampleData.assets.current.reduce((sum, item) => sum + item.previousAmount, 0)
  const prevTotalFixedAssets = sampleData.assets.fixed.reduce((sum, item) => sum + item.previousAmount, 0)
  const prevTotalAssets = prevTotalCurrentAssets + prevTotalFixedAssets

  const prevTotalCurrentLiabilities = sampleData.liabilities.current.reduce((sum, item) => sum + item.previousAmount, 0)
  const prevTotalLongTermLiabilities = sampleData.liabilities.longTerm.reduce((sum, item) => sum + item.previousAmount, 0)
  const prevTotalLiabilities = prevTotalCurrentLiabilities + prevTotalLongTermLiabilities

  const prevTotalEquity = sampleData.equity.reduce((sum, item) => sum + item.previousAmount, 0)

  // Balance check
  const isBalanced = Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 100

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
            <h1 className="text-3xl font-bold">Neraca (Balance Sheet)</h1>
            <p className="text-gray-600">Posisi keuangan per {period.endDate}</p>
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

      {/* Balance Sheet Card */}
      <Card>
        <CardHeader>
          <CardTitle>Neraca (Balance Sheet)</CardTitle>
          <CardDescription>
            Per {period.endDate}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Assets Column */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-blue-700 border-b-2 border-blue-200 pb-2">
                AKTIVA (ASSETS)
              </h3>
              
              {/* Current Assets */}
              <div>
                <h4 className="font-semibold text-blue-600 mb-2">Aktiva Lancar</h4>
                <div className="space-y-1 ml-2">
                  {sampleData.assets.current.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <div className="flex gap-2 text-gray-600">
                        <span className="font-mono w-16">{item.code}</span>
                        <span>{item.name}</span>
                      </div>
                      <span className="font-mono">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-semibold text-blue-600 pt-1 border-t">
                    <span>Total Aktiva Lancar</span>
                    <span>{formatCurrency(totalCurrentAssets)}</span>
                  </div>
                </div>
              </div>

              {/* Fixed Assets */}
              <div>
                <h4 className="font-semibold text-blue-600 mb-2">Aktiva Tetap</h4>
                <div className="space-y-1 ml-2">
                  {sampleData.assets.fixed.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <div className="flex gap-2 text-gray-600">
                        <span className="font-mono w-16">{item.code}</span>
                        <span>{item.name}</span>
                      </div>
                      <span className={`font-mono ${item.amount < 0 ? 'text-red-600' : ''}`}>
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between font-semibold text-blue-600 pt-1 border-t">
                    <span>Total Aktiva Tetap</span>
                    <span>{formatCurrency(totalFixedAssets)}</span>
                  </div>
                </div>
              </div>

              {/* Total Assets */}
              <div className="flex justify-between font-bold text-lg text-blue-700 bg-blue-50 p-3 rounded">
                <span>JUMLAH AKTIVA</span>
                <span>{formatCurrency(totalAssets)}</span>
              </div>
            </div>

            {/* Liabilities & Equity Column */}
            <div className="lg:col-span-2 space-y-4">
              {/* Liabilities */}
              <div>
                <h3 className="text-lg font-bold text-red-700 border-b-2 border-red-200 pb-2">
                  KEWAJIBAN (LIABILITIES)
                </h3>
                
                {/* Current Liabilities */}
                <div className="mt-2">
                  <h4 className="font-semibold text-red-600 mb-2">Kewajiban Lancar</h4>
                  <div className="space-y-1 ml-2">
                    {sampleData.liabilities.current.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <div className="flex gap-2 text-gray-600">
                          <span className="font-mono w-16">{item.code}</span>
                          <span>{item.name}</span>
                        </div>
                        <span className="font-mono">{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-semibold text-red-600 pt-1 border-t">
                      <span>Total Kewajiban Lancar</span>
                      <span>{formatCurrency(totalCurrentLiabilities)}</span>
                    </div>
                  </div>
                </div>

                {/* Long Term Liabilities */}
                <div className="mt-4">
                  <h4 className="font-semibold text-red-600 mb-2">Kewajiban Jangka Panjang</h4>
                  <div className="space-y-1 ml-2">
                    {sampleData.liabilities.longTerm.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <div className="flex gap-2 text-gray-600">
                          <span className="font-mono w-16">{item.code}</span>
                          <span>{item.name}</span>
                        </div>
                        <span className="font-mono">{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-semibold text-red-600 pt-1 border-t">
                      <span>Total Kewajiban Jangka Panjang</span>
                      <span>{formatCurrency(totalLongTermLiabilities)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between font-bold text-red-700 bg-red-50 p-3 rounded mt-4">
                  <span>JUMLAH KEWAJIBAN</span>
                  <span>{formatCurrency(totalLiabilities)}</span>
                </div>
              </div>

              {/* Equity */}
              <div className="mt-6">
                <h3 className="text-lg font-bold text-green-700 border-b-2 border-green-200 pb-2">
                  MODAL (EQUITY)
                </h3>
                
                <div className="space-y-1 mt-2">
                  {sampleData.equity.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <div className="flex gap-2 text-gray-600">
                        <span className="font-mono w-16">{item.code}</span>
                        <span>{item.name}</span>
                      </div>
                      <span className="font-mono">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-green-700 bg-green-50 p-3 rounded mt-2">
                    <span>JUMLAH MODAL</span>
                    <span>{formatCurrency(totalEquity)}</span>
                  </div>
                </div>
              </div>

              {/* Total Liabilities + Equity */}
              <div className="flex justify-between font-bold text-lg bg-gray-100 p-4 rounded mt-4">
                <span>JUMLAH KEWAJIBAN DAN MODAL</span>
                <span>{formatCurrency(totalLiabilities + totalEquity)}</span>
              </div>
            </div>
          </div>

          {/* Balance Check */}
          <div className={`mt-6 p-4 rounded-lg flex items-center justify-center gap-3 ${
            isBalanced ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <Scale className={`w-6 h-6 ${isBalanced ? 'text-green-600' : 'text-red-600'}`} />
            <div className="text-center">
              <p className={`font-semibold ${isBalanced ? 'text-green-700' : 'text-red-700'}`}>
                {isBalanced ? 'NERACA SEIMBANG' : 'NERACA TIDAK SEIMBANG'}
              </p>
              <p className="text-sm text-gray-600">
                Total Aktiva: {formatCurrency(totalAssets)} | 
                Total Kewajiban + Modal: {formatCurrency(totalLiabilities + totalEquity)}
                {isBalanced ? '' : ` | Selisih: ${formatCurrency(totalAssets - (totalLiabilities + totalEquity))}`}
              </p>
            </div>
          </div>

          {/* Ratios */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-sm text-gray-600">Rasio Lancar (Current Ratio)</p>
              <p className="text-xl font-bold">
                {totalCurrentLiabilities > 0 ? (totalCurrentAssets / totalCurrentLiabilities).toFixed(2) : '-'}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-sm text-gray-600">Rasio Utang terhadap Aset</p>
              <p className="text-xl font-bold">
                {totalAssets > 0 ? ((totalLiabilities / totalAssets) * 100).toFixed(1) : '-'}%
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-sm text-gray-600">Rasio Utang terhadap Modal</p>
              <p className="text-xl font-bold">
                {totalEquity > 0 ? ((totalLiabilities / totalEquity) * 100).toFixed(1) : '-'}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
