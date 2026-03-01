'use client'

import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Supplier } from '@/types/contact'
import { Edit, Trash2, MoreHorizontal, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface SupplierTableProps {
  suppliers: Supplier[]
  isLoading?: boolean
  selectedSuppliers: string[]
  onSelectSupplier: (id: string) => void
  onSelectAll: (select: boolean) => void
  onEdit: (supplier: Supplier) => void
  onDelete: (id: string) => void
  onView: (supplier: Supplier) => void
}

export function SupplierTable({
  suppliers,
  isLoading = false,
  selectedSuppliers,
  onSelectSupplier,
  onSelectAll,
  onEdit,
  onDelete,
  onView,
}: SupplierTableProps) {
  const allSelected = suppliers.length > 0 && selectedSuppliers.length === suppliers.length
  const someSelected = selectedSuppliers.length > 0 && selectedSuppliers.length < suppliers.length

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      inactive: 'secondary',
    }
    const labels: Record<string, string> = {
      active: 'Aktif',
      inactive: 'Tidak Aktif',
    }
    return (
      <Badge variant={variants[status] || 'outline'}>
        {labels[status] || status}
      </Badge>
    )
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      local: 'Lokal',
      international: 'Internasional',
    }
    return labels[type] || type
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(checked) => onSelectAll(checked === true)}
                disabled={isLoading}
              />
            </TableHead>
            <TableHead>Kode</TableHead>
            <TableHead>Nama</TableHead>
            <TableHead>Tipe</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Telepon</TableHead>
            <TableHead>Kota</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="py-8 text-center text-gray-500">
                Tidak ada supplier ditemukan
              </TableCell>
            </TableRow>
          ) : (
            suppliers.map((supplier) => (
              <TableRow key={supplier.id} className="hover:bg-gray-50">
                <TableCell>
                  <Checkbox
                    checked={selectedSuppliers.includes(supplier.id)}
                    onCheckedChange={() => onSelectSupplier(supplier.id)}
                    disabled={isLoading}
                  />
                </TableCell>
                <TableCell className="font-mono text-sm">{supplier.code}</TableCell>
                <TableCell className="max-w-xs truncate">{supplier.name}</TableCell>
                <TableCell className="text-sm">{getTypeLabel(supplier.type)}</TableCell>
                <TableCell className="text-sm">{supplier.email}</TableCell>
                <TableCell className="text-sm">{supplier.phone}</TableCell>
                <TableCell className="text-sm">{supplier.city}</TableCell>
                <TableCell>{getStatusBadge(supplier.status)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(supplier)} className="gap-2">
                        <Eye className="h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(supplier)} className="gap-2">
                        <Edit className="h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(supplier.id)}
                        className="gap-2 text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
