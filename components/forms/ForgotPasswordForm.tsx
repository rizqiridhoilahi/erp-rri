'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validations/auth'
import { AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface ForgotPasswordFormProps {
  onSubmit?: (data: ForgotPasswordInput) => Promise<void>
  isLoading?: boolean
  error?: string
}

export function ForgotPasswordForm({ onSubmit, isLoading = false, error }: ForgotPasswordFormProps) {
  const [submitError, setSubmitError] = useState<string>(error || '')
  const [submitted, setSubmitted] = useState(false)

  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const handleSubmit = async (data: ForgotPasswordInput) => {
    setSubmitError('')
    try {
      if (onSubmit) {
        await onSubmit(data)
      } else {
        console.log('Forgot password request:', data)
      }
      setSubmitted(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Request failed'
      setSubmitError(errorMessage)
    }
  }

  if (submitted) {
    return (
      <div className="space-y-5">
        {/* Success Message */}
        <div className="flex gap-3 rounded-lg bg-green-50 p-4">
          <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
          <div className="flex-1">
            <p className="font-medium text-green-800">Check your email</p>
            <p className="mt-1 text-sm text-green-700">
              We've sent password reset instructions to your email address. Please check your inbox and follow the link to reset your password.
            </p>
          </div>
        </div>

        {/* Links */}
        <div className="space-y-3 text-center text-sm">
          <div>
            <p className="text-gray-600 mb-2">Didn't receive the email?</p>
            <Button
              variant="outline"
              onClick={() => setSubmitted(false)}
              className="w-full"
            >
              Try another email
            </Button>
          </div>
          <div>
            <Link href="/login" className="text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
      {/* Error Alert */}
      {submitError && (
        <div className="flex gap-3 rounded-lg bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
          <p className="text-sm text-red-800">{submitError}</p>
        </div>
      )}

      {/* Info Message */}
      <div className="rounded-lg bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          Enter the email address associated with your account and we'll send you a link to reset your password.
        </p>
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Email address</label>
        <Input
          type="email"
          placeholder="you@example.com"
          disabled={isLoading}
          {...form.register('email')}
          className={form.formState.errors.email ? 'border-red-500' : ''}
        />
        {form.formState.errors.email && (
          <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Sending...
          </div>
        ) : (
          'Send reset link'
        )}
      </Button>

      {/* Back to login link */}
      <div className="text-center">
        <Link href="/login" className="text-sm text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>
      </div>
    </form>
  )
}
