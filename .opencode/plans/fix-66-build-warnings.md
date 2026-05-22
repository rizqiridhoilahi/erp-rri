# Plan: Fix All 66 Build Warnings

## Category A: `catch (err)` → `catch` (7 files, 8 edits)
`err` is defined in catch clause but never used.

| # | File | Line |
|---|------|------|
| 1 | `src/app/(auth)/login/page.tsx` | 42 |
| 2 | `src/app/(auth)/register/page.tsx` | 63 |
| 3 | `src/app/api/v1/invoice/[id]/pdf/route.ts` | 45 |
| 4 | `src/app/api/v1/kwitansi/[id]/pdf/route.ts` | 43 |
| 5 | `src/middleware.ts` | 35 |
| 6 | `src/app/dashboard/master/barang/[id]/edit/page.tsx` | 46, 59 |

**Fix:** `catch (err) {` → `catch {`

---

## Category B: Remove `formState: { errors }` from destructuring (18 files)
`errors` is destructured but never referenced in the component.

**Pattern:**
```ts
const { register, handleSubmit, formState: { errors } } = useForm(...)
```
→
```ts
const { register, handleSubmit } = useForm(...)
```

| # | File | Line |
|---|------|------|
| 1 | `src/app/dashboard/absensi/tambah/page.tsx` | 13 |
| 2 | `src/app/dashboard/ai/search-harga/page.tsx` | 13 |
| 3 | `src/app/dashboard/customer-po/tambah/page.tsx` | 13 |
| 4 | `src/app/dashboard/delivery-order/tambah/page.tsx` | 13 |
| 5 | `src/app/dashboard/di/tambah/page.tsx` | 13 |
| 6 | `src/app/dashboard/faktur-pajak/tambah/page.tsx` | 13 |
| 7 | `src/app/dashboard/grn/tambah/page.tsx` | 13 |
| 8 | `src/app/dashboard/jurnal/tambah/page.tsx` | 13 |
| 9 | `src/app/dashboard/kwitansi/tambah/page.tsx` | 13 |
| 10 | `src/app/dashboard/negoiasi/[id]/edit/page.tsx` | 15 |
| 11 | `src/app/dashboard/negoiasi/tambah/page.tsx` | 13 |
| 12 | `src/app/dashboard/penggajian/tambah/page.tsx` | 12 |
| 13 | `src/app/dashboard/purchase-order/tambah/page.tsx` | 13 |
| 14 | `src/app/dashboard/purchase-receiving/tambah/page.tsx` | 13 |
| 15 | `src/app/dashboard/purchase-request/tambah/page.tsx` | 13 |
| 16 | `src/app/dashboard/quotation/[id]/edit/page.tsx` | 51 |
| 17 | `src/app/dashboard/retur-pembelian/tambah/page.tsx` | 13 |
| 18 | `src/app/dashboard/rfq/[id]/edit/page.tsx` | 50 |
| 19 | `src/app/dashboard/sales-order/tambah/page.tsx` | 13 |

**Caution:** DO NOT touch `quotation/tambah/page.tsx` and `rfq/tambah/page.tsx` — their `errors` IS used in JSX.

---

## Category C: Remove unused named imports (10 files)

| # | File | Import to Remove | Reason |
|---|------|-----------------|--------|
| 1 | `src/app/dashboard/page.tsx:5` | `ShoppingCart` | From `lucide-react` |
| 2 | `src/app/dashboard/layout.tsx:3` | `FileSearch` | From `lucide-react` |
| 3 | `src/app/dashboard/ai/search-harga/page.tsx:3` | `CardHeader, CardTitle` | From `@/components/ui/card` |
| 4 | `src/app/dashboard/customer-po/[id]/edit/page.tsx:3` | `CardHeader, CardTitle` | From `@/components/ui/card` |
| 5 | `src/app/dashboard/customer-po/tambah/page.tsx:3` | `Textarea` | From `@/components/ui/textarea` |
| 6 | `src/app/dashboard/penggajian/tambah/page.tsx:3` | `Textarea` | From `@/components/ui/textarea` |
| 7 | `src/app/dashboard/rfq/[id]/edit/page.tsx:13` | `Badge` | From `@/components/ui/badge` |
| 8 | `src/app/dashboard/rfq/page.tsx:5` | `Eye, Trash2` | From `lucide-react` |
| 9 | `src/app/api/v1/search/route.ts:5` | `internalError` | From `@/lib/api/errors` Also remove unused `internalError` variable |

---

## Category D: Unused `id` param in `handleDelete` → `_id` (8 files)

| # | File | Line |
|---|------|------|
| 1 | `src/app/dashboard/customer/page.tsx` | 113 |
| 2 | `src/app/dashboard/supplier/page.tsx` | 126 |
| 3 | `src/app/dashboard/master/barang/page.tsx` | 128 |
| 4 | `src/app/dashboard/master/coa/page.tsx` | 112 |
| 5 | `src/app/dashboard/master/customer/page.tsx` | 113 |
| 6 | `src/app/dashboard/master/kontrak/page.tsx` | 108 |
| 7 | `src/app/dashboard/master/pic-customer/page.tsx` | 113 |
| 8 | `src/app/dashboard/master/supplier/page.tsx` | 126 |

**Fix:** `handleDelete(id: string)` → `handleDelete(_id: string)`

---

## Category E: Other unused variables (4 files)

| # | File | Line | Var | Fix |
|---|------|------|-----|-----|
| 1 | `src/app/(auth)/login/page.tsx` | 18 | `reset` | Remove from `useForm` destructure |
| 2 | `src/app/(auth)/login/page.tsx` | 30 | `user` | Change to `const { error: authError } = ...` |
| 3 | `src/app/(auth)/register/page.tsx` | 5 | `redirect` | Remove unused import of `redirect` from `next/navigation` |
| 4 | `src/app/dashboard/ai/search-harga/page.tsx` | 12 | `router` | Remove `const router = useRouter();` and the `useRouter` import |
| 5 | `src/app/dashboard/rfq/tambah/page.tsx` | 41 | `watch` | Remove from `useForm` destructure |
| 6 | `src/app/dashboard/quotation/tambah/page.tsx` | 42 | `setValue` | Remove from `useForm` destructure |
| 7 | `src/app/dashboard/quotation/tambah/page.tsx` | 79-82 | `calcSubtotal` | Remove entire unused function |
| 8 | `src/lib/ai/negosiasi-assistant.ts` | 27 | `hargaJualAwal` | Remove line (`const hargaJualAwal = qItems.harga_satuan`) |
| 9 | `src/app/dashboard/kwitansi/tambah/page.tsx` | 11 | `invItemOpts, setInvItemOpts` | Remove from state declaration |
| 10 | `src/app/dashboard/kwitansi/tambah/page.tsx` | 25 | `r` | Change `.then(r => {` to `.then(() => {` |
| 11 | `src/app/purchase-order/tambah/page.tsx` | 3 | `Textarea` | Remove from import (confirm) |
| 12 | `src/app/dashboard/delivery-order/tambah/page.tsx` | 3 | `Textarea` | Remove from import (confirm) |

---

## Category F: Missing useEffect dependency (1 file)

| File | Line | Issue | Fix |
|------|------|-------|-----|
| `src/app/dashboard/kwitansi/tambah/page.tsx` | 28 | `fields` used in useEffect but not in deps array | Add `fields` to the dependency array: `}, [fields])` |

---

## Category G: "Compilation Skipped: Use of incompatible library" (3 files)

| File | Line | Library | Assessment |
|------|------|---------|------------|
| `src/app/dashboard/invoice/tambah/page.tsx` | 15 | react-hook-form + zodResolver | ⚠️ Harmless. Next.js can't statically compile react-hook-form. Runtime works fine. |
| `src/app/dashboard/penggajian/[id]/edit/page.tsx` | 11 | react-hook-form + zodResolver | ⚠️ Same. Ignore. |
| `src/app/dashboard/penggajian/tambah/page.tsx` | 13 | react-hook-form + zodResolver | ⚠️ Same. Ignore. |

**Resolution:** No code change needed. These are harmless warnings from Next.js turbopack.

---

## Execution Order
1. Category A: catch(err) → catch
2. Category C + E combined: Remove unused imports and variables
3. Category B: Remove formState errors
4. Category D: `id` → `_id`
5. Category F: useEffect deps
6. Run `npm run build` to verify 0 errors 0 warnings
7. Update PRD/ROADMAP if needed
