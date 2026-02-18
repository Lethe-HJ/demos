import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import Database from 'better-sqlite3'
import path from 'path'
import { mkdirSync } from 'fs'
import { config } from 'dotenv'
import { resolve } from 'path'
import { PrismaUserRepository } from './implementations/prisma-user-repository'
import type { IUserRepository } from './user-repository'

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
  console.log('[repositories] DATABASE_URL:', process.env.DATABASE_URL)
  console.log('[repositories] process.env keys:', Object.keys(process.env).filter(k => k.includes('DATABASE')))
}

// Prisma 客户端单例
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

// 创建 SQLite 数据库连接
// DATABASE_URL 格式: "file:./prisma/dev.db" 或 "file:/absolute/path/to/db"
function getDatabasePath() {
  // 确保 DATABASE_URL 有值
  const dbUrl = process.env.DATABASE_URL!
  if (!dbUrl || typeof dbUrl !== 'string') {
    throw new Error('DATABASE_URL must be a valid string')
  }
  let dbPath = dbUrl.replace(/^file:/, '')
  
  // 如果是相对路径，转换为绝对路径
  if (!path.isAbsolute(dbPath)) {
    dbPath = path.join(process.cwd(), dbPath)
  }
  
  // 确保目录存在
  const dbDir = path.dirname(dbPath)
  try {
    mkdirSync(dbDir, { recursive: true })
  } catch (err) {
    // 目录可能已存在，忽略错误
  }
  
  return dbPath
}

// 确保在创建 PrismaClient 之前环境变量已设置
// 强制设置 DATABASE_URL（PrismaClient 内部可能需要）
const finalDbUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db'
process.env.DATABASE_URL = finalDbUrl

// PrismaBetterSqlite3 需要配置对象，而不是 Database 实例
// 根据源码，它会在内部调用 createBetterSQLite3Client，需要 url 属性
const dbPath = getDatabasePath()
// 使用绝对路径作为 url（PrismaBetterSqlite3 内部会调用 createBetterSQLite3Client，它需要 url 属性）
const adapter = new PrismaBetterSqlite3({
  url: `file:${dbPath}`
} as any)

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// 创建仓储实例（可根据环境变量切换实现）
export const userRepository: IUserRepository = new PrismaUserRepository(prisma)

// 未来可扩展：
// if (process.env.DB_ADAPTER === 'drizzle') {
//   export const userRepository = new DrizzleUserRepository(...)
// }
