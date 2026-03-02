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
import { CustomerFormInput, customerSchema } from '@/lib/validations/contact'
import { Customer } from '@/types/contact'
import { AlertCircle, Plus, Trash2, FileText, Upload } from 'lucide-react'

interface CustomerFormProps {
  customer?: Customer
  isLoading?: boolean
  error?: string
  onSubmit: (data: CustomerFormInput) => Promise<void>
}

export function CustomerForm({
  customer,
  isLoading = false,
  error: formError,
  onSubmit,
}: CustomerFormProps) {
  const [submitError, setSubmitError] = React.useState<string>(formError || '')

  const form = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: customer
      ? {
          code: customer.code,
          name: customer.name,
          type: customer.type,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          city: customer.city,
          province: customer.province,
          postalCode: customer.postalCode,
          country: customer.country || '',
          taxId: customer.taxId || '',
          taxName: customer.taxName || '',
          taxAddress: customer.taxAddress || '',
          companyName: customer.companyName || '',
          // PIC
          picName: customer.picName || '',
          picEmail: customer.picEmail || '',
          picPhone: customer.picPhone || '',
          // Storage Addresses
          storageAddress1: customer.storageAddress1 || '',
          storageAddress2: customer.storageAddress2 || '',
          storageAddress3: customer.storageAddress3 || '',
          storageAddress4: customer.storageAddress4 || '',
          storageAddress5: customer.storageAddress5 || '',
          // Contract
          hasContract: customer.hasContract || false,
          contractNumber: customer.contractNumber || '',
          contractFileUrl: customer.contractFileUrl || '',
          notes: customer.notes || '',
          status: customer.status,
        }
      : {
          code: '',
          name: '',
          type: 'perorangan',
          email: '',
          phone: '',
          address: '',
          city: '',
          province: '',
          postalCode: '',
          country: '',
          taxId: '',
          taxName: '',
          taxAddress: '',
          companyName: '',
          picName: '',
          picEmail: '',
          picPhone: '',
          storageAddress1: '',
          storageAddress2: '',
          storageAddress3: '',
          storageAddress4: '',
          storageAddress5: '',
          hasContract: false,
          contractNumber: '',
          contractFileUrl: '',
          notes: '',
          status: 'active',
        },
  })

  const handleFormSubmit = async (data: CustomerFormInput) => {
    setSubmitError('')
    try {
      await onSubmit(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menyimpan pelanggan'
      setSubmitError(message)
    }
  }

  const customerType = form.watch('type')
  const hasContract = form.watch('hasContract')

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
                <label className="mb-2 block text-sm font-medium text-gray-700">Kode Pelanggan *</label>
                <Input
                  placeholder="CUST-001"
                  {...form.register('code')}
                  disabled={isLoading}
                />
                {form.formState.errors.code && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.code.message}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Tipe Pelanggan *</label>
                <Select
                  value={form.watch('type')}
                  onValueChange={(val) => form.setValue('type', val as any)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="perorangan">Perorangan</SelectItem>
                    <SelectItem value="bisnis">Bisnis</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.type && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.type.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Nama Pelanggan *</label>
              <Input
                placeholder="Masukkan nama pelanggan"
                {...form.register('name')}
                disabled={isLoading}
              />
              {form.formState.errors.name && (
                <p className="mt-1 text-sm text-red-600">{form.formState.errors.name.message}</p>
              )}
            </div>

            {customerType === 'bisnis' && (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Nama Perusahaan</label>
                <Input
                  placeholder="Masukkan nama perusahaan"
                  {...form.register('companyName')}
                  disabled={isLoading}
                />
                {form.formState.errors.companyName && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.companyName.message}</p>
                )}
              </div>
            )}
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
                  placeholder="pelanggan@email.com"
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

        {/* PIC Information - Business Type Only */}
        {customerType === 'bisnis' && (
          <Card className="p-6">
            <h3 className="mb-4 font-semibold text-gray-900">Informasi PIC (Person In Charge)</h3>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Nama PIC *
                  </label>
                  <Input
                    placeholder="Budi Santoso"
                    {...form.register('picName')}
                    disabled={isLoading}
                  />
                  {form.formState.errors.picName && (
                    <p className="mt-1 text-sm text-red-600">{form.formState.errors.picName.message}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Email PIC *
                  </label>
                  <Input
                    type="email"
                    placeholder="pic@perusahaan.com"
                    {...form.register('picEmail')}
                    disabled={isLoading}
                  />
                  {form.formState.errors.picEmail && (
                    <p className="mt-1 text-sm text-red-600">{form.formState.errors.picEmail.message}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Telepon PIC *
                  </label>
                  <Input
                    placeholder="0812-3456-7890"
                    {...form.register('picPhone')}
                    disabled={isLoading}
                  />
                  {form.formState.errors.picPhone && (
                    <p className="mt-1 text-sm text-red-600">{form.formState.errors.picPhone.message}</p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Storage Addresses - Business Type Only */}
        {customerType === 'bisnis' && (
          <Card className="p-6">
            <h3 className="mb-4 font-semibold text-gray-900">Alamat Penyimpanan (Gudang/Warehouse)</h3>
            <p className="mb-4 text-sm text-gray-500">
              Tambahkan hingga 5 alamat penyimpanan. Alamat ini akan dipilih saat input Delivery Order.
            </p>
            <div className="space-y-4">
              {/* Storage Address 1 */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Alamat Penyimpanan 1</label>
                <Textarea
                  placeholder="Masukkan alamat gudang/warehouse 1"
                  rows={2}
                  {...form.register('storageAddress1')}
                  disabled={isLoading}
                />
              </div>

              {/* Storage Address 2 */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Alamat Penyimpanan 2</label>
                <Textarea
                  placeholder="Masukkan alamat gudang/warehouse 2"
                  rows={2}
                  {...form.register('storageAddress2')}
                  disabled={isLoading}
                />
              </div>

              {/* Storage Address 3 */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Alamat Penyimpanan 3</label>
                <Textarea
                  placeholder="Masukkan alamat gudang/warehouse 3"
                  rows={2}
                  {...form.register('storageAddress3')}
                  disabled={isLoading}
                />
              </div>

              {/* Storage Address 4 */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Alamat Penyimpanan 4</label>
                <Textarea
                  placeholder="Masukkan alamat gudang/warehouse 4"
                  rows={2}
                  {...form.register('storageAddress4')}
                  disabled={isLoading}
                />
              </div>

              {/* Storage Address 5 */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Alamat Penyimpanan 5</label>
                <Textarea
                  placeholder="Masukkan alamat gudang/warehouse 5"
                  rows={2}
                  {...form.register('storageAddress5')}
                  disabled={isLoading}
                />
              </div>
            </div>
          </Card>
        )}

        {/* Tax Information - Business Type Only */}
        {customerType === 'bisnis' && (
          <Card className="p-6">
            <h3 className="mb-4 font-semibold text-gray-900">Informasi Pajak</h3>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
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

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Nama NPWP</label>
                  <Input
                    placeholder="PT. Nama Perusahaan"
                    {...form.register('taxName')}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Alamat NPWP</label>
                <Textarea
                  placeholder="Alamat sesuai NPWP"
                  rows={2}
                  {...form.register('taxAddress')}
                  disabled={isLoading}
                />
              </div>
            </div>
          </Card>
        )}

        {/* Contract Information - Business Type Only */}
        {customerType === 'bisnis' && (
          <Card className="p-6">
            <h3 className="mb-4 font-semibold text-gray-900">Informasi Kontrak</h3>
            <div className="space-y-4">
              {/* Has Contract Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="hasContract"
                  {...form.register('hasContract')}
                  disabled={isLoading}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="hasContract" className="text-sm font-medium text-gray-700">
                  Customer ini memiliki kontrak dengan kami
                </label>
              </div>

              {/* Contract Details - Only show if hasContract is checked */}
              {hasContract && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Nomor Kontrak
                      </label>
                      <Input
                        placeholder="CONTRACT-2026-001"
                        {...form.register('contractNumber')}
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        File Kontrak (URL)
                      </label>
                      <Input
                        placeholder="https://storage.supabase.co/..."
                        {...form.register('contractFileUrl')}
                        disabled={isLoading}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Upload file kontrak ke Supabase Storage dan masukkan URL-nya di sini
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Notes */}
        <Card className="p-6">
          <h3 className="mb-4 font-semibold text-gray-900">Catatan</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Catatan Tambahan</label>
              <Textarea
                placeholder="Catatan untuk pelanggan ini..."
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
            {customer ? 'Update' : 'Create'}
          </Button>
          <Button type="button" variant="outline" disabled={isLoading}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
