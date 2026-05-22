import { supabase } from '@/lib/db/client'

export default async function AuditLogPage() {
  const { data, error } = await supabase.from('audit_log').select('*, users!user_id(email)').order('created_at', { ascending: false }).limit(100)
  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-heading font-bold">Audit Trail</h1><p className="text-muted-foreground mt-1">Riwayat perubahan data</p></div>
      {error ? <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">{error.message}</div> :
      !data?.length ? <div className="text-center py-12 border rounded-lg bg-card"><p className="text-muted-foreground">Belum ada aktivitas.</p></div> :
      <div className="rounded-lg border bg-card"><table className="w-full"><thead><tr className="border-b bg-muted/50">
        <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Waktu</th>
        <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">User</th>
        <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Aksi</th>
        <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Tabel</th>
        <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Record ID</th>
      </tr></thead><tbody className="divide-y">
        {data.map((item) => (
          <tr key={item.id} className="hover:bg-muted/30 text-sm">
            <td className="p-3 text-muted-foreground">{new Date(item.created_at).toLocaleString('id-ID')}</td>
            <td className="p-3">{item.users?.email ?? '-'}</td>
            <td className="p-3"><span className={`font-medium ${item.action === 'CREATE' ? 'text-emerald-600' : item.action === 'DELETE' ? 'text-red-600' : 'text-amber-600'}`}>{item.action}</span></td>
            <td className="p-3 font-mono text-xs">{item.table_name}</td>
            <td className="p-3 font-mono text-xs text-muted-foreground">{item.record_id}</td>
          </tr>
        ))}
      </tbody></table></div>}
    </div>
  )
}
