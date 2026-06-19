'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getDictionary } from '@/lib/i18n'
import { Loader2 } from 'lucide-react'

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
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', '12')
      if (selectedCategory) params.set('kategori_id', selectedCategory)
      if (searchQuery) params.set('search', searchQuery)

      try {
        const r = await fetch(`/api/v1/public/products?${params.toString()}`)
        const res = await r.json()
        if (cancelled) return
        const d = res.data as ProductsResponse
        setProducts(d.items)
        setCategories(d.categories)
        setTotalPages(d.totalPages)
      } catch {} finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [page, selectedCategory, searchQuery])

  return (
    <>
      <section className="relative h-[300px] flex items-center overflow-hidden bg-[#0B1528]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B1528] via-transparent to-[#0B1528]/40" />
        <div className="relative z-10 max-w-[1280px] mx-auto px-[40px] w-full">
          <h1 className="text-[48px] font-bold text-white font-[family-name:var(--font-heading)]">
            {dict.katalog.title}
          </h1>
          <p className="text-[18px] text-[#b9c8de] mt-4 max-w-xl font-[family-name:var(--font-body)]">
            {dict.katalog.subtitle}
          </p>
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
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[#0000ff]" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#454558] text-[16px] font-[family-name:var(--font-body)]">Belum ada produk yang dipublikasikan.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => {
                  const kategoriNama = Array.isArray(product.kategori_barang)
                    ? product.kategori_barang[0]?.nama
                    : (product.kategori_barang as { nama: string })?.nama
                  const primaryImage = product.image_url

                  return (
                    <Link
                      key={product.id}
                      href={`/katalog/${product.id}${lang !== 'id' ? `?lang=${lang}` : ''}`}
                      className="group glass-card rounded-xl overflow-hidden hover:translate-y-[-4px] transition-all duration-300"
                    >
                      <div className="h-48 bg-[#f0f2f5] flex items-center justify-center overflow-hidden">
                        {primaryImage ? (
                          <img
                            src={primaryImage}
                            alt={product.nama}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <span className="material-symbols-outlined text-[#94A3B8] text-[48px]">inventory_2</span>
                        )}
                      </div>
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
                  )
                })}
              </div>

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
