'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/common/MainLayout'
import { PageHeader } from '@/components/common/PageHeader'
import { CustomerForm } from '@/components/forms/CustomerForm'
import { useCustomers } from '@/hooks/useCustomers'
import { CustomerFormInput } from '@/lib/validations/contact'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function CreateCustomerPage() {
  const router = useRouter()
  const { create, loading: isLoading } = useCustomers()
  const [error, setError] = useState<string>('')

  const handleSubmit = async (data: CustomerFormInput) => {
    try {
      setError('')
      await create(data as any)
      router.push('/master-data/customers')
      // TODO: Show success toast notification
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal membuat pelanggan'
      setError(message)
    }
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
          title="Tambah Pelanggan Baru"
          description="Tambahkan pelanggan baru ke dalam sistem"
        />

        <CustomerForm
          isLoading={isLoading}
          error={error}
          onSubmit={handleSubmit}
        />
      </div>
    </MainLayout>
  )
}
