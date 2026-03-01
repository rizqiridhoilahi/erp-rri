'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/common/MainLayout'
import { PageHeader } from '@/components/common/PageHeader'
import { SupplierForm } from '@/components/forms/SupplierForm'
import { useSuppliers } from '@/hooks/useSuppliers'
import { SupplierFormInput } from '@/lib/validations/contact'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function CreateSupplierPage() {
  const router = useRouter()
  const { create, loading: isLoading } = useSuppliers()
  const [error, setError] = useState<string>('')

  const handleSubmit = async (data: SupplierFormInput) => {
    try {
      setError('')
      await create(data as any)
      router.push('/master-data/suppliers')
      // TODO: Show success toast notification
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal membuat supplier'
      setError(message)
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/master-data/suppliers">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Suppliers
            </Button>
          </Link>
        </div>

        <PageHeader
          title="Tambah Supplier Baru"
          description="Tambahkan supplier baru ke dalam sistem"
        />

        <SupplierForm
          isLoading={isLoading}
          error={error}
          onSubmit={handleSubmit}
        />
      </div>
    </MainLayout>
  )
}
