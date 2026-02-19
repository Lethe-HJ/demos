import { Suspense } from 'react'
import { ExamplesLayout } from '@/components/examples/ExamplesLayout'

function ExamplesLayoutFallback() {
  return (
    <div className="flex h-[calc(100vh-73px)]">
      <div className="w-64 border-r bg-background" />
      <div className="flex-1 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<ExamplesLayoutFallback />}>
      <ExamplesLayout />
    </Suspense>
  )
}
