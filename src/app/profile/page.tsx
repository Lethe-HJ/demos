import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { updateProfile, changePassword } from './actions'
import { ProfileForm } from '@/components/profile/profile-form'
import { ChangePasswordForm } from '@/components/profile/change-password-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/login?callbackUrl=/profile')
  }

  const user = session.user
  // 检查是否为 Credentials 用户（有 password）
  let isCredentialsUser = false
  if (user.email) {
    const { userRepository } = await import('@/lib/repositories')
    const dbUser = await userRepository.findByEmail(user.email)
    isCredentialsUser = !!dbUser?.password
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>个人中心</CardTitle>
          <CardDescription>管理您的账户信息</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">账户信息</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">邮箱：</span>
                <span>{user.email}</span>
              </div>
              <div>
                <span className="text-muted-foreground">角色：</span>
                <span>{user.role === 'ADMIN' ? '管理员' : '普通用户'}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">更新资料</h3>
            <ProfileForm
              defaultValues={{
                name: user.name || '',
                image: user.image || ''
              }}
              onSubmit={updateProfile}
            />
          </div>

          {isCredentialsUser && (
            <div>
              <h3 className="text-lg font-semibold mb-4">修改密码</h3>
              <ChangePasswordForm onSubmit={changePassword} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
