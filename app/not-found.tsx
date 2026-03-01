'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-orange-100 p-4">
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Halaman Tidak Ditemukan
        </h2>

        <p className="text-gray-600 mb-8">
          Maaf, halaman yang Anda cari tidak ada. Mungkin halaman telah dipindahkan
          atau dihapus.
        </p>

        <div className="space-y-3">
          <Link href="/dashboard" className="block">
            <Button className="w-full">Kembali ke Dashboard</Button>
          </Link>
          <Link href="/" className="block">
            <Button variant="outline" className="w-full">
              Kembali ke Beranda
            </Button>
          </Link>
        </div>

        <div className="mt-8 pt-8 border-t text-sm text-gray-500">
          <p>Error Code: 404</p>
          <p className="mt-1">Page Not Found</p>
        </div>
      </Card>
    </div>
  )
}
