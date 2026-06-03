'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { RefreshCw, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'
import { apiFetch } from '@/lib/api/client'
import { toast } from 'sonner'

interface Reservation {
  reserve_id: string
  kode_dokumen: string
  nomor: string
  tahun: number
  bulan: number
  user_id: string
  modul: string
  expires_at: string
  created_at: string
  used: boolean
  user_name?: string
}

interface Stats {
  total: number
  active: number
  expired: number
  used: number
}

export default function ReservationsPage() {
  const [loading, setLoading] = useState(true)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, expired: 0, used: 0 })
  const [filterModul, setFilterModul] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired' | 'used'>('all')

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await apiFetch<{ data: Reservation[]; stats: Stats }>('/api/v1/admin/reservations')
      setReservations(res.data.data)
      setStats(res.data.stats)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredReservations = reservations.filter(r => {
    const matchModul = filterModul ? r.modul === filterModul : true
    const matchStatus =
      filterStatus === 'all'
        ? true
        : filterStatus === 'active'
        ? !r.used && new Date(r.expires_at) > new Date()
        : filterStatus === 'expired'
        ? !r.used && new Date(r.expires_at) < new Date()
        : r.used
    return matchModul && matchStatus
  })

  const modulOptions = Array.from(new Set(reservations.map(r => r.modul))).sort()

  const getStatusBadge = (r: Reservation) => {
    const isExpired = new Date(r.expires_at) < new Date()
    if (r.used) {
      return <Badge className="bg-green-500/10 text-green-500 font-medium">Used</Badge>
    }
    if (isExpired) {
      return <Badge className="bg-red-500/10 text-red-500 font-medium">Expired</Badge>
    }
    return <Badge className="bg-blue-500/10 text-blue-500 font-medium">Active</Badge>
  }

  const formatTime = (dateString: string) => {
    const d = new Date(dateString)
    return d.toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date()
    const expires = new Date(expiresAt)
    const diff = expires.getTime() - now.getTime()
    if (diff <= 0) return 'Expired'
    const minutes = Math.floor(diff / 60000)
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ${minutes % 60}m`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Document Number Reservations</h1>
          <p className="text-muted-foreground mt-1">Monitor active, expired, and used reservations</p>
        </div>
        <Button onClick={loadData} variant="outline" size="icon" disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">All reservations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-500">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">{stats.active}</div>
            <p className="text-xs text-muted-foreground mt-1">Not expired, not used</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-red-500">Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">{stats.expired}</div>
            <p className="text-xs text-muted-foreground mt-1">Not used, past expiry</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-500">Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{stats.used}</div>
            <p className="text-xs text-muted-foreground mt-1">Successfully used</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Modul</label>
              <Select value={filterModul} onValueChange={setFilterModul}>
                <SelectTrigger>
                  <SelectValue placeholder="All modules" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modules</SelectItem>
                  {modulOptions.map(modul => (
                    <SelectItem key={modul} value={modul}>
                      {modul}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="used">Used</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reservations Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Reservations</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-20 text-muted-foreground">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nomor</TableHead>
                  <TableHead>Modul</TableHead>
                  <TableHead>Kode</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Time Left</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReservations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-20 text-muted-foreground">
                      No reservations found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReservations.map(r => (
                    <TableRow key={r.reserve_id}>
                      <TableCell className="font-medium">{r.nomor}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal">
                          {r.modul}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{r.kode_dokumen}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {r.user_name || r.user_id.slice(0, 8)}
                      </TableCell>
                      <TableCell>{getStatusBadge(r)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatTime(r.created_at)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatTime(r.expires_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {new Date(r.expires_at) < new Date() && !r.used ? (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          ) : !r.used ? (
                            <Clock className="h-4 w-4 text-blue-500" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          )}
                          <span
                            className={
                              new Date(r.expires_at) < new Date() && !r.used
                                ? 'text-red-500 font-medium'
                                : 'text-muted-foreground'
                            }
                          >
                            {getTimeRemaining(r.expires_at)}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}