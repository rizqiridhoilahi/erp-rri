'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { loginSchema, type LoginInput } from '@/lib/validations/auth'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'

interface LoginFormProps {
  onSubmit?: (data: LoginInput) => Promise<void>
  isLoading?: boolean
  error?: string
}

export function LoginForm({ onSubmit, isLoading = false, error }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [submitError, setSubmitError] = useState<string>(error || '')

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  const handleSubmit = async (data: LoginInput) => {
    setSubmitError('')
    try {
      if (onSubmit) {
        await onSubmit(data)
      } else {
        console.log('Login data:', data)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      setSubmitError(errorMessage)
    }
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

      {/* Password Field */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Password</label>
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            disabled={isLoading}
            {...form.register('password')}
            className={form.formState.errors.password ? 'pr-10 border-red-500' : 'pr-10'}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            disabled={isLoading}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {form.formState.errors.password && (
          <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
        )}
      </div>

      {/* Remember Me Checkbox */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="rememberMe"
          disabled={isLoading}
          {...form.register('rememberMe')}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700">
          Remember me
        </label>
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
            Signing in...
          </div>
        ) : (
          'Sign in'
        )}
      </Button>
    </form>
  )
}
