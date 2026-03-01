'use client'

import React from 'react'
import { AuthLayout } from '@/components/common/AuthLayout'
import { ForgotPasswordForm } from '@/components/forms/ForgotPasswordForm'
import { useAuth } from '@/hooks/useAuth'

export default function ForgotPasswordPage() {
  const { isLoading, resetPassword } = useAuth()

  const handleSubmit = async (data: any) => {
    await resetPassword(data.email)
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email address and we'll send you a link to reset your password."
      showLogo={true}
      showLinks={false}
    >
      <ForgotPasswordForm onSubmit={handleSubmit} isLoading={isLoading} />
    </AuthLayout>
  )
}
