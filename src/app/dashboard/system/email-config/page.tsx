"use client"
import { useEffect, useState, useRef } from 'react'
import { apiFetch } from '@/lib/api/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/page-header'
import { toast } from 'sonner'
import { Mail, Send, Loader2, CheckCircle2, XCircle, AlertTriangle, Plus, ExternalLink, RefreshCw } from 'lucide-react'

interface ConfigField {
  value: string | null
  masked: string | null
  source: 'db' | 'env' | null
}

interface ConfigData {
  brevo_sender_email: ConfigField
  brevo_sender_name: ConfigField
  brevo_api_key: ConfigField
  brevo_smtp_login: ConfigField
  brevo_smtp_password: ConfigField
  brevo_webhook_secret: ConfigField
  email_inbound_secret: ConfigField
}

interface TestResult {
  name: string
  status: 'ok' | 'error' | 'warning'
  message: string
}

interface Sender {
  id: number
  name: string
  email: string
  active: boolean
  createdAt?: string
}

const FIELDS: Array<{ key: keyof ConfigData; label: string; placeholder: string; type?: string; hint: string; section: string; sectionLabel: string; sectionDesc: string }> = [
  { key: 'brevo_sender_name', label: 'Sender Name', placeholder: 'Nama pengirim', hint: 'Nama yang muncul sebagai pengirim (contoh: ERP RRI)', section: 'sender', sectionLabel: 'Informasi Pengirim', sectionDesc: 'Nama dan email yang muncul sebagai pengirim' },
  { key: 'brevo_sender_email', label: 'Sender Email', placeholder: 'email@domain.com', hint: 'Email terverifikasi di Brevo → Settings → Senders. Hanya email yang sudah diverifikasi bisa dipakai.', section: 'sender', sectionLabel: 'Informasi Pengirim', sectionDesc: 'Nama dan email yang muncul sebagai pengirim' },
  { key: 'brevo_api_key', label: 'Brevo API Key', placeholder: '', type: 'password', hint: 'Dari Brevo Dashboard → Settings → API Keys → copy "API key". Format: xkeysib-...', section: 'brevo', sectionLabel: 'Brevo API', sectionDesc: 'API key untuk mengirim email via Brevo API' },
  { key: 'brevo_smtp_login', label: 'SMTP Login', placeholder: '', type: 'password', hint: 'Dari Brevo Dashboard → SMTP & API. Format: xxx@smtp-brevo.com', section: 'smtp', sectionLabel: 'Brevo SMTP', sectionDesc: 'Kredensial SMTP untuk menerima reply email (threading)' },
  { key: 'brevo_smtp_password', label: 'SMTP Password', placeholder: '', type: 'password', hint: 'Dari Brevo Dashboard → SMTP & API → copy "SMTP password". Format: xsmtpsib-...', section: 'smtp', sectionLabel: 'Brevo SMTP', sectionDesc: 'Kredensial SMTP untuk menerima reply email (threading)' },
  { key: 'brevo_webhook_secret', label: 'Webhook Secret', placeholder: '', type: 'password', hint: 'Generate dengan: openssl rand -hex 32. Set juga di Brevo → Webhooks → pilih webhook → Secret key.', section: 'webhook', sectionLabel: 'Webhook', sectionDesc: 'Secret key untuk verifikasi webhook dari Brevo' },
  { key: 'email_inbound_secret', label: 'Inbound Secret', placeholder: '', type: 'password', hint: 'Generate dengan: openssl rand -hex 32. Harus SAMA persis dengan ERP_INBOUND_SECRET di Cloudflare Worker.', section: 'inbound', sectionLabel: 'Inbound Email', sectionDesc: 'Secret key untuk verifikasi email inbound dari Cloudflare' },
]

const SECTION_KEYS: Record<string, Array<keyof ConfigData>> = {
  sender: ['brevo_sender_name', 'brevo_sender_email'],
  brevo: ['brevo_api_key'],
  smtp: ['brevo_smtp_login', 'brevo_smtp_password'],
  webhook: ['brevo_webhook_secret'],
  inbound: ['email_inbound_secret'],
}

export default function EmailConfigPage() {
  const [config, setConfig] = useState<ConfigData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[] | null>(null)
  const [values, setValues] = useState<Record<keyof ConfigData, string>>({} as Record<keyof ConfigData, string>)
  const [showTest, setShowTest] = useState(false)
  const mountedRef = useRef(false)

  const [senders, setSenders] = useState<Sender[]>([])
  const [sendersLoading, setSendersLoading] = useState(false)
  const [senderDialogOpen, setSenderDialogOpen] = useState(false)
  const [newSender, setNewSender] = useState({ name: '', email: '' })
  const [senderSubmitting, setSenderSubmitting] = useState(false)

  const loadConfig = async () => {
    setLoading(true)
    try {
      const r = await apiFetch<ConfigData>('/api/v1/system/email-config')
      if (!mountedRef.current) return
      const data = r.data
      setConfig(data)
      const initial: Record<string, string> = {}
      for (const key of Object.keys(data) as Array<keyof ConfigData>) {
        initial[key] = ''
      }
      setValues(initial as Record<keyof ConfigData, string>)
    } catch {
      if (!mountedRef.current) return
      toast.error('Gagal memuat konfigurasi email')
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }

  const loadSenders = async () => {
    setSendersLoading(true)
    try {
      const r = await apiFetch<Sender[]>('/api/v1/system/email-config/senders')
      if (!mountedRef.current) return
      if (r.data) setSenders(r.data)
    } catch {
      // silent — might not be configured
    } finally {
      if (mountedRef.current) setSendersLoading(false)
    }
  }

  useEffect(() => {
    mountedRef.current = true
    ;(async () => {
      try {
        const r = await apiFetch<ConfigData>('/api/v1/system/email-config')
        if (!mountedRef.current) return
        const data = r.data
        setConfig(data)
        const initial: Record<string, string> = {}
        for (const key of Object.keys(data) as Array<keyof ConfigData>) {
          initial[key] = ''
        }
        setValues(initial as Record<keyof ConfigData, string>)
      } catch {
        if (!mountedRef.current) return
        toast.error('Gagal memuat konfigurasi email')
      } finally {
        if (mountedRef.current) setLoading(false)
      }
    })()
    ;(async () => {
      try {
        const sr = await apiFetch<Sender[]>('/api/v1/system/email-config/senders')
        if (mountedRef.current && sr.data) setSenders(sr.data)
      } catch {
        // silent — API key mungkin belum dikonfig
      }
    })()
    return () => { mountedRef.current = false }
  }, [])

  const handleChange = (key: keyof ConfigData, val: string) => {
    setValues(prev => ({ ...prev, [key]: val }))
  }

  const handleSave = async () => {
    const changed: Record<string, string> = {}
    for (const key of Object.keys(values) as Array<keyof ConfigData>) {
      if (values[key]) {
        changed[key] = values[key]
      }
    }
    if (Object.keys(changed).length === 0) {
      toast.warning('Tidak ada data yang diubah')
      return
    }
    setSaving(true)
    try {
      await apiFetch('/api/v1/system/email-config', {
        method: 'POST',
        body: JSON.stringify(changed),
      })
      toast.success('Pengaturan email berhasil disimpan')
      setValues({} as Record<keyof ConfigData, string>)
      loadConfig()
    } catch {
      toast.error('Gagal menyimpan pengaturan email')
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    setTesting(true)
    setTestResults(null)
    setShowTest(true)
    try {
      const r = await apiFetch<TestResult[]>('/api/v1/system/email-config/test', {
        method: 'POST',
      })
      setTestResults(r.data)
    } catch {
      toast.error('Gagal menjalankan test koneksi')
    } finally {
      setTesting(false)
    }
  }

  const handleAddSender = async () => {
    if (!newSender.email || !newSender.name) {
      toast.warning('Nama dan email wajib diisi')
      return
    }
    setSenderSubmitting(true)
    try {
      const r = await apiFetch('/api/v1/system/email-config/senders', {
        method: 'POST',
        body: JSON.stringify(newSender),
      })
      toast.success(r.message || `Email verifikasi telah dikirim ke ${newSender.email}`)
      setSenderDialogOpen(false)
      setNewSender({ name: '', email: '' })
      loadSenders()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menambah sender')
    } finally {
      setSenderSubmitting(false)
    }
  }

  const renderField = (key: keyof ConfigData) => {
    const field = FIELDS.find(f => f.key === key)
    if (!field) return null
    const cfg = config?.[key]
    return (
      <div key={key} className="space-y-1.5">
        <Label htmlFor={key}>{field.label}</Label>
        <div className="relative">
          <Input
            id={key}
            type={field.type || 'text'}
            placeholder={cfg?.masked ?? field.placeholder}
            value={values[key]}
            onChange={e => handleChange(key, e.target.value)}
          />
          {cfg?.source && !values[key] && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              {cfg.source === 'env' ? 'ENV' : 'DB'}
            </span>
          )}
        </div>
        {field.hint && (
          <p className="text-xs text-muted-foreground">{field.hint}</p>
        )}
      </div>
    )
  }

  const renderSection = (sectionId: string) => {
    const fieldDef = FIELDS.find(f => f.section === sectionId)
    if (!fieldDef) return null
    const keys = SECTION_KEYS[sectionId]
    return (
      <Card key={sectionId}>
        <CardHeader>
          <CardTitle className="text-base">{fieldDef.sectionLabel}</CardTitle>
          <CardDescription>{fieldDef.sectionDesc}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {keys.map(key => renderField(key))}
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Konfigurasi Email" description="Atur pengaturan email untuk seluruh sistem" />
        <div className="grid gap-6">
          {[1, 2, 3, 4, 5].map(i => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-5 w-48" /><Skeleton className="h-4 w-72 mt-1" /></CardHeader>
              <CardContent className="grid gap-4">
                <Skeleton className="h-10 w-full" />
                {i < 3 && <Skeleton className="h-10 w-full" />}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Konfigurasi Email"
        description="Atur pengaturan email untuk seluruh sistem"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleTest} disabled={testing}>
              {testing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              Test Koneksi
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
              Simpan
            </Button>
          </div>
        }
      />

      {showTest && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Hasil Test Koneksi</CardTitle>
          </CardHeader>
          <CardContent>
            {testResults ? (
              <div className="grid gap-3">
                {testResults.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    {r.status === 'ok' ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" /> :
                     r.status === 'warning' ? <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" /> :
                     <XCircle className="h-4 w-4 text-red-500 shrink-0" />}
                    <span className="font-medium min-w-[140px]">{r.name}</span>
                    <span className="text-muted-foreground">{r.message}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Menjalankan test...
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        {Object.keys(SECTION_KEYS).map(renderSection)}

        {/* Manage Senders */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-base">Manage Senders</CardTitle>
              <CardDescription>
                Daftar pengirim email yang terverifikasi di Brevo. Hanya sender dengan status Aktif yang bisa digunakan.
              </CardDescription>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={loadSenders} disabled={sendersLoading}>
                <RefreshCw className={`h-4 w-4 ${sendersLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Dialog open={senderDialogOpen} onOpenChange={setSenderDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Tambah Sender
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tambah Sender Baru</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="sender-name">Nama</Label>
                      <Input
                        id="sender-name"
                        placeholder="Nama pengirim"
                        value={newSender.name}
                        onChange={e => setNewSender(p => ({ ...p, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="sender-email">Email</Label>
                      <Input
                        id="sender-email"
                        type="email"
                        placeholder="sender@domain.com"
                        value={newSender.email}
                        onChange={e => setNewSender(p => ({ ...p, email: e.target.value }))}
                      />
                      <p className="text-xs text-muted-foreground">
                        Brevo akan mengirim email verifikasi ke alamat ini. Sender hanya bisa dipakai setelah diverifikasi.
                      </p>
                    </div>
                    <Button onClick={handleAddSender} disabled={senderSubmitting}>
                      {senderSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                      Kirim Undangan Verifikasi
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {sendersLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : senders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Belum ada sender. Klik &ldquo;Tambah Sender&rdquo; untuk mengundang pengirim baru.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {senders.map(s => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{s.email}</TableCell>
                      <TableCell>
                        <Badge variant={s.active ? 'default' : 'secondary'}>
                          {s.active ? 'Aktif' : 'Belum Diverifikasi'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
              <ExternalLink className="h-3 w-3" />
              <span>
                Kelola sender juga bisa dilakukan di{' '}
                <a
                  href="https://app.brevo.com/senders/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-foreground"
                >
                  Brevo Dashboard → Senders
                </a>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-2 mt-8">
        <Button variant="outline" onClick={handleTest} disabled={testing}>
          {testing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
          Test Koneksi
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
          Simpan Pengaturan
        </Button>
      </div>
    </div>
  )
}
