'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useCustomerAuth } from '@/lib/hooks/use-customer-auth'
import Link from 'next/link'
import { ShoppingCart, Trash2, Minus, Plus, Package, CheckCircle, ArrowLeft, Send, AlertCircle, FileText, Loader2 } from 'lucide-react'

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

function CartSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white rounded-xl p-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-lg bg-slate-200 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 rounded w-3/4" />
            <div className="h-3 bg-slate-200 rounded w-1/3" />
          </div>
          <div className="h-8 w-24 bg-slate-200 rounded-lg" />
        </div>
      ))}
    </div>
  )
}

export function InquiryCartContent() {
  const router = useRouter()
  const { isLoggedIn, token, loading: authLoading } = useCustomerAuth()
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [perihal, setPerihal] = useState('')
  const [keterangan, setKeterangan] = useState('')
  const [success, setSuccess] = useState<{ nomor: string; nomor_rfq_customer: string } | null>(null)
  const [error, setError] = useState('')
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())
  const [perihalError, setPerihalError] = useState(false)

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
    if (!perihal.trim()) { setPerihalError(true); return }
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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0369A1]" />
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F8FAFC] to-white flex items-center justify-center px-4 pt-20">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-slate-100 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-[#0369A1]/10 flex items-center justify-center mx-auto mb-5">
            <ShoppingCart className="h-8 w-8 text-[#0369A1]" />
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A] mb-2 font-['Rubik']">Keranjang Inquiry</h1>
          <p className="text-[#475569] mb-8 font-['Nunito_Sans']">Silakan login untuk mengakses keranjang inquiry.</p>
          <Link
            href="/customer-login"
            className="inline-flex items-center gap-2 bg-[#0369A1] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#0284C7] transition-all duration-200 shadow-sm hover:shadow-md font-['Nunito_Sans'] cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Masuk
          </Link>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F0F9FF] to-white flex items-center justify-center px-4 pt-20">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-slate-100 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A] mb-2 font-['Rubik']">Inquiry Terkirim!</h1>
          <div className="bg-[#F8FAFC] rounded-xl p-4 mb-4 space-y-3 text-left">
            <div>
              <label className="block text-xs text-[#475569] mb-1 font-['Nunito_Sans']">Nomor RFQC</label>
              <input
                readOnly
                value={success.nomor}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-[#0F172A] font-['Nunito_Sans'] cursor-default"
              />
            </div>
            <div>
              <label className="block text-xs text-[#475569] mb-1 font-['Nunito_Sans']">Nomor RFQC Ref</label>
              <input
                readOnly
                value={success.nomor_rfq_customer}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-[#0F172A] font-['Nunito_Sans'] cursor-default"
              />
            </div>
          </div>
          <p className="text-[#475569] mb-8 text-sm font-['Nunito_Sans']">
            Tim kami akan memproses permintaan Anda dan menghubungi melalui WhatsApp.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/katalog"
              className="inline-flex items-center gap-2 bg-[#0369A1] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#0284C7] transition-all duration-200 shadow-sm hover:shadow-md font-['Nunito_Sans'] cursor-pointer"
            >
              <ShoppingCart className="h-4 w-4" />
              Lanjut Belanja
            </Link>
            <Link
              href="/public-pages/portal/sph-history"
              className="inline-flex items-center justify-center gap-2 text-[#0369A1] text-sm font-semibold hover:underline font-['Nunito_Sans']"
            >
              <FileText className="h-4 w-4" />
              Lihat Status Inquiry →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FAFC] to-white pt-20 pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] font-['Rubik']">Keranjang Inquiry</h1>
            <p className="text-[#475569] text-sm mt-1 font-['Nunito_Sans']">
              {loading ? 'Memuat...' : `${totalItems} item`}
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm font-['Nunito_Sans']">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {loading ? (
          <CartSkeleton />
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-[#F1F5F9] flex items-center justify-center mx-auto mb-5">
              <Package className="h-10 w-10 text-[#94A3B8]" />
            </div>
            <h2 className="text-xl font-bold text-[#0F172A] mb-2 font-['Rubik']">Belum ada item</h2>
            <p className="text-[#475569] mb-8 font-['Nunito_Sans']">Keranjang inquiry masih kosong. Jelajahi katalog untuk menemukan produk.</p>
            <Link
              href="/katalog"
              className="inline-flex items-center gap-2 bg-[#0369A1] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#0284C7] transition-all duration-200 shadow-sm hover:shadow-md font-['Nunito_Sans'] cursor-pointer"
            >
              <ShoppingCart className="h-4 w-4" />
              Jelajahi Katalog
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              {items.map(item => {
                const showImage = item.barang?.image_url && !imageErrors.has(item.id)
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="w-16 h-16 rounded-lg bg-[#F1F5F9] flex-shrink-0 overflow-hidden">
                      {showImage ? (
                        <Image
                          src={item.barang!.image_url!}
                          alt={item.barang?.nama ?? ''}
                          width={64}
                          height={64}
                          className="object-cover w-full h-full"
                          onError={() => setImageErrors(prev => new Set(prev).add(item.id))}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-6 w-6 text-[#94A3B8]" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#0F172A] truncate font-['Nunito_Sans']">{item.barang?.nama ?? 'Unknown'}</p>
                      <p className="text-xs text-[#64748B] font-['Nunito_Sans']">{item.barang?.kode} | {item.barang?.satuan}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleQtyChange(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-[#F1F5F9] hover:border-slate-300 transition-all duration-150 text-[#475569] cursor-pointer"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center font-semibold text-sm text-[#0F172A]">{item.quantity}</span>
                      <button
                        onClick={() => handleQtyChange(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-[#F1F5F9] hover:border-slate-300 transition-all duration-150 text-[#475569] cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all duration-150 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )
              })}
            </div>

            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 mb-6">
              <h2 className="font-semibold text-[#0F172A] mb-5 font-['Rubik'] flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#0369A1]" />
                Detail Inquiry
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5 font-['Nunito_Sans']">Perihal <span className="text-red-500">*</span></label>
                  <input
                    required
                    value={perihal}
                    onChange={e => { setPerihal(e.target.value); setPerihalError(false) }}
                    className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#0369A1]/20 outline-none transition-all duration-150 font-['Nunito_Sans'] text-[#0F172A] caret-[#0F172A] placeholder:text-slate-400 ${
                      perihalError ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:border-[#0369A1]'
                    }`}
                    placeholder="Permintaan Penawaran untuk..."
                  />
                  {perihalError && (
                    <p className="text-xs text-red-500 mt-1 font-['Nunito_Sans']">Perihal wajib diisi</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5 font-['Nunito_Sans']">Keterangan Tambahan</label>
                  <textarea
                    value={keterangan}
                    onChange={e => setKeterangan(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0369A1]/20 focus:border-[#0369A1] outline-none transition-all duration-150 font-['Nunito_Sans'] text-[#0F172A] caret-[#0F172A] placeholder:text-slate-400 resize-none"
                    placeholder="Informasi tambahan untuk tim kami..."
                  />
                </div>
              </div>
            </div>

            <div className="sticky bottom-4 bg-white rounded-xl border border-slate-100 shadow-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-[#475569]" />
                <span className="text-sm text-[#475569] font-['Nunito_Sans']">
                  <strong className="text-[#0F172A]">{totalItems}</strong> item
                </span>
              </div>
              <button
                onClick={handleSubmit}
                disabled={submitting || !perihal.trim()}
                className="inline-flex items-center gap-2 bg-[#0369A1] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#0284C7] transition-all duration-200 disabled:opacity-50 shadow-sm hover:shadow-md font-['Nunito_Sans'] cursor-pointer"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {submitting ? 'Mengirim...' : 'Kirim Inquiry'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
