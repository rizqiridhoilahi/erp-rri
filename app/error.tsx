'use client'

import React, { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error untuk debugging
    console.error('Error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-red-100 p-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">500</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Terjadi Kesalahan
        </h2>

        <p className="text-gray-600 mb-8">
          Maaf, terjadi kesalahan pada server. Tim kami telah diberitahu tentang
          masalah ini.
        </p>

        {error.digest && (
          <div className="mb-6 p-3 bg-gray-100 rounded text-left">
            <p className="text-xs text-gray-600 font-mono break-all">
              Error ID: {error.digest}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Button onClick={reset} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Coba Lagi
          </Button>
          <Button variant="outline" className="w-full" onClick={() => window.location.href = '/dashboard'}>
            Kembali ke Dashboard
          </Button>
        </div>

        <div className="mt-8 pt-8 border-t text-sm text-gray-500">
          <p>Error Code: 500</p>
          <p className="mt-1">Internal Server Error</p>
        </div>
      </Card>
    </div>
  )
}
