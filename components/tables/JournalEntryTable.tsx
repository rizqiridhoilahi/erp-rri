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
import { MoreHorizontal, Eye, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { JournalEntry } from '@/lib/validations/finance';

interface JournalEntryTableProps {
  data: any[];
  onView: (id: string) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

const statusConfig = {
  draft: { label: 'Draft', color: 'gray' },
  posted: { label: 'Posted', color: 'green' },
  voided: { label: 'Voided', color: 'red' },
};

export function JournalEntryTable({
  data,
  onView,
  onDelete,
  isLoading = false,
}: JournalEntryTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Belum ada data jurnal</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>No. Jurnal</TableHead>
          <TableHead>Tanggal</TableHead>
          <TableHead>Deskripsi</TableHead>
          <TableHead className="text-right">Total Debit</TableHead>
          <TableHead className="text-right">Total Kredit</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-12">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((entry: any) => (
          <TableRow key={entry.id}>
            <TableCell className="font-medium">{entry.entry_no}</TableCell>
            <TableCell>
              {format(new Date(entry.entry_date), 'dd MMM yyyy', { locale: idLocale })}
            </TableCell>
            <TableCell>{entry.description}</TableCell>
            <TableCell className="text-right font-mono">
              {Number(entry.total_debit || 0).toLocaleString('id-ID', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </TableCell>
            <TableCell className="text-right font-mono">
              {Number(entry.total_credit || 0).toLocaleString('id-ID', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </TableCell>
            <TableCell>
              <Badge
                variant={
                  statusConfig[entry.status as keyof typeof statusConfig]?.color as any
                }
              >
                {statusConfig[entry.status as keyof typeof statusConfig]?.label}
              </Badge>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild disabled={isLoading}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onView(entry.id)}>
                    <Eye className="w-4 h-4 mr-2" />
                    Lihat
                  </DropdownMenuItem>
                  {entry.status === 'draft' && (
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => onDelete(entry.id)}
                      disabled={isLoading}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Hapus
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
