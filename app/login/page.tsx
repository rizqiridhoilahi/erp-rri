'use client'

import React from 'react'
import { AuthLayout, AuthLinks } from '@/components/common/AuthLayout'
import { LoginForm } from '@/components/forms/LoginForm'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading, login, user } = useAuth()

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, user, router])

  const handleSubmit = async (data: any) => {
    await login(data.email, data.password)
    // Redirect will happen automatically when isAuthenticated changes
  }

  return (
    <AuthLayout
      title="Sign in to your account"
      subtitle="Welcome to ERP RRI. Enter your credentials to continue."
      showLogo={true}
      showLinks={false}
    >
      <LoginForm onSubmit={handleSubmit} isLoading={isLoading} />
      <AuthLinks type="login" registerLink="/register" forgotPasswordLink="/forgot-password" />
    </AuthLayout>
  )
}
