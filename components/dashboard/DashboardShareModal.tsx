'use client'

import { useState } from 'react'
import { Share2, Users, Mail, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useDashboardStore } from '@/store/dashboardStore'

interface DashboardShareModalProps {
  dashboardId: string
  isOpen: boolean
  onClose: () => void
}

// Mock users for demo
const mockUsers = [
  { id: 'user-1', name: 'Ahmad Sales', email: 'ahmad@rri.com', role: 'Sales' },
  { id: 'user-2', name: 'Budi Finance', email: 'budi@rri.com', role: 'Finance' },
  { id: 'user-3', name: 'Charlie Warehouse', email: 'charlie@rri.com', role: 'Warehouse' },
  { id: 'user-4', name: 'Diana Admin', email: 'diana@rri.com', role: 'Admin' },
]

export function DashboardShareModal({ dashboardId, isOpen, onClose }: DashboardShareModalProps) {
  const { dashboards, shareDashboard, unshareDashboard } = useDashboardStore()
  
  const dashboard = dashboards.find((d) => d.id === dashboardId)
  const sharedWith = dashboard?.sharedWith || []
  
  const [selectedUsers, setSelectedUsers] = useState<string[]>(sharedWith)
  const [emailInput, setEmailInput] = useState('')
  const [emailList, setEmailList] = useState<string[]>([])

  const handleToggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    )
  }

  const handleAddEmail = () => {
    if (emailInput.trim() && !emailList.includes(emailInput.trim())) {
      setEmailList([...emailList, emailInput.trim()])
      setEmailInput('')
    }
  }

  const handleRemoveEmail = (email: string) => {
    setEmailList(emailList.filter((e) => e !== email))
  }

  const handleSave = () => {
    // Share with selected users
    shareDashboard(dashboardId, selectedUsers)
    onClose()
  }

  const getUserById = (id: string) => mockUsers.find((u) => u.id === id)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Dashboard
          </DialogTitle>
          <DialogDescription>
            Share "{dashboard?.name}" with team members
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* User Selection */}
          <div>
            <Label className="text-base">Share with Users</Label>
            <p className="text-sm text-gray-500 mb-2">Select users from your team</p>
            <div className="space-y-2">
              {mockUsers.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
                    selectedUsers.includes(user.id)
                      ? 'bg-blue-50 border-blue-300'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleToggleUser(user.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                    selectedUsers.includes(user.id)
                      ? 'bg-blue-600 border-blue-600'
                      : 'border-gray-300'
                  }`}>
                    {selectedUsers.includes(user.id) && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Email Input */}
          <div>
            <Label className="text-base">Or add external email</Label>
            <p className="text-sm text-gray-500 mb-2">Share with people outside the system</p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="email@example.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddEmail()}
              />
              <Button variant="outline" onClick={handleAddEmail}>
                <Mail className="w-4 h-4" />
              </Button>
            </div>
            {emailList.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {emailList.map((email) => (
                  <Badge key={email} variant="secondary" className="gap-1">
                    {email}
                    <button
                      onClick={() => handleRemoveEmail(email)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Preview */}
          {selectedUsers.length > 0 && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-2">Will be shared with:</p>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((userId) => {
                  const user = getUserById(userId)
                  return user ? (
                    <Badge key={user.id} variant="outline" className="gap-1">
                      <Users className="w-3 h-3" />
                      {user.name}
                    </Badge>
                  ) : null
                })}
                {emailList.map((email) => (
                  <Badge key={email} variant="outline" className="gap-1">
                    <Mail className="w-3 h-3" />
                    {email}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save & Share
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
