import { Suspense } from 'react'
import { LayananContent } from '../components/layanan-content'

export default function LayananPage() {
  return (
    <main className="pt-20">
      <Suspense fallback={null}>
        <LayananContent />
      </Suspense>
    </main>
  )
}
