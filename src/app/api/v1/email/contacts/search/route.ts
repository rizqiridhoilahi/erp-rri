import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/api/auth"
import { supabaseAdmin } from "@/lib/api/supabase-server"

function escapeForLike(value: string): string {
  return value.replace(/'/g, "''").replace(/%/g, "\\%").replace(/_/g, "\\_")
}

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q")?.trim()

  if (!q || q.length < 2) {
    return NextResponse.json({ data: [] })
  }

  try {
    const { data: pics, error } = await supabaseAdmin
      .from("customer_pic")
      .select(`
        id,
        nama,
        email,
        no_hp,
        customer_id,
        customer:customer_id ( nama, kode )
      `)
      .eq("is_active", true)
      .or(`nama.ilike.%${escapeForLike(q)}%,email.ilike.%${escapeForLike(q)}%`)
      .limit(10)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const results = (pics || []).map((pic) => ({
      id: pic.id,
      nama: pic.nama,
      email: pic.email,
      noHp: pic.no_hp,
      customerNama: (pic.customer as { nama?: string } | null)?.nama ?? null,
      customerKode: (pic.customer as { kode?: string } | null)?.kode ?? null,
    }))

    return NextResponse.json({ data: results })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to search contacts"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
