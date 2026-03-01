'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function AdminSubNav() {
  const pathname = usePathname()
  const router = useRouter()

  const activeValue = pathname.startsWith('/admin/demos') ? 'demos' : 'users'

  const handleTabChange = (value: string) => {
    if (value === 'demos') router.push('/admin/demos')
    else router.push('/admin/users')
  }

  return (
    <div className="border-b pb-4 mb-6">
      <Tabs value={activeValue} onValueChange={handleTabChange} className="w-auto">
        <TabsList>
          <TabsTrigger value="users">用户管理</TabsTrigger>
          <TabsTrigger value="demos">示例管理</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}
