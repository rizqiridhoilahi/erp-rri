"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { supabase } from "@/lib/db/client"
import { EmailList, EmailItem, mapEmailLogRow } from "@/components/email/email-list"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

const PAGE_SIZE = 50

export default function TrashPage() {
  const [emails, setEmails] = useState<EmailItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [totalPages, setTotalPages] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)

  const fetchPage = useCallback(async (pageNum: number, append: boolean) => {
    const start = (pageNum - 1) * PAGE_SIZE
    const end = start + PAGE_SIZE - 1

    if (append) setLoadingMore(true)
    else setLoading(true)

    const [{ data, error }, { data: allData }] = await Promise.all([
      supabase
        .from("email_log")
        .select("*", { count: "exact" })
        .eq("status", "trashed")
        .order("updated_at", { ascending: false })
        .range(start, end),
      supabase
        .from("email_log")
        .select("*", { count: "exact", head: true })
        .eq("status", "trashed"),
    ])

    if (!error && data) {
      const mapped = data.map(mapEmailLogRow)
      if (append) {
        setEmails((prev) => [...prev, ...mapped])
      } else {
        setEmails(mapped)
      }
      setHasMore(data.length === PAGE_SIZE)
    }

    const totalCount = allData?.length ?? 0
    setTotalPages(Math.ceil(totalCount / PAGE_SIZE) || 1)

    if (append) setLoadingMore(false)
    else setLoading(false)
  }, [])

  const goToPage = useCallback((n: number) => {
    setPage(n)
    fetchPage(n, false)
  }, [fetchPage])

  const handleRefresh = useCallback(() => {
    setPage(1)
    setHasMore(true)
    setRefreshKey((k) => k + 1)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPage(1, false)
  }, [fetchPage, refreshKey])

  const filteredEmails = useMemo(() => {
    if (!searchQuery.trim()) return emails
    const q = searchQuery.toLowerCase()
    return emails.filter(
      (e) =>
        e.subject.toLowerCase().includes(q) ||
        (e.fromEmail && e.fromEmail.toLowerCase().includes(q)) ||
        (e.fromNama && e.fromNama.toLowerCase().includes(q)),
    )
  }, [emails, searchQuery])

  if (loading) {
    return (
      <div className="divide-y divide-border p-4 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-2 w-2 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="px-4 pt-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari email by subject atau pengirim..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      <EmailList emails={filteredEmails} basePath="/dashboard/email" onRefresh={handleRefresh} isFirstPage={page === 1} />

      {searchQuery === "" && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 py-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
          >
            Prev
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
