import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import { config } from 'dotenv'
import { resolve } from 'path'
import { prisma } from '@/lib/repositories'
import { userRepository } from '@/lib/repositories'
import bcrypt from 'bcryptjs'

// 确保环境变量在模块加载时就被设置
// 尝试多种方式加载环境变量
try {
  config({ path: resolve(process.cwd(), '.env.local') })
} catch (e) {
  // 忽略错误
}

// 确保 DATABASE_URL 始终有值
const dbUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db'
// 强制设置到 process.env（确保全局可用）
process.env.DATABASE_URL = dbUrl
// 也设置到 globalThis（某些情况下可能需要）
if (typeof globalThis !== 'undefined') {
  (globalThis as any).DATABASE_URL = dbUrl
}

// 调试信息（开发环境）
if (process.env.NODE_ENV === 'development') {
  console.log('[auth] DATABASE_URL:', process.env.DATABASE_URL)
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  providers: [
    // Credentials 提供商（邮箱密码）
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // 通过仓储查找用户
        const user = await userRepository.findByEmail(credentials.email as string)
        if (!user || !user.password) {
          return null
        }

        // 验证密码
        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isValid) {
          return null
        }

        // 返回用户信息（不含 password）
        return {
          id: user.id,
          email: user.email!,
          name: user.name,
          image: user.image,
          role: user.role
        }
      }
    }),

    // Google OAuth（可选，需要配置环境变量）
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET
    })
  ],

  session: {
    strategy: 'database' // 使用数据库会话
  },

  pages: {
    signIn: '/login' // 自定义登录页
  },

  callbacks: {
    // 在 session 中添加 role
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id
        // 从数据库获取最新的 role
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true }
        })
        if (dbUser) {
          session.user.role = dbUser.role as 'USER' | 'ADMIN'
        }
      }
      return session
    }
  }
})
