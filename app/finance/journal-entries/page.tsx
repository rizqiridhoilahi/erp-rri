'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useJournalEntries } from '@/hooks/useFinance';
import { JournalEntryTable } from '@/components/tables/JournalEntryTable';
import { JournalEntryFilters } from '@/components/tables/JournalEntryFilters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';

export default function JournalEntriesPage() {
  const router = useRouter();
  const { getList, delete: deleteEntry, loading, error } = useJournalEntries();
  const [entries, setEntries] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0, totalPages: 0 });
  const [filters, setFilters] = useState({
    search: undefined,
    status: 'all',
    dateFrom: undefined,
    dateTo: undefined,
    sortBy: 'entry_date',
    sortOrder: 'desc',
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch entries
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const result = await getList({
          search: filters.search,
          status: filters.status,
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
          sortBy: filters.sortBy as 'entry_date' | 'created_at',
          sortOrder: filters.sortOrder as 'asc' | 'desc',
          page: pagination.page,
          pageSize: pagination.pageSize,
        });
        setEntries(result.data);
        setPagination(result.pagination);
      } catch (error) {
        console.error('Error fetching entries:', error);
      }
    };

    fetchEntries();
  }, [filters, pagination.page, getList]);

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus jurnal ini?')) return;

    setIsDeleting(true);
    try {
      await deleteEntry(id);
      setEntries((prev) => prev.filter((item) => item.id !== id));
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Jurnal Umum</h1>
          <p className="text-gray-600">Kelola entri jurnal akuntansi</p>
        </div>
        <Button
          onClick={() => router.push('/finance/journal-entries/create')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Buat Jurnal
        </Button>
      </div>

      {/* Filters */}
      <JournalEntryFilters onFilterChange={setFilters} isLoading={loading} />

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Jurnal</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 mb-4">{error}</div>}
          <JournalEntryTable
            data={entries}
            onView={(id) => router.push(`/finance/journal-entries/${id}`)}
            onDelete={handleDelete}
            isLoading={loading || isDeleting}
          />
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <Button
            variant="outline"
            disabled={pagination.page === 1 || loading}
            onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
          >
            Previous
          </Button>
          <span>
            Halaman {pagination.page} dari {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={pagination.page === pagination.totalPages || loading}
            onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
