"use client"

import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

interface ItemSummary {
  id: string
  nama: string | null
  satuan: string | null
  jumlah: number
  harga_satuan?: number | null
}

export function ItemsPopover({ items }: { items: ItemSummary[] }) {
  const count = items.length

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 text-xs font-normal text-foreground border-primary border-[0.5px]">
          {count} Item
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-96 p-0 border-[0.5px] border-primary">
        <div className="p-3 border-b">
          <p className="text-xs font-semibold text-muted-foreground">Item Barang</p>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {items.map((item, idx) => {
            const subtotal = item.harga_satuan != null ? (item.jumlah || 0) * item.harga_satuan : null
            return (
              <div key={item.id} className="px-3 py-2 flex items-center gap-3 text-sm border-b last:border-0">
                <span className="text-muted-foreground w-5 shrink-0">{idx + 1}.</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-primary">{item.nama || '-'}</p>
                  <p className="text-xs text-foreground">
                    {item.satuan || '-'}{' | '}{item.jumlah}
                    {item.harga_satuan != null && <> × Rp {Number(item.harga_satuan).toLocaleString('id-ID')}</>}
                  </p>
                </div>
                {subtotal != null && (
                  <span className="font-mono text-xs shrink-0">
                    Rp {subtotal.toLocaleString('id-ID')}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
