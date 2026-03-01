'use client';

import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/components/common/MainLayout';
import { PageHeader } from '@/components/common/PageHeader';
import { useTrialBalance } from '@/hooks/useFinance';
import { TrialBalanceTable } from '@/components/tables/TrialBalanceTable';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

export default function TrialBalancePage() {
  const { get, loading } = useTrialBalance();
  const [data, setData] = useState<any[]>([]);
  const [totals, setTotals] = useState({ total_debit: 0, total_credit: 0, difference: 0 });
  const [accountType, setAccountType] = useState<string>('all');
  const [showZeroBalance, setShowZeroBalance] = useState(false);

  // Fetch trial balance data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await get({
          account_type: accountType === 'all' ? undefined : accountType,
          showZeroBalance,
        });
        setData(result.data);
        setTotals(result.totals);
      } catch (error) {
        console.error('Error fetching trial balance:', error);
      }
    };

    const timer = setTimeout(() => {
      fetchData();
    }, 300);

    return () => clearTimeout(timer);
  }, [accountType, showZeroBalance, get]);

  return (
    <MainLayout>
      <PageHeader
        title="Neraca Saldo (Trial Balance)"
        description="Verifikasi bahwa debit total sama dengan kredit total"
      />
      <div className="space-y-6">

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="accountType">Tipe Akun</Label>
            <Select value={accountType} onValueChange={setAccountType} disabled={loading}>
              <SelectTrigger id="accountType">
                <SelectValue placeholder="Semua Tipe Akun" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe Akun</SelectItem>
                <SelectItem value="asset">Aktiva</SelectItem>
                <SelectItem value="liability">Kewajiban</SelectItem>
                <SelectItem value="equity">Modal</SelectItem>
                <SelectItem value="revenue">Pendapatan</SelectItem>
                <SelectItem value="expense">Beban</SelectItem>
                <SelectItem value="other_income">Penghasilan Lain</SelectItem>
                <SelectItem value="other_expense">Beban Lain</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="showZero"
              checked={showZeroBalance}
              onCheckedChange={(checked: boolean) => setShowZeroBalance(checked)}
              disabled={loading}
            />
            <Label htmlFor="showZero" className="font-normal cursor-pointer">
              Tampilkan akun dengan saldo nol
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Trial Balance Table */}
      <TrialBalanceTable data={data} totals={totals} isLoading={loading} />
    </div>
    </MainLayout>
  );
}
