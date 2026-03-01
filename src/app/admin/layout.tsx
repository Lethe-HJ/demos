import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { AdminSubNav } from '@/components/admin/admin-sub-nav'

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) {
    redirect('/login?callbackUrl=/admin/users')
  }
  if (session.user.role !== 'ADMIN') {
    redirect('/')
  }

  return (
    <div>
      <AdminSubNav />
      {children}
    </div>
  )
}
