import type { NextConfig } from "next";
import { config } from 'dotenv'
import { resolve } from 'path'

// 确保环境变量在配置加载时就被设置
config({ path: resolve(process.cwd(), '.env.local') })

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // 确保环境变量在运行时可用
  env: {
    DATABASE_URL: process.env.DATABASE_URL || 'file:./prisma/dev.db',
  },
};

export default nextConfig;
