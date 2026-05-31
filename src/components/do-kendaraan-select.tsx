"use client"

import { useState, useEffect } from "react"
import { apiFetch } from "@/lib/api/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Loader2, Truck } from "lucide-react"
import { toast } from "sonner"

interface Kendaraan {
  id: string
  nama: string
  no_polisi: string
  is_active: boolean
}

interface Props {
  doId: string
  currentKendaraanId: string | null
}

const CLEAR_VALUE = '__clear__'

export function DOKendaraanSelect({ doId, currentKendaraanId }: Props) {
  const [kendaraanList, setKendaraanList] = useState<Kendaraan[]>([])
  const [selectedId, setSelectedId] = useState<string>(currentKendaraanId ?? CLEAR_VALUE)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    apiFetch<Kendaraan[]>('/api/v1/system/kendaraan')
      .then((res) => {
        const list = res.data ?? []
        setKendaraanList(list)
        if (!currentKendaraanId) setSelectedId(CLEAR_VALUE)
      })
      .catch(() => toast.error('Gagal memuat data kendaraan'))
      .finally(() => setLoading(false))
  }, [currentKendaraanId])

  const handleSave = async () => {
    setSaving(true)
    try {
      await apiFetch(`/api/v1/delivery-order/${doId}`, {
        method: 'PUT',
        body: JSON.stringify({ kendaraan_id: selectedId === CLEAR_VALUE ? null : selectedId }),
      })
      toast.success('Kendaraan berhasil dipilih')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan')
    } finally {
      setSaving(false)
    }
  }

  const selectedKendaraan = selectedId !== CLEAR_VALUE ? kendaraanList.find(x => x.id === selectedId) : null

  return (
    <Card>
      <CardHeader><CardTitle className="text-base flex items-center gap-2"><Truck className="h-4 w-4" />Kendaraan</CardTitle></CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-2"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="flex items-end gap-3">
            <div className="flex-1 space-y-1">
              <Label>Pilih Kendaraan</Label>
              <Select value={selectedId} onValueChange={setSelectedId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kendaraan..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CLEAR_VALUE}>-- Kosongkan Data Kendaraan --</SelectItem>
                  {kendaraanList.filter(k => k.is_active).map((k) => (
                    <SelectItem key={k.id} value={k.id}>
                      {k.nama} ({k.no_polisi})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Simpan
            </Button>
          </div>
        )}
        {selectedKendaraan && (
          <p className="text-sm text-muted-foreground mt-2">
            Kendaraan terpilih: <span className="font-medium text-foreground">{selectedKendaraan.nama}</span> — {selectedKendaraan.no_polisi}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
