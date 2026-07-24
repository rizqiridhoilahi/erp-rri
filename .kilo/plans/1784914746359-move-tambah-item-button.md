# Move "Tambah Item" button below item list in RFQ Customer

## Scope
- `src/app/dashboard/rfq-customer/tambah/page.tsx`
- `src/app/dashboard/rfq-customer/[id]/edit/page.tsx`

## Current state
In both files, the **Tambah Item** button sits inside the **Item Barang** card header (`CardHeader`), above the mapped item rows.

## Desired state
Move the **Tambah Item** button to the bottom of the card content, after the mapped items list (and after the empty-state message), so users adding many items don't have to scroll back up.

## Implementation sketch
In each file:
- Remove the button from the `flex flex-row items-center justify-between` inside `CardHeader`.
- After the last item / empty-state block inside `CardContent`, add:
  ```tsx
  <div className="pt-2">
    <Button type="button" variant="outline" size="sm" onClick={() => append({ barang_id: '', nama_barang: '', jumlah: 1 })}>
      <Plus className="h-4 w-4 mr-1" />Tambah Item
    </Button>
  </div>
  ```

## Notes
- Keep the existing `import { Plus }` (already present in both files).
- `variant="cancel"` is not used here; current button uses `variant="outline"`.
- No data model or API changes.
