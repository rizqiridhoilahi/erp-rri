"use client"

import { useState, useMemo, ReactNode, useCallback } from "react"
import { Input } from "@/components/ui/input"
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/pagination"
import { EmptyState } from "@/components/empty-state"
import { TableSkeleton } from "@/components/ui/skeleton"
import { Search, RotateCcw } from "lucide-react"

export interface DataTableFilter {
  key: string
  label: string
  options: { value: string; label: string }[]
}

interface DataTableProps<T extends { id: string }> {
  data: T[]
  loading: boolean
  error: string | null
  searchFields: (keyof T)[]
  searchPlaceholder?: string
  filters?: DataTableFilter[]
  pageSize?: number
  emptyMessage?: string
  skeletonRows?: number
  skeletonCols?: number
  onReset?: () => void
  children: (items: T[]) => ReactNode
}

export function DataTable<T extends { id: string }>({
  data,
  loading,
  error,
  searchFields,
  searchPlaceholder = "Cari...",
  filters,
  pageSize = 20,
  emptyMessage,
  skeletonRows = 5,
  skeletonCols = 8,
  onReset,
  children,
}: DataTableProps<T>) {
  const [query, setQuery] = useState("")
  const [filterValues, setFilterValues] = useState<Record<string, string>>({})
  const [page, setPage] = useState(1)

  const hasActiveFilters = query.length > 0 || Object.values(filterValues).some((v) => v !== "__all__")

  const filtered = useMemo(() => {
    let result = data

    if (query && searchFields.length > 0) {
      const q = query.toLowerCase()
      result = result.filter((item) =>
        searchFields.some((field) => String(item[field] ?? "").toLowerCase().includes(q)),
      )
    }

    if (filters) {
      for (const f of filters) {
        const val = filterValues[f.key]
        if (val && val !== "__all__") {
          result = result.filter((item) => String((item as Record<string, unknown>)[f.key] ?? "") === val)
        }
      }
    }

    return result
  }, [data, query, searchFields, filters, filterValues])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const paginated = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, safePage, pageSize])

  const handlePageChange = useCallback((p: number) => {
    setPage(p)
  }, [])

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }, [])

  const handleReset = useCallback(() => {
    setQuery("")
    setFilterValues({})
    setPage(1)
    onReset?.()
  }, [onReset])

  if (error) {
    return (
      <EmptyState
        title="Gagal memuat data"
        description={error}
        action={onReset ? { label: "Coba Lagi", onClick: handleReset } : undefined}
      />
    )
  }

  if (loading) {
    return <TableSkeleton rows={skeletonRows} cols={skeletonCols} headerHidden />
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1) }}
            className="pl-9"
          />
        </div>
        {filters?.map((f) => {
          const currentVal = filterValues[f.key] ?? "__all__"
          return (
            <Select
              key={f.key}
              value={currentVal}
              onValueChange={(v) => handleFilterChange(f.key, v)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={f.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Semua {f.label}</SelectItem>
                {f.options.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )
        })}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        )}
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title={emptyMessage || "Data tidak ditemukan"}
              description={hasActiveFilters ? "Coba ubah kata kunci atau filter pencarian." : undefined}
              action={hasActiveFilters ? { label: "Reset Filter", onClick: handleReset } : undefined}
            />
          </div>
        ) : (
          <>
            {children(paginated)}
            <Pagination
              page={safePage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>

      {filtered.length > 0 && (
        <div className="text-xs text-muted-foreground text-center">
          Menampilkan {paginated.length} dari {filtered.length} data
          {filtered.length < data.length && ` (difilter dari ${data.length})`}
        </div>
      )}
    </div>
  )
}
