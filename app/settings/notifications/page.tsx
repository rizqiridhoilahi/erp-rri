'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Bell, Mail, Smartphone, Settings, Save, RotateCcw } from 'lucide-react'
import { useNotificationStore } from '@/store/notificationStore'
import { NotificationType, getNotificationLabel } from '@/lib/validations/notification'

const notificationTypes: NotificationType[] = [
  'quotation_expiring',
  'quotation_accepted',
  'quotation_rejected',
  'sales_order_created',
  'sales_order_confirmed',
  'delivery_order_ready',
  'delivery_order_delivered',
  'invoice_created',
  'invoice_paid',
  'invoice_overdue',
  'low_stock',
  'payment_received',
  'system_alert',
  'approval_required',
]

export default function NotificationPreferencesPage() {
  const router = useRouter()
  const { preferences, updatePreference, alertRules, addAlertRule, updateAlertRule, removeAlertRule } = useNotificationStore()
  
  const [activeTab, setActiveTab] = useState<'notifications' | 'alerts'>('notifications')
  const [isSaving, setIsSaving] = useState(false)

  // Local state for form
  const [localPreferences, setLocalPreferences] = useState(preferences)

  const handleToggleType = (type: string) => {
    if (!localPreferences) return
    setLocalPreferences({
      ...localPreferences,
      types: {
        ...localPreferences.types,
        [type]: !localPreferences.types[type],
      },
    })
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    if (localPreferences) {
      updatePreference('channels', localPreferences.channels)
      updatePreference('types', localPreferences.types)
      updatePreference('emailDigest', localPreferences.emailDigest)
      updatePreference('pushEnabled', localPreferences.pushEnabled)
    }
    setIsSaving(false)
    alert('Preferences saved successfully!')
  }

  const handleReset = () => {
    setLocalPreferences(preferences)
  }

  if (!localPreferences) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notification Settings</h1>
            <p className="text-gray-600 mt-1">Kelola preferensi notifikasi dan alert</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'notifications' ? 'default' : 'outline'}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell className="w-4 h-4 mr-2" />
            Notifikasi
          </Button>
          <Button
            variant={activeTab === 'alerts' ? 'default' : 'outline'}
            onClick={() => setActiveTab('alerts')}
          >
            <Settings className="w-4 h-4 mr-2" />
            Alert Rules
          </Button>
        </div>

        {activeTab === 'notifications' ? (
          <div className="space-y-6">
            {/* Channel Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Notification Channels
                </CardTitle>
                <CardDescription>
                  Pilih saluran notifikasi yang ingin Anda aktifkan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium">In-App Notifications</p>
                      <p className="text-sm text-gray-500">Terima notifikasi di dalam aplikasi</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={localPreferences.channels.includes('in_app')}
                    onChange={(e) => {
                      const channels = e.target.checked
                        ? [...localPreferences.channels, 'in_app'] as ('in_app' | 'email' | 'sms')[]
                        : localPreferences.channels.filter((c) => c !== 'in_app') as ('in_app' | 'email' | 'sms')[]
                      setLocalPreferences({ ...localPreferences, channels })
                    }}
                    className="w-5 h-5 rounded border-gray-300"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-500">Terima notifikasi melalui email</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={localPreferences.channels.includes('email')}
                    onChange={(e) => {
                      const channels = e.target.checked
                        ? [...localPreferences.channels, 'email'] as ('in_app' | 'email' | 'sms')[]
                        : localPreferences.channels.filter((c) => c !== 'email') as ('in_app' | 'email' | 'sms')[]
                      setLocalPreferences({ ...localPreferences, channels })
                    }}
                    className="w-5 h-5 rounded border-gray-300"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-gray-500">Terima notifikasi push di browser</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={localPreferences.pushEnabled}
                    onChange={(e) =>
                      setLocalPreferences({ ...localPreferences, pushEnabled: e.target.checked })
                    }
                    className="w-5 h-5 rounded border-gray-300"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Email Digest */}
            <Card>
              <CardHeader>
                <CardTitle>Email Digest</CardTitle>
                <CardDescription>
                  Frekuensi email summary yang ingin Anda terima
                </CardDescription>
              </CardHeader>
              <CardContent>
                <select
                  value={localPreferences.emailDigest}
                  onChange={(e) =>
                    setLocalPreferences({ ...localPreferences, emailDigest: e.target.value as any })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="none">Tidak ada email</option>
                  <option value="daily">Harian</option>
                  <option value="weekly">Mingguan</option>
                </select>
              </CardContent>
            </Card>

            {/* Notification Types */}
            <Card>
              <CardHeader>
                <CardTitle>Notification Types</CardTitle>
                <CardDescription>
                  Pilih jenis notifikasi yang ingin Anda terima
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {notificationTypes.map((type) => (
                    <div
                      key={type}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-sm font-medium">{getNotificationLabel(type)}</span>
                      <input
                        type="checkbox"
                        checked={localPreferences.types[type] ?? false}
                        onChange={() => handleToggleType(type)}
                        className="w-5 h-5 rounded border-gray-300"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Preferences'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Alert Rules */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Alert Rules</CardTitle>
                    <CardDescription>
                      Konfigurasi aturan alert otomatis
                    </CardDescription>
                  </div>
                  <Button size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Add Rule
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {alertRules.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p>Belum ada alert rules</p>
                    <p className="text-sm">Buat aturan alert untuk notifikasi otomatis</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {alertRules.map((rule) => (
                      <div
                        key={rule.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{rule.name}</p>
                            <Badge
                              variant={rule.isActive ? 'default' : 'secondary'}
                              className={rule.isActive ? 'bg-green-100 text-green-700' : ''}
                            >
                              {rule.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge variant="outline">
                              {rule.priority}
                            </Badge>
                          </div>
                          {rule.description && (
                            <p className="text-sm text-gray-500 mt-1">{rule.description}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            Trigger: {rule.condition.type.replace(/_/g, ' ')} - {rule.condition.value}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => rule.id && updateAlertRule(rule.id, { isActive: !rule.isActive })}
                          >
                            {rule.isActive ? 'Disable' : 'Enable'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                            onClick={() => rule.id && removeAlertRule(rule.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
