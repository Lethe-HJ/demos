'use client'

import { useSearchParams } from 'next/navigation'
import { ExamplesSidebar } from './ExamplesSidebar'
import { ExamplesContent } from './ExamplesContent'
import { FloatingButtons } from './FloatingButtons'
import { findDemo, type Category } from '@/lib/examples-data'

interface ExamplesLayoutClientProps {
  categories: Category[]
}

export function ExamplesLayoutClient({ categories }: ExamplesLayoutClientProps) {
  const searchParams = useSearchParams()
  const category = searchParams.get('category') || ''
  const subcategory = searchParams.get('subcategory') || ''
  const demoId = searchParams.get('demo') || ''

  const currentDemo = category && subcategory && demoId
    ? findDemo(category, subcategory, demoId, categories)
    : null

  return (
    <div className="flex h-[calc(100vh-73px)]">
      <ExamplesSidebar categories={categories} />
      <div className="flex-1 relative overflow-hidden">
        <ExamplesContent currentDemo={currentDemo} />
        <FloatingButtons currentDemo={currentDemo} />
      </div>
    </div>
  )
}
