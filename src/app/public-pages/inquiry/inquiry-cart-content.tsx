'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useCustomerAuth } from '@/lib/hooks/use-customer-auth'
import Link from 'next/link'

interface CartItem {
  id: number
  auth_user_id: string
  barang_id: string
  quantity: number
  catatan_spesifik: string | null
  created_at: string
  barang: {
    id: string
    nama: string
    kode: string
    satuan: string
    image_url: string | null
  } | null
}

export function InquiryCartContent() {
  const router = useRouter()
  const { isLoggedIn, token, loading: authLoading } = useCustomerAuth()
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [perihal, setPerihal] = useState('')
  const [keterangan, setKeterangan] = useState('')
  const [success, setSuccess] = useState<{ nomor: string } | null>(null)
  const [error, setError] = useState('')

  const fetchCart = async () => {
    if (!token) return
    try {
      const res = await fetch('/api/v1/public/cart', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return
      const json = await res.json()
      setItems(json.data ?? [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    ;(async () => {
      if (!authLoading && isLoggedIn) await fetchCart()
      else if (!authLoading) setLoading(false)
    })()
  }, [isLoggedIn, authLoading, token])

  const handleQtyChange = async (id: number, quantity: number) => {
    if (quantity < 1) return
    if (!token) return
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i))
    await fetch(`/api/v1/public/cart/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ quantity }),
    })
  }

  const handleRemove = async (id: number) => {
    if (!token) return
    await fetch(`/api/v1/public/cart?id=${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const handleSubmit = async () => {
    if (!token) return
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/v1/public/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ perihal: perihal || undefined, keterangan: keterangan || undefined }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Gagal mengirim inquiry')
        return
      }
      setSuccess(json.data)
      setItems([])
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 pt-20">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-[#0B1528] mb-2 font-[family-name:var(--font-heading)]">Keranjang Inquiry</h1>
          <p className="text-[#64748B] mb-6 font-[family-name:var(--font-body)]">Silakan login untuk mengakses keranjang inquiry.</p>
          <Link href="/customer-login" className="inline-block bg-[#0000ff] text-white px-8 py-3 rounded-lg font-bold hover:opacity-90 transition-all font-[family-name:var(--font-body)]">
            Masuk
          </Link>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 pt-20">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-green-600 text-3xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0B1528] mb-2 font-[family-name:var(--font-heading)]">Inquiry Terkirim!</h1>
          <p className="text-[#64748B] mb-2 font-[family-name:var(--font-body)]">
            Nomor SPH: <strong className="text-[#0B1528]">{success.nomor}</strong>
          </p>
          <p className="text-[#64748B] mb-6 text-sm font-[family-name:var(--font-body)]">
            Tim kami akan memproses permintaan Anda dan menghubungi melalui WhatsApp.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/katalog" className="bg-[#0000ff] text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-all font-[family-name:var(--font-body)]">
              Lanjut Belanja
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-20 pb-12">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-[#0B1528] mb-6 font-[family-name:var(--font-heading)]">Keranjang Inquiry</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>
        )}

        {loading ? (
          <div className="text-center py-12 text-[#64748B]">Memuat keranjang...</div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <p className="text-[#64748B] mb-4 font-[family-name:var(--font-body)]">Keranjang inquiry masih kosong.</p>
            <Link href="/katalog" className="inline-block bg-[#0000ff] text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-all font-[family-name:var(--font-body)]">
              Jelajahi Katalog
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              {items.map(item => (
                <div key={item.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-[#F1F5F9] flex-shrink-0 overflow-hidden">
                    {item.barang?.image_url ? (
                      <Image src={item.barang.image_url} alt={item.barang.nama} width={64} height={64} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#94A3B8] text-xs">No img</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#0B1528] truncate font-[family-name:var(--font-body)]">{item.barang?.nama ?? 'Unknown'}</p>
                    <p className="text-xs text-[#64748B] font-[family-name:var(--font-body)]">{item.barang?.kode} | {item.barang?.satuan}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQtyChange(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-lg border border-[#CBD5E1] flex items-center justify-center hover:bg-[#F1F5F9]"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => handleQtyChange(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-lg border border-[#CBD5E1] flex items-center justify-center hover:bg-[#F1F5F9]"
                    >
                      +
                    </button>
                  </div>
                  <button onClick={() => handleRemove(item.id)} className="text-red-500 hover:text-red-700 p-2">
                    <span className="text-lg">✕</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="font-semibold text-[#0B1528] mb-4 font-[family-name:var(--font-heading)]">Detail Inquiry</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-[#0B1528] mb-1 font-[family-name:var(--font-body)]">Perihal</label>
                  <input
                    value={perihal}
                    onChange={e => setPerihal(e.target.value)}
                    className="w-full px-4 py-2.5 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff] outline-none font-[family-name:var(--font-body)]"
                    placeholder="Permintaan Penawaran untuk..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0B1528] mb-1 font-[family-name:var(--font-body)]">Keterangan Tambahan</label>
                  <textarea
                    value={keterangan}
                    onChange={e => setKeterangan(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff] outline-none font-[family-name:var(--font-body)] resize-none"
                    placeholder="Informasi tambahan untuk tim kami..."
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between bg-white rounded-xl shadow-sm p-4">
              <span className="text-sm text-[#64748B] font-[family-name:var(--font-body)]">
                {items.length} item
              </span>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-[#0000ff] text-white px-8 py-3 rounded-lg font-bold hover:opacity-90 transition-all disabled:opacity-50 font-[family-name:var(--font-body)]"
              >
                {submitting ? 'Mengirim...' : 'Kirim Inquiry'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
