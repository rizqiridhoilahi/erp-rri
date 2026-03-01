'use client';

import React, { useState, useCallback } from 'react';
import { MainLayout } from '@/components/common/MainLayout';
import { PageHeader } from '@/components/common/PageHeader';
import { AdvancedSearchForm, type AdvancedSearchFormData } from '@/components/search/AdvancedSearchForm';
import { QueryBuilder } from '@/components/search/QueryBuilder';
import { SavedFiltersPanel, type SavedFilter } from '@/components/search/SavedFiltersPanel';
import { SearchHistorySidebar, type SearchHistory } from '@/components/search/SearchHistorySidebar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle,
  Zap,
  Download,
  FileText,
  Grid3x3,
} from 'lucide-react';
import { useAdvancedSearch } from '@/hooks/useAdvancedSearch';

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

const searchScopes = [
  { value: 'products', label: 'Produk' },
  { value: 'customers', label: 'Pelanggan' },
  { value: 'suppliers', label: 'Supplier' },
  { value: 'quotations', label: 'Penawaran' },
];

export default function AdvancedSearchPage() {
  const {
    results,
    totalResults,
    isLoading,
    error,
    searchHistory,
    savedFilters,
    saveFilter,
    deleteFilter,
    updateFilter,
    deleteFromHistory,
    clearHistory,
    performSearch,
    clearSearch,
  } = useAdvancedSearch();

  const [selectedTab, setSelectedTab] = useState<'form' | 'builder'>('form');
  const [currentScope, setCurrentScope] = useState('products');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const handleFormSearch = useCallback(async (data: AdvancedSearchFormData) => {
    setCurrentScope(data.searchIn);
    await performSearch(data);
  }, [performSearch]);

  const handleSelectHistory = useCallback((history: SearchHistory) => {
    if (history.filterData) {
      handleFormSearch(history.filterData);
    }
  }, [handleFormSearch]);

  const handleSelectFilter = useCallback((filter: SavedFilter) => {
    if (filter.filterData) {
      handleFormSearch(filter.filterData);
    }
  }, [handleFormSearch]);

  const handleSaveFilter = useCallback((name: string, data: AdvancedSearchFormData) => {
    saveFilter(name, data, data.searchIn);
  }, [saveFilter]);

  const getCurrentFields = () => {
    return defaultFields[currentScope as keyof typeof defaultFields] || defaultFields.products;
  };

  return (
    <MainLayout>
      <PageHeader
        title="Pencarian Lanjutan"
        description="Cari data dengan filter yang lebih detail dan fleksibel"
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Search History */}
          <SearchHistorySidebar
            history={searchHistory}
            onSelectHistory={handleSelectHistory}
            onDeleteHistory={deleteFromHistory}
            onClearHistory={clearHistory}
            isLoading={isLoading}
          />

          {/* Saved Filters */}
          <SavedFiltersPanel
            filters={savedFilters}
            onFilterSelect={handleSelectFilter}
            onFilterDelete={deleteFilter}
            onFilterUpdate={updateFilter}
            isLoading={isLoading}
          />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search Tabs */}
          <div className="space-y-6">
            <div className="flex gap-2 border-b">
              <Button
                variant={selectedTab === 'form' ? 'default' : 'ghost'}
                onClick={() => setSelectedTab('form')}
                className="rounded-b-none"
              >
                Form Pencarian
              </Button>
              <Button
                variant={selectedTab === 'builder' ? 'default' : 'ghost'}
                onClick={() => setSelectedTab('builder')}
                className="rounded-b-none"
              >
                Query Builder
              </Button>
            </div>

            {selectedTab === 'form' && (
              <AdvancedSearchForm
                onSearch={handleFormSearch}
                onSaveFilter={handleSaveFilter}
                isLoading={isLoading}
                searchScopes={searchScopes}
                availableFields={getCurrentFields()}
              />
            )}

            {selectedTab === 'builder' && (
              <QueryBuilder
                fields={getCurrentFields()}
                onQueryChange={(query) => {
                  // Convert query to search data and perform search
                  const searchData: AdvancedSearchFormData = {
                    filters: query.conditions
                      .filter((c): c is any => 'field' in c)
                      .map((c) => ({
                        field: c.field,
                        operator: c.operator,
                        value: c.value,
                        valueEnd: c.valueEnd,
                      })),
                    logicalOperator: query.logicalOperator,
                    searchIn: currentScope,
                  };
                  handleFormSearch(searchData);
                }}
              />
            )}
          </div>

          {/* Results Section */}
          <Card className="p-6 bg-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-lg">Hasil Pencarian</h3>
                {totalResults > 0 && (
                  <p className="text-sm text-slate-600">
                    Ditemukan <Badge variant="secondary">{totalResults}</Badge> hasil
                  </p>
                )}
              </div>

              {results.length > 0 && (
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
              )}
            </div>

            {/* Error State */}
            {error && (
              <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm text-red-900">Terjadi Kesalahan</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && results.length === 0 && totalResults === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <Zap className="h-12 w-12 mb-3 opacity-50" />
                <p className="text-lg font-semibold">Mulai Pencarian</p>
                <p className="text-sm">Gunakan form atau query builder di atas untuk mencari data</p>
              </div>
            )}

            {/* Results List */}
            {!isLoading && results.length > 0 && (
              <div className={viewMode === 'grid' ?
                'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' :
                'space-y-4'
              }>
                {results.map((result) => {
                  const getIcon = () => {
                    switch (currentScope) {
                      case 'products': return '📦';
                      case 'customers': return '👥';
                      case 'suppliers': return '🏭';
                      case 'quotations': return '📄';
                      default: return '📌';
                    }
                  };

                  return (
                    <Card
                      key={result.id}
                      className="p-4 border hover:border-blue-300 hover:shadow-md transition cursor-pointer"
                    >
                      <div className="flex gap-3">
                        <span className="text-2xl">{getIcon()}</span>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate text-slate-900">
                            {result.name || result.quotation_number || result.title || 'No Name'}
                          </h4>
                          <p className="text-xs text-slate-600 line-clamp-2">
                            {result.email ||
                              result.description ||
                              result.category ||
                              'No description'}
                          </p>
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {result.status && (
                              <Badge variant="outline" className="text-xs">
                                {result.status}
                              </Badge>
                            )}
                            {result.amount && (
                              <Badge className="text-xs bg-green-100 text-green-700">
                                Rp {Number(result.amount).toLocaleString('id-ID')}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
