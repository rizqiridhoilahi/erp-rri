'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useCustomerAuth } from '@/lib/hooks/use-customer-auth'
import Link from 'next/link'
import * as XLSX from 'xlsx'
import {
  ShoppingCart,
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Plus,
  X,
  Package,
  Search,
} from 'lucide-react'

interface ProductLookup {
  id: string
  nama: string
  kode: string
  satuan: string
  image_url: string | null
  ditemukan: boolean
}

export function QuickOrderContent() {
  const router = useRouter()
  const { isLoggedIn, token, loading: authLoading } = useCustomerAuth()
  const [rows, setRows] = useState<Array<{ id: string; kode: string; qty: number }>>([{ id: crypto.randomUUID(), kode: '', qty: 1 }])
  const [lookups, setLookups] = useState<Record<string, ProductLookup | null>>({})
  const [lookingUp, setLookingUp] = useState<Record<string, boolean>>({})
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const debounceRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const lookupProduct = async (id: string, kode: string) => {
    if (!kode.trim()) {
      setLookups(prev => ({ ...prev, [id]: null }))
      return
    }
    setLookingUp(prev => ({ ...prev, [id]: true }))
    try {
      const res = await fetch(`/api/v1/public/products?search=${encodeURIComponent(kode)}&limit=5`)
      const json = await res.json()
      const items: ProductLookup[] = (json.data?.items ?? []).map((i: ProductLookup) => ({
        ...i,
        ditemukan: i.kode.toLowerCase() === kode.toLowerCase() || i.nama.toLowerCase().includes(kode.toLowerCase()),
      }))
      const match = items.find(i => i.kode.toLowerCase() === kode.toLowerCase()) || items[0] || null
      setLookups(prev => ({ ...prev, [id]: match }))
    } catch {
      setLookups(prev => ({ ...prev, [id]: null }))
    } finally {
      setLookingUp(prev => ({ ...prev, [id]: false }))
    }
  }

  const handleKodeChange = (id: string, value: string) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, kode: value } : r))
    if (debounceRef.current[id]) clearTimeout(debounceRef.current[id])
    debounceRef.current[id] = setTimeout(() => lookupProduct(id, value), 500)
  }

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const json = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { header: ['kode', 'qty'] })
        const newRows = json
          .filter(row => row.kode && String(row.kode).trim())
          .map(row => ({
            id: crypto.randomUUID(),
            kode: String(row.kode).trim(),
            qty: Math.max(1, parseInt(String(row.qty)) || 1),
          }))
        if (newRows.length === 0) {
          setError('File Excel kosong atau format tidak sesuai. Kolom pertama: kode barang, kolom kedua: quantity.')
          return
        }
        setRows(newRows)
        for (const row of newRows) {
          lookupProduct(row.id, row.kode)
        }
      } catch {
        setError('Gagal membaca file Excel. Pastikan format .xlsx valid.')
      }
    }
    reader.readAsArrayBuffer(file)
    e.target.value = ''
  }

  const addRow = () => setRows(prev => [...prev, { id: crypto.randomUUID(), kode: '', qty: 1 }])

  const removeRow = (id: string) => {
    setRows(prev => prev.filter(r => r.id !== id))
    setLookups(prev => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    if (debounceRef.current[id]) {
      clearTimeout(debounceRef.current[id])
      delete debounceRef.current[id]
    }
  }

  const handleAddAllToCart = async () => {
    if (!token) return
    setError('')
    setAdding(true)
    try {
      for (const [idx, row] of rows.entries()) {
        const lookup = lookups[row.id]
        if (!lookup?.ditemukan) {
          setError(`Baris ${idx + 1}: Produk dengan kode "${row.kode}" tidak ditemukan`)
          setAdding(false)
          return
        }
        const res = await fetch('/api/v1/public/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ barang_id: lookup.id, quantity: row.qty }),
        })
        if (!res.ok) {
          const json = await res.json()
          setError(`Baris ${idx + 1}: ${json.error || 'Gagal'}`)
          setAdding(false)
          return
        }
      }
      setSuccess(true)
      setTimeout(() => router.push('/inquiry'), 1500)
    } catch {
      setError('Terjadi kesalahan')
    } finally {
      setAdding(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-[#0369A1] animate-spin" />
          <p className="text-sm text-[#64748B] font-[family-name:var(--font-body)]">Memuat...</p>
        </div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 pt-20">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="h-8 w-8 text-[#0369A1]" />
          </div>
          <h1 className="text-2xl font-bold text-[#0B1528] mb-2 font-[family-name:var(--font-heading)]">Pesanan Cepat</h1>
          <p className="text-[#64748B] mb-6 font-[family-name:var(--font-body)]">Silakan login untuk menggunakan fitur pesanan cepat.</p>
          <Link
            href="/customer-login"
            className="inline-block bg-[#0369A1] text-white px-8 py-3 rounded-lg font-bold hover:opacity-90 transition-all font-[family-name:var(--font-body)]"
          >
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
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-[#0B1528] mb-2 font-[family-name:var(--font-heading)]">Berhasil!</h1>
          <p className="text-[#64748B] mb-4 font-[family-name:var(--font-body)]">
            Semua item ditambahkan ke keranjang inquiry.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-[#64748B] font-[family-name:var(--font-body)]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Mengarahkan ke halaman inquiry...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-20 pb-12">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-[#0B1528] mb-1 font-[family-name:var(--font-heading)]">Pesanan Cepat</h1>
        <p className="text-[#64748B] text-sm mb-6 font-[family-name:var(--font-body)]">
          Masukkan kode barang dan quantity untuk langsung menambahkan ke keranjang inquiry.
        </p>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm font-[family-name:var(--font-body)]">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm mb-6 border-2 border-dashed border-[#CBD5E1] transition-colors duration-200 hover:border-[#0369A1] hover:bg-blue-50/30">
          <label className="flex items-center gap-4 p-5 cursor-pointer rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-[#0369A1]/10 flex items-center justify-center flex-shrink-0">
              <Upload className="h-5 w-5 text-[#0369A1]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#0B1528] font-[family-name:var(--font-body)]">Upload Excel</p>
              <p className="text-xs text-[#64748B] font-[family-name:var(--font-body)]">
                Upload file .xlsx dengan kolom: kode barang, quantity
              </p>
            </div>
            <span className="text-xs font-semibold bg-[#0369A1] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity font-[family-name:var(--font-body)]">
              Pilih File
            </span>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleExcelUpload}
              className="hidden"
            />
          </label>
        </div>

        <p className="text-xs text-[#64748B] mb-3 font-[family-name:var(--font-body)]">Atau masukkan manual:</p>

        <div className="space-y-3 mb-6">
          {rows.map((row, idx) => (
            <div key={row.id} className="bg-white rounded-xl shadow-sm p-4 transition-shadow duration-200 hover:shadow-md">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-[#94A3B8] font-semibold font-[family-name:var(--font-body)]">#{idx + 1}</span>
                  </div>
                  <input
                    value={row.kode}
                    onChange={e => handleKodeChange(row.id, e.target.value)}
                    placeholder="Masukkan kode barang..."
                    className="w-full px-4 py-2.5 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#0369A1]/20 focus:border-[#0369A1] outline-none text-sm text-[#0F172A] caret-[#0F172A] font-[family-name:var(--font-body)] transition-shadow duration-200"
                  />
                  {lookingUp[row.id] && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-[#64748B] font-[family-name:var(--font-body)]">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Mencari produk...
                    </div>
                  )}
                  {!lookingUp[row.id] && lookups[row.id] && (
                    <div className="flex items-center gap-3 mt-2 p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                      <div className="w-9 h-9 rounded-lg bg-[#F1F5F9] overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {lookups[row.id]!.image_url ? (
                          <div
                            className="w-full h-full bg-cover bg-center rounded-lg"
                            style={{ backgroundImage: `url(${lookups[row.id]!.image_url})` }}
                          />
                        ) : (
                          <Package className="h-4 w-4 text-[#94A3B8]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#0B1528] truncate font-[family-name:var(--font-body)]">{lookups[row.id]!.nama}</p>
                        <p className="text-xs text-[#64748B] font-[family-name:var(--font-body)]">{lookups[row.id]!.kode} &middot; {lookups[row.id]!.satuan}</p>
                      </div>
                      <Search className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    </div>
                  )}
                  {!lookingUp[row.id] && row.kode && !lookups[row.id] && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-red-500 font-[family-name:var(--font-body)]">
                      <AlertCircle className="h-3 w-3" />
                      Produk tidak ditemukan
                    </div>
                  )}
                </div>
                <div className="flex items-start gap-2 pt-5">
                  <div>
                    <input
                      type="number"
                      min={1}
                      inputMode="numeric"
                      value={row.qty}
                      onChange={e => setRows(prev => prev.map(r => r.id === row.id ? { ...r, qty: parseInt(e.target.value) || 1 } : r))}
                      className="w-20 px-3 py-2.5 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#0369A1]/20 focus:border-[#0369A1] outline-none text-center text-sm text-[#0F172A] caret-[#0F172A] font-[family-name:var(--font-body)] transition-shadow duration-200"
                    />
                  </div>
                  {rows.length > 1 && (
                    <button
                      onClick={() => removeRow(row.id)}
                      className="p-2 text-[#94A3B8] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 cursor-pointer"
                      aria-label="Hapus baris"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={addRow}
            className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-[#0369A1] text-[#0369A1] rounded-lg font-bold hover:bg-[#0369A1]/5 transition-all duration-200 font-[family-name:var(--font-body)] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Tambah Baris
          </button>
          <button
            onClick={handleAddAllToCart}
            disabled={adding || rows.some(r => !lookups[r.id]?.ditemukan)}
            className="flex-1 flex items-center justify-center gap-2 bg-[#0369A1] text-white py-3 rounded-lg font-bold hover:opacity-90 transition-all disabled:opacity-50 font-[family-name:var(--font-body)] cursor-pointer"
          >
            {adding ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Menambahkan...
              </>
            ) : (
              `Tambah ${rows.length} Item ke Keranjang`
            )}
          </button>
        </div>

        <p className="text-xs text-[#94A3B8] mt-4 font-[family-name:var(--font-body)]">
          Kode barang dapat dilihat di halaman katalog produk.
        </p>
      </div>
    </div>
  )
}
