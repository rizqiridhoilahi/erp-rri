'use client'

import { ImportRow, ImportEntityType } from '@/lib/validations/import-export'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface ImportPreviewTableProps {
  data: ImportRow[]
  entityType: ImportEntityType
}

export function ImportPreviewTable({ data, entityType }: ImportPreviewTableProps) {
  // Get column headers based on entity type
  const getColumns = (type: ImportEntityType): string[] => {
    switch (type) {
      case 'products':
        return ['SKU', 'Nama', 'Brand', 'Kategori', 'Harga Beli', 'Harga Jual', 'Stok', 'Satuan', 'Status']
      case 'customers':
        return ['Nama', 'Email', 'Telepon', 'Alamat', 'Kota', 'Provinsi', 'NPWP', 'CP']
      case 'suppliers':
        return ['Nama', 'Email', 'Telepon', 'Alamat', 'Kota', 'Provinsi', 'Bank', 'Rekening', 'Pemilik', 'CP']
      default:
        return Object.keys(data[0]?.data || {})
    }
  }

  // Get data key mapping
  const getDataKeys = (type: ImportEntityType): string[] => {
    switch (type) {
      case 'products':
        return ['sku', 'name', 'brand', 'category', 'purchase_price', 'selling_price', 'stock', 'unit', 'status']
      case 'customers':
        return ['name', 'email', 'phone', 'address', 'city', 'province', 'tax_id', 'contact_person']
      case 'suppliers':
        return ['name', 'email', 'phone', 'address', 'city', 'province', 'bank_name', 'bank_account', 'bank_holder', 'contact_person']
      default:
        return Object.keys(data[0]?.data || {})
    }
  }

  const columns = getColumns(entityType)
  const dataKeys = getDataKeys(entityType)

  // Format cell value
  const formatValue = (value: string | undefined, key: string): string => {
    if (value === undefined || value === '') return '-'
    
    // Format currency
    if (key.includes('price') || key.includes('amount')) {
      const num = Number(value)
      if (!isNaN(num)) {
        return new Intl.NumberFormat('id-ID', { 
          style: 'currency', 
          currency: 'IDR',
          minimumFractionDigits: 0 
        }).format(num)
      }
    }
    
    return value
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Tidak ada data valid untuk ditampilkan
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="w-12">No</TableHead>
            {columns.map((col, idx) => (
              <TableHead key={idx}>{col}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.rowNumber} className="hover:bg-gray-50">
              <TableCell className="font-medium">{row.rowNumber}</TableCell>
              {dataKeys.map((key, idx) => (
                <TableCell key={idx}>
                  {formatValue(row.data[key], key)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
