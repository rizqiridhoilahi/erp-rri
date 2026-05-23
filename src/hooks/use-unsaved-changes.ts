"use client"

import { useState, useEffect, useCallback, useRef } from "react"

export function useUnsavedChanges(isDirty: boolean) {
  const [showDialog, setShowDialog] = useState(false)
  const pendingAction = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!isDirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ""
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [isDirty])

  const confirmLeave = useCallback((action: () => void) => {
    if (!isDirty) {
      action()
      return
    }
    pendingAction.current = action
    setShowDialog(true)
  }, [isDirty])

  const handleConfirm = useCallback(() => {
    setShowDialog(false)
    pendingAction.current?.()
    pendingAction.current = null
  }, [])

  const handleCancel = useCallback(() => {
    setShowDialog(false)
    pendingAction.current = null
  }, [])

  return { confirmLeave, showDialog, handleConfirm, handleCancel }
}
