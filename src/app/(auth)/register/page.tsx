"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/db/client'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Eye, EyeOff, User, Mail, Lock, AlertCircle, Check, X, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const registerSchema = z.object({
  name: z.string().min(2, { message: 'Nama minimal 2 karakter' }),
  email: z.string().email({ message: 'Email tidak valid' }),
  password: z.string().min(6, { message: 'Password minimal 6 karakter' }),
  role: z.enum(['owner', 'admin', 'manager', 'sales', 'procurement', 'gudang', 'finance', 'hr'], {
    message: 'Pilih role yang valid',
  }),
})

type RegisterFormValues = z.infer<typeof registerSchema>

const roleLabels: Record<string, string> = {
  owner: 'Owner',
  admin: 'Admin',
  manager: 'Manager',
  sales: 'Sales',
  procurement: 'Procurement',
  gudang: 'Gudang',
  finance: 'Finance',
  hr: 'HR',
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: 'Minimal 6 karakter', test: password.length >= 6 },
    { label: 'Mengandung huruf besar', test: /[A-Z]/.test(password) },
    { label: 'Mengandung huruf kecil', test: /[a-z]/.test(password) },
    { label: 'Mengandung angka', test: /\d/.test(password) },
  ]
  const strength = checks.filter((c) => c.test).length

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              level <= strength
                ? strength <= 1
                  ? 'bg-destructive'
                  : strength <= 2
                  ? 'bg-warning'
                  : strength <= 3
                  ? 'bg-chart-3'
                  : 'bg-success'
                : 'bg-muted'
            }`}
          />
        ))}
      </div>
      <ul className="space-y-1">
        {checks.map((check) => (
          <li key={check.label} className="flex items-center gap-2 text-xs">
            {check.test ? (
              <Check className="h-3 w-3 text-success" />
            ) : (
              <X className="h-3 w-3 text-muted-foreground" />
            )}
            <span className={check.test ? 'text-foreground' : 'text-muted-foreground'}>
              {check.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  })

  const password = watch('password', '')

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user }, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      })

      if (authError) {
        setError(authError.message)
        return
      }

      const { error: dbError } = await supabase.from('users').insert({
        id: user?.id,
        email: data.email,
        name: data.name,
        role: data.role,
        is_active: true,
      })

      if (dbError) {
        setError(dbError.message)
        return
      }

      router.push('/login?registered=true')
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-border/50 shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)]">
      <CardHeader className="space-y-1 pb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center lg:hidden">
            <UserPlus className="h-4 w-4 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-heading font-bold">Daftar</CardTitle>
        </div>
        <CardDescription>
          Buat akun baru untuk mengakses ERP RRI
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div
              role="alert"
              className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20 flex items-center gap-2"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Nama Lengkap
            </Label>
            <div className="relative">
              <Input
                id="name"
                type="text"
                placeholder="Nama lengkap Anda"
                autoComplete="name"
                autoFocus
                {...register('name')}
                aria-invalid={!!errors.name}
                className="h-12 pl-10 rounded-lg bg-muted/50 focus:bg-background transition-all duration-200"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                <User className="h-5 w-5" />
              </div>
            </div>
            {errors.name && (
              <p className="text-sm font-medium text-destructive flex items-center gap-1" role="alert">
                <AlertCircle className="h-3 w-3" /> {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Email
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                autoComplete="email"
                {...register('email')}
                aria-invalid={!!errors.email}
                className="h-12 pl-10 rounded-lg bg-muted/50 focus:bg-background transition-all duration-200"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                <Mail className="h-5 w-5" />
              </div>
            </div>
            {errors.email && (
              <p className="text-sm font-medium text-destructive flex items-center gap-1" role="alert">
                <AlertCircle className="h-3 w-3" /> {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="new-password"
                {...register('password')}
                aria-invalid={!!errors.password}
                className="h-12 pl-10 rounded-lg bg-muted/50 focus:bg-background transition-all duration-200"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                <Lock className="h-5 w-5" />
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                tabIndex={-1}
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm font-medium text-destructive flex items-center gap-1" role="alert">
                <AlertCircle className="h-3 w-3" /> {errors.password.message}
              </p>
            )}
            {password && <PasswordStrength password={password} />}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Role
            </Label>
            <Select
              onValueChange={(value) => setValue('role', value as RegisterFormValues['role'])}
            >
              <SelectTrigger id="role" aria-invalid={!!errors.role} className="h-12 rounded-lg bg-muted/50">
                <SelectValue placeholder="Pilih role" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(roleLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm font-medium text-destructive flex items-center gap-1" role="alert">
                <AlertCircle className="h-3 w-3" /> {errors.role.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 text-base font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 transition-all duration-200"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Memproses...
              </>
            ) : (
              'Daftar'
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex-col space-y-3">
        <div className="text-sm text-muted-foreground text-center w-full">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-accent font-medium hover:underline underline-offset-4">
            Masuk disini
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
