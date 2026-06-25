'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { getDictionary } from '@/lib/i18n'
import { PackageOpen } from 'lucide-react'
import { Skeleton } from '@/components/skeleton'

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const staggerGrid = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

interface ProductItem {
  id: string
  nama: string
  kode: string
  satuan: string
  image_url: string | null
  kategori_barang: { nama: string }[] | { nama: string }
  deskripsi_katalog: string | null
}

interface ProductsResponse {
  items: ProductItem[]
  count: number
  page: number
  totalPages: number
  categories: Array<{ id: string; nama: string }>
}

export function KatalogContent() {
  const searchParams = useSearchParams()
  const lang = searchParams.get('lang') ?? 'id'
  const dict = getDictionary(lang)

  const [products, setProducts] = useState<ProductItem[]>([])
  const [categories, setCategories] = useState<Array<{ id: string; nama: string }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', '12')
      if (selectedCategory) params.set('kategori_id', selectedCategory)
      if (searchQuery) params.set('search', searchQuery)

      try {
        const r = await fetch(`/api/v1/public/products?${params.toString()}`)
        if (!r.ok) {
          throw new Error(`API error: ${r.status} ${r.statusText}`)
        }
        const res = await r.json()
        if (cancelled) return
        if (!res.data) {
          throw new Error('Invalid API response format')
        }
        const d = res.data as ProductsResponse
        setProducts(d.items)
        setCategories(d.categories)
        setTotalPages(d.totalPages)
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to fetch products:', err)
          setError(err instanceof Error ? err.message : 'Gagal memuat produk')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [page, selectedCategory, searchQuery])

  return (
    <>
      <section className="relative h-[100px] flex items-center justify-center overflow-hidden bg-[#0B1528]">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_50%_50%,#343DFF_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0B1528]/60" />
        <div className="relative z-10 text-center max-w-4xl px-4">
          <h1 className="text-[32px] font-bold text-white font-[family-name:var(--font-heading)]">
            {dict.katalog.title}
          </h1>
        </div>
      </section>

      <section className="py-12 bg-[#f7f9fb] min-h-[600px]">
        <div className="max-w-[1280px] mx-auto px-[40px]">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
                placeholder="Cari produk..."
                className="w-full px-4 py-3 rounded-lg border border-[#c5c4db]/30 bg-white text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#0000ff]/20 font-[family-name:var(--font-body)]"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setPage(1) }}
              className="px-4 py-3 rounded-lg border border-[#c5c4db]/30 bg-white text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#0000ff]/20 font-[family-name:var(--font-body)]"
            >
              <option value="">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.nama}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="rounded-2xl bg-white shadow-lg shadow-[#0B1528]/5 border border-[#e2e8f0] overflow-hidden">
                  <Skeleton className="h-48 w-full rounded-none" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20">
              <span className="material-symbols-outlined text-5xl text-[#DC2626] mb-3">error</span>
              <p className="text-[#DC2626] text-[16px] font-[family-name:var(--font-body)]">{error}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <PackageOpen className="h-12 w-12 text-[#94A3B8] mb-3" />
              <p className="text-[#454558] text-[16px] font-[family-name:var(--font-body)]">Belum ada produk yang dipublikasikan.</p>
            </div>
          ) : (
            <>
              <motion.div
                variants={staggerGrid}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.05 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {products.map((product) => {
                  const kategoriNama = Array.isArray(product.kategori_barang)
                    ? product.kategori_barang[0]?.nama
                    : (product.kategori_barang as { nama: string })?.nama
                  const primaryImage = product.image_url

                  return (
                    <motion.div key={product.id} variants={cardVariants} transition={{ duration: 0.4 }}>
                      <motion.div
                        whileHover={{ y: -6, boxShadow: '0 20px 25px -5px rgba(11,21,40,0.1), 0 10px 10px -5px rgba(11,21,40,0.04)' }}
                        transition={{ duration: 0.3 }}
                      >
                        <Link
                          href={`/katalog/${product.id}${lang !== 'id' ? `?lang=${lang}` : ''}`}
                          className="block rounded-2xl bg-white shadow-lg shadow-[#0B1528]/5 border border-[#e2e8f0] overflow-hidden group"
                        >
                          <motion.div className="h-48 bg-[#f0f2f5] flex items-center justify-center overflow-hidden">
                            {primaryImage ? (
                              <motion.img
                                src={primaryImage}
                                alt={product.nama}
                                className="w-full h-full object-contain"
                                whileHover={{ scale: 1.08 }}
                                transition={{ duration: 0.4 }}
                              />
                            ) : (
                              <svg className="w-12 h-12 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            )}
                          </motion.div>
                          <div className="p-5">
                            {kategoriNama && (
                              <span className="text-[11px] uppercase tracking-wider text-[#0000ff] font-medium font-[family-name:var(--font-body)]">
                                {kategoriNama}
                              </span>
                            )}
                            <h3 className="text-[16px] font-semibold text-[#191c1e] mt-1 mb-2 font-[family-name:var(--font-heading)]">
                              {product.nama}
                            </h3>
                            <div className="flex items-center gap-3 text-[12px] text-[#94A3B8] font-[family-name:var(--font-body)]">
                              <span>{product.kode}</span>
                              <span>&bull;</span>
                              <span>{product.satuan}</span>
                            </div>
                            {product.deskripsi_katalog && (
                              <p className="text-[13px] text-[#454558] mt-2 line-clamp-2 font-[family-name:var(--font-body)]">
                                {product.deskripsi_katalog}
                              </p>
                            )}
                          </div>
                        </Link>
                      </motion.div>
                    </motion.div>
                  )
                })}
              </motion.div>

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors font-[family-name:var(--font-body)] ${
                        p === page
                          ? 'bg-[#0000ff] text-white'
                          : 'bg-white text-[#454558] border border-[#c5c4db]/30 hover:bg-[#f0f2f5]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  )
}
