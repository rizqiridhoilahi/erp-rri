'use client'

import { Suspense } from 'react'
import { QuickOrderContent } from './quick-order-content'

export default function QuickOrderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <QuickOrderContent />
    </Suspense>
  )
}
