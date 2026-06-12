"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { toast } from "sonner"
import { Paperclip, InboxIcon, MessageSquare, Check, Trash2, RotateCcw, AlertTriangle, ListChecks } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getAuthToken } from "@/lib/api/client"

export interface EmailItem {
  id: string
  fromEmail?: string | null
  fromNama?: string | null
  toEmail: string
  toNama?: string | null
  cc?: string | null
  subject: string
  body?: string | null
  status: string
  hasAttachments?: boolean | null
  createdAt: string
  deliveredAt?: string | null
  openedAt?: string | null
  clickedAt?: string | null
  inbound?: boolean | null
  threadId?: string | null
}

export function mapEmailLogRow(row: Record<string, unknown>): EmailItem {
  return {
    id: row.id as string,
    fromEmail: row.from_email as string | null | undefined,
    fromNama: row.from_nama as string | null | undefined,
    toEmail: row.to_email as string,
    toNama: row.to_nama as string | null | undefined,
    cc: row.cc as string | null | undefined,
    subject: row.subject as string,
    body: row.body as string | null | undefined,
    status: row.status as string,
    hasAttachments: row.has_attachments as boolean | null | undefined,
    createdAt: row.created_at as string,
    deliveredAt: row.delivered_at as string | null | undefined,
    openedAt: row.opened_at as string | null | undefined,
    clickedAt: row.clicked_at as string | null | undefined,
    inbound: row.inbound as boolean | null | undefined,
    threadId: row.thread_id as string | null | undefined,
  }
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning"> = {
  sent: "warning",
  delivered: "success",
  opened: "default",
  clicked: "default",
  failed: "destructive",
  bounced: "destructive",
  trashed: "destructive",
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return ""
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return ""
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return format(date, "HH:mm")
  if (days < 7) return format(date, "EEE HH:mm", { locale: id })
  return format(date, "dd MMM yyyy", { locale: id })
}

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return parts[0][0].toUpperCase()
  }
  return (email?.[0] ?? "?").toUpperCase()
}

function getAvatarColor(seed: string): string {
  const colors = [
    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
    "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
    "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
    "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  ]
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

function AvatarCircle({ name, email, className }: { name?: string | null; email?: string | null; className?: string }) {
  const seed = name || email || "?"
  return (
    <div
      className={cn(
        "w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0",
        getAvatarColor(seed),
        className,
      )}
    >
      {getInitials(name, email)}
    </div>
  )
}

interface ThreadGroup {
  threadId: string
  emails: EmailItem[]
}

function normalizeSubject(subject: string): string {
  let s = subject
  while (/^(Re|Fwd|Aw|Fw)\s*:\s*/i.test(s)) {
    s = s.replace(/^(Re|Fwd|Aw|Fw)\s*:\s*/i, '')
  }
  return s.trim().toLowerCase()
}

function groupThreads(emails: EmailItem[]): ThreadGroup[] {
  const map = new Map<string, EmailItem[]>()

  for (const email of [...emails].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())) {
    let tid = email.threadId || email.id

    if (!map.has(tid)) {
      const normSubj = normalizeSubject(email.subject)
      if (normSubj) {
        for (const [existingId, existingEmails] of map) {
          if (normalizeSubject(existingEmails[0].subject) !== normSubj) continue
          const participants = new Set([existingEmails[0].fromEmail, existingEmails[0].toEmail].filter(Boolean))
          const overlaps = [email.fromEmail, email.toEmail].filter(Boolean).some(p => participants.has(p))
          if (overlaps) {
            tid = existingId
            break
          }
        }
      }
    }

    if (!map.has(tid)) map.set(tid, [])
    map.get(tid)!.push(email)
  }

  return Array.from(map.entries())
    .map(([threadId, items]) => ({
      threadId,
      emails: items.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    }))
    .sort((a, b) => {
      const aLatest = new Date(a.emails[a.emails.length - 1].createdAt).getTime()
      const bLatest = new Date(b.emails[b.emails.length - 1].createdAt).getTime()
      return bLatest - aLatest
    })
}

function EmailThreadRow({ thread, path, selectedIds, toggleSelect, selectMode }: { thread: ThreadGroup; path: string; selectedIds: Set<string>; toggleSelect: (id: string) => void; selectMode?: boolean }) {
  const pathname = usePathname()
  const latest = thread.emails[thread.emails.length - 1]
  const isUnread = latest.inbound
    ? (latest.status === 'delivered' && !latest.openedAt)
    : (latest.status === 'sent')
  const isCurrent = pathname === `${path}/${latest.id}`
  const isSelected = selectedIds.has(thread.threadId)

  return (
    <Link
      key={thread.threadId}
      href={`${path}/${latest.id}`}
      className={cn(
        "relative rounded-l-none rounded-r-[30px] transition-all border shadow-md block",
        "before:absolute before:inset-y-0 before:left-0 before:w-[10px] before:[clip-path:polygon(0_0,100%_0,30%_100%,0_100%)]",
        isCurrent
          ? "before:bg-gradient-to-b before:from-ring before:to-transparent border-ring bg-primary/[0.08]"
          : isSelected
            ? "before:bg-primary/40 border-primary/50 bg-primary/[0.05]"
            : "before:bg-primary/20 border-foreground/30 bg-card hover:border-foreground/50",
      )}
    >
      <div className="flex items-start gap-3 pl-3 pr-4 py-4 cursor-pointer">
        <div className="flex items-center gap-1.5 shrink-0">
          {selectMode && (
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                toggleSelect(thread.threadId)
              }}
              className={cn(
                "h-4 w-4 rounded shrink-0 border transition-colors flex items-center justify-center mt-1",
                isSelected
                  ? "bg-primary border-primary text-primary-foreground"
                  : "border-foreground/30 hover:border-foreground/50",
              )}
              aria-label="Select thread"
            >
              {isSelected && <Check className="h-3 w-3" />}
            </button>
          )}
          <AvatarCircle name={latest.fromNama || latest.toNama} email={latest.fromEmail || latest.toEmail} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                "font-heading text-base text-primary",
                isUnread ? "font-semibold" : "font-medium",
              )}
            >
              {latest.inbound
                ? (latest.fromNama || latest.fromEmail || latest.toEmail)
                : (latest.toNama || latest.toEmail)}
            </span>
            <span className="text-sm text-foreground">
              {latest.inbound ? "to" : "from"}{" "}
              <span className="font-medium text-amber-600 dark:text-amber-400">
                {latest.inbound ? latest.toEmail : (latest.fromEmail || latest.toEmail)}
              </span>
            </span>
            <Badge variant={statusVariant[latest.status] ?? "outline"} className="text-sm px-2 py-0.5">
              {latest.status}
            </Badge>
            {latest.hasAttachments && <Paperclip className="h-3 w-3 shrink-0 text-muted-foreground" />}
            {thread.emails.length > 1 && (
              <span className="flex items-center gap-1 text-sm font-bold text-success shrink-0">
                <MessageSquare className="h-3.5 w-3.5" strokeWidth={2.5} />
                {thread.emails.length}
              </span>
            )}
          </div>
          <p
            className={cn(
              "truncate text-sm text-[#D946EF] mt-0.5",
              isUnread ? "font-medium" : "",
            )}
          >
            {latest.subject}
          </p>
          <div className="flex items-center gap-2 text-sm font-medium text-primary mt-0.5">
            <span>{formatDate(latest.createdAt)}</span>
            {latest.cc && <span>CC: {latest.cc}</span>}
          </div>
          <p className="truncate text-sm font-medium text-foreground mt-0.5">
            {latest.body?.replace(/<[^>]*>/g, "").slice(0, 100) || ""}
          </p>
        </div>
      </div>
    </Link>
  )
}

export function EmailList({
  emails,
  basePath,
  onRefresh,
  isFirstPage,
}: {
  emails: EmailItem[]
  basePath?: string
  onRefresh?: () => void
  isFirstPage?: boolean
}) {
  const path = basePath ?? "/dashboard/email"
  const pathname = usePathname()
  const isTrash = pathname.includes("/trash")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [actionLoading, setActionLoading] = useState(false)

  const [selectMode, setSelectMode] = useState(false)
  const threads = groupThreads(emails)

  function handleSelectAll() {
    setSelectedIds(new Set(threads.map((t) => t.threadId)))
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function getSelectedEmailIds(): string[] {
    return threads
      .filter((t) => selectedIds.has(t.threadId))
      .flatMap((t) => t.emails.map((e) => e.id))
  }

  async function handleBulkTrash() {
    const token = await getAuthToken()
    if (!token) return
    const emailIds = getSelectedEmailIds()
    const toastId = toast.loading(`Memindahkan ${emailIds.length} email ke Trash...`)
    setActionLoading(true)
    const results = await Promise.allSettled(
      emailIds.map((id) =>
        fetch(`/api/v1/email/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }),
      ),
    )
    setActionLoading(false)
    setSelectedIds(new Set())
    const ok = results.filter((r) => r.status === "fulfilled" && (r.value as Response).ok).length
    if (ok === emailIds.length) {
      toast.success(`${ok} email dipindahkan ke Trash`, { id: toastId })
      onRefresh?.()
    } else {
      toast.error(`${emailIds.length - ok} dari ${emailIds.length} email gagal dipindahkan`, { id: toastId })
    }
  }

  async function handleBulkRestore() {
    const token = await getAuthToken()
    if (!token) return
    const emailIds = getSelectedEmailIds()
    const toastId = toast.loading(`Mengembalikan ${emailIds.length} email...`)
    setActionLoading(true)
    const results = await Promise.allSettled(
      emailIds.map((id) =>
        fetch(`/api/v1/email/${id}/restore`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }),
      ),
    )
    setActionLoading(false)
    setSelectedIds(new Set())
    const ok = results.filter((r) => r.status === "fulfilled" && (r.value as Response).ok).length
    if (ok === emailIds.length) {
      toast.success(`${ok} email dikembalikan`, { id: toastId })
      onRefresh?.()
    } else {
      toast.error(`${emailIds.length - ok} dari ${emailIds.length} email gagal dikembalikan`, { id: toastId })
    }
  }

  async function handleBulkPurge() {
    const token = await getAuthToken()
    if (!token) return
    const emailIds = getSelectedEmailIds()
    const toastId = toast.loading(`Menghapus permanen ${emailIds.length} email...`)
    setActionLoading(true)
    const results = await Promise.allSettled(
      emailIds.map((id) =>
        fetch(`/api/v1/email/${id}/purge`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }),
      ),
    )
    setActionLoading(false)
    setSelectedIds(new Set())
    const ok = results.filter((r) => r.status === "fulfilled" && (r.value as Response).ok).length
    if (ok === emailIds.length) {
      toast.success(`${ok} email dihapus permanen`, { id: toastId })
      onRefresh?.()
    } else {
      toast.error(`${emailIds.length - ok} dari ${emailIds.length} email gagal dihapus`, { id: toastId })
    }
  }

  if (emails.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed rounded-lg bg-muted/20">
        <InboxIcon className="mx-auto h-8 w-8 text-muted-foreground/60 mb-2" />
        <p className="text-sm font-medium text-muted-foreground">Tidak ada email</p>
      </div>
    )
  }

  return (
    <div className="space-y-[10px]">
      {!selectMode && selectedIds.size === 0 && (
        <div className="flex justify-end pr-4">
          <Button
            variant="outline"
            size="sm"
            className="mr-2 bg-success border-success text-white hover:bg-success/90"
            onClick={() => setSelectMode(true)}
          >
            <ListChecks className="mr-1 h-3.5 w-3.5" />
            Select
          </Button>
        </div>
      )}
      {selectMode && isFirstPage && (
        <div className="flex justify-end pr-4">
          <Button
            variant="outline"
            size="sm"
            className="bg-success border-success text-white hover:bg-success/90"
            onClick={handleSelectAll}
          >
            <Check className="mr-1 h-3.5 w-3.5" />
            Select All
          </Button>
        </div>
      )}
      {selectedIds.size > 0 && (
        <div className="sticky top-0 z-20 bg-card border border-foreground/30 rounded-none shadow-md p-3 flex items-center gap-3">
          <span className="text-sm font-medium text-foreground min-w-fit">
            {selectedIds.size} selected
          </span>
          <div className="flex-1" />
          {isTrash ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkRestore}
                disabled={actionLoading}
              >
                <RotateCcw className="mr-1 h-3.5 w-3.5" />
                Restore
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkPurge}
                disabled={actionLoading}
              >
                <AlertTriangle className="mr-1 h-3.5 w-3.5" />
                Delete Permanently
              </Button>
            </>
          ) : (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkTrash}
              disabled={actionLoading}
            >
              <Trash2 className="mr-1 h-3.5 w-3.5" />
              Move to Trash
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedIds(new Set())
              setSelectMode(false)
            }}
            className="bg-zinc-700 text-foreground hover:bg-zinc-600 px-4"
          >
            Cancel
          </Button>
        </div>
      )}
      {threads.map((thread) => (
        <EmailThreadRow key={thread.threadId} thread={thread} path={path} selectedIds={selectedIds} toggleSelect={toggleSelect} selectMode={selectMode} />
      ))}
    </div>
  )
}
