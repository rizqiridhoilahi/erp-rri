import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/api/auth"
import { supabaseAdmin } from "@/lib/api/supabase-server"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(request)
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 })

  try {
    const { id } = await params

    // Get current record including previous_status
    const { data: email } = await supabaseAdmin
      .from("email_log")
      .select("status, previous_status")
      .eq("id", id)
      .maybeSingle()

    if (!email) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 })
    }

    if (email.status !== "trashed") {
      return NextResponse.json({ error: "Email is not in trash" }, { status: 400 })
    }

    // Restore to previous_status, fall back to 'sent' if not set
    const restoredStatus = email.previous_status || "sent"

    const now = new Date().toISOString()
    const { error } = await supabaseAdmin
      .from("email_log")
      .update({ status: restoredStatus, previous_status: null, updated_at: now })
      .eq("id", id)
      .eq("status", "trashed")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: { status: restoredStatus } })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to restore email"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
