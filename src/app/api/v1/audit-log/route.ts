import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { verifyAuth } from '@/lib/api/auth'
import { internalError } from '@/lib/api/errors'

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error

  const { searchParams } = new URL(request.url)
  const tableName = searchParams.get('table_name')
  const recordId = searchParams.get('record_id')

  if (!tableName || !recordId) {
    return NextResponse.json({ error: 'table_name and record_id are required' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('audit_log')
    .select('id, action, changes, created_at, users!user_id(email)')
    .eq('table_name', tableName)
    .eq('record_id', recordId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) return internalError(error)

  const activities = (data ?? []).map((r: Record<string, unknown>) => ({
    id: r.id as string,
    action: r.action as string,
    changes: r.changes as Record<string, unknown> | null,
    created_at: r.created_at as string,
    users: Array.isArray(r.users) ? (r.users[0] as { email: string } | null) : (r.users as { email: string } | null),
  }))

  return NextResponse.json({ data: activities })
}
