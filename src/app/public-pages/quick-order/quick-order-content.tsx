'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useCustomerAuth } from '@/lib/hooks/use-customer-auth'
import Link from 'next/link'
import Image from 'next/image'
import * as XLSX from 'xlsx'

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

  if (authLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 pt-20">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-[#0B1528] mb-2 font-[family-name:var(--font-heading)]">Pesanan Cepat</h1>
          <p className="text-[#64748B] mb-6 font-[family-name:var(--font-body)]">Silakan login untuk menggunakan fitur pesanan cepat.</p>
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
          <h1 className="text-2xl font-bold text-[#0B1528] mb-2 font-[family-name:var(--font-heading)]">Berhasil!</h1>
          <p className="text-[#64748B] font-[family-name:var(--font-body)]">Semua item ditambahkan ke keranjang inquiry. Mengarahkan...</p>
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
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border-2 border-dashed border-[#CBD5E1]">
          <label className="flex items-center gap-3 cursor-pointer hover:bg-[#F8FAFC] transition-colors rounded-lg p-2">
            <span className="material-symbols-outlined text-[#0000ff] text-2xl">upload_file</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#0B1528] font-[family-name:var(--font-body)]">Upload Excel</p>
              <p className="text-xs text-[#64748B] font-[family-name:var(--font-body)]">Upload file .xlsx dengan kolom: kode barang, quantity</p>
            </div>
            <span className="text-xs text-[#0000ff] font-semibold font-[family-name:var(--font-body)]">Pilih File</span>
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
          {rows.map((row) => (
            <div key={row.id} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <input
                    value={row.kode}
                    onChange={e => handleKodeChange(row.id, e.target.value)}
                    placeholder="Kode barang..."
                    className="w-full px-4 py-2.5 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff] outline-none font-[family-name:var(--font-body)]"
                  />
                  {lookingUp[row.id] && <p className="text-xs text-[#64748B] mt-1">Mencari...</p>}
                  {!lookingUp[row.id] && lookups[row.id] && (
                    <div className="flex items-center gap-2 mt-2 p-2 bg-[#F8FAFC] rounded-lg">
                      <div className="w-8 h-8 rounded bg-[#F1F5F9] overflow-hidden flex-shrink-0">
                        {lookups[row.id]!.image_url ? (
                          <Image src={lookups[row.id]!.image_url || ''} alt="" width={32} height={32} className="object-cover" />
                        ) : null}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#0B1528] truncate">{lookups[row.id]!.nama}</p>
                        <p className="text-xs text-[#64748B]">{lookups[row.id]!.kode} | {lookups[row.id]!.satuan}</p>
                      </div>
                    </div>
                  )}
                  {!lookingUp[row.id] && row.kode && !lookups[row.id] && (
                    <p className="text-xs text-red-500 mt-1">Produk tidak ditemukan</p>
                  )}
                </div>
                <div>
                  <input
                    type="number"
                    min={1}
                    value={row.qty}
                    onChange={e => setRows(prev => prev.map(r => r.id === row.id ? { ...r, qty: parseInt(e.target.value) || 1 } : r))}
                    className="w-20 px-3 py-2.5 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff] outline-none text-center font-[family-name:var(--font-body)]"
                  />
                </div>
                {rows.length > 1 && (
                  <button onClick={() => removeRow(row.id)} className="text-red-500 hover:text-red-700 p-2">
                    <span>✕</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={addRow}
            className="px-6 py-3 border-2 border-[#0000ff] text-[#0000ff] rounded-lg font-bold hover:bg-[#0000ff]/5 transition-all font-[family-name:var(--font-body)]"
          >
            + Tambah Baris
          </button>
          <button
            onClick={handleAddAllToCart}
            disabled={adding || rows.some(r => !lookups[r.id]?.ditemukan)}
            className="flex-1 bg-[#0000ff] text-white py-3 rounded-lg font-bold hover:opacity-90 transition-all disabled:opacity-50 font-[family-name:var(--font-body)]"
          >
            {adding ? 'Menambahkan...' : `Tambah ${rows.length} Item ke Keranjang`}
          </button>
        </div>

        <p className="text-xs text-[#94A3B8] mt-4 font-[family-name:var(--font-body)]">
          Kode barang dapat dilihat di halaman katalog produk.
        </p>
      </div>
    </div>
  )
}
