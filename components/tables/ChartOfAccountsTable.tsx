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
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';
import { ChartOfAccount } from '@/lib/validations/finance';

interface ChartOfAccountsTableProps {
  data: ChartOfAccount[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
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

export function ChartOfAccountsTable({
  data,
  onView,
  onEdit,
  onDelete,
  isLoading = false,
}: ChartOfAccountsTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Belum ada data akun</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Kode Akun</TableHead>
          <TableHead>Nama Akun</TableHead>
          <TableHead>Tipe</TableHead>
          <TableHead className="text-right">Saldo Awal</TableHead>
          <TableHead className="text-right">Saldo</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-12">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((account: any) => (
          <TableRow key={account.id}>
            <TableCell className="font-mono font-semibold">{account.account_code}</TableCell>
            <TableCell>{account.account_name}</TableCell>
            <TableCell>
              <Badge variant={accountTypeConfig[account.account_type]?.color as any}>
                {accountTypeConfig[account.account_type]?.label}
              </Badge>
            </TableCell>
            <TableCell className="text-right font-mono">
              {Number(account.opening_balance || 0).toLocaleString('id-ID', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </TableCell>
            <TableCell className="text-right font-mono">
              {Number(account.balance || 0).toLocaleString('id-ID', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </TableCell>
            <TableCell>
              <Badge variant={account.status === 'active' ? 'default' : 'secondary'}>
                {account.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
              </Badge>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild disabled={isLoading}>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onView(account.id)}>
                    <Eye className="w-4 h-4 mr-2" />
                    Lihat
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(account.id)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => onDelete(account.id)}
                    disabled={isLoading}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Hapus
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
