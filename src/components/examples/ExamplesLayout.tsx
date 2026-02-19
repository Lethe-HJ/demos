import { demoRepository } from '@/lib/repositories'
import { organizeDemosToCategories } from '@/lib/examples-data'
import { ExamplesLayoutClient } from './ExamplesLayoutClient'

export async function ExamplesLayout() {
  const demos = await demoRepository.findAll()
  const categories = organizeDemosToCategories(demos)

  return <ExamplesLayoutClient categories={categories} />
}
