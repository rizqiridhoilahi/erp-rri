'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { registerSchema, type RegisterInput } from '@/lib/validations/auth'
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'

interface RegisterFormProps {
  onSubmit?: (data: RegisterInput) => Promise<void>
  isLoading?: boolean
  error?: string
}

export function RegisterForm({ onSubmit, isLoading = false, error }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitError, setSubmitError] = useState<string>(error || '')

  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  })

  const handleSubmit = async (data: RegisterInput) => {
    setSubmitError('')
    try {
      if (onSubmit) {
        await onSubmit(data)
      } else {
        console.log('Register data:', data)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed'
      setSubmitError(errorMessage)
    }
  }

  // Password strength indicator
  const password = form.watch('password')
  const passwordStrength = getPasswordStrength(password)

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
      {/* Error Alert */}
      {submitError && (
        <div className="flex gap-3 rounded-lg bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
          <p className="text-sm text-red-800">{submitError}</p>
        </div>
      )}

      {/* Name Field */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Full name</label>
        <Input
          type="text"
          placeholder="John Doe"
          disabled={isLoading}
          {...form.register('name')}
          className={form.formState.errors.name ? 'border-red-500' : ''}
        />
        {form.formState.errors.name && (
          <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
        )}
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
        {password && (
          <div className="mt-2 space-y-1">
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full ${
                    i < passwordStrength.level ? passwordStrength.color : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-600">{passwordStrength.text}</p>
          </div>
        )}
        {form.formState.errors.password && (
          <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Confirm password</label>
        <div className="relative">
          <Input
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="••••••••"
            disabled={isLoading}
            {...form.register('confirmPassword')}
            className={form.formState.errors.confirmPassword ? 'pr-10 border-red-500' : 'pr-10'}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            disabled={isLoading}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {form.formState.errors.confirmPassword && (
          <p className="text-sm text-red-600">{form.formState.errors.confirmPassword.message}</p>
        )}
      </div>

      {/* Terms & Conditions */}
      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          id="acceptTerms"
          disabled={isLoading}
          {...form.register('acceptTerms')}
          className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="acceptTerms" className="text-sm text-gray-700">
          I agree to the{' '}
          <a href="#" className="text-blue-600 hover:text-blue-700">
            Terms and Conditions
          </a>{' '}
          and{' '}
          <a href="#" className="text-blue-600 hover:text-blue-700">
            Privacy Policy
          </a>
        </label>
      </div>
      {form.formState.errors.acceptTerms && (
        <p className="text-sm text-red-600">{form.formState.errors.acceptTerms.message}</p>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Creating account...
          </div>
        ) : (
          'Create account'
        )}
      </Button>
    </form>
  )
}

function getPasswordStrength(password: string) {
  if (password.length < 8) {
    return { level: 1, color: 'bg-red-500', text: 'Too weak' }
  }
  if (password.length < 12) {
    return { level: 2, color: 'bg-yellow-500', text: 'Fair' }
  }
  if (/[A-Z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*]/.test(password)) {
    return { level: 4, color: 'bg-green-500', text: 'Strong' }
  }
  return { level: 3, color: 'bg-blue-500', text: 'Good' }
}
