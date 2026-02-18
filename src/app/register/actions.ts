'use server'

import { userRepository } from '@/lib/repositories'
import { signIn } from '@/auth'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email('无效邮箱'),
  password: z.string().min(8, '密码至少8位'),
  name: z.string().max(100).optional()
})

export async function registerUser(data: unknown) {
  try {
    // 验证输入
    const validated = registerSchema.parse(data)

    // 检查邮箱是否已存在
    const existing = await userRepository.findByEmail(validated.email)
    if (existing) {
      return {
        success: false,
        error: '邮箱已被注册',
        code: 'EMAIL_EXISTS'
      }
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(validated.password, 10)

    // 创建用户
    const user = await userRepository.create({
      email: validated.email,
      password: hashedPassword,
      name: validated.name
    })

    // 自动登录
    await signIn('credentials', {
      email: validated.email,
      password: validated.password,
      redirect: false
    })

    return {
      success: true,
      userId: user.id
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
        code: 'VALIDATION_ERROR'
      }
    }
    return {
      success: false,
      error: '注册失败，请稍后重试',
      code: 'DATABASE_ERROR'
    }
  }
}
