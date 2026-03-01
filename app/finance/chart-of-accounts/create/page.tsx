'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useChartOfAccounts } from '@/hooks/useFinance';
import { ChartOfAccountForm } from '@/components/forms/ChartOfAccountForm';
import { ChartOfAccount } from '@/lib/validations/finance';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function CreateChartOfAccountPage() {
  const router = useRouter();
  const { create, loading, error } = useChartOfAccounts();
  const { getList } = useChartOfAccounts();
  const [parentOptions, setParentOptions] = useState<any[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const fetchParentAccounts = async () => {
      try {
        const result = await getList({ pageSize: 100 });
        setParentOptions(result.data);
      } catch (error) {
        console.error('Error fetching parent accounts:', error);
      }
    };
    fetchParentAccounts();
  }, [getList]);

  const handleSubmit = async (data: ChartOfAccount) => {
    setSubmitError(null);
    try {
      await create(data);
      router.push('/finance/chart-of-accounts');
    } catch (error: any) {
      setSubmitError(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Buat Akun Baru</h1>
        <p className="text-gray-600">Tambahkan akun baru ke Chart of Accounts</p>
      </div>

      {submitError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      <ChartOfAccountForm
        parentOptions={parentOptions}
        onSubmit={handleSubmit}
        isLoading={loading}
      />
    </div>
  );
}
