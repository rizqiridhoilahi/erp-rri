import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/api/auth"
import { supabaseAdmin } from "@/lib/api/supabase-server"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(request)
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 })

  try {
    const { id } = await params

    // First get current status to store as previous_status
    const { data: email } = await supabaseAdmin
      .from("email_log")
      .select("status")
      .eq("id", id)
      .maybeSingle()

    if (!email) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 })
    }

    const now = new Date().toISOString()
    const { error } = await supabaseAdmin
      .from("email_log")
      .update({ status: "trashed", previous_status: email.status, updated_at: now })
      .eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: { status: "trashed" } })
  } catch (err) {
    console.error('[EMAIL:id] Trash failed:', { error: err instanceof Error ? err.stack : err })
    const message = err instanceof Error ? err.message : "Failed to trash email"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
