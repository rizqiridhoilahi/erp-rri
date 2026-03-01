'use client'

import { useState } from 'react'
import { LayoutGrid, Plus, Copy, Trash2, Share2, MoreVertical, Star, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  DropdownMenu,
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { useDashboardStore, DashboardLayout } from '@/store/dashboardStore'

interface DashboardSelectorProps {
  onShare?: (dashboardId: string) => void
}

export function DashboardSelector({ onShare }: DashboardSelectorProps) {
  const { 
    currentDashboardId, 
    dashboards, 
    setCurrentDashboard,
    addDashboard,
    duplicateDashboard,
    deleteDashboard 
  } = useDashboardStore()
  
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [newDashboardName, setNewDashboardName] = useState('')
  const [newDashboardDesc, setNewDashboardDesc] = useState('')

  const currentDashboard = dashboards.find((d) => d.id === currentDashboardId)

  const handleCreateDashboard = () => {
    if (!newDashboardName.trim()) return

    const newDashboard: DashboardLayout = {
      id: `dash-${Date.now()}`,
      name: newDashboardName,
      description: newDashboardDesc,
      widgets: [],
    }

    addDashboard(newDashboard)
    setCurrentDashboard(newDashboard.id)
    setShowNewDialog(false)
    setNewDashboardName('')
    setNewDashboardDesc('')
  }

  const handleDuplicate = (dashboardId: string) => {
    duplicateDashboard(dashboardId)
  }

  const handleDelete = (dashboardId: string) => {
    if (confirm('Are you sure you want to delete this dashboard?')) {
      deleteDashboard(dashboardId)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Current Dashboard */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <LayoutGrid className="w-4 h-4" />
            <span className="max-w-[150px] truncate">
              {currentDashboard?.name || 'Select Dashboard'}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <div className="px-2 py-1.5">
            <p className="text-xs font-semibold text-gray-500 uppercase">Dashboards</p>
          </div>
          <DropdownMenuSeparator />
          
          {dashboards.map((dashboard) => (
            <DropdownMenuItem 
              key={dashboard.id}
              onClick={() => setCurrentDashboard(dashboard.id)}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                {dashboard.isDefault && <Star className="w-3 h-3 text-yellow-500" />}
                <span className={dashboard.id === currentDashboardId ? 'font-medium' : ''}>
                  {dashboard.name}
                </span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div 
                    className="p-1 hover:bg-gray-100 rounded"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="w-3 h-3" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleDuplicate(dashboard.id)}>
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  {onShare && (
                    <DropdownMenuItem onClick={() => onShare(dashboard.id)}>
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </DropdownMenuItem>
                  )}
                  {!dashboard.isDefault && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDelete(dashboard.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => setShowNewDialog(true)}
            className="cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Dashboard
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Inline Dialog */}
      {showNewDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="fixed inset-0 bg-black/50"
            onClick={() => setShowNewDialog(false)}
          />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6 z-10">
            <button
              onClick={() => setShowNewDialog(false)}
              className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-lg font-semibold mb-2">Create New Dashboard</h2>
            <p className="text-sm text-gray-500 mb-4">
              Create a custom dashboard with your own widgets and layout.
            </p>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Dashboard Name</Label>
                <Input
                  id="name"
                  value={newDashboardName}
                  onChange={(e) => setNewDashboardName(e.target.value)}
                  placeholder="My Custom Dashboard"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  value={newDashboardDesc}
                  onChange={(e) => setNewDashboardDesc(e.target.value)}
                  placeholder="Description"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowNewDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateDashboard} disabled={!newDashboardName.trim()}>
                Create
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
