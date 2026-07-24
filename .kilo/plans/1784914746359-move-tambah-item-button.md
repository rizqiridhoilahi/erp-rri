# Quotation: auto-fill harga from master barang + move Tambah Item button

## Scope
- `src/app/dashboard/quotation/tambah/page.tsx`
- `src/app/dashboard/quotation/[id]/edit/page.tsx`

## Context
- Master `barang` table has `harga_beli_default` and `harga_jual_default` columns (schema: `src/lib/db/schema/barang.ts`).
- API `/api/v1/master/barang` returns these columns via `select('*')`.
- `DocumentSearchCombobox` `onSearch` already maps `raw: b`, so the full row is available at runtime.
- `handleBarangChange` currently fills only `specification`, `justification`, `image_url`, `satuan` — prices are left empty.

## Change 1 — Auto-fill harga beli & harga jual
In both files, extend `handleBarangChange` to also set prices from `option.raw`:

```tsx
setValue(`items.${index}.harga_beli`, Number(option.raw.harga_beli_default ?? 0))
setValue(`items.${index}.harga_satuan`, Number(option.raw.harga_jual_default ?? 0))
```

Notes:
- `harga_beli` schema: `z.coerce.number().nonnegative().optional().default(0)` — accepting `0` is safe.
- `harga_satuan` schema: `z.coerce.number().nonnegative()` (required), defaulting to `0` keeps validation happy until user edits.
- Values must remain user-editable after auto-fill (no read-only lock).
- Only affects new barang selections via combobox. Existing loaded items (including RFQ-loaded or edit-loaded records) keep their current DB values.

## Change 2 — Move "Tambah Item" button below item list
In both files, relocate the button from `CardHeader` to below the mapped items list inside `CardContent`, mirroring the RFQ pattern.

### tambah/page.tsx
- Remove button from `CardHeader` (`flex flex-row items-center justify-between`).
- Add after the empty-state block / last item mapping:
  ```tsx
  <div className="pt-2">
    <Button type="button" variant="outline" size="sm" onClick={() => append({ barang_id: '', jumlah: 1, harga_satuan: 0, harga_beli: 0, specification: '', justification: '', image_url: '', link_produk: '', nama_barang: '', satuan: '' })}>
      <Plus className="h-4 w-4 mr-1" />Tambah Item
    </Button>
  </div>
  ```

### edit/page.tsx
- Same move, with matching append payload:
  ```tsx
  <div className="pt-2">
    <Button type="button" variant="outline" size="sm" onClick={() => append({ barang_id: '', jumlah: 1, harga_satuan: 0, harga_beli: 0, specification: '', justification: '', image_url: '', link_produk: '', nama_barang: '', satuan: '' })}>
      <Plus className="h-4 w-4 mr-1" />Tambah Item
    </Button>
  </div>
  ```

## Validation
- `npm run lint -- src/app/dashboard/quotation/tambah/page.tsx src/app/dashboard/quotation/[id]/edit/page.tsx`
- `npm run build` (verify no static-generation crash on `/api/v1/ai/agents/automation/webhook` if that page is still in the build)
- Manual: select a barang in tambah/edit → verify `harga_beli` and `harga_satuan` auto-populate, then manually edit one price and save → confirm API accepts edited values.
- Manual: long list of items → confirm "Tambah Item" is reachable without scrolling back to card header.
