'use client'

import React, { useEffect } from 'react'
import { AuthLayout, AuthLinks } from '@/components/common/AuthLayout'
import { RegisterForm } from '@/components/forms/RegisterForm'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading, register, user } = useAuth()

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, user, router])

  const handleSubmit = async (data: any) => {
    await register(data.name, data.email, data.password)
    // Redirect will happen automatically when isAuthenticated changes
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join ERP RRI and start managing your business efficiently."
      showLogo={true}
      showLinks={false}
    >
      <RegisterForm onSubmit={handleSubmit} isLoading={isLoading} />
      <AuthLinks type="register" loginLink="/login" />
    </AuthLayout>
  )
}
