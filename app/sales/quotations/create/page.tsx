'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button
          asChild
          variant="outline"
          size="icon"
          className="rounded-lg"
        >
          <Link href="/sales/quotations">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Buat Quotation Baru</h1>
          <p className="text-gray-600 mt-2">Buat quotation penjualan baru untuk pelanggan Anda</p>
        </div>
      </div>

      {/* Error Alert */}
      {(submitError || error) && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm font-medium">{submitError || error}</p>
        </div>
      )}

      {/* Form */}
      <QuotationForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  )
}
