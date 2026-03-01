'use client';

import React, { useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  X,
  Search,
  RotateCw,
} from 'lucide-react';

// Define filter condition schema
const FilterConditionSchema = z.object({
  field: z.string().min(1, 'Field is required'),
  operator: z.enum(['equals', 'contains', 'startsWith', 'endsWith', 'greaterThan', 'lessThan', 'between']),
  value: z.string().min(1, 'Value is required'),
  valueEnd: z.string().optional(), // For 'between' operator
});

const AdvancedSearchFormSchema = z.object({
  filters: z.array(FilterConditionSchema),
  logicalOperator: z.enum(['AND', 'OR']),
  searchIn: z.string().min(1, 'Search scope is required'),
});

export type AdvancedSearchFormData = z.infer<typeof AdvancedSearchFormSchema>;

interface AdvancedSearchFormProps {
  onSearch: (data: AdvancedSearchFormData) => void;
  isLoading?: boolean;
  searchScopes?: { value: string; label: string }[];
  availableFields?: { value: string; label: string }[];
  onSaveFilter?: (name: string, data: AdvancedSearchFormData) => void;
}

const defaultSearchScopes = [
  { value: 'products', label: 'Produk' },
  { value: 'customers', label: 'Pelanggan' },
  { value: 'suppliers', label: 'Supplier' },
  { value: 'quotations', label: 'Penawaran' },
];

const defaultFields = {
  products: [
    { value: 'name', label: 'Nama Produk' },
    { value: 'category', label: 'Kategori' },
    { value: 'brand', label: 'Merek' },
    { value: 'price', label: 'Harga' },
    { value: 'stock', label: 'Stok' },
    { value: 'sku', label: 'SKU' },
  ],
  customers: [
    { value: 'name', label: 'Nama' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Telepon' },
    { value: 'city', label: 'Kota' },
    { value: 'status', label: 'Status' },
  ],
  suppliers: [
    { value: 'name', label: 'Nama' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Telepon' },
    { value: 'city', label: 'Kota' },
    { value: 'rating', label: 'Rating' },
  ],
  quotations: [
    { value: 'quotation_number', label: 'No. Penawaran' },
    { value: 'customer_name', label: 'Nama Pelanggan' },
    { value: 'status', label: 'Status' },
    { value: 'amount', label: 'Jumlah' },
    { value: 'created_at', label: 'Tanggal' },
  ],
};

const operatorLabels: Record<string, string> = {
  equals: 'Sama dengan',
  contains: 'Mengandung',
  startsWith: 'Dimulai dengan',
  endsWith: 'Berakhir dengan',
  greaterThan: 'Lebih besar dari',
  lessThan: 'Lebih kecil dari',
  between: 'Antara',
};

export function AdvancedSearchForm({
  onSearch,
  isLoading = false,
  searchScopes = defaultSearchScopes,
  availableFields,
  onSaveFilter,
}: AdvancedSearchFormProps) {
  const [saveFilterName, setSaveFilterName] = useState('');
  const [selectedScope, setSelectedScope] = useState(searchScopes[0]?.value || 'products');
  const [filters, setFilters] = useState<any[]>([
    { id: '1', field: '', operator: 'contains', value: '', valueEnd: '' }
  ]);
  const [logicalOperator, setLogicalOperator] = useState<'AND' | 'OR'>('AND');

  const currentFields = availableFields || 
    (defaultFields[selectedScope as keyof typeof defaultFields] || defaultFields.products);

  const handleAddFilter = () => {
    setFilters([
      ...filters,
      { 
        id: `${Date.now()}-${Math.random()}`,
        field: '', 
        operator: 'contains', 
        value: '', 
        valueEnd: '' 
      }
    ]);
  };

  const handleRemoveFilter = (id: string) => {
    if (filters.length > 1) {
      setFilters(filters.filter(f => f.id !== id));
    }
  };

  const handleUpdateFilter = (id: string, updates: any) => {
    setFilters(filters.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const handleScopeChange = (value: string) => {
    setSelectedScope(value);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validFilters = filters.filter(f => f.field && f.value);
    onSearch({ 
      filters: validFilters, 
      logicalOperator, 
      searchIn: selectedScope 
    });
  };

  const handleSaveFilter = () => {
    if (saveFilterName.trim()) {
      onSaveFilter?.(saveFilterName, { 
        filters, 
        logicalOperator, 
        searchIn: selectedScope 
      });
      setSaveFilterName('');
    }
  };

  return (
    <Card className="w-full p-6 bg-white">
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Search Scope */}
        <div>
          <label className="font-semibold block mb-2">Cari Di</label>
          <Select value={selectedScope} onValueChange={handleScopeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih ruang pencarian" />
            </SelectTrigger>
            <SelectContent>
              {searchScopes.map((scope) => (
                <SelectItem key={scope.value} value={scope.value}>
                  {scope.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Filter Kondisi</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddFilter}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Tambah Filter
            </Button>
          </div>

          {filters.map((filter, index) => (
            <div key={filter.id} className="space-y-3 p-4 border rounded-lg bg-slate-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {index > 0 && (
                    <Badge variant="secondary">
                      {logicalOperator}
                    </Badge>
                  )}
                </div>
                {filters.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFilter(filter.id)}
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-12 gap-3">
                {/* Field */}
                <div className="col-span-3">
                  <label className="text-sm font-medium block mb-1">Field</label>
                  <Select
                    value={filter.field}
                    onValueChange={(value) => handleUpdateFilter(filter.id, { field: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih field" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentFields.map((f) => (
                        <SelectItem key={f.value} value={f.value}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Operator */}
                <div className="col-span-3">
                  <label className="text-sm font-medium block mb-1">Operator</label>
                  <Select
                    value={filter.operator}
                    onValueChange={(value) => handleUpdateFilter(filter.id, { operator: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih operator" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(operatorLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Value */}
                <div className={filter.operator === 'between' ? 'col-span-3' : 'col-span-6'}>
                  <label className="text-sm font-medium block mb-1">Nilai</label>
                  <Input
                    placeholder="Masukkan nilai"
                    value={filter.value}
                    onChange={(e) => handleUpdateFilter(filter.id, { value: e.target.value })}
                  />
                </div>

                {/* Value End (for between operator) */}
                {filter.operator === 'between' && (
                  <div className="col-span-3">
                    <label className="text-sm font-medium block mb-1">Sampai</label>
                    <Input
                      placeholder="Nilai akhir"
                      value={filter.valueEnd}
                      onChange={(e) => handleUpdateFilter(filter.id, { valueEnd: e.target.value })}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Logical Operator */}
        {filters.length > 1 && (
          <div>
            <label className="font-semibold block mb-2">Operator Logika</label>
            <Select
              value={logicalOperator}
              onValueChange={(value) => setLogicalOperator(value as 'AND' | 'OR')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih operator logika" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AND">AND (Semua kondisi)</SelectItem>
                <SelectItem value="OR">OR (Salah satu kondisi)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-slate-600 mt-2">
              AND: Semua filter harus cocok | OR: Salah satu filter harus cocok
            </p>
          </div>
        )}

        {/* Save Filter */}
        {onSaveFilter && (
          <div className="flex gap-2">
            <Input
              placeholder="Nama filter untuk disimpan"
              value={saveFilterName}
              onChange={(e) => setSaveFilterName(e.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveFilter}
            >
              Simpan Filter
            </Button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="gap-2"
          >
            <Search className="h-4 w-4" />
            {isLoading ? 'Mencari...' : 'Cari'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setFilters([{ id: '1', field: '', operator: 'contains', value: '', valueEnd: '' }]);
              setLogicalOperator('AND');
            }}
            className="gap-2"
          >
            <RotateCw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </form>
    </Card>
  );
}
