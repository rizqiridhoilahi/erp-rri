# ERP RRI Dashboard UI/UX Design System

## Overview
Refinement plan for ERP RRI dashboard cards, aging reports, pipeline tracking, and approval workflows to align with premium enterprise UX standards.

### Design Principles
- **Style:** Liquid Glass (flowing glass, smooth transitions, translucent, animated blur)
- **Colors:**
  - Primary: `#0000FF` (light) / `#3B82F6` (dark)
  - Accent: `#A1A1AA` (light) / `#D1D5DB` (dark)
  - CTA: `#8B5CF6` (purple tech)
- **Typography:** IBM Plex Sans (financial, trustworthy, professional)
- **Effects:** Morphing elements, fluid animations (400-600ms), dynamic blur (`backdrop-filter`)

---

## 1. Dashboard Card Enhancements

### A. Stat Cards (Overview)
**Current:** Basic border + shadow.
**Proposed:**
- **Glassmorphism:** `bg-primary/10 backdrop-blur-sm border border-primary/20`
- **Hover Effect:** `hover:scale-[1.02] hover:shadow-xl transition-all duration-300`
- **Icon Container:** `bg-primary/20 p-3 rounded-lg`
- **Icon Variant:** Gunakan `iconVariant` untuk membedakan warna ikon per kartu (lihat matriks di bawah)
- **Value Text:** `text-3xl font-bold text-primary`
- **Label:** `text-xs text-muted-foreground/80`

**Design Decision:** Hybrid light/dark — Light mode: white card + blue border halus; Dark mode: glassmorphism blue tint.

**Komponen:** `/src/components/stat-card.tsx` — shared component untuk semua dashboard.

### Icon Variant Matriks
| Variant | Container | Icon | Semantic |
|---------|-----------|------|----------|
| `primary` (default) | `bg-primary/20` | `text-primary` | Umum, default |
| `success` | `bg-success/20` | `text-success` | Revenue, pendapatan positif |
| `warning` | `bg-warning/20` | `text-warning` | Piutang, pending, PR/PO butuh tindakan |
| `destructive` | `bg-destructive/20` | `text-destructive` | Hutang, stok kosong, alert |
| `info` | `bg-sky-500/20` | `text-sky-500` | Data master (karyawan, customer, barang) |

### Example Mapping (Owner Dashboard)
| Kartu | iconVariant |
|-------|-------------|
| Revenue Bulan Ini | `success` |
| Piutang (AR) | `warning` |
| Hutang (AP) | `destructive` |
| Karyawan Aktif | `info` |
| Customer Aktif | `info` |
| PR/PO Aktif | `warning` |
| Total Barang/Stok | `info` |
| Stok Kosong | `destructive` |

**Implementation:**
```tsx
<Card className="rounded-2xl bg-white dark:bg-primary/10 dark:backdrop-blur-sm border border-primary/10 dark:border-primary/20 hover:scale-[1.02] hover:shadow-[0_4px_20px_rgba(0,0,255,0.08)] dark:hover:shadow-xl transition-all duration-300">
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
      {label}
    </CardTitle>
    <div className="bg-primary/20 p-3 rounded-lg">
      <Icon className="h-6 w-6 text-primary" />
    </div>
  </CardHeader>
  <CardContent>
    <div className="text-3xl font-bold font-heading tracking-tight text-primary">
      {typeof value === 'number' ? value.toLocaleString('id-ID') : value}
    </div>
    <div className="flex items-center justify-between mt-1">
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      {trend !== undefined && (
        <div className={`flex items-center gap-0.5 text-xs font-medium ${trend >= 0 ? 'text-success' : 'text-destructive'}`}>
          {trend >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          <span>{Math.abs(trend).toFixed(1)}%</span>
          {trendLabel && <span className="text-muted-foreground font-normal ml-1">{trendLabel}</span>}
        </div>
      )}
    </div>
  </CardContent>
</Card>
```

---

### A.1 Revenue Chart Card
**Component:** `/src/components/revenue-chart-card.tsx` — wrapper yang konsisten dengan `StatCard`
**Chart Engine:** `/src/components/revenue-chart.tsx` — `recharts` `AreaChart` dengan gradient fill

**Design:**
- **Card:** Sama dengan StatCard (white + blue border light mode, glassmorphism dark mode)
- **Chart:** `h-[140px]`, gradient fill sukses (hijau) ke transparent, dots interaktif, grid halus
- **Icon:** `TrendingUp` di `bg-primary/20 p-3 rounded-lg` (konsisten dengan StatCard)
- **Header:** `text-sm font-semibold uppercase tracking-wider text-foreground`

**Implementation:**
```tsx
// revenue-chart.tsx
<AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
  <defs>
    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
      <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0} />
    </linearGradient>
  </defs>
  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
  <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
  <YAxis tickFormatter={(v) => v >= 1_000_000 ? `${(v/1_000_000).toFixed(0)}M` : `${(v/1_000).toFixed(0)}K`} />
  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--success))" strokeWidth={2}
    fill="url(#revenueGradient)" dot={{ r: 3 }} activeDot={{ r: 5 }} />
</AreaChart>

// revenue-chart-card.tsx
<RevenueChartCard data={revenueChartData} />
```

---
**Current:** Plain tables.
**Proposed:**
- **Heatmap Rows:** Color-code aging buckets (0-30d, 31-60d, 61-90d, 90d+).
- **Interactive Tooltips:** Hover to show details (e.g., invoice #, supplier, due date).
- **Summary Card:** Aggregate totals per bucket.

**Tailwind Implementation:**
```tsx
// Aging Bucket Colors
const agingColors = {
  "0-30": "bg-green-100 text-green-800",
  "31-60": "bg-yellow-100 text-yellow-800",
  "61-90": "bg-orange-100 text-orange-800",
  "90+": "bg-red-100 text-red-800",
};

// Table Row
<tr className="hover:bg-primary/5 transition-colors">
  <td className="p-4">INV-202605-001</td>
  <td className="p-4">PT Maju Jaya</td>
  <td className={`p-4 rounded-md ${agingColors["31-60"]}`}>35 days</td>
  <td className="p-4">Rp 12.500.000</td>
</tr>
```

---

### C. Pipeline Tracking (Owner / Sales)
**Current:** Static `bg-muted` boxes with connector arrows.
**Proposed:**
- **Compact Cards:** Design konsisten dengan StatCard (white + blue border light, glassmorphism dark)
- **Icon Variant per Stage:** Biru (primary) → Sky Blue (info) → Hijau (success)
- **Hover Effect:** `hover:scale-[1.02] hover:shadow-[0_4px_20px_rgba(0,0,255,0.08)]`
- **No Connector Arrows:** Cards sudah terpisah dengan gap, tidak perlu panah

**Tailwind Implementation:**
```tsx
// Pipeline Stage Card
<div className="rounded-2xl bg-white dark:bg-primary/10 dark:backdrop-blur-sm border border-primary/10 dark:border-primary/20 p-4 hover:scale-[1.02] hover:shadow-[0_4px_20px_rgba(0,0,255,0.08)] dark:hover:shadow-xl transition-all duration-300">
  <div className="flex items-center justify-between mb-3">
    <span className="text-sm font-medium text-foreground">Quotation</span>
    <div className="bg-primary/20 p-2 rounded-lg">
      <FileText className="h-4 w-4 text-primary" />
    </div>
  </div>
  <p className="text-2xl font-bold font-heading tracking-tight text-primary">12</p>
  <p className="text-xs text-muted-foreground mt-1">RFQ dikirim ke supplier</p>
</div>
```

**Stage Mapping:**
| Stage | Variant | Warna |
|-------|---------|-------|
| Quotation | `primary` | Biru (`#0000FF`) |
| Quot. Diterima | `info` | Sky Blue (`#0EA5E9`) |
| PO Customer | `success` | Hijau (`#22C55E`) |
| Sales Order | `success` | Hijau (`#22C55E`) |

---

### D. Aktivitas Terbaru, Akses Cepat, Modul (Owner Dashboard)

#### Aktivitas Terbaru
- **Card wrapper:** Konsisten dengan StatCard (`rounded-2xl bg-white dark:bg-primary/10 border border-primary/10`)
- **Header:** Icon `Clock` di `bg-primary/20 p-3 rounded-lg`, title `text-sm font-semibold uppercase tracking-wider text-foreground`
- **Item rows:** Setiap item punya icon per tipe dokumen (`FileText`=Quotation, `Receipt`=Invoice, `Package`=PO, `DollarSign`=SO) di container `bg-primary/10 p-2 rounded-md`
- **Hover:** `hover:bg-primary/5 hover:scale-[1.01] transition-all duration-200`
- **Empty state:** Icon lebih besar (`h-10 w-10`), tanpa border dashed

#### Akses Cepat
- **Grouping by category:** HR & Kepegawaian, Finance, Sales & Procurement
- **Category label:** `text-xs font-semibold uppercase tracking-wider text-muted-foreground`
- **Items:** Button `variant="ghost"` dengan `hover:bg-primary/5`, icon `text-primary`
- **Header icon:** `Bot` di container konsisten

#### Modul
- **Mini cards:** Setiap modul adalah link card kecil dengan icon + label
- **Icon variant:** `info` (biru) untuk master data, `success` (hijau) untuk laporan positif, `warning` (kuning) untuk aging
- **Hover:** `hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(0,0,255,0.06)]`
- **Layout:** `grid grid-cols-2 md:grid-cols-4 gap-3`

---

### E. Approval Workflows
**Current:** Basic tables.
**Proposed:**
- **Action Cards:** Approve/Reject buttons with `variant="outline"` + hover effects.
- **Status Badges:** `bg-green-500` (Approved), `bg-red-500` (Rejected), `bg-yellow-500` (Pending).
- **Audit Trail:** Collapsible timeline of approval history.

**Tailwind Implementation:**
```tsx
// Approval Card
div className="bg-background rounded-lg p-4 shadow-sm">
  <div className="flex justify-between items-start">
    <div>
      <p className="font-medium">PO-202605-018</p>
      <p className="text-sm text-muted-foreground">PT Sentosa</p>
    </div>
    <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded-full">Pending</span>
  </div>
  <div className="mt-4 flex gap-2">
    <Button variant="outline" className="border-green-500 text-green-500 hover:bg-green-500/10">
      Approve
    </Button>
    <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-500/10">
      Reject
    </Button>
  </div>
</div>
```

---

## 2. UX Best Practices

### A. Micro-Interactions
- **Hover Effects:** `hover:scale-[1.02] transition-transform duration-200` on all interactive cards.
- **Skeleton Loaders:** For dynamic data (e.g., aging reports).
- **Tooltips:** Use `@radix-ui/react-tooltip` for additional context.

### B. Accessibility
- **Keyboard Navigation:** Ensure all interactive elements are focusable.
- **Reduced Motion:** Respect `prefers-reduced-motion` for animations.
- **Contrast:** Minimum 4.5:1 for text (e.g., `text-primary` on `bg-primary/10`).

### C. Performance
- **Lazy Loading:** Load non-critical cards (e.g., approval workflows) after initial render.
- **Memoization:** Use `React.memo` for static cards (e.g., stat cards).

---

## 3. Implementation Roadmap
| Task | Priority | Status |
|------|----------|--------|
| Refine stat cards (glassmorphism + hover effects) | High | Done |
| Created shared StatCard component | High | Done |
| Added iconVariant prop (5 color variants) | High | Done |
| Refine RevenueChart + create RevenueChartCard | High | Done |
| Refine Aktivitas Terbaru, Akses Cepat, Modul cards | High | Done |
| Enhance approval workflows (action cards) | Medium | Pending |
| Add skeleton loaders | Low | Pending |
| Test accessibility (keyboard + contrast) | High | Pending |

---

## 4. Anti-Patterns
- **Avoid:** Cheap visuals (e.g., emoji icons, inconsistent spacing).
- **Avoid:** Fast animations (>300ms for fluidity).
- **Avoid:** Low-contrast text in light mode (e.g., `text-gray-400` on white).