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

interface Gudang {
  id: string
  nama: string
}

interface Props {
  doId: string
  currentKendaraanId: string | null
  currentGudangId: string | null
}

const CLEAR_VALUE = '__clear__'

export function DOKendaraanGudangSelect({ doId, currentKendaraanId, currentGudangId }: Props) {
  const [kendaraanList, setKendaraanList] = useState<Kendaraan[]>([])
  const [gudangList, setGudangList] = useState<Gudang[]>([])
  const [selectedKendaraanId, setSelectedKendaraanId] = useState<string>(currentKendaraanId ?? CLEAR_VALUE)
  const [selectedGudangId, setSelectedGudangId] = useState<string>(currentGudangId ?? CLEAR_VALUE)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([
      apiFetch<Kendaraan[]>('/api/v1/system/kendaraan'),
      apiFetch<Gudang[]>('/api/v1/master/gudang'),
    ]).then(([kendRes, gudangRes]) => {
      setKendaraanList(kendRes.data ?? [])
      setGudangList(gudangRes.data ?? [])
      if (!currentKendaraanId) setSelectedKendaraanId(CLEAR_VALUE)
      if (!currentGudangId) setSelectedGudangId(CLEAR_VALUE)
    }).catch(() => toast.error('Gagal memuat data'))
      .finally(() => setLoading(false))
  }, [currentKendaraanId, currentGudangId])

  const handleSave = async () => {
    setSaving(true)
    try {
      await apiFetch(`/api/v1/delivery-order/${doId}`, {
        method: 'PUT',
        body: JSON.stringify({
          kendaraan_id: selectedKendaraanId === CLEAR_VALUE ? null : selectedKendaraanId,
          gudang_id: selectedGudangId === CLEAR_VALUE ? null : selectedGudangId,
        }),
      })
      toast.success('Kendaraan & Gudang berhasil disimpan')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan')
    } finally {
      setSaving(false)
    }
  }

  const selectedKendaraan = selectedKendaraanId !== CLEAR_VALUE
    ? kendaraanList.find(x => x.id === selectedKendaraanId)
    : null

  const selectedGudang = selectedGudangId !== CLEAR_VALUE
    ? gudangList.find(x => x.id === selectedGudangId)
    : null

  return (
    <Card>
      <CardHeader><CardTitle className="text-base flex items-center gap-2"><Truck className="h-4 w-4" />Kendaraan & Gudang</CardTitle></CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-2"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="flex items-end gap-3">
            <div className="flex-1 space-y-1">
              <Label>Pilih Kendaraan</Label>
              <Select value={selectedKendaraanId} onValueChange={setSelectedKendaraanId}>
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
            <div className="flex-1 space-y-1">
              <Label>Gudang</Label>
              <Select value={selectedGudangId} onValueChange={setSelectedGudangId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih gudang..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CLEAR_VALUE}>-- Kosongkan Data Gudang --</SelectItem>
                  {gudangList.map((g) => (
                    <SelectItem key={g.id} value={g.id}>{g.nama}</SelectItem>
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
        {(selectedKendaraan || selectedGudang) && (
          <div className="mt-3 space-y-1 text-sm text-muted-foreground">
            {selectedKendaraan && (
              <p>
                Kendaraan: <span className="font-medium text-foreground">{selectedKendaraan.nama}</span> — {selectedKendaraan.no_polisi}
              </p>
            )}
            {selectedGudang && (
              <p>
                Gudang: <span className="font-medium text-foreground">{selectedGudang.nama}</span>
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
