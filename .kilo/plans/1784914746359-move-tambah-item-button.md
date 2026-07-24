# Quotation: Tambah Card "Ringkasan Quotation" di bawah Biaya Overhead

## Scope
- `src/app/dashboard/quotation/tambah/page.tsx`
- `src/app/dashboard/quotation/[id]/edit/page.tsx`

## Opsi yang disepakati
- User memilih **opsi A**: tambah Card baru **"Ringkasan Quotation"** di bawah Card "Biaya Overhead".

## Konteks
- Halaman detail quotation menghitung ringkasan dari `data.items`:
  - `subtotal` = Σ(qty × harga_satuan)
  - `totalDiskon` = Σ(qty × harga_satuan × diskon / 100)
  - `totalPpn` = Σ(ppn_per_item) jika `ppn_enabled`
  - `grandTotal` = subtotal − totalDiskon + totalPpn
  - Estimasi Margin: `totalJual`, `totalBeli` (dengan `harga_beli ?? 0`), `totalOverhead` (dengan `overhead_per_unit ?? 0`), margin kotor/bersih persen, status margin berdasarkan `target_margin` & `negotiation_buffer`

- Keterbatasan form tambah/edit: tidak ada field `overhead_per_unit`, `ppn_per_item`, `total_harga` di UI. Overhead per item dihitung client-side dari `overhead_biaya` + `overhead_metode`. PPN juga tidak di-input per item di form.

## Implementasi

### 1. Tambah derived values menggunakan `watch()`
Di kedua file (tambah & edit), tambahkan computed values dari form state. Gunakan pattern IIFE serupa dengan yang sudah ada di per-item preview agar real-time saat user mengedit qty/harga/overhead:

```tsx
const quotationSummary = (() => {
  const items = watch('items') || []
  const targetMargin = Number(watch('target_margin')) || 0.15
  const buffer = Number(watch('negotiation_buffer')) || 0.10
  const overheadBiaya = Number(watch('overhead_biaya')) || 0
  const metode = watch('overhead_metode') || 'quantity'

  const totalQty = items.reduce((s, i) => s + (Number(i.jumlah) || 0), 0)
  const totalValue = items.reduce((s, i) => s + (Number(i.jumlah) || 0) * (Number(i.harga_satuan) || 0), 0)
  const totalJual = totalValue
  const totalBeli = items.reduce((s, i) => s + (Number(i.jumlah) || 0) * (Number(i.harga_beli) || 0), 0)

  const overheadPerUnit = overheadBiaya <= 0 ? 0
    : metode === 'quantity'
      ? (totalQty > 0 ? overheadBiaya / totalQty : 0)
      : (totalValue > 0 ? overheadBiaya * totalJual / totalValue : 0)
  const totalOverhead = totalQty * overheadPerUnit

  const subtotal = totalJual
  const totalDiskon = items.reduce((s, i) => s + (Number(i.jumlah) || 0) * (Number(i.harga_satuan) || 0) * ((Number(i.diskon) || 0) / 100), 0)
  const grandTotal = subtotal - totalDiskon

  const marginKotor = totalJual - totalBeli
  const marginBersih = marginKotor - totalOverhead
  const marginPct = totalJual > 0 ? (marginBersih / totalJual) * 100 : 0
  const targetWithBufferPct = (1 - (1 - targetMargin) * (1 - buffer)) * 100
  const marginStatus = marginPct >= targetWithBufferPct ? 'full' : marginPct >= targetMargin * 100 ? 'on_target' : 'below'

  return {
    subtotal, totalDiskon, grandTotal, totalJual, totalBeli,
    totalOverhead, marginKotor, marginBersih, marginPct,
    targetMargin, buffer, targetWithBufferPct, marginStatus,
  }
})()
```

### 2. Tambah Card "Ringkasan Quotation"
Setelah Card "Biaya Overhead" (dan setelahnya), tambah:

```tsx
<Card>
  <CardHeader><CardTitle className="text-base">Ringkasan Quotation</CardTitle></CardHeader>
  <CardContent className="space-y-4">
    <div className="space-y-1">
      <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatCurrency(quotationSummary.subtotal)}</span></div>
      {quotationSummary.totalDiskon > 0 && (
        <div className="flex justify-between text-sm text-muted-foreground"><span>Diskon</span><span>-{formatCurrency(quotationSummary.totalDiskon)}</span></div>
      )}
      <div className="flex justify-between font-bold text-lg pt-2 border-t">
        <span>Grand Total</span>
        <span>{formatCurrency(quotationSummary.grandTotal)}</span>
      </div>
    </div>

    <div className="border-t border-dashed pt-3 space-y-1">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Estimasi Margin (Internal)</p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Target: {(quotationSummary.targetMargin * 100).toFixed(0)}%</span>
          <span className="text-xs text-muted-foreground">Buffer: {(quotationSummary.buffer * 100).toFixed(0)}%</span>
        </div>
      </div>
      <div className="flex justify-between text-sm"><span>Total Harga Jual</span><span>{formatCurrency(quotationSummary.totalJual)}</span></div>
      <div className="flex justify-between text-sm text-muted-foreground"><span>Total Harga Beli</span><span>{formatCurrency(quotationSummary.totalBeli)}</span></div>
      <div className="flex justify-between text-sm"><span>Margin Kotor</span><span>{formatCurrency(quotationSummary.marginKotor)}</span></div>
      <div className="flex justify-between text-sm text-muted-foreground"><span>Total Overhead</span><span>{formatCurrency(quotationSummary.totalOverhead)}</span></div>
      <div className={`flex justify-between font-semibold text-sm pt-1 border-t ${quotationSummary.marginBersih >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        <span>Margin Bersih</span>
        <span>{formatCurrency(quotationSummary.marginBersih)} ({quotationSummary.marginPct.toFixed(1)}%)</span>
      </div>
      <div className="flex justify-between text-xs pt-1">
        <span className="text-muted-foreground">Status Margin</span>
        {(() => {
          const icon = quotationSummary.marginStatus === 'full' ? '✅' : quotationSummary.marginStatus === 'on_target' ? '⚠️' : '🔴'
          const label = quotationSummary.marginStatus === 'full' ? 'Ada Buffer' : quotationSummary.marginStatus === 'on_target' ? 'Sesuai Target' : 'Dibawah Target'
          const color = quotationSummary.marginStatus === 'full' ? 'text-green-600 border-green-300 bg-green-50' : quotationSummary.marginStatus === 'on_target' ? 'text-yellow-700 border-yellow-300 bg-yellow-50' : 'text-red-600 border-red-300 bg-red-50'
          return <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium ${color}`}>{icon} {label}</span>
        })()}
      </div>
    </div>
  </CardContent>
</Card>
```

- Tambahkan helper `formatCurrency` (atau inline `toLocaleString('id-ID')`) jika belum ada di kedua file.
- Nilai-nilai **read-only** (tidak ada `FormField`/`register`).
- Urutan elemen di form: Header Surat → Kepada Yth. → Item Penawaran → Biaya Overhead (conditional) → **Ringkasan Quotation (baru)** → Pengaturan.

### 3. File terpengaruh
| File | Perubahan |
|------|-----------|
| `tambah/page.tsx` | Tambah `quotationSummary` computation + Card Ringkasan setelah Biaya Overhead |
| `edit/page.tsx` | Sama seperti tambah |

## Invalidasi & Dependensi
- Tidak ada perubahan API/DB.
- Nilai ringkasan bergantung pada form state (`watch('items')`, `watch('overhead_biaya')`, `watch('overhead_metode')`, `watch('target_margin')`, `watch('negotiation_buffer')`) yang sudah existing.
- Jika `fields.length === 0`, ringkasan akan menampilkan Rp 0 — ini wajar karena form validation mencegah submit dengan 0 item (`items: z.array(itemSchema).min(1)`).

## Validasi
- `npm run lint -- src/app/dashboard/quotation/tambah/page.tsx src/app/dashboard/quotation/[id]/edit/page.tsx`
- Manual: tambah/edit quotation → isi beberapa item → ubah qty/harga/overhead → pastikan ringkasan ter-update real-time
- Manual: RFQ load pada tambah page → pastikan ringkasan tampil meski item di-load otomatis
- Manual: edit page dengan item existing → pastikan ringkasan konsisten dengan detail page
