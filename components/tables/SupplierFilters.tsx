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
import { SupplierFiltersInput, supplierFiltersSchema } from '@/lib/validations/contact'
import { Search, X } from 'lucide-react'

interface SupplierFiltersProps {
  onFilterChange: (filters: SupplierFiltersInput) => void
  cities?: string[]
  onReset?: () => void
}

export function SupplierFilters({
  onFilterChange,
  cities = [],
  onReset,
}: SupplierFiltersProps) {
  const form = useForm({
    resolver: zodResolver(supplierFiltersSchema),
    defaultValues: {
      search: '',
      type: undefined,
      city: '',
      status: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    },
  })

  const handleSubmit = (data: SupplierFiltersInput) => {
    onFilterChange(data)
  }

  const handleReset = () => {
    form.reset()
    onReset?.()
  }

  return (
    <Card className="p-3">
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-2">
        {/* Filters Row - Compact */}
        <div className="flex flex-wrap gap-2 items-center">
          {/* Search */}
          <div className="relative min-w-[180px] flex-1">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Cari supplier..."
              className="pl-8 h-8 text-sm"
              {...form.register('search')}
            />
          </div>

          {/* Type */}
          <Select value={form.watch('type') || 'all'} onValueChange={(val) => form.setValue('type', val === 'all' ? undefined : val as any)}>
            <SelectTrigger className="w-full md:w-32 h-8 text-sm">
              <SelectValue placeholder="Tipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              <SelectItem value="local">Lokal</SelectItem>
              <SelectItem value="international">Internasional</SelectItem>
            </SelectContent>
          </Select>

          {/* City */}
          <Select value={form.watch('city') || 'all'} onValueChange={(val) => form.setValue('city', val === 'all' ? '' : val)}>
            <SelectTrigger className="w-full md:w-32 h-8 text-sm">
              <SelectValue placeholder="Kota" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status */}
          <Select value={form.watch('status') || 'all'} onValueChange={(val) => form.setValue('status', val === 'all' ? undefined : val as any)}>
            <SelectTrigger className="w-full md:w-28 h-8 text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="inactive">Nonaktif</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort By */}
          <Select value={form.watch('sortBy')} onValueChange={(val) => form.setValue('sortBy', val as any)}>
            <SelectTrigger className="w-full md:w-28 h-8 text-sm">
              <SelectValue placeholder="Urutkan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Tanggal</SelectItem>
              <SelectItem value="name">Nama</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort Order */}
          <Select value={form.watch('sortOrder')} onValueChange={(val) => form.setValue('sortOrder', val as any)}>
            <SelectTrigger className="w-full md:w-24 h-8 text-sm">
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Terbaru</SelectItem>
              <SelectItem value="asc">Terlama</SelectItem>
            </SelectContent>
          </Select>

          {/* Buttons */}
          <div className="flex gap-1">
            <Button type="submit" size="sm" className="h-8 gap-1">
              <Search className="h-3 w-3" />
              Cari
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="h-8"
            >
              Reset
            </Button>
          </div>
        </div>
      </form>
    </Card>
  )
}
