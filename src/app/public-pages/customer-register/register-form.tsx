'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export function RegisterForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    email: '',
    password: '',
    konfirmasi_password: '',
    nama_perusahaan: '',
    penanggung_jawab_pic: '',
    no_whatsapp_pic: '',
    alamat_perusahaan: '',
    npwp_perusahaan: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.konfirmasi_password) {
      setError('Password dan konfirmasi password tidak cocok')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/v1/public/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          nama_perusahaan: form.nama_perusahaan,
          penanggung_jawab_pic: form.penanggung_jawab_pic,
          no_whatsapp_pic: form.no_whatsapp_pic,
          alamat_perusahaan: form.alamat_perusahaan,
          npwp_perusahaan: form.npwp_perusahaan || undefined,
        }),
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
          <p className="text-[#64748B] mb-6 font-[family-name:var(--font-body)]">
            Akun Anda sedang menunggu persetujuan admin. Kami akan mengirimkan notifikasi ke email <strong>{form.email}</strong> setelah akun diaktifkan.
          </p>
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
          Daftarkan perusahaan Anda untuk mengakses katalog produk dan mengajukan permintaan penawaran.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm font-[family-name:var(--font-body)]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#0B1528] mb-1 font-[family-name:var(--font-body)]">Nama Perusahaan <span className="text-red-500">*</span></label>
              <input
                name="nama_perusahaan"
                value={form.nama_perusahaan}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff] outline-none font-[family-name:var(--font-body)]"
                placeholder="PT. Contoh Abadi"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0B1528] mb-1 font-[family-name:var(--font-body)]">Email PIC <span className="text-red-500">*</span></label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff] outline-none font-[family-name:var(--font-body)]"
                placeholder="email@perusahaan.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0B1528] mb-1 font-[family-name:var(--font-body)]">Penanggung Jawab PIC <span className="text-red-500">*</span></label>
              <input
                name="penanggung_jawab_pic"
                value={form.penanggung_jawab_pic}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff] outline-none font-[family-name:var(--font-body)]"
                placeholder="Nama lengkap PIC"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0B1528] mb-1 font-[family-name:var(--font-body)]">No. WhatsApp PIC <span className="text-red-500">*</span></label>
              <input
                name="no_whatsapp_pic"
                value={form.no_whatsapp_pic}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff] outline-none font-[family-name:var(--font-body)]"
                placeholder="0812-3456-7890"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0B1528] mb-1 font-[family-name:var(--font-body)]">NPWP Perusahaan</label>
              <input
                name="npwp_perusahaan"
                value={form.npwp_perusahaan}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff] outline-none font-[family-name:var(--font-body)]"
                placeholder="XX.XXX.XXX.X-XXX.XXX"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#0B1528] mb-1 font-[family-name:var(--font-body)]">Alamat Perusahaan <span className="text-red-500">*</span></label>
              <textarea
                name="alamat_perusahaan"
                value={form.alamat_perusahaan}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-4 py-2.5 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff] outline-none font-[family-name:var(--font-body)] resize-none"
                placeholder="Jl. Contoh No. 123, Kecamatan, Kota, Provinsi"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0B1528] mb-1 font-[family-name:var(--font-body)]">Password <span className="text-red-500">*</span></label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full px-4 py-2.5 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff] outline-none font-[family-name:var(--font-body)]"
                placeholder="Minimal 8 karakter"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0B1528] mb-1 font-[family-name:var(--font-body)]">Konfirmasi Password <span className="text-red-500">*</span></label>
              <input
                name="konfirmasi_password"
                type="password"
                value={form.konfirmasi_password}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full px-4 py-2.5 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff] outline-none font-[family-name:var(--font-body)]"
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
