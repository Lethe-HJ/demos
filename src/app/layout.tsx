import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { auth } from '@/auth'
import Link from 'next/link'
import { signOut } from '@/auth'
import { Button } from '@/components/ui/button'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: '用户管理系统',
  description: '用户认证与管理系统'
}

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()

  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <nav className="border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="text-xl font-semibold">
              用户管理系统
            </Link>
            <div className="flex items-center gap-4">
              {session ? (
                <>
                  <Link
                    href="/profile"
                    className="text-sm hover:underline"
                  >
                    个人中心
                  </Link>
                  {session.user?.role === 'ADMIN' && (
                    <Link
                      href="/admin/users"
                      className="text-sm hover:underline"
                    >
                      用户管理
                    </Link>
                  )}
                  <form
                    action={async () => {
                      'use server'
                      await signOut({ redirectTo: '/' })
                    }}
                  >
                    <Button type="submit" variant="ghost" size="sm">
                      退出
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      登录
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm">
                      注册
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  )
}
