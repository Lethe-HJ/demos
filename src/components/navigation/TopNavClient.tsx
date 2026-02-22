'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserMenu } from './UserMenu'

interface TopNavClientProps {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string | null
  }
}

export function TopNavClient({ user }: TopNavClientProps) {
  const pathname = usePathname()
  const router = useRouter()

  // 根据路径确定当前选中的标签
  const getActiveTab = () => {
    if (pathname === '/') return 'examples'
    if (pathname.startsWith('/profile')) return 'profile'
    if (pathname.startsWith('/admin')) return 'admin'
    return 'examples'
  }

  const handleTabChange = (value: string) => {
    if (value === 'examples') {
      router.push('/')
    } else if (value === 'profile') {
      router.push('/profile')
    } else if (value === 'admin') {
      router.push('/admin/users')
    }
  }

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold">
            案例集锦
          </Link>
          <div className="flex items-center gap-6">
            <Tabs
              value={getActiveTab()}
              onValueChange={handleTabChange}
              className="w-auto"
            >
              <TabsList>
                <TabsTrigger value="examples">示例</TabsTrigger>
                {user && (
                  <>
                    <TabsTrigger value="profile">个人中心</TabsTrigger>
                    {user.role === 'ADMIN' && (
                      <TabsTrigger value="admin">用户管理</TabsTrigger>
                    )}
                  </>
                )}
              </TabsList>
            </Tabs>
            <UserMenu user={user} />
          </div>
        </div>
      </div>
    </nav>
  )
}
