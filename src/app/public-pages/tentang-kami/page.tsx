import { Suspense } from 'react'
import { TentangContent } from '../components/tentang-content'

export default function TentangKamiPage() {
  return (
    <main className="pt-20">
      <Suspense fallback={null}>
        <TentangContent />
      </Suspense>
    </main>
  )
}
