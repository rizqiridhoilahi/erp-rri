'use client'

import { ImportRow } from '@/lib/validations/import-export'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AlertCircle } from 'lucide-react'

interface ImportErrorReportProps {
  data: ImportRow[]
}

export function ImportErrorReport({ data }: ImportErrorReportProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Tidak ada error untuk ditampilkan
      </div>
    )
  }

  return (
    <div className="border border-red-200 rounded-lg overflow-hidden bg-red-50">
      <Table>
        <TableHeader className="bg-red-100">
          <TableRow>
            <TableHead className="w-16 text-red-800">Baris</TableHead>
            <TableHead className="text-red-800">Error</TableHead>
            <TableHead className="text-red-800">Data</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.rowNumber} className="bg-white">
              <TableCell className="font-medium text-red-600">
                {row.rowNumber}
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  {row.errors.map((error, idx) => (
                    <div key={idx} className="flex items-center gap-1 text-red-600 text-sm">
                      <AlertCircle className="h-3 w-3 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(row.data).map(([key, value]) => (
                    value && (
                      <div key={key} className="flex gap-2">
                        <span className="text-gray-400">{key}:</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    )
                  ))}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
