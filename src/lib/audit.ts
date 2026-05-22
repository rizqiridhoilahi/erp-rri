import { supabaseAdmin } from '@/lib/api/supabase-server'

export async function logAudit(params: {
  userId?: string
  action: 'CREATE' | 'UPDATE' | 'DELETE'
  tableName: string
  recordId: string
  changes?: Record<string, unknown>
}) {
  try {
    await supabaseAdmin.from('audit_log').insert({
      user_id: params.userId ?? null,
      action: params.action,
      table_name: params.tableName,
      record_id: params.recordId,
      changes: params.changes ?? null,
    })
  } catch (err) {
    console.error('Audit log failed:', err)
  }
}
