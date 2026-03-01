'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string[]
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter()
  const { isAuthenticated, isLoading, user } = useAuth()

  useEffect(() => {
    // If not loading and not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
      return
    }

    // Check role if required
    if (requiredRole && user && !requiredRole.includes(user.role)) {
      router.push('/unauthorized')
      return
    }
  }, [isAuthenticated, isLoading, user, requiredRole, router])

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <LoadingSpinner fullPage label="Checking authentication..." />
  }

  // If not authenticated, return null (router will handle redirect)
  if (!isAuthenticated) {
    return null
  }

  // Check role permission
  if (requiredRole && user && !requiredRole.includes(user.role)) {
    return null
  }

  return <>{children}</>
}
