"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/db/client"
import { Loader2 } from "lucide-react"

interface Activity {
  id: string
  action: string
  changes: Record<string, unknown> | null
  created_at: string
  users: { email: string } | null
}

interface ActivityTimelineProps {
  tableName: string
  recordId: string
}

export function ActivityTimeline({ tableName, recordId }: ActivityTimelineProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from("audit_log")
      .select("id, action, changes, created_at, users!user_id(email)")
      .eq("table_name", tableName)
      .eq("record_id", recordId)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (data) {
          setActivities(data.map((r: Record<string, unknown>) => ({
            id: r.id as string,
            action: r.action as string,
            changes: r.changes as Record<string, unknown> | null,
            created_at: r.created_at as string,
            users: Array.isArray(r.users) ? (r.users[0] as { email: string } | null) : (r.users as { email: string } | null),
          })))
        }
        setLoading(false)
      })
  }, [tableName, recordId])

  if (loading) return <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Memuat riwayat...</div>
  if (!activities.length) return <p className="text-sm text-muted-foreground py-4">Belum ada aktivitas.</p>

  return (
    <div className="relative space-y-0">
      {activities.map((item, i) => {
        const isFirst = i === activities.length - 1
        const actionLabel = item.action === "CREATE" ? "Dibuat" : item.action === "UPDATE" ? "Diperbarui" : item.action === "DELETE" ? "Dihapus" : item.action
        const color = item.action === "CREATE" ? "text-emerald-600 border-emerald-500" : item.action === "DELETE" ? "text-red-600 border-red-500" : "text-amber-600 border-amber-500"

        return (
          <div key={item.id} className="flex gap-4 pb-6 last:pb-0">
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full border-2 ${color} bg-background shrink-0 mt-1.5`} />
              {!isFirst && <div className="w-px flex-1 bg-border" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{actionLabel}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(item.created_at).toLocaleString("id-ID")}
                </span>
              </div>
              {item.users?.email && (
                <p className="text-xs text-muted-foreground">oleh {item.users.email}</p>
              )}
              {item.changes && item.action === "UPDATE" && (
                <div className="mt-1 text-xs text-muted-foreground">
                  {Object.entries(item.changes as Record<string, { old: unknown; new: unknown }>).slice(0, 3).map(([field, val]) => (
                    <span key={field} className="block">
                      {field}: {String(val.old ?? "-")} → {String(val.new ?? "-")}
                    </span>
                  ))}
                  {Object.keys(item.changes).length > 3 && (
                    <span className="text-muted-foreground/60">...dan {Object.keys(item.changes).length - 3} perubahan lain</span>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
