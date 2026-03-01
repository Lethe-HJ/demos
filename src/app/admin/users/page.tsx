import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { listUsers } from './actions'
import { UsersTable } from '@/components/admin/users-table'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

interface PageProps {
  searchParams: Promise<{
    page?: string
    pageSize?: string
    search?: string
    role?: string
  }>
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }
  if (session.user.role !== 'ADMIN') {
    redirect('/')
  }

  const params = await searchParams
  const page = parseInt(params.page || '1')
  const pageSize = parseInt(params.pageSize || '10')
  const search = params.search || undefined
  const role = (params.role as 'USER' | 'ADMIN') || undefined

  const result = await listUsers({ page, pageSize, search, role })

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>用户管理</CardTitle>
          <CardDescription>管理系统中的所有用户</CardDescription>
        </CardHeader>
        <CardContent>
          <UsersTable
            initialData={
              result.success
                ? result
                : {
                    users: [],
                    total: 0,
                    page: 1,
                    pageSize: 10,
                    totalPages: 0
                  }
            }
            currentPage={page}
            currentPageSize={pageSize}
            currentSearch={search}
            currentRole={role}
          />
        </CardContent>
      </Card>
    </div>
  )
}
