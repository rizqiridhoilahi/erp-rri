import { Suspense } from 'react'
import { LandingContent } from './components/landing-content'

export default function LandingPage() {
  return (
    <main>
      <Suspense fallback={null}>
        <LandingContent />
      </Suspense>
    </main>
  )
}
