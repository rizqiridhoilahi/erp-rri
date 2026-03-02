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
import { Customer } from '@/types/contact'
import { Edit, Trash2, MoreHorizontal, Eye, FileText, Warehouse } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface CustomerTableProps {
  customers: Customer[]
  isLoading?: boolean
  selectedCustomers: string[]
  onSelectCustomer: (id: string) => void
  onSelectAll: (select: boolean) => void
  onEdit: (customer: Customer) => void
  onDelete: (id: string) => void
  onView: (customer: Customer) => void
}

export function CustomerTable({
  customers,
  isLoading = false,
  selectedCustomers,
  onSelectCustomer,
  onSelectAll,
  onEdit,
  onDelete,
  onView,
}: CustomerTableProps) {
  const allSelected = customers.length > 0 && selectedCustomers.length === customers.length
  const someSelected = selectedCustomers.length > 0 && selectedCustomers.length < customers.length

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
      perorangan: 'Perorangan',
      bisnis: 'Bisnis',
    }
    return labels[type] || type
  }

  // Count filled storage addresses
  const countStorageAddresses = (customer: Customer): number => {
    let count = 0
    if (customer.storageAddress1) count++
    if (customer.storageAddress2) count++
    if (customer.storageAddress3) count++
    if (customer.storageAddress4) count++
    if (customer.storageAddress5) count++
    return count
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
            <TableHead>PIC</TableHead>
            <TableHead>Kontrak</TableHead>
            <TableHead>Gudang</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={12} className="py-8 text-center text-gray-500">
                Tidak ada pelanggan ditemukan
              </TableCell>
            </TableRow>
          ) : (
            customers.map((customer) => (
              <TableRow key={customer.id} className="hover:bg-gray-50">
                <TableCell>
                  <Checkbox
                    checked={selectedCustomers.includes(customer.id)}
                    onCheckedChange={() => onSelectCustomer(customer.id)}
                    disabled={isLoading}
                  />
                </TableCell>
                <TableCell className="font-mono text-sm">{customer.code}</TableCell>
                <TableCell className="max-w-xs truncate">{customer.name}</TableCell>
                <TableCell className="text-sm">{getTypeLabel(customer.type)}</TableCell>
                <TableCell className="text-sm">{customer.email}</TableCell>
                <TableCell className="text-sm">{customer.phone}</TableCell>
                <TableCell className="text-sm">{customer.city}</TableCell>
                {/* PIC - Only show for business type */}
                <TableCell className="text-sm">
                  {customer.type === 'bisnis' && customer.picName ? (
                    <div className="flex flex-col">
                      <span className="text-xs font-medium">{customer.picName}</span>
                      <span className="text-xs text-gray-500">{customer.picPhone}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                {/* Contract Status */}
                <TableCell className="text-sm">
                  {customer.type === 'bisnis' ? (
                    customer.hasContract ? (
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3 text-green-600" />
                        <span className="text-green-600">Ya</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">Tidak</span>
                    )
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                {/* Storage Addresses Count */}
                <TableCell className="text-sm">
                  {customer.type === 'bisnis' ? (
                    countStorageAddresses(customer) > 0 ? (
                      <div className="flex items-center gap-1">
                        <Warehouse className="h-3 w-3 text-blue-600" />
                        <span>{countStorageAddresses(customer)}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">0</span>
                    )
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell>{getStatusBadge(customer.status)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(customer)} className="gap-2">
                        <Eye className="h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(customer)} className="gap-2">
                        <Edit className="h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(customer.id)}
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
