"use client"
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/use-auth'
import { apiFetch } from '@/lib/api/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/page-header'
import { toast } from 'sonner'
import { User, Shield, KeyRound } from 'lucide-react'
import { ROLE_LABELS } from '@/types/role'

export default function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [name, setName] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const mountedRef = useRef(false)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    if (user?.name) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(user.name)
    }
  }, [user])

  const handleUpdateProfile = async () => {
    if (!name.trim()) { toast.error('Nama tidak boleh kosong'); return }
    setSubmitting(true)
    try {
      await apiFetch(`/api/v1/users/${user?.id}`, {
        method: 'PUT',
        body: JSON.stringify({ name }),
      })
      toast.success('Profil berhasil diperbarui')
    } catch { toast.error('Gagal memperbarui profil') }
    finally { setSubmitting(false) }
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) { toast.error('Konfirmasi password tidak cocok'); return }
    if (newPassword.length < 6) { toast.error('Password minimal 6 karakter'); return }
    setSubmitting(true)
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      const supabase = createClient(supabaseUrl, supabaseAnonKey)
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw new Error(error.message)
      toast.success('Password berhasil diubah')
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Gagal mengubah password')
    } finally { setSubmitting(false) }
  }

  if (!user) return null

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <PageHeader title="Pengaturan Profil" description="Kelola informasi akun dan password" />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informasi Akun
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user.email ?? ''} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <div className="h-10 flex items-center">
                <Badge variant="outline" className="text-sm">
                  <Shield className="h-3.5 w-3.5 mr-1" />
                  {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] ?? user.role}
                </Badge>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Nama</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama lengkap" />
          </div>
          <Button onClick={handleUpdateProfile} disabled={submitting}>
            {submitting ? 'Menyimpan...' : 'Simpan Profil'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            Ubah Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Password Baru</Label>
            <Input
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              type="password"
              placeholder="Minimal 6 karakter"
            />
          </div>
          <div className="space-y-2">
            <Label>Konfirmasi Password Baru</Label>
            <Input
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type="password"
              placeholder="Ketik ulang password baru"
            />
          </div>
          <Button onClick={handleChangePassword} disabled={submitting || !newPassword}>
            {submitting ? 'Menyimpan...' : 'Ubah Password'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
