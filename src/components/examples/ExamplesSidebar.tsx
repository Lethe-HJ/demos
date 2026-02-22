'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { type Category } from '@/lib/examples-data'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ExamplesSidebarProps {
  categories: Category[]
}

export function ExamplesSidebar({ categories }: ExamplesSidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const category = searchParams.get('category') || ''
  const subcategory = searchParams.get('subcategory') || ''
  const demoId = searchParams.get('demo') || ''

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(category ? [category] : [])
  )
  const [expandedSubcategories, setExpandedSubcategories] = useState<
    Set<string>
  >(new Set(subcategory ? [`${category}-${subcategory}`] : []))

  const toggleCategory = (catName: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(catName)) {
      newExpanded.delete(catName)
    } else {
      newExpanded.add(catName)
    }
    setExpandedCategories(newExpanded)
  }

  const toggleSubcategory = (catName: string, subcatName: string) => {
    const key = `${catName}-${subcatName}`
    const newExpanded = new Set(expandedSubcategories)
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    setExpandedSubcategories(newExpanded)
  }

  const selectDemo = (catName: string, subcatName: string, demoId: string) => {
    const params = new URLSearchParams()
    params.set('category', catName)
    params.set('subcategory', subcatName)
    params.set('demo', demoId)
    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="w-64 border-r bg-background h-full">
      <ScrollArea className="h-full">
        <div className="p-2">
          {categories.map((cat) => {
            const isCategoryExpanded = expandedCategories.has(cat.category)
            return (
              <div key={cat.category} className="mb-1">
                <button
                  onClick={() => toggleCategory(cat.category)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium hover:bg-accent transition-colors',
                    category === cat.category && 'bg-accent'
                  )}
                >
                  <span>{cat.category}</span>
                  {isCategoryExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                {isCategoryExpanded && (
                  <div className="ml-4 mt-1">
                    {cat.subcategories.map((subcat) => {
                      const key = `${cat.category}-${subcat.name}`
                      const isSubcatExpanded = expandedSubcategories.has(key)
                      return (
                        <div key={subcat.name} className="mb-1">
                          <button
                            onClick={() =>
                              toggleSubcategory(cat.category, subcat.name)
                            }
                            className={cn(
                              'w-full flex items-center justify-between px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors',
                              subcategory === subcat.name && 'bg-accent'
                            )}
                          >
                            <span>{subcat.name}</span>
                            {isSubcatExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </button>
                          {isSubcatExpanded && (
                            <div className="ml-4 mt-1">
                              {subcat.demos.map((demo) => (
                                <button
                                  key={demo.id}
                                  onClick={() =>
                                    selectDemo(
                                      cat.category,
                                      subcat.name,
                                      demo.id
                                    )
                                  }
                                  className={cn(
                                    'w-full text-left px-3 py-1.5 rounded-md text-sm hover:bg-accent transition-colors',
                                    demoId === demo.id &&
                                      'bg-accent font-medium'
                                  )}
                                >
                                  {demo.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
