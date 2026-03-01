'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download, Calendar, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardSelector } from '@/components/dashboard/DashboardSelector'
import { DashboardBuilder } from '@/components/dashboard/DashboardBuilder'
import { DashboardShareModal } from '@/components/dashboard/DashboardShareModal'
import { useDashboardStore } from '@/store/dashboardStore'

export default function DashboardCustomizePage() {
  const router = useRouter()
  const { currentDashboardId, dashboards, schedules, addSchedule, toggleSchedule, removeSchedule } = useDashboardStore()
  
  const [showShareModal, setShowShareModal] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)

  const dashboard = dashboards.find((d) => d.id === currentDashboardId)
  const currentSchedules = schedules.filter((s) => s.dashboardId === currentDashboardId)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Customization</h1>
              <p className="text-gray-600 mt-1">Customize your dashboard widgets and layout</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <DashboardSelector onShare={() => setShowShareModal(true)} />
            
            <Button variant="outline" onClick={() => setShowScheduleDialog(true)}>
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Export
            </Button>
          </div>
        </div>

        {/* Dashboard Builder */}
        <DashboardBuilder 
          dashboardId={currentDashboardId || 'default'} 
          isEditable={true}
        />

        {/* Schedules Section */}
        {currentSchedules.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Scheduled Exports</h2>
            <div className="grid gap-4">
              {currentSchedules.map((schedule) => (
                <Card key={schedule.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${schedule.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <div>
                        <p className="font-medium capitalize">
                          {schedule.frequency} at {schedule.time}
                        </p>
                        <p className="text-sm text-gray-500">
                          {schedule.recipients.length} recipient(s) • {schedule.format.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleSchedule(schedule.id)}
                      >
                        {schedule.isActive ? 'Disable' : 'Enable'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() => removeSchedule(schedule.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Schedule Dialog */}
        {showScheduleDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Schedule Dashboard Export
                </CardTitle>
                <CardDescription>
                  Set up automatic email exports of this dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScheduleForm 
                  dashboardId={currentDashboardId || ''}
                  onCancel={() => setShowScheduleDialog(false)}
                  onSave={(schedule) => {
                    addSchedule(schedule)
                    setShowScheduleDialog(false)
                  }}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Share Modal */}
        {currentDashboardId && (
          <DashboardShareModal
            dashboardId={currentDashboardId}
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
          />
        )}
      </div>
    </div>
  )
}

// Simple schedule form
interface ScheduleFormProps {
  dashboardId: string
  onCancel: () => void
  onSave: (schedule: any) => void
}

function ScheduleForm({ dashboardId, onCancel, onSave }: ScheduleFormProps) {
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [time, setTime] = useState('09:00')
  const [format, setFormat] = useState<'pdf' | 'excel'>('pdf')
  const [emailInput, setEmailInput] = useState('')
  const [emails, setEmails] = useState<string[]>([])

  const handleSubmit = () => {
    if (emails.length === 0) return
    
    onSave({
      id: `sched-${Date.now()}`,
      dashboardId,
      frequency,
      time,
      recipients: emails,
      format,
      isActive: true,
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Frequency</label>
        <select
          className="w-full mt-1 p-2 border rounded-md"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as any)}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      <div>
        <label className="text-sm font-medium">Time</label>
        <input
          type="time"
          className="w-full mt-1 p-2 border rounded-md"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
      </div>

      <div>
        <label className="text-sm font-medium">Format</label>
        <select
          className="w-full mt-1 p-2 border rounded-md"
          value={format}
          onChange={(e) => setFormat(e.target.value as any)}
        >
          <option value="pdf">PDF</option>
          <option value="excel">Excel</option>
        </select>
      </div>

      <div>
        <label className="text-sm font-medium">Recipients</label>
        <div className="flex gap-2 mt-1">
          <input
            type="email"
            placeholder="email@example.com"
            className="flex-1 p-2 border rounded-md"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), setEmails([...emails, emailInput]), setEmailInput(''))}
          />
          <Button
            variant="outline"
            onClick={() => {
              if (emailInput) {
                setEmails([...emails, emailInput])
                setEmailInput('')
              }
            }}
          >
            Add
          </Button>
        </div>
        {emails.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {emails.map((email) => (
              <span
                key={email}
                className="px-2 py-1 bg-gray-100 rounded text-sm flex items-center gap-1"
              >
                {email}
                <button
                  onClick={() => setEmails(emails.filter((e) => e !== email))}
                  className="text-red-500"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={emails.length === 0}>
          Save Schedule
        </Button>
      </div>
    </div>
  )
}
