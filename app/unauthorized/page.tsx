'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-red-100 p-3">
          <AlertCircle className="h-6 w-6 text-red-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
        <p className="mt-2 text-gray-600">
          You don't have permission to access this page. Please contact your administrator if you believe this is a mistake.
        </p>

        <div className="mt-6 space-y-3">
          <Link href="/dashboard" className="block">
            <Button className="w-full">Go to Dashboard</Button>
          </Link>
          <Link href="/settings/profile" className="block">
            <Button variant="outline" className="w-full">
              View Profile
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
