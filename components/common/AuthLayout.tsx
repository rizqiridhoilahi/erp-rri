'use client'

import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface AuthLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  showLogo?: boolean
  showLinks?: boolean
}

export function AuthLayout({
  children,
  title,
  subtitle,
  showLogo = true,
  showLinks = true,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Logo & Branding */}
          {showLogo && (
            <div className="mb-8">
              <Link href="/" className="flex items-center gap-2">
                <div className="h-10 w-10 rounded bg-blue-600 flex items-center justify-center text-white font-bold">
                  E
                </div>
                <span className="text-xl font-bold text-gray-900">ERP RRI</span>
              </Link>
            </div>
          )}

          {/* Title & Subtitle */}
          {title && (
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {subtitle && <p className="mt-2 text-sm text-gray-600">{subtitle}</p>}
            </div>
          )}

          {/* Form Content */}
          <div className="mb-8">{children}</div>

          {/* Links Section */}
          {showLinks && <AuthLinks />}
        </div>
      </div>

      {/* Right side - Brand Image/Info */}
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800" />
        <div className="flex h-full flex-col justify-center px-8 text-white">
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold">Welcome to ERP RRI</h2>
              <p className="mt-2 text-lg text-blue-100">
                Enterprise Resource Planning System untuk PT. Rizqi Ridho Ilahi
              </p>
            </div>

            <div className="space-y-4">
              <Feature icon="📊" title="Complete Business Management">
                Master Data, Sales, Finance, Purchasing semua dalam satu platform
              </Feature>
              <Feature icon="🤖" title="RRI AI Chatbot">
                Smart assistant untuk membantu pekerjaan Anda setiap hari
              </Feature>
              <Feature icon="📱" title="Mobile Responsive">
                Akses dari desktop, tablet, atau smartphone di mana saja
              </Feature>
              <Feature icon="🔒" title="Secure & Reliable">
                Enkripsi end-to-end dan backup otomatis untuk data Anda
              </Feature>
            </div>

            <div className="pt-6 border-t border-blue-500">
              <p className="text-sm text-blue-100">
                © 2026 PT. Rizqi Ridho Ilahi. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface FeatureProps {
  icon: string
  title: string
  children: React.ReactNode
}

function Feature({ icon, title, children }: FeatureProps) {
  return (
    <div className="flex gap-3">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-blue-100">{children}</p>
      </div>
    </div>
  )
}

interface AuthLinksProps {
  loginLink?: string
  registerLink?: string
  forgotPasswordLink?: string
  type?: 'login' | 'register'
}

export function AuthLinks({
  loginLink = '/login',
  registerLink = '/register',
  forgotPasswordLink = '/forgot-password',
  type = 'login',
}: AuthLinksProps) {
  if (type === 'login') {
    return (
      <div className="space-y-4 text-center text-sm">
        <div>
          <Link href={forgotPasswordLink} className="text-blue-600 hover:text-blue-700 font-medium">
            Forgot password?
          </Link>
        </div>
        <div className="text-gray-600">
          Don't have an account?{' '}
          <Link href={registerLink} className="text-blue-600 hover:text-blue-700 font-medium">
            Sign up
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="text-center text-sm">
      <div className="text-gray-600">
        Already have an account?{' '}
        <Link href={loginLink} className="text-blue-600 hover:text-blue-700 font-medium">
          Sign in
        </Link>
      </div>
    </div>
  )
}
