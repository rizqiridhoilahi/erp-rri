'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MainLayout } from '@/components/common/MainLayout'
import { PageHeader } from '@/components/common/PageHeader'
import { CustomerForm } from '@/components/forms/CustomerForm'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { useCustomers } from '@/hooks/useCustomers'
import { CustomerFormInput } from '@/lib/validations/contact'
import { Customer } from '@/types/contact'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function EditCustomerPage() {
  const router = useRouter()
  const params = useParams()
  const customerId = (params?.id as string) || ''

  const { getOne, update, loading: isLoading } = useCustomers()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCustomer = async () => {
      try {
        setLoading(true)
        const data = await getOne(customerId)
        setCustomer(data)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Gagal memuat pelanggan'
        setError(message)
      } finally {
        setLoading(false)
      }
    }
    loadCustomer()
  }, [customerId, getOne])

  const handleSubmit = async (data: CustomerFormInput) => {
    try {
      setError('')
      await update(customerId, data as any)
      router.push('/master-data/customers')
      // TODO: Show success toast notification
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal memperbarui pelanggan'
      setError(message)
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner label="Memuat pelanggan..." />
        </div>
      </MainLayout>
    )
  }

  if (!customer) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <PageHeader title="Pelanggan Tidak Ditemukan" />
          <div className="text-center">
            <p className="text-gray-600">Pelanggan yang Anda cari tidak ada.</p>
            <Link href="/master-data/customers">
              <Button variant="link" className="mt-4">
                Kembali ke Daftar Pelanggan
              </Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/master-data/customers">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Customers
            </Button>
          </Link>
        </div>

        <PageHeader
          title="Edit Pelanggan"
          description={`Perbarui detail untuk ${customer.name}`}
        />

        <CustomerForm
          customer={customer}
          isLoading={isLoading}
          error={error}
          onSubmit={handleSubmit}
        />
      </div>
    </MainLayout>
  )
}
