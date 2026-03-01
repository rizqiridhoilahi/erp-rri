'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useNotificationStore } from '@/store/notificationStore'
import { AlertRule, AlertConditionType, AlertPriority } from '@/lib/validations/notification'
import { Plus, Settings, Trash2, Edit2, X } from 'lucide-react'

const conditionTypes: { value: AlertConditionType; label: string }[] = [
  { value: 'stock_below', label: 'Stock Below Threshold' },
  { value: 'quotation_expiring_days', label: 'Quotation Expiring (Days)' },
  { value: 'invoice_overdue_days', label: 'Invoice Overdue (Days)' },
  { value: 'order_value_above', label: 'Order Value Above' },
  { value: 'payment_received', label: 'Payment Received' },
  { value: 'customer_created', label: 'New Customer Created' },
  { value: 'daily_sales_below', label: 'Daily Sales Below' },
  { value: 'monthly_revenue_below', label: 'Monthly Revenue Below' },
]

const priorityOptions: { value: AlertPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

const channelOptions = [
  { value: 'in_app', label: 'In-App' },
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
]

interface AlertRulesConfigurationProps {
  editable?: boolean
}

export function AlertRulesConfiguration({ editable = true }: AlertRulesConfigurationProps) {
  const { alertRules, addAlertRule, updateAlertRule, removeAlertRule } = useNotificationStore()
  
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    conditionType: 'stock_below' as AlertConditionType,
    conditionValue: 10,
    priority: 'medium' as AlertPriority,
    notifyChannels: ['in_app'] as string[],
  })

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      conditionType: 'stock_below',
      conditionValue: 10,
      priority: 'medium',
      notifyChannels: ['in_app'],
    })
    setIsAddingNew(false)
    setEditingId(null)
  }

  const handleSave = () => {
    if (!formData.name.trim()) return

    const rule: AlertRule = {
      id: editingId || `rule-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      isActive: true,
      condition: {
        type: formData.conditionType,
        value: formData.conditionValue,
      },
      actions: {
        notifyChannels: formData.notifyChannels as ('in_app' | 'email' | 'sms')[],
        notifyUsers: [],
      },
      priority: formData.priority,
    }

    if (editingId) {
      updateAlertRule(editingId, rule)
    } else {
      addAlertRule(rule)
    }

    resetForm()
  }

  const handleEdit = (rule: AlertRule) => {
    if (!rule.id) return
    setEditingId(rule.id)
    setFormData({
      name: rule.name,
      description: rule.description || '',
      conditionType: rule.condition.type,
      conditionValue: typeof rule.condition.value === 'number' ? rule.condition.value : 10,
      priority: rule.priority,
      notifyChannels: rule.actions.notifyChannels,
    })
    setIsAddingNew(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this alert rule?')) {
      removeAlertRule(id)
    }
  }

  const toggleChannel = (channel: string) => {
    const channels = formData.notifyChannels.includes(channel)
      ? formData.notifyChannels.filter(c => c !== channel)
      : [...formData.notifyChannels, channel]
    setFormData({ ...formData, notifyChannels: channels })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Alert Rules Configuration
            </CardTitle>
            <CardDescription>
              Configure automated alert triggers
            </CardDescription>
          </div>
          {editable && !isAddingNew && (
            <Button size="sm" onClick={() => setIsAddingNew(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Rule
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Add/Edit Form */}
        {isAddingNew && (
          <div className="mb-6 p-4 border border-blue-200 bg-blue-50 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{editingId ? 'Edit Alert Rule' : 'New Alert Rule'}</h4>
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ruleName">Rule Name *</Label>
                <Input
                  id="ruleName"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Low Stock Warning"
                />
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value as AlertPriority })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>

              <div>
                <Label htmlFor="conditionType">Condition Type</Label>
                <Select
                  value={formData.conditionType}
                  onValueChange={(value) => setFormData({ ...formData, conditionType: value as AlertConditionType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {conditionTypes.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="conditionValue">Threshold Value</Label>
                <Input
                  id="conditionValue"
                  type="number"
                  value={formData.conditionValue}
                  onChange={(e) => setFormData({ ...formData, conditionValue: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="md:col-span-2">
                <Label>Notification Channels</Label>
                <div className="flex gap-4 mt-2">
                  {channelOptions.map((channel) => (
                    <label key={channel.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.notifyChannels.includes(channel.value)}
                        onChange={() => toggleChannel(channel.value)}
                        className="w-4 h-4 rounded"
                      />
                      <span>{channel.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!formData.name.trim()}>
                {editingId ? 'Update' : 'Create'} Rule
              </Button>
            </div>
          </div>
        )}

        {/* Rules List */}
        {alertRules.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Settings className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>No alert rules configured</p>
            <p className="text-sm">Create an alert rule to get automatic notifications</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alertRules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{rule.name}</span>
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
                    <span className="mx-1">|</span>
                    Notify: {rule.actions.notifyChannels.join(', ')}
                  </p>
                </div>
                {editable && (
                  <div className="flex items-center gap-1 ml-4">
                    {rule.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateAlertRule(rule.id!, { isActive: !rule.isActive })}
                      >
                        {rule.isActive ? 'Disable' : 'Enable'}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => rule.id && handleEdit(rule)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600"
                      onClick={() => rule.id && handleDelete(rule.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
