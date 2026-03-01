'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { QuotationForm } from '@/components/forms/QuotationForm'
import { useQuotation } from '@/hooks/useQuotation'
import { QuotationFormInput, Quotation } from '@/lib/validations/quotation'

export default function EditQuotationPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { getOne, update, isLoading } = useQuotation()
  const [quotation, setQuotation] = useState<Quotation | null>(null)
  const [isFetching, setIsFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    const fetchQuotation = async () => {
      try {
        const data = await getOne(params.id)
        setQuotation(data as Quotation)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch quotation'
        setError(message)
      } finally {
        setIsFetching(false)
      }
    }

    fetchQuotation()
  }, [params.id, getOne])

  const handleSubmit = async (data: QuotationFormInput) => {
    setSubmitError(null)
    try {
      await update(params.id, data)
      router.push(`/sales/quotations/${params.id}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update quotation'
      setSubmitError(message)
    }
  }

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Memuat data quotation...</p>
        </div>
      </div>
    )
  }

  if (error || !quotation) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon">
            <Link href="/sales/quotations">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Quotation tidak ditemukan</h1>
        </div>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error || 'Quotation tidak ditemukan'}</p>
        </div>
      </div>
    )
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
          <Link href={`/sales/quotations/${params.id}`}>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Quotation</h1>
          <p className="text-gray-600 mt-2">{quotation.quotationNo}</p>
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
        quotation={quotation}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  )
}
