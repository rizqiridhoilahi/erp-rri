'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export function LoginForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/v1/public/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Login gagal')
        return
      }
      localStorage.setItem('customer_token', json.data.access_token)
      localStorage.setItem('customer_refresh_token', json.data.refresh_token)
      router.push('/portal')
      router.refresh()
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 pt-20">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-[#0B1528] mb-1 font-[family-name:var(--font-heading)]">Masuk</h1>
        <p className="text-[#64748B] text-sm mb-6 font-[family-name:var(--font-body)]">
          Masuk ke portal klien untuk mengakses katalog dan mengajukan permintaan penawaran.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm font-[family-name:var(--font-body)]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#0B1528] mb-1 font-[family-name:var(--font-body)]">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff] outline-none text-[#0B1528] caret-[#0B1528] font-[family-name:var(--font-body)]"
              placeholder="email@perusahaan.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#0B1528] mb-1 font-[family-name:var(--font-body)]">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff] outline-none text-[#0B1528] caret-[#0B1528] font-[family-name:var(--font-body)]"
              placeholder="Masukkan password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0000ff] text-white py-3 rounded-lg font-bold hover:opacity-90 transition-all disabled:opacity-50 font-[family-name:var(--font-body)]"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <p className="text-center text-sm text-[#64748B] mt-6 font-[family-name:var(--font-body)]">
          Belum punya akun?{' '}
          <Link href="/customer-register" className="text-[#0000ff] font-medium hover:underline">
            Daftar
          </Link>
        </p>
      </div>
    </div>
  )
}
