import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface GeneralLedgerTableProps {
  accountInfo?: any;
  data: any[];
  isLoading?: boolean;
}

export function GeneralLedgerTable({
  accountInfo,
  data,
  isLoading = false,
}: GeneralLedgerTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Belum ada transaksi untuk akun ini</p>
      </div>
    );
  }

  // Calculate running balance
  let runningBalance = accountInfo?.opening_balance || 0;
  const enrichedData = data.map((item: any) => {
    const debit = item.debit || 0;
    const credit = item.credit || 0;

    // Determine balance direction based on account type
    if (
      accountInfo?.account_type === 'asset' ||
      accountInfo?.account_type === 'expense' ||
      accountInfo?.account_type === 'other_expense'
    ) {
      runningBalance += debit - credit;
    } else {
      runningBalance += credit - debit;
    }

    return { ...item, running_balance: runningBalance };
  });

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex justify-between items-center">
          <span>Buku Besar - {accountInfo?.account_code} {accountInfo?.account_name}</span>
          <span className="text-sm font-normal text-gray-600">
            Saldo Awal: {Number(accountInfo?.opening_balance || 0).toLocaleString('id-ID', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>No. Jurnal</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead className="text-right">Debit</TableHead>
              <TableHead className="text-right">Kredit</TableHead>
              <TableHead className="text-right">Saldo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enrichedData.map((item: any, index: number) => (
              <TableRow key={index}>
                <TableCell>
                  {format(new Date(item.entry_date), 'dd MMM yyyy', { locale: idLocale })}
                </TableCell>
                <TableCell className="font-mono font-semibold">{item.entry_no}</TableCell>
                <TableCell>
                  <div className="text-sm">{item.entry_description}</div>
                  {item.line_description && (
                    <div className="text-xs text-gray-500">{item.line_description}</div>
                  )}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {item.debit > 0
                    ? Number(item.debit).toLocaleString('id-ID', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : '-'}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {item.credit > 0
                    ? Number(item.credit).toLocaleString('id-ID', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : '-'}
                </TableCell>
                <TableCell className="text-right font-mono font-semibold">
                  {Number(item.running_balance).toLocaleString('id-ID', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Summary */}
        <div className="mt-4 p-3 bg-gray-50 rounded border flex justify-between">
          <span className="font-semibold">Saldo Akhir:</span>
          <span className="font-mono font-semibold">
            {Number(enrichedData[enrichedData.length - 1]?.running_balance || 0).toLocaleString(
              'id-ID',
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            )}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
