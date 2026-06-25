'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'

interface PicData {
  nama_pic: string
  email: string
  no_hp: string
  nama_perusahaan: string
  alamat_perusahaan: string
}

type LookupState = 'idle' | 'loading' | 'found' | 'not_found'

export function RegisterForm() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [lookupState, setLookupState] = useState<LookupState>('idle')
  const [picData, setPicData] = useState<PicData | null>(null)
  const lookupTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const doLookup = async (value: string) => {
    const trimmed = value.trim()
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setLookupState('idle')
      setPicData(null)
      return
    }

    setLookupState('loading')
    setError('')

    try {
      const res = await fetch(`/api/v1/public/auth/check-pic?email=${encodeURIComponent(trimmed)}`)
      const json = await res.json()

      if (json.data) {
        setPicData(json.data)
        setLookupState('found')
      } else {
        setPicData(null)
        setLookupState('not_found')
      }
    } catch {
      setPicData(null)
      setLookupState('not_found')
      setError('Gagal memeriksa email. Silakan coba lagi.')
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)

    if (lookupTimer.current) {
      clearTimeout(lookupTimer.current)
    }

    if (lookupState !== 'idle' && lookupState !== 'loading') {
      setLookupState('idle')
      setPicData(null)
    }
  }

  const handleEmailBlur = () => {
    if (email.trim()) {
      doLookup(email)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (lookupState !== 'found' || !picData) {
      setError('Verifikasi email PIC terlebih dahulu')
      return
    }

    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/v1/public/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Registrasi gagal')
        return
      }
      setSuccess(true)
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 pt-20">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-green-600 text-3xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0B1528] mb-2 font-[family-name:var(--font-heading)]">Registrasi Berhasil</h1>
          <p className="text-[#64748B] mb-4 font-[family-name:var(--font-body)]">
            Akun Anda sedang menunggu persetujuan admin. Kami akan mengirimkan notifikasi ke email <strong>{email}</strong> setelah akun diaktifkan.
          </p>
          {picData && (
            <p className="text-sm text-[#64748B] mb-6 font-[family-name:var(--font-body)]">
              PIC: <strong>{picData.nama_pic}</strong> &mdash; {picData.nama_perusahaan}
            </p>
          )}
          <Link
            href="/customer-login"
            className="inline-block bg-[#0000ff] text-white px-8 py-3 rounded-lg font-bold hover:opacity-90 transition-all font-[family-name:var(--font-body)]"
          >
            Kembali ke Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 pt-20">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-[#0B1528] mb-1 font-[family-name:var(--font-heading)]">Daftar Akun</h1>
        <p className="text-[#64748B] text-sm mb-6 font-[family-name:var(--font-body)]">
          Masukkan email PIC Anda untuk memulai pendaftaran.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm font-[family-name:var(--font-body)]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#0B1528] mb-1 font-[family-name:var(--font-body)]">
              Email PIC <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
                required
                className="w-full px-4 py-2.5 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff] outline-none text-[#0B1528] caret-[#0B1528] font-[family-name:var(--font-body)] pr-10"
                placeholder="email@perusahaan.com"
              />
              {lookupState === 'loading' && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-[#0000ff] border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {lookupState === 'found' && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <span className="text-green-500 text-lg">✓</span>
                </div>
              )}
            </div>
          </div>

          {lookupState === 'not_found' && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm font-[family-name:var(--font-body)]">
              Email PIC tidak ditemukan. Hubungi admin perusahaan Anda untuk didaftarkan sebagai PIC terlebih dahulu.
            </div>
          )}

          {picData && lookupState === 'found' && (
            <>
              <div className="border border-[#E2E8F0] rounded-lg p-4 space-y-3 bg-[#F8FAFC]">
                <h3 className="text-sm font-semibold text-[#0B1528] font-[family-name:var(--font-heading)]">
                  Data Perusahaan &mdash; Verifikasi Otomatis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#64748B] mb-0.5 font-[family-name:var(--font-body)]">
                      Nama PIC
                    </label>
                    <input
                      value={picData.nama_pic}
                      readOnly
                      className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-[#0B1528] text-sm font-[family-name:var(--font-body)] cursor-default"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#64748B] mb-0.5 font-[family-name:var(--font-body)]">
                      No. WhatsApp PIC
                    </label>
                    <input
                      value={picData.no_hp}
                      readOnly
                      className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-[#0B1528] text-sm font-[family-name:var(--font-body)] cursor-default"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-[#64748B] mb-0.5 font-[family-name:var(--font-body)]">
                      Nama Perusahaan
                    </label>
                    <input
                      value={picData.nama_perusahaan}
                      readOnly
                      className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-[#0B1528] text-sm font-[family-name:var(--font-body)] cursor-default"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-[#64748B] mb-0.5 font-[family-name:var(--font-body)]">
                      Alamat Perusahaan
                    </label>
                    <textarea
                      value={picData.alamat_perusahaan}
                      readOnly
                      rows={2}
                      className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-[#0B1528] text-sm font-[family-name:var(--font-body)] resize-none cursor-default"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#0B1528] mb-1 font-[family-name:var(--font-body)]">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full px-4 py-2.5 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff] outline-none text-[#0B1528] caret-[#0B1528] font-[family-name:var(--font-body)]"
                    placeholder="Minimal 8 karakter"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0B1528] mb-1 font-[family-name:var(--font-body)]">
                    Konfirmasi Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full px-4 py-2.5 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff] outline-none text-[#0B1528] caret-[#0B1528] font-[family-name:var(--font-body)]"
                    placeholder="Ulangi password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0000ff] text-white py-3 rounded-lg font-bold hover:opacity-90 transition-all disabled:opacity-50 font-[family-name:var(--font-body)] mt-2"
              >
                {loading ? 'Memproses...' : 'Daftar Sekarang'}
              </button>
            </>
          )}

          {lookupState === 'idle' && (
            <p className="text-center text-xs text-[#94A3B8] font-[family-name:var(--font-body)]">
              Masukkan email PIC lalu klik di luar field untuk verifikasi.
            </p>
          )}
        </form>

        <p className="text-center text-sm text-[#64748B] mt-6 font-[family-name:var(--font-body)]">
          Sudah punya akun?{' '}
          <Link href="/customer-login" className="text-[#0000ff] font-medium hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  )
}
