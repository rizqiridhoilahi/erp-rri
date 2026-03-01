'use client'

import { useState } from 'react'
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { WidgetThreshold, ThresholdStatus } from '@/store/dashboardStore'
import { cn } from '@/lib/utils'

interface WidgetThresholdSetterProps {
  threshold: WidgetThreshold | undefined
  onSave: (threshold: WidgetThreshold) => void
  onCancel: () => void
}

export function WidgetThresholdSetter({ 
  threshold, 
  onSave, 
  onCancel 
}: WidgetThresholdSetterProps) {
  const [localThreshold, setLocalThreshold] = useState<WidgetThreshold>({
    low: threshold?.low ?? null,
    medium: threshold?.medium ?? null,
    high: threshold?.high ?? null,
    inverted: threshold?.inverted ?? false,
  })

  const handleSave = () => {
    onSave(localThreshold)
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Widget Threshold Settings</h3>
        <p className="text-sm text-gray-500">
          Set threshold values to change widget color based on status
        </p>
      </div>

      {/* Status Preview */}
      <div className="flex gap-4 justify-center py-4">
        <div className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg border-2",
          localThreshold.inverted 
            ? "bg-red-50 border-red-300 text-red-700" 
            : "bg-green-50 border-green-300 text-green-700"
        )}>
          {localThreshold.inverted 
            ? <AlertCircle className="w-5 h-5" /> 
            : <CheckCircle className="w-5 h-5" />
          }
          <span className="text-sm font-medium">
            {localThreshold.inverted ? 'Good' : 'Warning'}
          </span>
        </div>
        <div className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg border-2",
          "bg-yellow-50 border-yellow-300 text-yellow-700"
        )}>
          <AlertTriangle className="w-5 h-5" />
          <span className="text-sm font-medium">Warning</span>
        </div>
        <div className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg border-2",
          localThreshold.inverted 
            ? "bg-green-50 border-green-300 text-green-700" 
            : "bg-red-50 border-red-300 text-red-700"
        )}>
          {localThreshold.inverted 
            ? <CheckCircle className="w-5 h-5" /> 
            : <AlertCircle className="w-5 h-5" />
          }
          <span className="text-sm font-medium">
            {localThreshold.inverted ? 'Warning' : 'Critical'}
          </span>
        </div>
      </div>

      {/* Threshold Values */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Low (Critical)</Label>
          <Input
            type="number"
            value={localThreshold.low ?? ''}
            onChange={(e) => setLocalThreshold({
              ...localThreshold,
              low: e.target.value ? parseInt(e.target.value) : null
            })}
            placeholder="e.g., 0"
          />
          <p className="text-xs text-gray-500">
            Below this = {localThreshold.inverted ? 'Good' : 'Critical'}
          </p>
        </div>
        <div className="space-y-2">
          <Label>Medium (Warning)</Label>
          <Input
            type="number"
            value={localThreshold.medium ?? ''}
            onChange={(e) => setLocalThreshold({
              ...localThreshold,
              medium: e.target.value ? parseInt(e.target.value) : null
            })}
            placeholder="e.g., 50"
          />
          <p className="text-xs text-gray-500">
            Between low and medium = Warning
          </p>
        </div>
        <div className="space-y-2">
          <Label>High (Good)</Label>
          <Input
            type="number"
            value={localThreshold.high ?? ''}
            onChange={(e) => setLocalThreshold({
              ...localThreshold,
              high: e.target.value ? parseInt(e.target.value) : null
            })}
            placeholder="e.g., 100"
          />
          <p className="text-xs text-gray-500">
            Above this = {localThreshold.inverted ? 'Critical' : 'Good'}
          </p>
        </div>
      </div>

      {/* Inverted Toggle - using checkbox instead */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <Label className="text-base">Inverted Threshold</Label>
          <p className="text-sm text-gray-500">
            Use when lower values are worse (e.g., low stock)
          </p>
        </div>
        <input
          type="checkbox"
          checked={localThreshold.inverted ?? false}
          onChange={(e) => setLocalThreshold({
            ...localThreshold,
            inverted: e.target.checked
          })}
          className="w-5 h-5 rounded"
        />
      </div>

      {/* Preview */}
      <div className="p-4 border rounded-lg">
        <h4 className="text-sm font-medium mb-2">Preview</h4>
        <div className="flex items-center gap-4">
          <div className={cn(
            "flex-1 p-2 rounded border-l-4",
            getStatusColor('green', localThreshold.inverted ?? false)
          )}>
            <span className="text-sm">
              Good: above {localThreshold.medium ?? 'medium'}
            </span>
          </div>
          <div className={cn(
            "flex-1 p-2 rounded border-l-4",
            getStatusColor('yellow', false)
          )}>
            <span className="text-sm">
              Warning: {localThreshold.low ?? 'low'} - {localThreshold.medium ?? 'medium'}
            </span>
          </div>
          <div className={cn(
            "flex-1 p-2 rounded border-l-4",
            getStatusColor('red', localThreshold.inverted ?? false)
          )}>
            <span className="text-sm">
              Critical: below {localThreshold.low ?? 'low'}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save Threshold
        </Button>
      </div>
    </div>
  )
}

function getStatusColor(status: ThresholdStatus, inverted: boolean): string {
  if (status === 'green') {
    return inverted 
      ? 'bg-red-50 border-red-400 text-red-700' 
      : 'bg-green-50 border-green-400 text-green-700'
  }
  if (status === 'yellow') {
    return 'bg-yellow-50 border-yellow-400 text-yellow-700'
  }
  return inverted 
    ? 'bg-green-50 border-green-400 text-green-700' 
    : 'bg-red-50 border-red-400 text-red-700'
}
