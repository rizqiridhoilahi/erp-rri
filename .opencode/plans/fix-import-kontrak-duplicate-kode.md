# Fix: Import Kontrak — Duplicate Kode Barang + Kontrak GET is_active

## Perubahan 1: `src/app/api/v1/master/barang/import-from-kontrak/route.ts`

### Masalah
Validasi `barang.kode` hanya cek dalam 1 kontrak (`.eq('kontrak_id', kontrakId)`). Ketika kontrak ke-3 sudah diimport, kontrak ke-2 gagal karena `barang.kode` global uniq constraint violation.

### Solusi
Cek `barang.kode` secara global — jika sudah ada, link existing + update `harga_jual_default`. Jika belum ada, create baru.

### Code (full file)
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/api/supabase-server'
import { verifyAuth } from '@/lib/api/auth'
import { badRequest, notFound } from '@/lib/api/errors'

const importItemSchema = z.object({
  kode: z.string().min(1, 'Kode barang harus diisi'),
  nama: z.string().min(1, 'Nama barang harus diisi'),
  satuan: z.string().min(1, 'Satuan harus diisi'),
  harga: z.number().nonnegative('Harga harus >= 0'),
})

const schema = z.object({
  kontrakId: z.string().min(1, 'Kontrak harus dipilih'),
  kategoriId: z.string().min(1, 'Kategori harus dipilih'),
  items: z.array(importItemSchema).min(1, 'Minimal 1 item'),
})

export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (auth.error) return auth.error

  const body = await request.json().catch(() => null)
  if (!body) return badRequest('Invalid JSON body')

  const parsed = schema.safeParse(body)
  if (!parsed.success) return badRequest(parsed.error.issues.map(e => e.message).join(', '))

  const { kontrakId, kategoriId, items } = parsed.data

  const { error: kontrakError } = await supabaseAdmin
    .from('kontrak')
    .select('id, nama')
    .eq('id', kontrakId)
    .single()

  if (kontrakError) return notFound('Kontrak tidak ditemukan')

  const imported: Array<{ kode: string; barangId: string; kontrakItemId: string; status: string }> = []
  const errors: Array<{ kode: string; error: string }> = []

  for (const item of items) {
    try {
      const { data: existingBarang } = await supabaseAdmin
        .from('barang')
        .select('id, harga_jual_default')
        .eq('kode', item.kode)
        .maybeSingle()

      if (existingBarang) {
        const { error: updateError } = await supabaseAdmin
          .from('barang')
          .update({ harga_jual_default: item.harga })
          .eq('id', existingBarang.id)

        if (updateError) {
          errors.push({ kode: item.kode, error: 'Gagal update harga default: ' + updateError.message })
          continue
        }

        const { data: kontrakItem, error: itemError } = await supabaseAdmin
          .from('kontrak_item')
          .insert({
            kontrak_id: kontrakId,
            barang_id: existingBarang.id,
            kode_barang: item.kode,
            nama_barang: item.nama,
            satuan: item.satuan,
            harga_satuan: item.harga,
            ppn_include: true,
          })
          .select()
          .single()

        if (itemError) {
          errors.push({ kode: item.kode, error: 'Gagal membuat item kontrak: ' + itemError.message })
          continue
        }

        imported.push({ kode: item.kode, barangId: existingBarang.id, kontrakItemId: kontrakItem.id, status: 'linked' })
      } else {
        const { data: newBarang, error: barangError } = await supabaseAdmin
          .from('barang')
          .insert({
            kode: item.kode,
            nama: item.nama,
            satuan: item.satuan,
            kategori_id: kategoriId,
            harga_jual_default: item.harga,
            stok_minimum: 0,
            is_active: true,
            kontrak_id: kontrakId,
          })
          .select()
          .single()

        if (barangError || !newBarang) {
          errors.push({ kode: item.kode, error: barangError?.message || 'Gagal membuat barang' })
          continue
        }

        const { data: kontrakItem, error: itemError } = await supabaseAdmin
          .from('kontrak_item')
          .insert({
            kontrak_id: kontrakId,
            barang_id: newBarang.id,
            kode_barang: item.kode,
            nama_barang: item.nama,
            satuan: item.satuan,
            harga_satuan: item.harga,
            ppn_include: true,
          })
          .select()
          .single()

        if (itemError) {
          errors.push({ kode: item.kode, error: 'Barang tersimpan tapi gagal membuat item kontrak: ' + itemError.message })
          continue
        }

        imported.push({ kode: item.kode, barangId: newBarang.id, kontrakItemId: kontrakItem.id, status: 'created' })
      }
    } catch (err) {
      errors.push({ kode: item.kode, error: err instanceof Error ? err.message : 'Unknown error' })
    }
  }

  return NextResponse.json({
    data: {
      success: errors.length === 0,
      imported: imported.length,
      items: imported,
      errors: errors.length > 0 ? errors : undefined,
    },
  })
}
```

### Perubahan dari versi lama
| Baris | Sebelum | Sesudah |
|-------|---------|---------|
| 40 | `barangId: string; kontrakItemId: string` | + `status: string` |
| 45-49 | `.eq('kode', item.kode).eq('kontrak_id', kontrakId)` | `.eq('kode', item.kode)` (global) |
| 52-95 | If existing → push error + continue | If existing → update `harga_jual_default` + insert `kontrak_item` + push `linked` |
| 96 | `imported.push({...})` | `imported.push({..., status: 'created'})` |

---

## Perubahan 2: `src/app/api/v1/master/kontrak/route.ts`

### Masalah
GET handler tidak support `?is_active=true/false` query param, dan override `is_active` dengan computed value dari `tanggal_selesai`.

### Solusi
Support `is_active` query param untuk filtering. Jika tidak dikirim, behavior tetap (return semua).

### Edit spesifik
**Line 26-32 (before):**
```typescript
const { searchParams } = new URL(request.url)
const customerId = searchParams.get('customer_id')

let query = supabaseAdmin.from('kontrak')
  .select('*, customer!customer_id(nama)')
  .order('created_at', { ascending: false })

if (customerId) query = query.eq('customer_id', customerId)
```

**Line 26-37 (after):**
```typescript
const { searchParams } = new URL(request.url)
const customerId = searchParams.get('customer_id')
const isActive = searchParams.get('is_active')

let query = supabaseAdmin.from('kontrak')
  .select('*, customer!customer_id(nama)')
  .order('created_at', { ascending: false })

if (customerId) query = query.eq('customer_id', customerId)
if (isActive === 'true') query = query.eq('is_active', true)
else if (isActive === 'false') query = query.eq('is_active', false)
```

**Line 36-40 (remove the computed `is_active` override):**
Hapus block:
```typescript
const today = new Date().toISOString().split('T')[0]
const mapped = (data ?? []).map(k => ({
  ...k,
  is_active: !k.tanggal_selesai || k.tanggal_selesai >= today,
}))
return NextResponse.json({ data: mapped })
```

Ganti dengan:
```typescript
return NextResponse.json({ data: data ?? [] })
```

---

## Perubahan 3: `src/app/dashboard/master/barang/tambah/page.tsx`

### Masalah
Success toast tidak membedakan `linked` vs `created`.

### Edit spesifik
**Line 399-400 (before):**
```typescript
toast.success(`${result.imported} barang berhasil diimport dari kontrak!`,
  { id: result.imported > (result.errors?.length ?? 0) ? toastId : undefined });
```

**Line 399-400 (after):**
```typescript
const linkedCount = result.items.filter(i => i.status === 'linked').length
const createdCount = result.items.filter(i => i.status === 'created').length
const detailParts: string[] = []
if (createdCount > 0) detailParts.push(`${createdCount} baru`)
if (linkedCount > 0) detailParts.push(`${linkedCount} ditautkan`)
toast.success(`${result.imported} barang berhasil diimport (${detailParts.join(', ')})`,
  { id: result.imported > (result.errors?.length ?? 0) ? toastId : undefined });
```

---
