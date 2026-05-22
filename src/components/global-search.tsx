"use client"
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Loader2 } from 'lucide-react'
import { apiFetch } from '@/lib/api/client'

interface SearchResult { table: string; id: string; label: string; href: string }

export function GlobalSearch() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setOpen(true); inputRef.current?.focus() } }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      if (!query || query.length < 2) { setResults([]); return }
      setSearching(true)
      try { const r = await apiFetch<SearchResult[]>('/api/v1/search', { method: 'POST', body: JSON.stringify({ q: query }) }); setResults(r.data ?? []) }
      catch { setResults([]) }
      finally { setSearching(false) }
    }
    fetchData()
  }, [query])

  return (
    <div ref={wrapperRef} className="relative">
      <button onClick={() => setOpen(true)} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-muted-foreground bg-muted/30 border rounded-md hover:bg-muted/50 transition-colors">
        <Search className="h-4 w-4" /><span className="flex-1 text-left">Cari...</span><kbd className="hidden sm:inline-flex text-xs px-1.5 py-0.5 bg-muted border rounded">⌘K</kbd>
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50">
          <div className="bg-popover border rounded-lg shadow-lg overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 border-b">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} placeholder="Cari barang, invoice, PO..." className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" autoFocus />
              {searching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </div>
            {results.length > 0 && <div className="max-h-60 overflow-y-auto p-1">
              {results.map((r, i) => (
                <button key={i} onClick={() => { router.push(r.href); setOpen(false); setQuery('') }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-accent text-left">
                  <span className="text-xs font-mono text-muted-foreground uppercase">{r.table}</span>
                  <span className="flex-1 truncate">{r.label}</span>
                </button>
              ))}
            </div>}
            {query.length >= 2 && !searching && results.length === 0 && <p className="text-xs text-muted-foreground p-3">Tidak ada hasil</p>}
          </div>
        </div>
      )}
    </div>
  )
}
