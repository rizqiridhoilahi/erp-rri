import { useState, useCallback } from 'react'
import {
  Quotation,
  QuotationDetail,
  QuotationLineItem,
  QuotationFilters,
  QuotationFormInput,
} from '@/lib/validations/quotation'

interface QuotationListResponse {
  data: Quotation[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

interface UseQuotationOptions {
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function useQuotation(options?: UseQuotationOptions) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get list of quotations
  const getList = useCallback(
    async (filters?: Partial<QuotationFilters>) => {
      setIsLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        if (filters?.search) params.append('search', filters.search)
        if (filters?.status) params.append('status', filters.status)
        if (filters?.customerId) params.append('customerId', filters.customerId)
        if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom)
        if (filters?.dateTo) params.append('dateTo', filters.dateTo)
        params.append('page', String(filters?.page || 1))
        params.append('pageSize', String(filters?.pageSize || 10))

        const response = await fetch(`/api/quotations?${params.toString()}`)
        if (!response.ok) {
          throw new Error('Failed to fetch quotations')
        }
        const result: QuotationListResponse = await response.json()
        setIsLoading(false)
        return result
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        options?.onError?.(errorMessage)
        setIsLoading(false)
        throw err
      }
    },
    [options]
  )

  // Get single quotation
  const getOne = useCallback(
    async (id: string) => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/quotations/${id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch quotation')
        }
        const result: QuotationDetail = await response.json()
        setIsLoading(false)
        return result
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        options?.onError?.(errorMessage)
        setIsLoading(false)
        throw err
      }
    },
    [options]
  )

  // Create new quotation
  const create = useCallback(
    async (data: QuotationFormInput) => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/quotations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to create quotation')
        }

        const result: QuotationDetail = await response.json()
        setIsLoading(false)
        options?.onSuccess?.()
        return result
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        options?.onError?.(errorMessage)
        setIsLoading(false)
        throw err
      }
    },
    [options]
  )

  // Update quotation
  const update = useCallback(
    async (id: string, data: QuotationFormInput) => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/quotations/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to update quotation')
        }

        const result: QuotationDetail = await response.json()
        setIsLoading(false)
        options?.onSuccess?.()
        return result
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        options?.onError?.(errorMessage)
        setIsLoading(false)
        throw err
      }
    },
    [options]
  )

  // Delete quotation
  const delete_ = useCallback(
    async (id: string) => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/quotations/${id}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          throw new Error('Failed to delete quotation')
        }

        setIsLoading(false)
        options?.onSuccess?.()
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        options?.onError?.(errorMessage)
        setIsLoading(false)
        throw err
      }
    },
    [options]
  )

  // Get filter options (customers for dropdown)
  const getFilterOptions = useCallback(async () => {
    try {
      // For now, we'll fetch from products API
      // In real implementation, you might want a dedicated endpoint
      return {
        customers: [],
        statuses: [
          { label: 'Draft', value: 'draft' },
          { label: 'Sent', value: 'sent' },
          { label: 'Accepted', value: 'accepted' },
          { label: 'Rejected', value: 'rejected' },
          { label: 'Expired', value: 'expired' },
        ],
      }
    } catch (err) {
      console.error('Error getting filter options:', err)
      throw err
    }
  }, [])

  return {
    isLoading,
    error,
    getList,
    getOne,
    create,
    update,
    delete: delete_,
    getFilterOptions,
  }
}
