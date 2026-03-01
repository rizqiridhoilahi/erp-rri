'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2, Home } from 'lucide-react'
import { QuotationForm } from '@/components/forms/QuotationForm'
import { useQuotation } from '@/hooks/useQuotation'
import { useState } from 'react'
import { QuotationFormInput } from '@/lib/validations/quotation'

export default function CreateQuotationPage() {
  const router = useRouter()
  const { create, isLoading, error } = useQuotation()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (data: QuotationFormInput) => {
    setSubmitError(null)
    try {
      await create(data)
      router.push('/sales/quotations')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create quotation'
      setSubmitError(message)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center gap-2 mb-6">
          <Button
            asChild
            variant="default"
            size="sm"
            className="gap-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Link href="/dashboard">
              <Home className="w-4 h-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="default"
            size="sm"
            className="gap-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Link href="/sales/quotations">
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </Link>
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">Buat Quotation Baru</h1>
          <p className="text-gray-600 mt-1">Buat quotation penjualan baru untuk pelanggan Anda</p>
        </div>

        {/* Error Alert */}
        {(submitError || error) && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm font-medium">{submitError || error}</p>
          </div>
        )}

        {/* Form */}
        <div className="mt-6">
          <QuotationForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </div>
    </main>
  )
}
