'use client'

import { useState, useCallback } from 'react'
import { Calendar, Clock, Mail, Plus, Trash2, Edit2, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { ExportEntityType, ExportFormat, exportSchedulerSchema, ExportSchedulerInput } from '@/lib/validations/import-export'
import { useImportExportStore, ScheduledExport } from '@/store/importExportStore'

interface ExportSchedulerProps {
  isOpen: boolean
  onClose: () => void
}

const entityTypeLabels: Record<ExportEntityType, string> = {
  products: 'Produk',
  customers: 'Pelanggan',
  suppliers: 'Supplier',
  sales_orders: 'Pesanan Penjualan',
  invoices: 'Faktur',
  quotations: 'Penawaran',
  journal_entries: 'Jurnal Umum',
  trial_balance: 'Neraca Saldo',
}

export function ExportScheduler({ isOpen, onClose }: ExportSchedulerProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Form state
  const [entityType, setEntityType] = useState<ExportEntityType>('products')
  const [format, setFormat] = useState<ExportFormat>('xlsx')
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [time, setTime] = useState('09:00')
  const [emailInput, setEmailInput] = useState('')
  const [emailRecipients, setEmailRecipients] = useState<string[]>([])
  const [isActive, setIsActive] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  const { scheduledExports, addScheduledExport, updateScheduledExport, removeScheduledExport } = useImportExportStore()

  // Add email recipient
  const addEmailRecipient = useCallback(() => {
    if (emailInput && emailInput.includes('@')) {
      setEmailRecipients([...emailRecipients, emailInput])
      setEmailInput('')
    }
  }, [emailInput, emailRecipients])

  // Remove email recipient
  const removeEmailRecipient = useCallback((email: string) => {
    setEmailRecipients(emailRecipients.filter(e => e !== email))
  }, [emailRecipients])

  // Save schedule
  const handleSave = useCallback(async () => {
    setIsSaving(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const scheduleData: ExportSchedulerInput = {
      entityType,
      format,
      frequency,
      time,
      emailRecipients,
      isActive,
    }
    
    if (editingId) {
      updateScheduledExport(editingId, {
        ...scheduleData,
        id: editingId,
        createdAt: new Date().toISOString(),
      })
    } else {
      const newSchedule: ScheduledExport = {
        ...scheduleData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      }
      addScheduledExport(newSchedule)
    }
    
    setIsSaving(false)
    resetForm()
    setIsEditing(false)
  }, [entityType, format, frequency, time, emailRecipients, isActive, editingId, addScheduledExport, updateScheduledExport])

  // Edit schedule
  const handleEdit = useCallback((schedule: ScheduledExport) => {
    setEntityType(schedule.entityType)
    setFormat(schedule.format)
    setFrequency(schedule.frequency)
    setTime(schedule.time)
    setEmailRecipients(schedule.emailRecipients)
    setIsActive(schedule.isActive)
    setEditingId(schedule.id)
    setIsEditing(true)
  }, [])

  // Delete schedule
  const handleDelete = useCallback((id: string) => {
    removeScheduledExport(id)
  }, [removeScheduledExport])

  // Reset form
  const resetForm = useCallback(() => {
    setEntityType('products')
    setFormat('xlsx')
    setFrequency('daily')
    setTime('09:00')
    setEmailRecipients([])
    setEmailInput('')
    setIsActive(true)
    setEditingId(null)
  }, [])

  // Close modal
  const handleClose = useCallback(() => {
    resetForm()
    setIsEditing(false)
    onClose()
  }, [onClose, resetForm])

  const frequencyLabels = {
    daily: 'Harian',
    weekly: 'Mingguan',
    monthly: 'Bulanan',
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            Jadwal Ekspor Otomatis
          </DialogTitle>
          <DialogDescription>
            Atur ekspor otomatis data ke email secara terjadwal
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Scheduled Exports List */}
          {!isEditing && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Jadwal Aktif</h3>
                <Button size="sm" onClick={() => setIsEditing(true)} className="gap-1">
                  <Plus className="h-4 w-4" />
                  Tambah Jadwal
                </Button>
              </div>
              
              {scheduledExports.length === 0 ? (
                <Card className="bg-gray-50">
                  <CardContent className="py-8 text-center">
                    <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">Belum ada jadwal ekspor</p>
                    <p className="text-sm text-gray-400">Klik "Tambah Jadwal" untuk membuat jadwal baru</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {scheduledExports.map((schedule) => (
                    <Card key={schedule.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${schedule.isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
                              {schedule.isActive ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <AlertCircle className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{entityTypeLabels[schedule.entityType]}</p>
                              <p className="text-sm text-gray-500">
                                {frequencyLabels[schedule.frequency]} • {schedule.time} • {schedule.format.toUpperCase()}
                              </p>
                              <p className="text-sm text-gray-400">
                                {schedule.emailRecipients.length} penerima
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={schedule.isActive}
                              onCheckedChange={(checked) => updateScheduledExport(schedule.id, { isActive: checked })}
                            />
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(schedule)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(schedule.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Add/Edit Form */}
          {isEditing && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{editingId ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}</h3>
                <Button variant="ghost" size="sm" onClick={() => { resetForm(); setIsEditing(false); }}>
                  <X className="h-4 w-4 mr-1" />
                  Batal
                </Button>
              </div>

              {/* Entity Type */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Jenis Data</Label>
                  <Select value={entityType} onValueChange={(v) => setEntityType(v as ExportEntityType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(entityTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Format</Label>
                  <Select value={format} onValueChange={(v) => setFormat(v as ExportFormat)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Frequency & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Frekuensi</Label>
                  <Select value={frequency} onValueChange={(v) => setFrequency(v as 'daily' | 'weekly' | 'monthly')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Harian</SelectItem>
                      <SelectItem value="weekly">Mingguan</SelectItem>
                      <SelectItem value="monthly">Bulanan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Waktu</Label>
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
              </div>

              {/* Email Recipients */}
              <div className="space-y-2">
                <Label>Penerima Email</Label>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Masukkan alamat email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEmailRecipient())}
                  />
                  <Button type="button" onClick={addEmailRecipient} variant="secondary">
                    Tambah
                  </Button>
                </div>
                {emailRecipients.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {emailRecipients.map((email) => (
                      <Badge key={email} variant="secondary" className="gap-1">
                        {email}
                        <button onClick={() => removeEmailRecipient(email)}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Active Switch */}
              <div className="flex items-center justify-between">
                <div>
                  <Label>Aktif</Label>
                  <p className="text-sm text-gray-500">Jadwal akan berjalan sesuai waktu yang ditentukan</p>
                </div>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>

              <Button onClick={handleSave} disabled={isSaving || emailRecipients.length === 0} className="w-full">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {editingId ? 'Simpan Perubahan' : 'Buat Jadwal'}
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
