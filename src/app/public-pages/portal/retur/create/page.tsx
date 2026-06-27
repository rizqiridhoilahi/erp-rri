'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { useCustomerAuth } from '@/lib/hooks/use-customer-auth'

interface DOOption {
  id: string
  nomor: string
  tanggal: string
  status: string
}

interface DOItem {
  id: string
  barang_id: string
  jumlah: number
  nama_barang: string | null
  kode_barang: string | null
  satuan: string | null
  barang: { id: string; nama: string; kode: string; satuan: string } | null
}

interface ReturItem {
  barang_id: string
  jumlah: number
  keterangan: string
}

export default function CreateReturPage() {
  const router = useRouter()
  const { token } = useCustomerAuth()
  const [dos, setDos] = useState<DOOption[]>([])
  const [selectedDoId, setSelectedDoId] = useState('')
  const [doItems, setDoItems] = useState<DOItem[]>([])
  const [returItems, setReturItems] = useState<Record<string, ReturItem>>({})
  const [keterangan, setKeterangan] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) return
    ;(async () => {
      try {
        const res = await fetch('/api/v1/public/delivery-order', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) return
        const json = await res.json()
        setDos(json.data ?? [])
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    })()
  }, [token])

  useEffect(() => {
    if (!selectedDoId || !token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDoItems([])
      return
    }
    ;(async () => {
      try {
        const res = await fetch(`/api/v1/public/delivery-order/${selectedDoId}/items`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) return
        const json = await res.json()
        const items: DOItem[] = json.data ?? []
        setDoItems(items)
        const initial: Record<string, ReturItem> = {}
        for (const item of items) {
          initial[item.barang_id] = { barang_id: item.barang_id, jumlah: 0, keterangan: '' }
        }
        setReturItems(initial)
      } catch {
        // silent
      }
    })()
  }, [selectedDoId, token])

  const updateReturItem = (barangId: string, field: keyof ReturItem, value: string | number) => {
    setReturItems(prev => ({
      ...prev,
      [barangId]: { ...prev[barangId], [field]: value },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !selectedDoId) return
    setError('')
    setSubmitting(true)

    const items = Object.values(returItems).filter(i => i.jumlah > 0)
    if (items.length === 0) {
      setError('Pilih minimal 1 item untuk diretur')
      setSubmitting(false)
      return
    }

    try {
      const res = await fetch('/api/v1/public/retur', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          delivery_order_id: selectedDoId,
          keterangan: keterangan || undefined,
          items: items.map(i => ({ barang_id: i.barang_id, jumlah: i.jumlah, keterangan: i.keterangan || undefined })),
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Gagal membuat retur')
        setSubmitting(false)
        return
      }

      const returId = json.data.id

      if (selectedFile && returId) {
        const formData = new FormData()
        formData.append('file', selectedFile)
        await fetch(`/api/v1/public/retur/${returId}/documents`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        })
      }

      router.push('/portal/retur')
    } catch {
      setError('Terjadi kesalahan')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-[#555e75] mb-4">
        <button onClick={() => router.push('/portal/retur')} className="hover:text-[#0001bb]">Retur</button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#0001bb] font-medium">Buat Retur Baru</span>
      </div>

      <h1 className="text-2xl font-bold text-[#0B1528] mb-1 font-[family-name:var(--font-heading)]">Buat Retur Baru</h1>
      <p className="text-sm text-[#64748B] mb-6 font-[family-name:var(--font-body)]">
        Pilih pengiriman (DO) dan barang yang akan diretur.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <label className="block text-sm font-semibold text-[#0B1528] mb-2 font-[family-name:var(--font-body)]">Pilih Pengiriman (DO)</label>
          {loading ? (
            <p className="text-sm text-[#64748B]">Memuat...</p>
          ) : dos.length === 0 ? (
            <p className="text-sm text-[#64748B]">Tidak ada pengiriman tersedia untuk diretur.</p>
          ) : (
            <select
              value={selectedDoId}
              onChange={e => setSelectedDoId(e.target.value)}
              className="w-full px-4 py-2.5 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff] outline-none font-[family-name:var(--font-body)]"
            >
              <option value="">-- Pilih DO --</option>
              {dos.map(doItem => (
                <option key={doItem.id} value={doItem.id}>
                  {doItem.nomor} — {new Date(doItem.tanggal).toLocaleDateString('id-ID')} ({doItem.status})
                </option>
              ))}
            </select>
          )}
        </div>

        {selectedDoId && doItems.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-sm font-semibold text-[#0B1528] mb-4 font-[family-name:var(--font-body)]">Barang yang Diterima</h3>
            <div className="space-y-4">
              {doItems.map(item => {
                const ri = returItems[item.barang_id]
                const maxQty = item.jumlah
                return (
                  <div key={item.id} className="border border-[#CBD5E1] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-[#0B1528]">{item.nama_barang || item.barang?.nama || '-'}</p>
                        <p className="text-xs text-[#64748B]">{item.kode_barang || item.barang?.kode || ''} — Maks: {maxQty} {item.satuan || item.barang?.satuan || ''}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          max={maxQty}
                          value={ri?.jumlah ?? 0}
                          onChange={e => updateReturItem(item.barang_id, 'jumlah', Math.min(Math.max(0, parseInt(e.target.value) || 0), maxQty))}
                          className="w-20 px-3 py-2 border border-[#CBD5E1] rounded-lg text-center text-sm font-[family-name:var(--font-body)]"
                        />
                      </div>
                    </div>
                    {ri && ri.jumlah > 0 && (
                      <input
                        value={ri.keterangan}
                        onChange={e => updateReturItem(item.barang_id, 'keterangan', e.target.value)}
                        placeholder="Alasan retur (opsional)"
                        className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg text-sm mt-2 font-[family-name:var(--font-body)]"
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {selectedDoId && (
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#0B1528] mb-2 font-[family-name:var(--font-body)]">Catatan Retur</label>
              <textarea
                value={keterangan}
                onChange={e => setKeterangan(e.target.value)}
                placeholder="Catatan tambahan (opsional)"
                rows={3}
                className="w-full px-4 py-2.5 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff] outline-none font-[family-name:var(--font-body)]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0B1528] mb-2 font-[family-name:var(--font-body)]">Foto Pendukung</label>
              <input
                type="file"
                accept="image/*"
                onChange={e => setSelectedFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm font-[family-name:var(--font-body)]"
              />
              <p className="text-xs text-[#64748B] mt-1">Upload foto barang yang akan diretur (opsional).</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-[#0000ff] text-white rounded-lg font-bold hover:opacity-90 transition-all disabled:opacity-50 font-[family-name:var(--font-body)]"
              >
                {submitting ? 'Mengirim...' : 'Ajukan Retur'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/portal/retur')}
                className="px-6 py-3 border border-[#CBD5E1] text-[#64748B] rounded-lg font-bold hover:bg-[#F8FAFC] transition-all font-[family-name:var(--font-body)]"
              >
                Batal
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
