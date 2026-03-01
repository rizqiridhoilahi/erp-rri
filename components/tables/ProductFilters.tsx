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
    <Card className="p-4">
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Search */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search products by name, code, or SKU..."
              className="pl-10"
              {...form.register('search')}
            />
          </div>
        </div>

        {/* Row 1: Category, Brand, Status */}
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Category</label>
            <Select value={form.watch('category') || 'all'} onValueChange={(val) => form.setValue('category', val === 'all' ? '' : val)}>
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Brand</label>
            <Select value={form.watch('brand') || 'all'} onValueChange={(val) => form.setValue('brand', val === 'all' ? '' : val)}>
              <SelectTrigger>
                <SelectValue placeholder="All brands" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All brands</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Status</label>
            <Select value={form.watch('status') || 'all'} onValueChange={(val) => form.setValue('status', val === 'all' ? undefined : val as any)}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="discontinued">Discontinued</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Row 2: Price Range */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Min Price (Rp)</label>
            <Input
              type="number"
              placeholder="0"
              {...form.register('minPrice', { valueAsNumber: true, setValueAs: (v) => (v === '' ? undefined : v) })}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Max Price (Rp)</label>
            <Input
              type="number"
              placeholder="No limit"
              {...form.register('maxPrice', { valueAsNumber: true, setValueAs: (v) => (v === '' ? undefined : v) })}
            />
          </div>
        </div>

        {/* Row 3: Sort */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Sort By</label>
            <Select value={form.watch('sortBy')} onValueChange={(val) => form.setValue('sortBy', val as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Date Created</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="stock">Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Order</label>
            <Select value={form.watch('sortOrder')} onValueChange={(val) => form.setValue('sortOrder', val as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Descending</SelectItem>
                <SelectItem value="asc">Ascending</SelectItem>
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
