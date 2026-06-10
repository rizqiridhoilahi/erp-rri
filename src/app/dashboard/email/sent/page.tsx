"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { supabase } from "@/lib/db/client"
import { EmailList, EmailItem, mapEmailLogRow } from "@/components/email/email-list"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Loader2 } from "lucide-react"

const PAGE_SIZE = 50

export default function SentPage() {
  const [emails, setEmails] = useState<EmailItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const fetchPage = useCallback(async (pageNum: number, append: boolean) => {
    const start = (pageNum - 1) * PAGE_SIZE
    const end = start + PAGE_SIZE - 1

    if (append) setLoadingMore(true)

    const { data, error } = await supabase
      .from("email_log")
      .select("*")
      .in("status", ["sent", "delivered", "opened", "clicked", "bounced", "failed"])
      .neq("status", "trashed")
      .order("created_at", { ascending: false })
      .range(start, end)

    if (!error && data) {
      const mapped = data.map(mapEmailLogRow)
      if (append) {
        setEmails((prev) => [...prev, ...mapped])
      } else {
        setEmails(mapped)
      }
      setHasMore(data.length === PAGE_SIZE)
    }

    if (append) setLoadingMore(false)
    else setLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPage(1, false)
  }, [fetchPage])

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchPage(nextPage, true)
  }

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
        {Array.from({ length: 6 }).map((_, i) => (
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
            placeholder="Cari email by subject atau penerima..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      <EmailList emails={filteredEmails} basePath="/dashboard/email" />

      {hasMore && searchQuery === "" && (
        <div className="flex justify-center py-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Memuat...
              </>
            ) : (
              "Muat lebih banyak"
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
