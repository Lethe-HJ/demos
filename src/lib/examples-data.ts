import type { DemoDomain } from '@/lib/repositories/demo-repository'

// 兼容旧的Demo接口（用于UI组件）
export interface Demo {
  id: string
  name: string
  description: string
  category: string
  subcategory: string
  iframeUrl: string
  markdownUrl: string | null
  techStack: string[] | null
  info?: {
    title: string
    description: string
    techStack?: string[]
    usage?: string
    links?: Array<{ label: string; url: string }>
  }
}

export interface Subcategory {
  name: string
  demos: Demo[]
}

export interface Category {
  category: string
  subcategories: Subcategory[]
}

// 将数据库模型转换为UI需要的格式
export function demoDomainToDemo(demo: DemoDomain): Demo {
  let techStack: string[] | null = null
  if (demo.techStack) {
    try {
      techStack = JSON.parse(demo.techStack)
    } catch {
      techStack = null
    }
  }

  return {
    id: demo.id,
    name: demo.name,
    description: demo.description || '',
    category: demo.category,
    subcategory: demo.subcategory,
    iframeUrl: demo.iframeUrl,
    markdownUrl: demo.markdownUrl,
    techStack,
    info: {
      title: demo.name,
      description: demo.description || '',
      techStack: techStack || undefined,
      links: demo.markdownUrl
        ? [{ label: '详细说明', url: demo.markdownUrl }]
        : undefined
    }
  }
}

// 将数据库数据组织成三级结构
export function organizeDemosToCategories(demos: DemoDomain[]): Category[] {
  const categoryMap = new Map<string, Map<string, Demo[]>>()

  demos.forEach(demoDomain => {
    const demo = demoDomainToDemo(demoDomain)
    const { category, subcategory } = demo

    if (!categoryMap.has(category)) {
      categoryMap.set(category, new Map())
    }

    const subcategoryMap = categoryMap.get(category)!
    if (!subcategoryMap.has(subcategory)) {
      subcategoryMap.set(subcategory, [])
    }

    subcategoryMap.get(subcategory)!.push(demo)
  })

  // 转换为数组格式
  return Array.from(categoryMap.entries()).map(([category, subcategoryMap]) => ({
    category,
    subcategories: Array.from(subcategoryMap.entries()).map(([name, demos]) => ({
      name,
      demos
    }))
  }))
}

// 查找demo（兼容旧接口）
export function findDemo(
  category: string,
  subcategory: string,
  demoId: string,
  categories: Category[]
): Demo | undefined {
  const cat = categories.find(c => c.category === category)
  if (!cat) return undefined

  const subcat = cat.subcategories.find(s => s.name === subcategory)
  if (!subcat) return undefined

  return subcat.demos.find(d => d.id === demoId)
}
