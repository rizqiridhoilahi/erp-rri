'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useChartOfAccounts } from '@/hooks/useFinance';
import { ChartOfAccountsTable } from '@/components/tables/ChartOfAccountsTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';

export default function ChartOfAccountsPage() {
  const router = useRouter();
  const { getList, delete: deleteAccount, loading, error } = useChartOfAccounts();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch accounts
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const result = await getList({
          search: search || undefined,
          page: pagination.page,
          pageSize: pagination.pageSize,
        });
        setAccounts(result.data);
        setPagination(result.pagination);
      } catch (error) {
        console.error('Error fetching accounts:', error);
      }
    };

    const timer = setTimeout(() => {
      fetchAccounts();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, pagination.page, getList]);

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus akun ini?')) return;

    setIsDeleting(true);
    try {
      await deleteAccount(id);
      setAccounts((prev) => prev.filter((item) => item.id !== id));
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
          <h1 className="text-3xl font-bold">Daftar Akun</h1>
          <p className="text-gray-600">Kelola Chart of Accounts (COA) perusahaan</p>
        </div>
        <Button
          onClick={() => router.push('/finance/chart-of-accounts/create')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Buat Akun Baru
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <Input
            placeholder="Cari kode atau nama akun..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={loading}
          />
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Akun</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 mb-4">{error}</div>}
          <ChartOfAccountsTable
            data={accounts}
            onView={(id) => router.push(`/finance/chart-of-accounts/${id}`)}
            onEdit={(id) => router.push(`/finance/chart-of-accounts/${id}`)}
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
