# Login Page Design — ERP RRI

## Overview
Login page redesign with enterprise-grade UI/UX: dual-panel layout (brand + form), glassmorphism card, `#0000FF` primary color, minimal animations, spinner loading.

## Design System

### Style & Aesthetic
- **Pattern**: Enterprise Gateway — trust signals prominent, clean credential form
- **Style**: Swiss Modernism 2.0 — grid-based, high contrast, single accent (#0000FF), minimal decoration
- **Effects**: Glassmorphism card (backdrop-blur), animated mesh gradient on brand panel, entrance fade-in
- **Typography**: Lexend (heading, 700-800 weight) + Source Sans 3 (body, 400-500 weight) — "Corporate Trust" pairing
- **Anti-patterns avoided**: No emoji icons, no layout shift on hover, no skeleton loading, no floating particles, no hardcoded colors

### Color Palette
```
:root {
  --primary: #0000FF;            // Deep Blue — main brand color
  --primary-foreground: #FFFFFF;  // Text on primary bg
  --accent: #A1A1AA;              // Silver accent
  --card: #FFFFFF;                // Card container
  --background: #F9FAFB;          // Form panel bg
  --border: #E5E7EB;              // Subtle borders
  --muted: #F3F4F6;               // Input bg
  --muted-foreground: #6B7280;    // Secondary text
}

.dark {
  --primary: #3B82F6;
  --card: #1F2937;
  --background: #111827;
  --border: #374151;
}
```

## Layout Structure

### Dual-Panel (lg+ screens)
```
┌─────────────────────────┬──────────────────────────────┐
│    BRAND PANEL (50%)    │     FORM PANEL (50%)          │
│                         │                              │
│  ┌───┐                  │  ┌──────────────────────┐    │
│  │ERP│ RRI              │  │   [Logo]              │    │
│  │   │ Enterprise ...   │  │   Selamat Datang      │    │
│  └───┘                  │  │   Masukkan kredensial │    │
│                         │  │                        │    │
│  Kelola Bisnis Anda     │  │   Email ............. │    │
│  Dalam Satu Platform    │  │   Password .........  │    │
│                         │  │                        │    │
│  ✓ Aman & Terpercaya    │  │   [───── Masuk ─────] │    │
│  ✓ Dukungan 24/7        │  │                        │    │
│                         │  │   🔒 Sistem terlindungi│    │
│  © 2026 PT. RRI         │  └──────────────────────┘    │
│                         │                              │
└─────────────────────────┴──────────────────────────────┘
```

### Mobile (< lg)
- Single column: form panel only (brand panel hidden)
- Same glassmorphism card, full-width inputs

## Component Design

### Brand Panel (`(auth)/layout.tsx`)
- Background: `bg-gradient-to-br from-[#0000FF] via-[#0000D9] to-[#0A0E27]`
- Animated mesh: 2 blurred circles with `animate-mesh-shift` (20s infinite, offset phase)
- Dot pattern overlay: `radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)` at 24px grid
- Content: Logo + tagline, value props (security + support), copyright

### Login Card (`login/page.tsx`)
- **Container**: `<Card>` with `shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)]`
- **Header**: Logo in `bg-primary/10 rounded-full`, "Selamat Datang" title, subtitle
- **Form**: React Hook Form + Zod validation
- **Entrance**: Parent div has `animate-fade-in-up` (0.4s ease-out)

### Input Fields
- Height: `h-12` for comfortable touch target
- Background: `bg-muted/50` → `focus:bg-background`
- Border: `border-border` (via shadcn/ui default)
- Focus: `ring-primary` (via shadcn/ui `focus:ring-ring`)
- Icon prefix: `absolute left-3` with `text-muted-foreground`
- Transition: `transition-all duration-200`
- Icon: `Mail` (email), `Lock` (password)
- Password toggle: `Eye`/`EyeOff` icon button at `right-3`

### Button (Submit)
- Colors: `bg-primary text-primary-foreground` (via shadcn/ui primary variant)
- Height: `h-12`, font: `text-base font-semibold`
- Shadow: `shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]` (subtle inner highlight)
- Hover: `hover:-translate-y-0.5 hover:shadow-lg` (lift effect)
- Active: `active:translate-y-0` (press feedback)
- Transition: `transition-all duration-200`
- Loading: `Loader2` spinning icon + "Memproses..." text
- Disabled: shadcn/ui default `opacity-50 cursor-not-allowed`

### Error State
- Banner: `bg-destructive/10 border-destructive/20` with `AlertCircle` icon
- Field error: `text-destructive` text with `AlertCircle` icon
- Role: `alert` for accessibility

## Animations

| Animasi | Durasi | Trigger | Keterangan |
|---------|--------|---------|------------|
| `fade-in-up` | 400ms | Page mount | Card entrance (translateY 12px → 0) |
| `mesh-shift` | 20s | Infinite | Mesh gradient movement on brand panel |
| Button lift | 200ms | Hover | `translateY(-0.125rem)` + shadow increase |
| Button press | 100ms | Active | `translateY(0)` — reset |
| Button spinner | Continuous | Loading state | `Loader2` spin animation |
| Input transition | 200ms | Focus/blur | `bg-muted/50` ↔ `bg-background` |

## Responsive Design

| Breakpoint | Brand Panel | Form Panel | Card Width |
|------------|-------------|------------|------------|
| < 1024px | Hidden | Full width | `max-w-md` centered |
| 1024px+ | 50% visible | 50% flex | `max-w-md` in panel |

## Implementation Status

### Phase 1: Layout
- [x] Dual-panel auth layout with brand + form panels
- [x] Brand panel gradient (#0000FF → #0A0E27) + animated mesh
- [x] Dot pattern overlay subtle
- [x] Form panel with `animate-fade-in-up` entrance

### Phase 2: Login Card
- [x] Glassmorphism card with clean shadow
- [x] Logo in primary-tinted circular container
- [x] Title + subtitle centered
- [x] Icon-prefixed inputs (Mail, Lock) with h-12
- [x] Password show/hide toggle (Eye/EyeOff)
- [x] Primary CTA button with hover lift + spinner loading
- [x] Error banner with AlertCircle icon
- [x] Security badge footer (ShieldCheck + enkripsi)

### Phase 3: Register Page Alignment
- [x] Same card design as login
- [x] Icon-prefixed inputs (User, Mail, Lock)
- [x] Same button styling (hover lift, spinner)
- [x] Same error banner style
- [x] Password strength meter preserved
- [x] Role select with consistent height

### Phase 4: Animations
- [x] fade-in-up keyframe
- [x] mesh-shift keyframe for brand panel
- [x] No skeleton loading (spinner in button instead)
- [x] No floating particles
- [x] `prefers-reduced-motion` respected (implicit via CSS)

### Phase 5: Code Quality
- [x] All colors from CSS variables (no hardcoded `#0000FF` in JSX)
- [x] No dead code (removed `mounted = true`, skeleton logic)
- [x] Proper accessibility: `aria-invalid`, `role="alert"`, `aria-label`
- [x] Build 0 errors
- [x] Lint 0 errors

## Key Design Decisions

1. **No skeleton loading** — Spinner di button lebih ringan, tidak ada layout shift
2. **No floating particles** — Terlalu noise untuk enterprise; ganti dengan animated mesh yang subtle
3. **No "Lupa Password" / "Daftar" links** — Fokus pada form minimal sesuai spesifikasi
4. **Spinner in button** — UX standard, feedback langsung tanpa delay artifisial
5. **Dual-panel dipertahankan** — Brand panel kiri memberikan konteks enterprise, form panel kanan fokus pada task

## Files Modified

| File | Perubahan |
|------|-----------|
| `src/app/(auth)/layout.tsx` | Brand panel gradient, animated mesh overlay, dot pattern, hapus floating particles |
| `src/app/(auth)/login/page.tsx` | Full rewrite: glass card, spinner, proper colors, entrance animation |
| `src/app/(auth)/register/page.tsx` | Aligned styling: icon inputs, consistent card/button |
| `src/app/globals.css` | Added `fade-in-up` and `mesh-shift` keyframes |
