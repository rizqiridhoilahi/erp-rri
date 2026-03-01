'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { MoreHorizontal, Eye, Edit2, Trash2, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Quotation } from '@/lib/validations/quotation'

interface QuotationTableProps {
  quotations: Quotation[]
  isLoading?: boolean
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onSelectionChange?: (selectedIds: string[]) => void
}

const statusConfig = {
  draft: { label: 'Draft', className: 'bg-gray-100 text-gray-800' },
  sent: { label: 'Sent', className: 'bg-blue-100 text-blue-800' },
  accepted: { label: 'Accepted', className: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800' },
  expired: { label: 'Expired', className: 'bg-yellow-100 text-yellow-800' },
}

export function QuotationTable({
  quotations,
  isLoading,
  onView,
  onEdit,
  onDelete,
  onSelectionChange,
}: QuotationTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const toggleSelect = (id: string) => {
    const newSelected = selectedIds.includes(id)
      ? selectedIds.filter((item) => item !== id)
      : [...selectedIds, id]
    setSelectedIds(newSelected)
    onSelectionChange?.(newSelected)
  }

  const toggleSelectAll = () => {
    const newSelected = selectedIds.length === quotations.length ? [] : quotations.map((q) => q.id)
    setSelectedIds(newSelected)
    onSelectionChange?.(newSelected)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="mb-4">Loading...</div>
          <div className="text-sm text-gray-500">Memuat data quotation...</div>
        </div>
      </div>
    )
  }

  if (quotations.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 border rounded-lg bg-gray-50">
        <div className="text-center">
          <div className="mb-2 text-lg font-medium text-gray-700">Belum ada data quotation</div>
          <p className="text-sm text-gray-500">Mulai dengan membuat quotation baru</p>
        </div>
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-12">
              <Checkbox
                checked={selectedIds.length === quotations.length && quotations.length > 0}
                onCheckedChange={toggleSelectAll}
              />
            </TableHead>
            <TableHead>No. Quotation</TableHead>
            <TableHead>Pelanggan</TableHead>
            <TableHead>Tgl Quotation</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotations.map((quotation) => (
            <TableRow key={quotation.id} className="hover:bg-gray-50">
              <TableCell>
                <Checkbox
                  checked={selectedIds.includes(quotation.id)}
                  onCheckedChange={() => toggleSelect(quotation.id)}
                />
              </TableCell>
              <TableCell className="font-medium">{quotation.quotationNo}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{quotation.customerName}</span>
                </div>
              </TableCell>
              <TableCell>
                {format(new Date(quotation.quotationDate), 'dd MMM yyyy', {
                  locale: idLocale,
                })}
              </TableCell>
              <TableCell className="text-right font-medium">
                {quotation.totalAmount.toLocaleString('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  maximumFractionDigits: 0,
                })}
              </TableCell>
              <TableCell>
                <Badge
                  className={`${
                    statusConfig[quotation.status as keyof typeof statusConfig]?.className
                  } rounded-full`}
                >
                  {statusConfig[quotation.status as keyof typeof statusConfig]?.label}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView?.(quotation.id)}>
                      <Eye className="w-4 h-4 mr-2" />
                      Lihat Detail
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit?.(quotation.id)}>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete?.(quotation.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
