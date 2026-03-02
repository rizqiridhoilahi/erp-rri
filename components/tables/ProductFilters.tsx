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
import { ProductFiltersInput, productFiltersSchema } from '@/lib/validations/product'
import { Search, X } from 'lucide-react'

interface ProductFiltersProps {
  onFilterChange: (filters: ProductFiltersInput) => void
  categories: string[]
  brands: string[]
  onReset?: () => void
}

export function ProductFilters({
  onFilterChange,
  categories,
  brands,
  onReset,
}: ProductFiltersProps) {
  const form = useForm({
    resolver: zodResolver(productFiltersSchema),
    defaultValues: {
      search: '',
      category: '',
      brand: '',
      status: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    },
  })

  const handleSubmit = (data: ProductFiltersInput) => {
    onFilterChange(data)
  }

  const handleReset = () => {
    form.reset()
    onReset?.()
  }

  return (
    <Card className="p-3">
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-2">
        {/* Filters Row - Compact with all options */}
        <div className="flex flex-wrap gap-2 items-center">
          {/* Search */}
          <div className="relative min-w-[180px] flex-1">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Cari produk..."
              className="pl-8 h-8 text-sm"
              {...form.register('search')}
            />
          </div>

          {/* Category */}
          <Select value={form.watch('category') || 'all'} onValueChange={(val) => form.setValue('category', val === 'all' ? '' : val)}>
            <SelectTrigger className="w-full md:w-28 h-8 text-sm">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Brand */}
          <Select value={form.watch('brand') || 'all'} onValueChange={(val) => form.setValue('brand', val === 'all' ? '' : val)}>
            <SelectTrigger className="w-full md:w-28 h-8 text-sm">
              <SelectValue placeholder="Merek" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              {brands.map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status */}
          <Select value={form.watch('status') || 'all'} onValueChange={(val) => form.setValue('status', val === 'all' ? undefined : val as any)}>
            <SelectTrigger className="w-full md:w-24 h-8 text-sm">
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
              <SelectItem value="price">Harga</SelectItem>
              <SelectItem value="stock">Stok</SelectItem>
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
