'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MainLayout } from '@/components/common/MainLayout'
import { PageHeader } from '@/components/common/PageHeader'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCustomers } from '@/hooks/useCustomers'
import { Customer } from '@/types/contact'
import { ArrowLeft, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function CustomerDetailPage() {
  const router = useRouter()
  const params = useParams()
  const customerId = (params?.id as string) || ''

  const { getOne, delete: deleteCustomer } = useCustomers()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

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

  const handleDelete = async () => {
    if (confirm('Apakah Anda yakin ingin menghapus pelanggan ini? Tindakan ini tidak dapat dibatalkan.')) {
      try {
        await deleteCustomer(customerId)
        router.push('/master-data/customers')
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Gagal menghapus pelanggan'
        setError(message)
      }
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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      inactive: 'secondary',
    }
    const labels: Record<string, string> = {
      active: 'Aktif',
      inactive: 'Tidak Aktif',
    }
    return (
      <Badge variant={variants[status] || 'outline'}>
        {labels[status] || status}
      </Badge>
    )
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      individual: 'Perorangan',
      business: 'Bisnis',
    }
    return labels[type] || type
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/master-data/customers">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Customers
              </Button>
            </Link>
          </div>
          <div className="flex gap-2">
            <Link href={`/master-data/customers/${customerId}/edit`}>
              <Button className="gap-2">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            </Link>
            <Button variant="destructive" onClick={handleDelete} className="gap-2">
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <PageHeader title={customer.name} description={customer.code} />

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Basic Info */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="space-y-3">
                <div>
                  <div className="text-xs font-medium uppercase text-gray-500">Status</div>
                  <div className="mt-1">{getStatusBadge(customer.status)}</div>
                </div>

                <div>
                  <div className="text-xs font-medium uppercase text-gray-500">Tipe</div>
                  <div className="mt-1 text-sm font-medium text-gray-900">{getTypeLabel(customer.type)}</div>
                </div>

                <div>
                  <div className="text-xs font-medium uppercase text-gray-500">Kota</div>
                  <div className="mt-1 text-sm font-medium text-gray-900">{customer.city}</div>
                </div>

                <div>
                  <div className="text-xs font-medium uppercase text-gray-500">Provinsi</div>
                  <div className="mt-1 text-sm font-medium text-gray-900">{customer.province}</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Details */}
          <div className="space-y-6 lg:col-span-2">
            {/* Identification */}
            <Card className="p-6">
              <h3 className="mb-4 font-semibold text-gray-900">Identitas</h3>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="text-xs font-medium uppercase text-gray-500">Kode Pelanggan</div>
                    <div className="mt-1 font-mono text-sm font-medium text-gray-900">{customer.code}</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium uppercase text-gray-500">Nama</div>
                    <div className="mt-1 text-sm font-medium text-gray-900">{customer.name}</div>
                  </div>
                </div>
                {customer.companyName && customer.type === 'bisnis' && (
                  <div>
                    <div className="text-xs font-medium uppercase text-gray-500">Nama Perusahaan</div>
                    <div className="mt-1 text-sm text-gray-900">{customer.companyName}</div>
                  </div>
                )}
              </div>
            </Card>

            {/* Contact Information */}
            <Card className="p-6">
              <h3 className="mb-4 font-semibold text-gray-900">Informasi Kontak</h3>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="text-xs font-medium uppercase text-gray-500">Email</div>
                    <div className="mt-1 text-sm text-gray-900">{customer.email}</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium uppercase text-gray-500">Telepon</div>
                    <div className="mt-1 text-sm text-gray-900">{customer.phone}</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Address Information */}
            <Card className="p-6">
              <h3 className="mb-4 font-semibold text-gray-900">Alamat</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-medium uppercase text-gray-500">Alamat Lengkap</div>
                  <div className="mt-1 text-sm text-gray-900">{customer.address}</div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <div className="text-xs font-medium uppercase text-gray-500">Kota</div>
                    <div className="mt-1 text-sm text-gray-900">{customer.city}</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium uppercase text-gray-500">Provinsi</div>
                    <div className="mt-1 text-sm text-gray-900">{customer.province}</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium uppercase text-gray-500">Kode Pos</div>
                    <div className="mt-1 text-sm text-gray-900">{customer.postalCode}</div>
                  </div>
                </div>
                {customer.country && (
                  <div>
                    <div className="text-xs font-medium uppercase text-gray-500">Negara</div>
                    <div className="mt-1 text-sm text-gray-900">{customer.country}</div>
                  </div>
                )}
              </div>
            </Card>

            {/* Tax Information */}
            {customer.type === 'bisnis' && customer.taxId && (
              <Card className="p-6">
                <h3 className="mb-4 font-semibold text-gray-900">Informasi Pajak</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-xs font-medium uppercase text-gray-500">NPWP</div>
                    <div className="mt-1 font-mono text-sm text-gray-900">{customer.taxId}</div>
                  </div>
                </div>
              </Card>
            )}

            {/* Notes */}
            {customer.notes && (
              <Card className="p-6">
                <h3 className="mb-4 font-semibold text-gray-900">Catatan</h3>
                <p className="text-sm text-gray-700">{customer.notes}</p>
              </Card>
            )}

            {/* Metadata */}
            <Card className="p-6">
              <h3 className="mb-4 font-semibold text-gray-900">Informasi Sistem</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Dibuat pada:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(customer.createdAt).toLocaleDateString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Diperbarui pada:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(customer.updatedAt).toLocaleDateString('id-ID')}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
