import { z } from 'zod'

// Notification types
export const notificationTypeSchema = z.enum([
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
])

export const notificationChannelSchema = z.enum([
  'in_app',
  'email',
  'sms',
])

export const notificationPrioritySchema = z.enum([
  'low',
  'medium',
  'high',
  'urgent',
])

// Alert condition types
export const alertConditionTypeSchema = z.enum([
  'stock_below',
  'quotation_expiring_days',
  'invoice_overdue_days',
  'payment_not_received_days',
  'order_value_above',
  'customer_created',
  'daily_sales_below',
  'monthly_revenue_below',
  'payment_received',
])

// Notification item schema
export const notificationSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  type: notificationTypeSchema,
  priority: notificationPrioritySchema.default('medium'),
  isRead: z.boolean().default(false),
  link: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  createdAt: z.string().optional(),
})

// User notification preferences
export const notificationPreferencesSchema = z.object({
  userId: z.string(),
  channels: z.array(notificationChannelSchema).default(['in_app']),
  types: z.record(z.string(), z.boolean()).default({}),
  emailDigest: z.enum(['none', 'daily', 'weekly']).default('none'),
  pushEnabled: z.boolean().default(true),
})

// Alert rule schema
export const alertRuleSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Rule name is required'),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  condition: z.object({
    type: alertConditionTypeSchema,
    value: z.number().min(1),
  }),
  actions: z.object({
    notifyChannels: z.array(notificationChannelSchema).default(['in_app']),
    notifyUsers: z.array(z.string()).default([]),
    autoAction: z.string().optional(),
  }),
  priority: notificationPrioritySchema.default('medium'),
})

// Email template schema
export const emailTemplateSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Template name is required'),
  subject: z.string().min(1, 'Subject is required'),
  type: notificationTypeSchema,
  body: z.string().min(1, 'Email body is required'),
  variables: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

// Type exports
export type NotificationType = z.infer<typeof notificationTypeSchema>
export type NotificationChannel = z.infer<typeof notificationChannelSchema>
export type NotificationPriority = z.infer<typeof notificationPrioritySchema>
export type AlertConditionType = z.infer<typeof alertConditionTypeSchema>
export type AlertPriority = z.infer<typeof notificationPrioritySchema>
export type Notification = z.infer<typeof notificationSchema>
export type NotificationPreferences = z.infer<typeof notificationPreferencesSchema>
export type AlertRule = z.infer<typeof alertRuleSchema>
export type EmailTemplate = z.infer<typeof emailTemplateSchema>

// Helper function to get notification icon
export function getNotificationIcon(type: NotificationType): string {
  const icons: Record<NotificationType, string> = {
    quotation_expiring: 'file-clock',
    quotation_accepted: 'file-check',
    quotation_rejected: 'file-x',
    sales_order_created: 'shopping-cart',
    sales_order_confirmed: 'check-circle',
    delivery_order_ready: 'truck',
    delivery_order_delivered: 'package-check',
    invoice_created: 'receipt',
    invoice_paid: 'credit-card',
    invoice_overdue: 'alert-circle',
    low_stock: 'alert-triangle',
    payment_received: 'banknote',
    system_alert: 'bell',
    approval_required: 'clipboard-list',
  }
  return icons[type] || 'bell'
}

// Helper function to get notification label
export function getNotificationLabel(type: NotificationType): string {
  const labels: Record<NotificationType, string> = {
    quotation_expiring: 'Quotation Expiring',
    quotation_accepted: 'Quotation Accepted',
    quotation_rejected: 'Quotation Rejected',
    sales_order_created: 'Sales Order Created',
    sales_order_confirmed: 'Sales Order Confirmed',
    delivery_order_ready: 'Delivery Ready',
    delivery_order_delivered: 'Delivery Completed',
    invoice_created: 'Invoice Created',
    invoice_paid: 'Invoice Paid',
    invoice_overdue: 'Invoice Overdue',
    low_stock: 'Low Stock Alert',
    payment_received: 'Payment Received',
    system_alert: 'System Alert',
    approval_required: 'Approval Required',
  }
  return labels[type] || type
}
