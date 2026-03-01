'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, X } from 'lucide-react'
import { QuotationFilters } from '@/lib/validations/quotation'

interface QuotationFiltersProps {
  onFilterChange: (filters: Partial<QuotationFilters>) => void
  isLoading?: boolean
}

export function QuotationFilterComponent({
  onFilterChange,
  isLoading = false,
}: QuotationFiltersProps) {
  const [filters, setFilters] = useState<Partial<QuotationFilters>>({
    search: '',
    status: undefined,
    dateFrom: '',
    dateTo: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })

  const handleSearchChange = (value: string) => {
    const updated = { ...filters, search: value }
    setFilters(updated)
    onFilterChange(updated)
  }

  const handleStatusChange = (value: string) => {
    const updated = { ...filters, status: value as any }
    setFilters(updated)
    onFilterChange(updated)
  }

  const handleDateFromChange = (value: string) => {
    const updated = { ...filters, dateFrom: value }
    setFilters(updated)
    onFilterChange(updated)
  }

  const handleDateToChange = (value: string) => {
    const updated = { ...filters, dateTo: value }
    setFilters(updated)
    onFilterChange(updated)
  }

  const handleSortByChange = (value: string) => {
    const updated = { ...filters, sortBy: value as any }
    setFilters(updated)
    onFilterChange(updated)
  }

  const handleSortOrderChange = (value: string) => {
    const updated = { ...filters, sortOrder: value as any }
    setFilters(updated)
    onFilterChange(updated)
  }

  const handleReset = () => {
    const cleared: Partial<QuotationFilters> = {
      search: '',
      status: undefined,
      dateFrom: '',
      dateTo: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    }
    setFilters(cleared)
    onFilterChange(cleared)
  }

  return (
    <div className="bg-white p-4 rounded-lg border space-y-4">
      {/* Search */}
      <div>
        <Label htmlFor="search" className="text-sm font-medium text-gray-700">
          Cari Quotation
        </Label>
        <div className="relative mt-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="search"
            type="text"
            placeholder="Cari nomor quotation..."
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            disabled={isLoading}
            className="pl-10"
          />
        </div>
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div>
          <Label htmlFor="status" className="text-sm font-medium text-gray-700">
            Status
          </Label>
          <Select value={filters.status || ''} onValueChange={handleStatusChange} disabled={isLoading}>
            <SelectTrigger id="status" className="mt-1">
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Semua Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date From */}
        <div>
          <Label htmlFor="dateFrom" className="text-sm font-medium text-gray-700">
            Dari Tanggal
          </Label>
          <Input
            id="dateFrom"
            type="date"
            value={filters.dateFrom || ''}
            onChange={(e) => handleDateFromChange(e.target.value)}
            disabled={isLoading}
            className="mt-1"
          />
        </div>

        {/* Date To */}
        <div>
          <Label htmlFor="dateTo" className="text-sm font-medium text-gray-700">
            Hingga Tanggal
          </Label>
          <Input
            id="dateTo"
            type="date"
            value={filters.dateTo || ''}
            onChange={(e) => handleDateToChange(e.target.value)}
            disabled={isLoading}
            className="mt-1"
          />
        </div>

        {/* Sort By */}
        <div>
          <Label htmlFor="sortBy" className="text-sm font-medium text-gray-700">
            Urutkan Berdasarkan
          </Label>
          <Select value={filters.sortBy || 'createdAt'} onValueChange={handleSortByChange} disabled={isLoading}>
            <SelectTrigger id="sortBy" className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Tanggal Buat</SelectItem>
              <SelectItem value="quotationDate">Tanggal Quotation</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort Order */}
        <div>
          <Label htmlFor="sortOrder" className="text-sm font-medium text-gray-700">
            Urutan
          </Label>
          <Select value={filters.sortOrder || 'desc'} onValueChange={handleSortOrderChange} disabled={isLoading}>
            <SelectTrigger id="sortOrder" className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <Button onClick={handleReset} variant="outline" disabled={isLoading} className="gap-2">
          <X className="w-4 h-4" />
          Reset Filter
        </Button>
      </div>
    </div>
  )
}
