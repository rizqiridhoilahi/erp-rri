'use client';

import React, { useEffect, useState } from 'react';
import { useChartOfAccounts, useGeneralLedger } from '@/hooks/useFinance';
import { GeneralLedgerTable } from '@/components/tables/GeneralLedgerTable';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function GeneralLedgerPage() {
  const { getList } = useChartOfAccounts();
  const { getByAccount, loading } = useGeneralLedger();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [glData, setGlData] = useState<any[]>([]);
  const [accountInfo, setAccountInfo] = useState<any>(null);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 0 });
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Fetch accounts
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const result = await getList({ pageSize: 100 });
        setAccounts(result.data);
        // Select first account by default
        if (result.data.length > 0 && !selectedAccountId) {
          setSelectedAccountId(result.data[0].id);
        }
      } catch (error) {
        console.error('Error fetching accounts:', error);
      }
    };
    fetchAccounts();
  }, [getList]);

  // Fetch GL data when account changes
  useEffect(() => {
    if (!selectedAccountId) return;

    const fetchGLData = async () => {
      try {
        const result = await getByAccount({
          account_id: selectedAccountId,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          sortBy: 'entry_date',
          sortOrder: 'asc',
          page: pagination.page,
          pageSize: pagination.pageSize,
        });
        setGlData(result.data);
        setAccountInfo(result.account);
        setPagination(result.pagination);
      } catch (error) {
        console.error('Error fetching GL data:', error);
      }
    };

    fetchGLData();
  }, [selectedAccountId, dateFrom, dateTo, pagination.page, getByAccount]);

  const handleAccountChange = (accountId: string) => {
    setSelectedAccountId(accountId);
    setPagination({ page: 1, pageSize: 20, total: 0, totalPages: 0 });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Buku Besar (General Ledger)</h1>
        <p className="text-gray-600">Lihat detail transaksi untuk setiap akun</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="account">Pilih Akun *</Label>
            <Select value={selectedAccountId} onValueChange={handleAccountChange} disabled={loading}>
              <SelectTrigger id="account">
                <SelectValue placeholder="Pilih akun" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.account_code} - {account.account_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dateFrom">Dari Tanggal</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="dateTo">Sampai Tanggal</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                disabled={loading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* GL Table */}
      {selectedAccountId && (
        <>
          <GeneralLedgerTable
            accountInfo={accountInfo}
            data={glData}
            isLoading={loading}
          />

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
        </>
      )}
    </div>
  );
}
