'use client'

import { useCallback } from 'react'
import { useNotificationStore, Notification } from '@/store/notificationStore'

export function useNotification() {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    preferences,
    alertRules,
    emailTemplates,
    setNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    setPreferences,
    updatePreference,
    setAlertRules,
    addAlertRule,
    updateAlertRule,
    removeAlertRule,
    setEmailTemplates,
    addEmailTemplate,
    updateEmailTemplate,
    removeEmailTemplate,
    setLoading,
    setError,
  } = useNotificationStore()

  // Create a new notification
  const createNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      isRead: false,
    }
    addNotification(newNotification)
    return newNotification
  }, [addNotification])

  // Quick notification helpers
  const notifySuccess = useCallback((title: string, message: string) => {
    return createNotification({
      title,
      message,
      type: 'system_alert',
      priority: 'low',
    })
  }, [createNotification])

  const notifyError = useCallback((title: string, message: string) => {
    return createNotification({
      title,
      message,
      type: 'system_alert',
      priority: 'urgent',
    })
  }, [createNotification])

  const notifyWarning = useCallback((title: string, message: string) => {
    return createNotification({
      title,
      message,
      type: 'system_alert',
      priority: 'high',
    })
  }, [createNotification])

  // Check if a specific notification type is enabled in preferences
  const isNotificationTypeEnabled = useCallback((type: string): boolean => {
    if (!preferences) return true
    return preferences.types[type] ?? false
  }, [preferences])

  // Get active alert rules
  const activeAlertRules = alertRules.filter(rule => rule.isActive)

  return {
    // State
    notifications,
    unreadCount,
    isLoading,
    error,
    preferences,
    alertRules,
    activeAlertRules,
    emailTemplates,
    
    // Notification actions
    createNotification,
    notifySuccess,
    notifyError,
    notifyWarning,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll: clearAllNotifications,
    setNotifications,
    
    // Preference actions
    setPreferences,
    updatePreference,
    isNotificationTypeEnabled,
    
    // Alert rule actions
    setAlertRules,
    addAlertRule,
    updateAlertRule,
    removeAlertRule,
    
    // Email template actions
    setEmailTemplates,
    addEmailTemplate,
    updateEmailTemplate,
    removeEmailTemplate,
    
    // Loading/error
    setLoading,
    setError,
  }
}
