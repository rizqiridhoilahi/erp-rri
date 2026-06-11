import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/api/auth"
import { supabaseAdmin } from "@/lib/api/supabase-server"
import { deleteFile } from "@/lib/email/r2-client"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(request)
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 })

  try {
    const { id } = await params

    // Fetch attachment R2 keys before cascade delete removes the records
    const { data: attachments } = await supabaseAdmin
      .from("email_attachments")
      .select("file_url")
      .eq("email_id", id)

    // Delete files from R2 (best-effort, continue even if some fail)
    if (attachments && attachments.length > 0) {
      const results = await Promise.allSettled(
        attachments.map((att) =>
          att.file_url ? deleteFile(att.file_url) : Promise.resolve()
        )
      )
      const failures = results.filter(r => r.status === 'rejected')
      if (failures.length > 0) {
        console.error('[PURGE] R2 delete failures:', {
          emailId: id,
          failures: failures.map(r => r.status === 'rejected' ? (r.reason?.message || r.reason) : null),
          attempted: attachments.map(a => a.file_url),
        })
      }
    }

    const { error } = await supabaseAdmin
      .from("email_log")
      .delete()
      .eq("id", id)
      .eq("status", "trashed")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: { success: true } })
  } catch (err) {
    console.error('[EMAIL:purge] Delete failed:', { error: err instanceof Error ? err.stack : err })
    const message = err instanceof Error ? err.message : "Failed to permanently delete email"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
