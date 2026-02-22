'use server'

import { auth } from '@/auth'
import { userRepository } from '@/lib/repositories'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const updateProfileSchema = z.object({
  name: z.string().max(100).optional(),
  image: z.string().url().optional().or(z.literal(''))
})

const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8, '新密码至少8位')
})

export async function updateProfile(data: unknown) {
  const session = await auth()
  if (!session?.user) {
    redirect('/login?callbackUrl=/profile')
  }

  try {
    const validated = updateProfileSchema.parse(data)

    const user = await userRepository.update(session.user.id, {
      name: validated.name,
      image: validated.image || null
    })

    return {
      success: true,
      user
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
      error: '更新失败，请稍后重试',
      code: 'DATABASE_ERROR'
    }
  }
}

export async function changePassword(data: unknown) {
  const session = await auth()
  if (!session?.user?.email) {
    redirect('/login')
  }

  try {
    const validated = changePasswordSchema.parse(data)

    // 获取用户（含 password）
    const user = await userRepository.findByEmail(session.user.email)
    if (!user || !user.password) {
      return {
        success: false,
        error: 'OAuth 用户无法修改密码',
        code: 'OAUTH_USER'
      }
    }

    // 验证旧密码
    const isValid = await bcrypt.compare(
      validated.currentPassword,
      user.password
    )
    if (!isValid) {
      return {
        success: false,
        error: '当前密码错误',
        code: 'INVALID_PASSWORD'
      }
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(validated.newPassword, 10)

    // 更新密码
    await userRepository.update(user.id, {
      password: hashedPassword
    })

    return {
      success: true
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
      error: '修改失败，请稍后重试',
      code: 'DATABASE_ERROR'
    }
  }
}
