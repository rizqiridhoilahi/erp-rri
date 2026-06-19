'use client'

import { Suspense } from 'react'
import { InquiryCartContent } from './inquiry-cart-content'

export default function InquiryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <InquiryCartContent />
    </Suspense>
  )
}
