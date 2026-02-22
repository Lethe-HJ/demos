import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'
import { mkdirSync } from 'fs'
import { config } from 'dotenv'
import { resolve } from 'path'
import bcrypt from 'bcryptjs'

// 确保环境变量在模块加载时就被设置
try {
  config({ path: resolve(process.cwd(), '.env.local') })
} catch (e) {
  // 忽略错误
}

// 确保 DATABASE_URL 始终有值
const dbUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db'
process.env.DATABASE_URL = dbUrl

// 获取数据库路径
function getDatabasePath() {
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

const dbPath = getDatabasePath()
// PrismaBetterSqlite3 需要配置对象，包含 url 属性
const adapter = new PrismaBetterSqlite3({
  url: `file:${dbPath}`
} as any)

const prisma = new PrismaClient({
  adapter
})

async function main() {
  // 创建默认管理员账户
  const adminEmail = 'admin@example.com'
  const adminPassword = 'Admin123456' // 请在生产环境中修改此密码

  // 检查管理员是否已存在
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10)

    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: '系统管理员',
        role: 'ADMIN'
      }
    })

    console.log('✅ 管理员账户创建成功！')
    console.log(`   邮箱: ${adminEmail}`)
    console.log(`   密码: ${adminPassword}`)
    console.log(`   请登录后立即修改密码！`)
  } else {
    console.log('ℹ️  管理员账户已存在')
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed 执行失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
