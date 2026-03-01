'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { SupplierFormInput, supplierSchema } from '@/lib/validations/contact'
import { Supplier } from '@/types/contact'
import { AlertCircle } from 'lucide-react'

interface SupplierFormProps {
  supplier?: Supplier
  isLoading?: boolean
  error?: string
  onSubmit: (data: SupplierFormInput) => Promise<void>
}

export function SupplierForm({
  supplier,
  isLoading = false,
  error: formError,
  onSubmit,
}: SupplierFormProps) {
  const [submitError, setSubmitError] = React.useState<string>(formError || '')

  const form = useForm({
    resolver: zodResolver(supplierSchema),
    defaultValues: supplier
      ? {
          code: supplier.code,
          name: supplier.name,
          type: supplier.type,
          email: supplier.email,
          phone: supplier.phone,
          address: supplier.address,
          city: supplier.city,
          province: supplier.province,
          postalCode: supplier.postalCode,
          country: supplier.country || '',
          taxId: supplier.taxId || '',
          bankAccount: supplier.bankAccount || '',
          bankName: supplier.bankName || '',
          notes: supplier.notes || '',
          status: supplier.status,
        }
      : {
          code: '',
          name: '',
          type: 'local',
          email: '',
          phone: '',
          address: '',
          city: '',
          province: '',
          postalCode: '',
          country: '',
          taxId: '',
          bankAccount: '',
          bankName: '',
          notes: '',
          status: 'active',
        },
  })

  const handleFormSubmit = async (data: SupplierFormInput) => {
    setSubmitError('')
    try {
      await onSubmit(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menyimpan supplier'
      setSubmitError(message)
    }
  }

  return (
    <div className="space-y-6">
      {submitError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6">
          <h3 className="mb-4 font-semibold text-gray-900">Informasi Dasar</h3>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Kode Supplier *</label>
                <Input
                  placeholder="SUP-001"
                  {...form.register('code')}
                  disabled={isLoading}
                />
                {form.formState.errors.code && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.code.message}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Tipe Supplier *</label>
                <Select
                  value={form.watch('type')}
                  onValueChange={(val) => form.setValue('type', val as any)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local">Lokal</SelectItem>
                    <SelectItem value="international">Internasional</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.type && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.type.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Nama Supplier *</label>
              <Input
                placeholder="Masukkan nama supplier"
                {...form.register('name')}
                disabled={isLoading}
              />
              {form.formState.errors.name && (
                <p className="mt-1 text-sm text-red-600">{form.formState.errors.name.message}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Contact Information */}
        <Card className="p-6">
          <h3 className="mb-4 font-semibold text-gray-900">Informasi Kontak</h3>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Email *</label>
                <Input
                  type="email"
                  placeholder="supplier@email.com"
                  {...form.register('email')}
                  disabled={isLoading}
                />
                {form.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Nomor Telepon *</label>
                <Input
                  placeholder="0812-3456-7890"
                  {...form.register('phone')}
                  disabled={isLoading}
                />
                {form.formState.errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.phone.message}</p>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Address Information */}
        <Card className="p-6">
          <h3 className="mb-4 font-semibold text-gray-900">Informasi Alamat</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Alamat *</label>
              <Textarea
                placeholder="Masukkan alamat lengkap"
                rows={3}
                {...form.register('address')}
                disabled={isLoading}
              />
              {form.formState.errors.address && (
                <p className="mt-1 text-sm text-red-600">{form.formState.errors.address.message}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Kota *</label>
                <Input
                  placeholder="Masukkan kota"
                  {...form.register('city')}
                  disabled={isLoading}
                />
                {form.formState.errors.city && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.city.message}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Provinsi *</label>
                <Input
                  placeholder="Masukkan provinsi"
                  {...form.register('province')}
                  disabled={isLoading}
                />
                {form.formState.errors.province && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.province.message}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Kode Pos *</label>
                <Input
                  placeholder="12345"
                  {...form.register('postalCode')}
                  disabled={isLoading}
                />
                {form.formState.errors.postalCode && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.postalCode.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Negara</label>
              <Input
                placeholder="Indonesia"
                {...form.register('country')}
                disabled={isLoading}
              />
              {form.formState.errors.country && (
                <p className="mt-1 text-sm text-red-600">{form.formState.errors.country.message}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Tax Information */}
        <Card className="p-6">
          <h3 className="mb-4 font-semibold text-gray-900">Informasi Pajak</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">NPWP</label>
              <Input
                placeholder="12.345.678.9-123.456"
                {...form.register('taxId')}
                disabled={isLoading}
              />
              {form.formState.errors.taxId && (
                <p className="mt-1 text-sm text-red-600">{form.formState.errors.taxId.message}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Bank Information */}
        <Card className="p-6">
          <h3 className="mb-4 font-semibold text-gray-900">Informasi Bank</h3>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Nama Bank</label>
                <Input
                  placeholder="Masukkan nama bank"
                  {...form.register('bankName')}
                  disabled={isLoading}
                />
                {form.formState.errors.bankName && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.bankName.message}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Nomor Rekening</label>
                <Input
                  placeholder="Masukkan nomor rekening"
                  {...form.register('bankAccount')}
                  disabled={isLoading}
                />
                {form.formState.errors.bankAccount && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.bankAccount.message}</p>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Notes */}
        <Card className="p-6">
          <h3 className="mb-4 font-semibold text-gray-900">Catatan</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Catatan Tambahan</label>
              <Textarea
                placeholder="Catatan untuk supplier ini..."
                rows={3}
                {...form.register('notes')}
                disabled={isLoading}
              />
              {form.formState.errors.notes && (
                <p className="mt-1 text-sm text-red-600">{form.formState.errors.notes.message}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Status */}
        <Card className="p-6">
          <h3 className="mb-4 font-semibold text-gray-900">Status</h3>
          <Select
            value={form.watch('status')}
            onValueChange={(val) => form.setValue('status', val as any)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="inactive">Tidak Aktif</SelectItem>
            </SelectContent>
          </Select>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading && <LoadingSpinner />}
            {supplier ? 'Update' : 'Create'}
          </Button>
          <Button type="button" variant="outline" disabled={isLoading}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
