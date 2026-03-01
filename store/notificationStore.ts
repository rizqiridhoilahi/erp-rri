import { create } from 'zustand'
import { Notification, NotificationPreferences, AlertRule, EmailTemplate, NotificationType } from '@/lib/validations/notification'

// Re-export types for convenience
export type { Notification, NotificationPreferences, AlertRule, EmailTemplate, NotificationType }

interface NotificationState {
  // Notifications
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: string | null
  
  // Notification preferences
  preferences: NotificationPreferences | null
  
  // Alert rules
  alertRules: AlertRule[]
  
  // Email templates
  emailTemplates: EmailTemplate[]
  
  // Actions - Notifications
  setNotifications: (notifications: Notification[]) => void
  addNotification: (notification: Notification) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAllNotifications: () => void
  clearAll: () => void // Alias for clearAllNotifications
  
  // Actions - Preferences
  setPreferences: (preferences: NotificationPreferences) => void
  updatePreference: (key: keyof NotificationPreferences, value: any) => void
  
  // Actions - Alert Rules
  setAlertRules: (rules: AlertRule[]) => void
  addAlertRule: (rule: AlertRule) => void
  updateAlertRule: (id: string, rule: Partial<AlertRule>) => void
  removeAlertRule: (id: string) => void
  
  // Actions - Email Templates
  setEmailTemplates: (templates: EmailTemplate[]) => void
  addEmailTemplate: (template: EmailTemplate) => void
  updateEmailTemplate: (id: string, template: Partial<EmailTemplate>) => void
  removeEmailTemplate: (id: string) => void
  
  // Loading states
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
}

// Sample notification types for demo
const sampleNotifications: Notification[] = [
  {
    id: '1',
    title: 'Quotation Expiring',
    message: 'Quotation Q-2026-0001 will expire in 3 days',
    type: 'quotation_expiring',
    priority: 'high',
    isRead: false,
    link: '/sales/quotations/1',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Low Stock Alert',
    message: 'Product "Laptop ASUS VivoBook" stock is below 10 units',
    type: 'low_stock',
    priority: 'urgent',
    isRead: false,
    link: '/master-data/products/1',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '3',
    title: 'Invoice Paid',
    message: 'Invoice INV-2026-0015 has been paid by PT ABC',
    type: 'invoice_paid',
    priority: 'low',
    isRead: true,
    link: '/finance/invoices/15',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '4',
    title: 'New Sales Order',
    message: 'New Sales Order SO-2026-0008 created',
    type: 'sales_order_created',
    priority: 'medium',
    isRead: true,
    link: '/sales/sales-orders/8',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
]

const defaultPreferences: NotificationPreferences = {
  userId: '',
  channels: ['in_app'],
  types: {
    quotation_expiring: true,
    quotation_accepted: true,
    quotation_rejected: true,
    sales_order_created: true,
    sales_order_confirmed: true,
    delivery_order_ready: true,
    delivery_order_delivered: true,
    invoice_created: true,
    invoice_paid: true,
    invoice_overdue: true,
    low_stock: true,
    payment_received: true,
    system_alert: true,
    approval_required: true,
  },
  emailDigest: 'none',
  pushEnabled: true,
}

const sampleAlertRules: AlertRule[] = [
  {
    id: '1',
    name: 'Low Stock Warning',
    description: 'Alert when product stock falls below threshold',
    isActive: true,
    condition: {
      type: 'stock_below',
      value: 10,
    },
    actions: {
      notifyChannels: ['in_app', 'email'],
      notifyUsers: [],
    },
    priority: 'high',
  },
  {
    id: '2',
    name: 'Quotation Expiry',
    description: 'Alert 3 days before quotation expires',
    isActive: true,
    condition: {
      type: 'quotation_expiring_days',
      value: 3,
    },
    actions: {
      notifyChannels: ['in_app'],
      notifyUsers: [],
    },
    priority: 'medium',
  },
]

export const useNotificationStore = create<NotificationState>((set) => ({
  // Initial state
  notifications: sampleNotifications,
  unreadCount: sampleNotifications.filter((n) => !n.isRead).length,
  isLoading: false,
  error: null,
  preferences: defaultPreferences,
  alertRules: sampleAlertRules,
  emailTemplates: [],
  
  // Notification actions
  setNotifications: (notifications) =>
    set({ 
      notifications,
      unreadCount: notifications.filter((n) => !n.isRead).length 
    }),
    
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + (notification.isRead ? 0 : 1),
    })),
    
  markAsRead: (id) =>
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      )
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.isRead).length,
      }
    }),
    
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    })),
    
  removeNotification: (id) =>
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id)
      const notifications = state.notifications.filter((n) => n.id !== id)
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.isRead).length,
      }
    }),
    
  clearAllNotifications: () =>
    set({ notifications: [], unreadCount: 0 }),
  
  clearAll: () =>
    set({ notifications: [], unreadCount: 0 }),
  
  // Preferences actions
  setPreferences: (preferences) => set({ preferences }),
  
  updatePreference: (key, value) =>
    set((state) => ({
      preferences: state.preferences
        ? { ...state.preferences, [key]: value }
        : null,
    })),
  
  // Alert rules actions
  setAlertRules: (alertRules) => set({ alertRules }),
  
  addAlertRule: (rule) =>
    set((state) => ({
      alertRules: [...state.alertRules, rule],
    })),
    
  updateAlertRule: (id, updates) =>
    set((state) => ({
      alertRules: state.alertRules.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    })),
    
  removeAlertRule: (id) =>
    set((state) => ({
      alertRules: state.alertRules.filter((r) => r.id !== id),
    })),
  
  // Email templates actions
  setEmailTemplates: (emailTemplates) => set({ emailTemplates }),
  
  addEmailTemplate: (template) =>
    set((state) => ({
      emailTemplates: [...state.emailTemplates, template],
    })),
    
  updateEmailTemplate: (id, updates) =>
    set((state) => ({
      emailTemplates: state.emailTemplates.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    })),
    
  removeEmailTemplate: (id) =>
    set((state) => ({
      emailTemplates: state.emailTemplates.filter((t) => t.id !== id),
    })),
  
  // Loading states
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}))
