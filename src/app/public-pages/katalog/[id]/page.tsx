import { Suspense } from 'react'
import { KatalogDetailContent } from '../../components/katalog-detail-content'

export default function KatalogDetailPage() {
  return (
    <main className="pt-20">
      <Suspense fallback={null}>
        <KatalogDetailContent />
      </Suspense>
    </main>
  )
}
