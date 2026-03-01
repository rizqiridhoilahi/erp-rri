import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TrialBalanceTableProps {
  data: any[];
  totals?: {
    total_debit: number;
    total_credit: number;
    difference: number;
  };
  isLoading?: boolean;
}

const accountTypeConfig: { [key: string]: { label: string; color: string } } = {
  asset: { label: 'Aktiva', color: 'blue' },
  liability: { label: 'Kewajiban', color: 'orange' },
  equity: { label: 'Modal', color: 'purple' },
  revenue: { label: 'Pendapatan', color: 'green' },
  expense: { label: 'Beban', color: 'red' },
  other_income: { label: 'Penghasilan Lain', color: 'teal' },
  other_expense: { label: 'Beban Lain', color: 'pink' },
};

export function TrialBalanceTable({
  data,
  totals,
  isLoading = false,
}: TrialBalanceTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Belum ada data neraca saldo</p>
      </div>
    );
  }

  const finalTotals = totals || {
    total_debit: 0,
    total_credit: 0,
    difference: 0,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Neraca Saldo (Trial Balance)</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Kode Akun</TableHead>
              <TableHead>Nama Akun</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead className="text-right">Saldo Awal</TableHead>
              <TableHead className="text-right">Debit</TableHead>
              <TableHead className="text-right">Kredit</TableHead>
              <TableHead className="text-right">Saldo Akhir</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row: any, index: number) => (
              <TableRow key={index}>
                <TableCell className="font-mono font-semibold">{row.account_code}</TableCell>
                <TableCell>{row.account_name}</TableCell>
                <TableCell>
                  <Badge variant={accountTypeConfig[row.account_type]?.color as any}>
                    {accountTypeConfig[row.account_type]?.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono">
                  {Number(row.opening_balance || 0).toLocaleString('id-ID', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {row.debit_balance > 0
                    ? Number(row.debit_balance).toLocaleString('id-ID', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : '-'}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {row.credit_balance > 0
                    ? Number(row.credit_balance).toLocaleString('id-ID', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : '-'}
                </TableCell>
                <TableCell className="text-right font-mono font-semibold">
                  {Number(row.balance || 0).toLocaleString('id-ID', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Totals Row */}
        <div className="mt-4 space-y-2">
          <div className="grid grid-cols-4 gap-4 p-3 bg-blue-50 rounded font-semibold border border-blue-200">
            <div></div>
            <div className="text-right">Total Debit:</div>
            <div className="text-right font-mono">
              {Number(finalTotals.total_debit).toLocaleString('id-ID', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <div className="text-right"></div>
          </div>

          <div className="grid grid-cols-4 gap-4 p-3 bg-green-50 rounded font-semibold border border-green-200">
            <div></div>
            <div className="text-right">Total Kredit:</div>
            <div className="text-right font-mono">
              {Number(finalTotals.total_credit).toLocaleString('id-ID', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <div className="text-right"></div>
          </div>

          <div
            className={`grid grid-cols-4 gap-4 p-3 rounded font-semibold border ${
              finalTotals.difference < 0.01
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            <div></div>
            <div className="text-right">Selisih:</div>
            <div className="text-right font-mono">
              {Number(finalTotals.difference).toLocaleString('id-ID', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <div className="text-right"></div>
          </div>

          {finalTotals.difference < 0.01 && (
            <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm font-semibold">
              ✓ Neraca saldo seimbang (Debit = Kredit)
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
