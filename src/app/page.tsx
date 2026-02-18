import { auth } from '@/auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

export default async function Home() {
  const session = await auth()

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>欢迎使用用户管理系统</CardTitle>
          <CardDescription>
            一个基于 Next.js、Auth.js 和 Prisma 的用户认证与管理系统
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {session ? (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                欢迎，{session.user?.name || session.user?.email}！
              </p>
              <div className="flex gap-4">
                <Link href="/profile">
                  <Button>个人中心</Button>
                </Link>
                {session.user?.role === 'ADMIN' && (
                  <Link href="/admin/users">
                    <Button variant="outline">用户管理</Button>
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                请登录或注册以开始使用
              </p>
              <div className="flex gap-4">
                <Link href="/login">
                  <Button>登录</Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline">注册</Button>
                </Link>
              </div>
            </div>
          )}

          <div className="mt-8 pt-8 border-t">
            <h3 className="text-lg font-semibold mb-2">功能特性</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>邮箱密码登录</li>
              <li>Google OAuth 登录（可选）</li>
              <li>用户注册</li>
              <li>个人资料管理</li>
              <li>密码修改（Credentials 用户）</li>
              <li>管理员用户管理（CRUD）</li>
              <li>数据库解耦设计（仓储模式）</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
