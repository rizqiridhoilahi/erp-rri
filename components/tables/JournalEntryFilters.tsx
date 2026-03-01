import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { X } from 'lucide-react';

interface JournalEntryFiltersProps {
  onFilterChange: (filters: any) => void;
  isLoading?: boolean;
}

const statusOptions = [
  { value: 'all', label: 'Semua Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'posted', label: 'Posted' },
  { value: 'voided', label: 'Voided' },
];

const sortByOptions = [
  { value: 'entry_date', label: 'Tanggal Jurnal' },
  { value: 'created_at', label: 'Dibuat' },
];

export function JournalEntryFilters({
  onFilterChange,
  isLoading = false,
}: JournalEntryFiltersProps) {
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState('all');
  const [dateFrom, setDateFrom] = React.useState('');
  const [dateTo, setDateTo] = React.useState('');
  const [sortBy, setSortBy] = React.useState('entry_date');
  const [sortOrder, setSortOrder] = React.useState('desc');

  const handleFilterChange = (
    newSearch: string,
    newStatus: string,
    newDateFrom: string,
    newDateTo: string,
    newSortBy: string,
    newSortOrder: string
  ) => {
    onFilterChange({
      search: newSearch || undefined,
      status: newStatus,
      dateFrom: newDateFrom || undefined,
      dateTo: newDateTo || undefined,
      sortBy: newSortBy,
      sortOrder: newSortOrder,
      page: 1,
    });
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    handleFilterChange(value, status, dateFrom, dateTo, sortBy, sortOrder);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    handleFilterChange(search, value, dateFrom, dateTo, sortBy, sortOrder);
  };

  const handleDateFromChange = (value: string) => {
    setDateFrom(value);
    handleFilterChange(search, status, value, dateTo, sortBy, sortOrder);
  };

  const handleDateToChange = (value: string) => {
    setDateTo(value);
    handleFilterChange(search, status, dateFrom, value, sortBy, sortOrder);
  };

  const handleSortByChange = (value: string) => {
    setSortBy(value);
    handleFilterChange(search, status, dateFrom, dateTo, value, sortOrder);
  };

  const handleSortOrderChange = (value: string) => {
    setSortOrder(value);
    handleFilterChange(search, status, dateFrom, dateTo, sortBy, value);
  };

  const handleReset = () => {
    setSearch('');
    setStatus('all');
    setDateFrom('');
    setDateTo('');
    setSortBy('entry_date');
    setSortOrder('desc');
    onFilterChange({
      search: undefined,
      status: 'all',
      dateFrom: undefined,
      dateTo: undefined,
      sortBy: 'entry_date',
      sortOrder: 'desc',
      page: 1,
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Search */}
          <div>
            <Label htmlFor="search">Cari Jurnal</Label>
            <Input
              id="search"
              placeholder="No. Jurnal atau Deskripsi"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={handleStatusChange} disabled={isLoading}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dateFrom">Dari Tanggal</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => handleDateFromChange(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="dateTo">Sampai Tanggal</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => handleDateToChange(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Sort */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sortBy">Urutkan Berdasarkan</Label>
              <Select value={sortBy} onValueChange={handleSortByChange} disabled={isLoading}>
                <SelectTrigger id="sortBy">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortByOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sortOrder">Urutan</Label>
              <Select value={sortOrder} onValueChange={handleSortOrderChange} disabled={isLoading}>
                <SelectTrigger id="sortOrder">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending (↑)</SelectItem>
                  <SelectItem value="desc">Descending (↓)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reset Button */}
          {(search || status !== 'all' || dateFrom || dateTo) && (
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={isLoading}
              className="w-full"
            >
              <X className="w-4 h-4 mr-2" />
              Reset Filter
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
