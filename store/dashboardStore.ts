import { create } from 'zustand'

// Widget types
export type WidgetType = 
  | 'kpi_card'
  | 'revenue_chart'
  | 'sales_chart'
  | 'inventory_chart'
  | 'recent_orders'
  | 'low_stock_list'
  | 'pending_quotations'
  | 'invoice_status'
  | 'top_customers'
  | 'top_products'
  | 'pie_chart'
  | 'line_chart'
  | 'bar_chart'
  | 'table'

export type WidgetSize = 'small' | 'medium' | 'large' | 'full'
export type ThresholdStatus = 'green' | 'yellow' | 'red'

export interface WidgetThreshold {
  low: number | null      // Below this = red
  medium: number | null   // Between low and medium = yellow
  high: number | null     // Above medium = green
  // For inverted metrics (like low stock), swap red/green
  inverted?: boolean
}

export interface DashboardWidget {
  id: string
  type: WidgetType
  title: string
  size: WidgetSize
  position: { x: number; y: number }
  config: {
    dataSource?: string
    refreshInterval?: number // in seconds
    threshold?: WidgetThreshold
    chartType?: 'line' | 'bar' | 'pie'
  }
}

export interface DashboardLayout {
  id: string
  name: string
  description?: string
  widgets: DashboardWidget[]
  isDefault?: boolean
  createdBy?: string
  sharedWith?: string[] // user IDs
}

export interface DashboardSchedule {
  id: string
  dashboardId: string
  frequency: 'daily' | 'weekly' | 'monthly'
  dayOfWeek?: number // 0-6 for weekly
  dayOfMonth?: number // 1-31 for monthly
  time: string // HH:mm format
  recipients: string[] // email addresses
  format: 'pdf' | 'excel'
  isActive: boolean
}

interface DashboardState {
  // Current dashboard
  currentDashboardId: string | null
  dashboards: DashboardLayout[]
  schedules: DashboardSchedule[]
  
  // Available widget types
  availableWidgets: { type: WidgetType; name: string; icon: string; description: string }[]
  
  // Actions - Dashboard
  setCurrentDashboard: (id: string) => void
  addDashboard: (dashboard: DashboardLayout) => void
  updateDashboard: (id: string, updates: Partial<DashboardLayout>) => void
  deleteDashboard: (id: string) => void
  duplicateDashboard: (id: string) => void
  
  // Actions - Widgets
  addWidget: (dashboardId: string, widget: DashboardWidget) => void
  updateWidget: (dashboardId: string, widgetId: string, updates: Partial<DashboardWidget>) => void
  removeWidget: (dashboardId: string, widgetId: string) => void
  moveWidget: (dashboardId: string, widgetId: string, position: { x: number; y: number }) => void
  resizeWidget: (dashboardId: string, widgetId: string, size: WidgetSize) => void
  
  // Actions - Sharing
  shareDashboard: (dashboardId: string, userIds: string[]) => void
  unshareDashboard: (dashboardId: string, userId: string) => void
  
  // Actions - Schedules
  addSchedule: (schedule: DashboardSchedule) => void
  updateSchedule: (id: string, updates: Partial<DashboardSchedule>) => void
  removeSchedule: (id: string) => void
  toggleSchedule: (id: string) => void
}

// Available widget definitions
const availableWidgets = [
  { type: 'kpi_card' as WidgetType, name: 'KPI Card', icon: 'gauge', description: 'Single metric with trend indicator' },
  { type: 'revenue_chart' as WidgetType, name: 'Revenue Chart', icon: 'trending-up', description: 'Revenue over time' },
  { type: 'sales_chart' as WidgetType, name: 'Sales Chart', icon: 'bar-chart', description: 'Sales by period' },
  { type: 'inventory_chart' as WidgetType, name: 'Inventory Chart', icon: 'package', description: 'Stock levels visualization' },
  { type: 'recent_orders' as WidgetType, name: 'Recent Orders', icon: 'shopping-cart', description: 'Latest transactions' },
  { type: 'low_stock_list' as WidgetType, name: 'Low Stock List', icon: 'alert-triangle', description: 'Products below threshold' },
  { type: 'pending_quotations' as WidgetType, name: 'Pending Quotations', icon: 'file-text', description: 'Quotations awaiting response' },
  { type: 'invoice_status' as WidgetType, name: 'Invoice Status', icon: 'receipt', description: 'Invoice payment status' },
  { type: 'top_customers' as WidgetType, name: 'Top Customers', icon: 'users', description: 'Best performing customers' },
  { type: 'top_products' as WidgetType, name: 'Top Products', icon: 'star', description: 'Best selling products' },
  { type: 'pie_chart' as WidgetType, name: 'Pie Chart', icon: 'pie-chart', description: 'Distribution visualization' },
  { type: 'line_chart' as WidgetType, name: 'Line Chart', icon: 'activity', description: 'Trend line visualization' },
  { type: 'bar_chart' as WidgetType, name: 'Bar Chart', icon: 'bar-chart-2', description: 'Comparison bars' },
  { type: 'table' as WidgetType, name: 'Data Table', icon: 'table', description: 'Tabular data view' },
]

// Sample dashboards
const sampleDashboards: DashboardLayout[] = [
  {
    id: 'default',
    name: 'Main Dashboard',
    description: 'Default ERP dashboard',
    isDefault: true,
    widgets: [
      {
        id: 'w1',
        type: 'kpi_card',
        title: 'Total Revenue',
        size: 'small',
        position: { x: 0, y: 0 },
        config: { dataSource: 'revenue', threshold: { low: 10000000, medium: 50000000, high: null } },
      },
      {
        id: 'w2',
        type: 'kpi_card',
        title: 'Pending Orders',
        size: 'small',
        position: { x: 1, y: 0 },
        config: { dataSource: 'pending_orders' },
      },
      {
        id: 'w3',
        type: 'kpi_card',
        title: 'Low Stock Items',
        size: 'small',
        position: { x: 2, y: 0 },
        config: { dataSource: 'low_stock', threshold: { low: 0, medium: 5, high: 10, inverted: true } },
      },
      {
        id: 'w4',
        type: 'kpi_card',
        title: 'Outstanding Invoices',
        size: 'small',
        position: { x: 3, y: 0 },
        config: { dataSource: 'outstanding_invoices' },
      },
      {
        id: 'w5',
        type: 'revenue_chart',
        title: 'Revenue Trend',
        size: 'large',
        position: { x: 0, y: 1 },
        config: { dataSource: 'revenue_history', chartType: 'line', refreshInterval: 300 },
      },
      {
        id: 'w6',
        type: 'sales_chart',
        title: 'Sales by Category',
        size: 'medium',
        position: { x: 2, y: 1 },
        config: { dataSource: 'sales_by_category', chartType: 'bar' },
      },
      {
        id: 'w7',
        type: 'recent_orders',
        title: 'Recent Orders',
        size: 'medium',
        position: { x: 0, y: 2 },
        config: { dataSource: 'recent_orders' },
      },
      {
        id: 'w8',
        type: 'top_customers',
        title: 'Top Customers',
        size: 'medium',
        position: { x: 1, y: 2 },
        config: { dataSource: 'top_customers' },
      },
    ],
  },
  {
    id: 'sales',
    name: 'Sales Dashboard',
    description: 'Sales-focused metrics',
    widgets: [
      {
        id: 'sw1',
        type: 'kpi_card',
        title: 'Today\'s Sales',
        size: 'small',
        position: { x: 0, y: 0 },
        config: { dataSource: 'today_sales' },
      },
      {
        id: 'sw2',
        type: 'kpi_card',
        title: 'This Month',
        size: 'small',
        position: { x: 1, y: 0 },
        config: { dataSource: 'monthly_sales' },
      },
      {
        id: 'sw3',
        type: 'revenue_chart',
        title: 'Sales Trend',
        size: 'large',
        position: { x: 0, y: 1 },
        config: { dataSource: 'sales_trend', chartType: 'line' },
      },
    ],
  },
  {
    id: 'inventory',
    name: 'Inventory Dashboard',
    description: 'Inventory management metrics',
    widgets: [
      {
        id: 'iw1',
        type: 'low_stock_list',
        title: 'Low Stock Alert',
        size: 'medium',
        position: { x: 0, y: 0 },
        config: { dataSource: 'low_stock', threshold: { low: 0, medium: 5, high: 10, inverted: true } },
      },
    ],
  },
]

const sampleSchedules: DashboardSchedule[] = []

export const useDashboardStore = create<DashboardState>((set, get) => ({
  // Initial state
  currentDashboardId: 'default',
  dashboards: sampleDashboards,
  schedules: sampleSchedules,
  availableWidgets,
  
  // Dashboard actions
  setCurrentDashboard: (id) => set({ currentDashboardId: id }),
  
  addDashboard: (dashboard) =>
    set((state) => ({
      dashboards: [...state.dashboards, dashboard],
    })),
    
  updateDashboard: (id, updates) =>
    set((state) => ({
      dashboards: state.dashboards.map((d) =>
        d.id === id ? { ...d, ...updates } : d
      ),
    })),
    
  deleteDashboard: (id) =>
    set((state) => {
      const dashboards = state.dashboards.filter((d) => d.id !== id)
      return {
        dashboards,
        currentDashboardId: state.currentDashboardId === id 
          ? (dashboards[0]?.id || null) 
          : state.currentDashboardId
      }
    }),
    
  duplicateDashboard: (id) => {
    const dashboard = get().dashboards.find((d) => d.id === id)
    if (!dashboard) return
    
    const newDashboard: DashboardLayout = {
      ...dashboard,
      id: `dash-${Date.now()}`,
      name: `${dashboard.name} (Copy)`,
      isDefault: false,
      widgets: dashboard.widgets.map((w) => ({
        ...w,
        id: `w-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      })),
    }
    
    set((state) => ({
      dashboards: [...state.dashboards, newDashboard],
    }))
  },
  
  // Widget actions
  addWidget: (dashboardId, widget) =>
    set((state) => ({
      dashboards: state.dashboards.map((d) =>
        d.id === dashboardId
          ? { ...d, widgets: [...d.widgets, widget] }
          : d
      ),
    })),
    
  updateWidget: (dashboardId, widgetId, updates) =>
    set((state) => ({
      dashboards: state.dashboards.map((d) =>
        d.id === dashboardId
          ? {
              ...d,
              widgets: d.widgets.map((w) =>
                w.id === widgetId ? { ...w, ...updates } : w
              ),
            }
          : d
      ),
    })),
    
  removeWidget: (dashboardId, widgetId) =>
    set((state) => ({
      dashboards: state.dashboards.map((d) =>
        d.id === dashboardId
          ? { ...d, widgets: d.widgets.filter((w) => w.id !== widgetId) }
          : d
      ),
    })),
    
  moveWidget: (dashboardId, widgetId, position) =>
    set((state) => ({
      dashboards: state.dashboards.map((d) =>
        d.id === dashboardId
          ? {
              ...d,
              widgets: d.widgets.map((w) =>
                w.id === widgetId ? { ...w, position } : w
              ),
            }
          : d
      ),
    })),
    
  resizeWidget: (dashboardId, widgetId, size) =>
    set((state) => ({
      dashboards: state.dashboards.map((d) =>
        d.id === dashboardId
          ? {
              ...d,
              widgets: d.widgets.map((w) =>
                w.id === widgetId ? { ...w, size } : w
              ),
            }
          : d
      ),
    })),
  
  // Sharing actions
  shareDashboard: (dashboardId, userIds) =>
    set((state) => ({
      dashboards: state.dashboards.map((d) =>
        d.id === dashboardId
          ? { ...d, sharedWith: [...(d.sharedWith || []), ...userIds] }
          : d
      ),
    })),
    
  unshareDashboard: (dashboardId, userId) =>
    set((state) => ({
      dashboards: state.dashboards.map((d) =>
        d.id === dashboardId
          ? { ...d, sharedWith: d.sharedWith?.filter((id) => id !== userId) }
          : d
      ),
    })),
  
  // Schedule actions
  addSchedule: (schedule) =>
    set((state) => ({
      schedules: [...state.schedules, schedule],
    })),
    
  updateSchedule: (id, updates) =>
    set((state) => ({
      schedules: state.schedules.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    })),
    
  removeSchedule: (id) =>
    set((state) => ({
      schedules: state.schedules.filter((s) => s.id !== id),
    })),
    
  toggleSchedule: (id) =>
    set((state) => ({
      schedules: state.schedules.map((s) =>
        s.id === id ? { ...s, isActive: !s.isActive } : s
      ),
    })),
}))
