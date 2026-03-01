'use client'

import { useState, useCallback } from 'react'
import { Plus, LayoutGrid, Save, RotateCcw, Eye, Edit3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useDashboardStore, DashboardWidget, WidgetType, WidgetSize } from '@/store/dashboardStore'
import { Widget, WidgetPlaceholder } from './Widget'
import { cn } from '@/lib/utils'

interface DashboardBuilderProps {
  dashboardId: string
  isEditable?: boolean
}

export function DashboardBuilder({ dashboardId, isEditable = true }: DashboardBuilderProps) {
  const { 
    dashboards, 
    addWidget, 
    removeWidget, 
    resizeWidget,
    updateWidget,
    availableWidgets 
  } = useDashboardStore()
  
  const [viewMode, setViewMode] = useState<'view' | 'edit'>('view')
  const [showWidgetPicker, setShowWidgetPicker] = useState(false)
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null)
  const [configureWidget, setConfigureWidget] = useState<DashboardWidget | null>(null)

  const dashboard = dashboards.find((d) => d.id === dashboardId)

  if (!dashboard) {
    return (
      <div className="text-center py-12 text-gray-500">
        <LayoutGrid className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p>Dashboard not found</p>
      </div>
    )
  }

  const handleAddWidget = useCallback((type: WidgetType) => {
    const widgetDef = availableWidgets.find((w) => w.type === type)
    if (!widgetDef) return

    // Calculate next position
    const maxY = dashboard.widgets.reduce((max, w) => Math.max(max, w.position.y + 1), 0)
    
    const newWidget: DashboardWidget = {
      id: `widget-${Date.now()}`,
      type,
      title: widgetDef.name,
      size: 'medium',
      position: { x: 0, y: maxY },
      config: {},
    }

    addWidget(dashboardId, newWidget)
    setShowWidgetPicker(false)
  }, [dashboardId, dashboard.widgets, availableWidgets, addWidget])

  const handleRemoveWidget = useCallback((widgetId: string) => {
    removeWidget(dashboardId, widgetId)
  }, [dashboardId, removeWidget])

  const handleResizeWidget = useCallback((widgetId: string, size: WidgetSize) => {
    resizeWidget(dashboardId, widgetId, size)
  }, [dashboardId, resizeWidget])

  const handleConfigureWidget = useCallback((widget: DashboardWidget) => {
    setConfigureWidget(widget)
  }, [])

  const renderWidgetContent = (widget: DashboardWidget) => {
    // Placeholder content based on widget type
    switch (widget.type) {
      case 'kpi_card':
        return <WidgetPlaceholder type="kpi" />
      case 'revenue_chart':
      case 'sales_chart':
      case 'line_chart':
      case 'bar_chart':
      case 'pie_chart':
        return <WidgetPlaceholder type="chart" />
      case 'recent_orders':
      case 'top_customers':
      case 'top_products':
      case 'table':
        return <WidgetPlaceholder type="table" />
      case 'low_stock_list':
      case 'pending_quotations':
      case 'invoice_status':
        return <WidgetPlaceholder type="list" />
      default:
        return <WidgetPlaceholder type={widget.type} />
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      {isEditable && (
        <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'view' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('view')}
            >
              <Eye className="w-4 h-4 mr-2" />
              View
            </Button>
            <Button
              variant={viewMode === 'edit' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('edit')}
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>

          {viewMode === 'edit' && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowWidgetPicker(!showWidgetPicker)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Widget
              </Button>
              <Button variant="outline" size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save Layout
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Widget Picker */}
      {showWidgetPicker && viewMode === 'edit' && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Add Widget</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowWidgetPicker(false)}
              >
                ✕
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {availableWidgets.map((widget) => (
                <Button
                  key={widget.type}
                  variant="outline"
                  className="h-auto py-3 flex flex-col items-center gap-1"
                  onClick={() => handleAddWidget(widget.type)}
                >
                  <span className="text-sm">{widget.name}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dashboard Grid */}
      <div 
        className={cn(
          "grid grid-cols-4 gap-4 min-h-[500px]",
          viewMode === 'edit' && "bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-200"
        )}
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => setDraggedWidget(null)}
      >
        {dashboard.widgets.length === 0 ? (
          <div className="col-span-4 text-center py-12 text-gray-500">
            <LayoutGrid className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No widgets added yet</p>
            {viewMode === 'edit' && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setShowWidgetPicker(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add your first widget
              </Button>
            )}
          </div>
        ) : (
          dashboard.widgets.map((widget) => (
            <Widget
              key={widget.id}
              widget={widget}
              isEditable={viewMode === 'edit'}
              onRemove={viewMode === 'edit' ? () => handleRemoveWidget(widget.id) : undefined}
              onConfigure={() => handleConfigureWidget(widget)}
              onResize={viewMode === 'edit' ? (size) => handleResizeWidget(widget.id, size) : undefined}
            >
              {renderWidgetContent(widget)}
            </Widget>
          ))
        )}
      </div>

      {/* Widget Configuration Modal (placeholder) */}
      {configureWidget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Configure: {configureWidget.title}</h3>
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Widget configuration options will appear here.
                </p>
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setConfigureWidget(null)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={() => setConfigureWidget(null)}>
                    Save
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
