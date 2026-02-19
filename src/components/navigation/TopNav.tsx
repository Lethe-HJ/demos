import { auth } from '@/auth'
import { TopNavClient } from './TopNavClient'

export async function TopNav() {
  const session = await auth()

  return <TopNavClient user={session?.user} />
}

