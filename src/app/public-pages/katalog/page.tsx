import { Suspense } from 'react'
import { KatalogContent } from '../components/katalog-content'

export default function KatalogPage() {
  return (
    <main className="pt-20">
      <Suspense fallback={null}>
        <KatalogContent />
      </Suspense>
    </main>
  )
}
