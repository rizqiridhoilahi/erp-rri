'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MainLayout } from '@/components/common/MainLayout'
import { PageHeader } from '@/components/common/PageHeader'
import { SupplierForm } from '@/components/forms/SupplierForm'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { useSuppliers } from '@/hooks/useSuppliers'
import { SupplierFormInput } from '@/lib/validations/contact'
import { Supplier } from '@/types/contact'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function EditSupplierPage() {
  const router = useRouter()
  const params = useParams()
  const supplierId = (params?.id as string) || ''

  const { getOne, update, loading: isLoading } = useSuppliers()
  const [supplier, setSupplier] = useState<Supplier | null>(null)
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSupplier = async () => {
      try {
        setLoading(true)
        const data = await getOne(supplierId)
        setSupplier(data)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Gagal memuat supplier'
        setError(message)
      } finally {
        setLoading(false)
      }
    }
    loadSupplier()
  }, [supplierId, getOne])

  const handleSubmit = async (data: SupplierFormInput) => {
    try {
      setError('')
      await update(supplierId, data as any)
      router.push('/master-data/suppliers')
      // TODO: Show success toast notification
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal memperbarui supplier'
      setError(message)
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner label="Memuat supplier..." />
        </div>
      </MainLayout>
    )
  }

  if (!supplier) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <PageHeader title="Supplier Tidak Ditemukan" />
          <div className="text-center">
            <p className="text-gray-600">Supplier yang Anda cari tidak ada.</p>
            <Link href="/master-data/suppliers">
              <Button variant="link" className="mt-4">
                Kembali ke Daftar Supplier
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
          <Link href="/master-data/suppliers">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Suppliers
            </Button>
          </Link>
        </div>

        <PageHeader
          title="Edit Supplier"
          description={`Perbarui detail untuk ${supplier.name}`}
        />

        <SupplierForm
          supplier={supplier}
          isLoading={isLoading}
          error={error}
          onSubmit={handleSubmit}
        />
      </div>
    </MainLayout>
  )
}
