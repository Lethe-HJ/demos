// 确保环境变量在模块加载时就被设置
// Next.js 会自动加载 .env.local，但为了确保所有模块都能访问，我们在这里显式加载

import { config } from 'dotenv'
import { resolve } from 'path'

// 加载 .env.local 文件
config({ path: resolve(process.cwd(), '.env.local') })

// 如果 DATABASE_URL 仍然未设置，使用默认值
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./prisma/dev.db'
}

export {}
