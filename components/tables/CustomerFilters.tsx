'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { CustomerFiltersInput, customerFiltersSchema } from '@/lib/validations/contact'
import { Search, X } from 'lucide-react'

interface CustomerFiltersProps {
  onFilterChange: (filters: CustomerFiltersInput) => void
  cities?: string[]
  onReset?: () => void
}

export function CustomerFilters({
  onFilterChange,
  cities = [],
  onReset,
}: CustomerFiltersProps) {
  const form = useForm({
    resolver: zodResolver(customerFiltersSchema),
    defaultValues: {
      search: '',
      type: undefined,
      city: '',
      status: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    },
  })

  const handleSubmit = (data: CustomerFiltersInput) => {
    onFilterChange(data)
  }

  const handleReset = () => {
    form.reset()
    onReset?.()
  }

  return (
    <Card className="p-4">
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Search */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Pencarian</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Cari berdasarkan nama, kode, atau email..."
              className="pl-10"
              {...form.register('search')}
            />
          </div>
        </div>

        {/* Row 1: Type, City, Status */}
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Tipe Pelanggan</label>
            <Select value={form.watch('type') || ''} onValueChange={(val) => form.setValue('type', val as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Semua tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Semua tipe</SelectItem>
                <SelectItem value="individual">Perorangan</SelectItem>
                <SelectItem value="business">Bisnis</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Kota</label>
            <Select value={form.watch('city') || ''} onValueChange={(val) => form.setValue('city', val)}>
              <SelectTrigger>
                <SelectValue placeholder="Semua kota" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Semua kota</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Status</label>
            <Select value={form.watch('status') || ''} onValueChange={(val) => form.setValue('status', val as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Semua status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Semua status</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Tidak Aktif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Row 2: Sort */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Urutkan Berdasarkan</label>
            <Select value={form.watch('sortBy')} onValueChange={(val) => form.setValue('sortBy', val as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Tanggal Dibuat</SelectItem>
                <SelectItem value="name">Nama</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Urutan</label>
            <Select value={form.watch('sortOrder')} onValueChange={(val) => form.setValue('sortOrder', val as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Menurun</SelectItem>
                <SelectItem value="asc">Naik</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-4">
          <Button type="submit" className="gap-2">
            <Search className="h-4 w-4" />
            Apply Filters
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </form>
    </Card>
  )
}
