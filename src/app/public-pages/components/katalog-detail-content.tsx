'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { getDictionary } from '@/lib/i18n'
import { useCustomerAuth } from '@/lib/hooks/use-customer-auth'
import { ArrowLeft } from 'lucide-react'
import { Skeleton } from '@/components/skeleton'

interface ProductImage {
  id: string
  url: string
  urutan: number
  is_primary: boolean
}

interface ProductDetail {
  id: string
  nama: string
  kode: string
  satuan: string
  spesifikasi: string | null
  image_url: string | null
  deskripsi_katalog: string | null
  spesifikasi_teknis: Record<string, unknown> | null
  kategori_barang: { nama: string }[] | { nama: string }
  gambar: ProductImage[]
}

export function KatalogDetailContent() {
  const searchParams = useSearchParams()
  const params = useParams()
  const lang = searchParams.get('lang') ?? 'id'
  const id = params.id as string
  const dict = getDictionary(lang)

  const router = useRouter()
  const { isLoggedIn, token, profile } = useCustomerAuth()
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [addingToCart, setAddingToCart] = useState(false)
  const [actionFeedback, setActionFeedback] = useState('')
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState({ show: false, x: 0, y: 0, bgX: 0, bgY: 0 })

  useEffect(() => {
    if (!id) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const r = await fetch(`/api/v1/public/products/${id}`)
        if (!r.ok) {
          if (r.status === 404) throw new Error('Produk tidak ditemukan')
          throw new Error('Gagal memuat produk')
        }
        const res = await r.json()
        if (cancelled) return
        const d = res.data as ProductDetail
        setProduct(d)
        setSelectedImage(d.gambar.find((g) => g.is_primary)?.url ?? d.image_url ?? null)
      } catch (err) {
        if (!cancelled) setError((err as Error).message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [id])

  if (loading) {
    return (
      <section className="min-h-[600px] bg-[#f7f9fb] pb-16">
        <div className="bg-[#f7f9fb] py-8">
          <div className="max-w-[1280px] mx-auto px-[40px]">
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="max-w-[1280px] mx-auto px-[40px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <Skeleton className="h-[400px] w-full rounded-xl" />
              <div className="flex gap-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="w-20 h-20 rounded-lg" />)}
              </div>
            </div>
            <div className="space-y-6">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-32 w-full rounded-xl" />
              <div className="flex gap-4 pt-4">
                <Skeleton className="h-14 flex-1 rounded-lg" />
                <Skeleton className="h-14 flex-1 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-[600px] flex items-center justify-center bg-[#f7f9fb]">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-[#94A3B8] mb-3 block">search_off</span>
          <p className="text-[#454558] text-[16px] mb-4 font-[family-name:var(--font-body)]">{error || 'Produk tidak ditemukan'}</p>
          <Link href={`/katalog${lang !== 'id' ? `?lang=${lang}` : ''}`} className="text-[#0000ff] hover:underline font-[family-name:var(--font-body)]">
            &larr; Kembali ke Katalog
          </Link>
        </div>
      </div>
    )
  }

  const images: string[] = []
  const sortedGambar = [...product.gambar].sort((a, b) => a.urutan - b.urutan)
  for (const g of sortedGambar) {
    if (g.url && !images.includes(g.url)) images.push(g.url)
  }
  if (product.image_url && !images.includes(product.image_url)) {
    images.push(product.image_url)
  }

  const kategoriNama = Array.isArray(product.kategori_barang)
    ? product.kategori_barang[0]?.nama
    : (product.kategori_barang as { nama: string })?.nama

  const spesifikasiTeknis = product.spesifikasi_teknis
    ? (typeof product.spesifikasi_teknis === 'string'
        ? JSON.parse(product.spesifikasi_teknis as string)
        : product.spesifikasi_teknis)
    : null

  return (
    <>
      <section className="bg-[#f7f9fb] py-8">
        <div className="max-w-[1280px] mx-auto px-[40px]">
          <Link
            href={`/katalog${lang !== 'id' ? `?lang=${lang}` : ''}`}
            className="inline-flex items-center gap-2 text-[14px] text-[#0000ff] hover:underline font-[family-name:var(--font-body)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Katalog
          </Link>
        </div>
      </section>

      <section className="bg-[#f7f9fb] pb-16">
        <div className="max-w-[1280px] mx-auto px-[40px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <motion.div
                key={selectedImage}
                initial={{ opacity: 0.6 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl border border-[#c5c4db]/20 p-0 overflow-hidden min-h-[400px]"
                ref={imageContainerRef}
              >
                {selectedImage ? (
                  <div
                    className="relative w-full min-h-[400px] cursor-crosshair"
                    onMouseMove={(e) => {
                      const rect = imageContainerRef.current?.getBoundingClientRect()
                      if (!rect) return
                      const x = ((e.clientX - rect.left) / rect.width) * 100
                      const y = ((e.clientY - rect.top) / rect.height) * 100
                      setZoom({ show: true, x: e.clientX - rect.left, y: e.clientY - rect.top, bgX: x, bgY: y })
                    }}
                    onMouseEnter={() => setZoom(z => ({ ...z, show: true }))}
                    onMouseLeave={() => setZoom(z => ({ ...z, show: false }))}
                  >
                    <img
                      src={selectedImage}
                      alt={product.nama}
                      className="w-full h-full min-h-[400px] object-contain"
                      draggable={false}
                    />
                    {zoom.show && (
                      <div
                        className="absolute pointer-events-none border-2 border-[#0000ff]/30 rounded-full"
                        style={{
                          width: 120,
                          height: 120,
                          left: zoom.x - 60,
                          top: zoom.y - 60,
                          backgroundImage: `url(${selectedImage})`,
                          backgroundSize: '250%',
                          backgroundPosition: `${zoom.bgX}% ${zoom.bgY}%`,
                          boxShadow: '0 0 0 9999px rgba(0,0,0,0.3)',
                        }}
                      />
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center min-h-[400px]">
                    <svg className="w-16 h-16 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                  </div>
                )}
              </motion.div>
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {images.map((url, idx) => (
                    <motion.button
                      key={idx}
                      onClick={() => setSelectedImage(url)}
                      whileHover={{ borderColor: '#0000ff' }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden ${
                        selectedImage === url ? 'border-[#0000ff]' : 'border-[#c5c4db]/30'
                      }`}
                    >
                      <img src={url} alt={`${product.nama} ${idx + 1}`} className="w-full h-full object-contain" />
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              {kategoriNama && (
                <span className="inline-block text-[11px] uppercase tracking-wider text-[#0000ff] font-medium font-[family-name:var(--font-body)]">
                  {kategoriNama}
                </span>
              )}
              <h1 className="text-[32px] font-bold text-[#191c1e] font-[family-name:var(--font-heading)]">
                {product.nama}
              </h1>

              <div className="flex items-center gap-4 text-[14px] text-[#94A3B8] font-[family-name:var(--font-body)]">
                <span className="font-medium text-[#191c1e]">{dict.katalog.sku}:</span>
                <span className="font-mono">{product.kode}</span>
                <span className="text-[#c5c4db]">|</span>
                <span>{product.satuan}</span>
              </div>

              {product.deskripsi_katalog && (
                <div>
                  <h3 className="text-[16px] font-semibold text-[#191c1e] mb-2 font-[family-name:var(--font-heading)]">
                    {dict.katalog.detail}
                  </h3>
                  <p className="text-[14px] text-[#454558] leading-relaxed font-[family-name:var(--font-body)]">
                    {product.deskripsi_katalog}
                  </p>
                </div>
              )}

              {product.spesifikasi && (
                <div>
                  <h3 className="text-[16px] font-semibold text-[#191c1e] mb-2 font-[family-name:var(--font-heading)]">
                    Spesifikasi
                  </h3>
                  <p className="text-[14px] text-[#454558] leading-relaxed font-[family-name:var(--font-body)]">
                    {product.spesifikasi}
                  </p>
                </div>
              )}

              {spesifikasiTeknis && (
                <div className="glass-card rounded-xl p-6">
                  <h3 className="text-[16px] font-semibold text-[#191c1e] mb-4 font-[family-name:var(--font-heading)]">
                    {dict.katalog.spesifikasi}
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(spesifikasiTeknis).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center border-b border-[#c5c4db]/20 pb-2">
                        <span className="text-[13px] text-[#454558] capitalize font-[family-name:var(--font-body)]">
                          {key.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[13px] font-medium text-[#191c1e] font-[family-name:var(--font-body)]">
                          {String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {actionFeedback && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-[14px] font-[family-name:var(--font-body)]">
                  {actionFeedback}
                </div>
              )}
              <div className="flex gap-4">
                <motion.button
                  onClick={async () => {
                    setActionFeedback('')
                    if (!isLoggedIn) { router.push('/customer-login'); return }
                    if (profile?.status_verifikasi !== 'approved') {
                      setActionFeedback('Akun Anda belum disetujui admin. Silakan tunggu konfirmasi.')
                      return
                    }
                    setAddingToCart(true)
                    try {
                      const res = await fetch('/api/v1/public/cart', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ barang_id: product.id, quantity: 1 }),
                      })
                      if (!res.ok) {
                        const err = await res.json().catch(() => ({ error: 'Gagal menambahkan' }))
                        setActionFeedback(err.error || 'Gagal menambahkan ke keranjang')
                        return
                      }
                      router.push('/inquiry')
                    } catch {
                      setActionFeedback('Terjadi kesalahan jaringan')
                    } finally {
                      setAddingToCart(false)
                    }
                  }}
                  disabled={addingToCart}
                  whileHover={{ opacity: 0.9 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 px-6 py-4 bg-[#0000ff] text-white font-bold rounded-lg disabled:opacity-50 font-[family-name:var(--font-body)]"
                >
                  {addingToCart ? 'Memproses...' : dict.katalog.addToSph}
                </motion.button>
                <motion.button
                  onClick={async () => {
                    setActionFeedback('')
                    if (!isLoggedIn) { router.push('/customer-login'); return }
                    if (profile?.status_verifikasi !== 'approved') {
                      setActionFeedback('Akun Anda belum disetujui admin. Silakan tunggu konfirmasi.')
                      return
                    }
                    setAddingToCart(true)
                    try {
                      const res = await fetch('/api/v1/public/cart', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ barang_id: product.id, quantity: 1 }),
                      })
                      if (!res.ok) {
                        const err = await res.json().catch(() => ({ error: 'Gagal menambahkan' }))
                        setActionFeedback(err.error || 'Gagal menambahkan ke keranjang')
                        return
                      }
                      setActionFeedback('Berhasil ditambahkan ke keranjang inquiry')
                    } catch {
                      setActionFeedback('Terjadi kesalahan jaringan')
                    } finally {
                      setAddingToCart(false)
                    }
                  }}
                  disabled={addingToCart}
                  whileHover={{ backgroundColor: 'rgba(0,0,255,0.05)' }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 px-6 py-4 border border-[#0000ff] text-[#0000ff] font-bold rounded-lg disabled:opacity-50 font-[family-name:var(--font-body)]"
                >
                  {dict.katalog.addToCart}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
