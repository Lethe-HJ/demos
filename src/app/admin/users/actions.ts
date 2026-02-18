'use server'

import { auth } from '@/auth'
import { userRepository } from '@/lib/repositories'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const listUsersSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(50).default(10),
  search: z.string().optional(),
  role: z.enum(['USER', 'ADMIN']).optional()
})

const updateUserSchema = z.object({
  name: z.string().max(100).optional(),
  email: z.string().email().optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
  image: z.string().url().optional().or(z.literal(''))
})

const createUserSchema = z.object({
  email: z.string().email('无效邮箱'),
  password: z.string().min(8, '密码至少8位'),
  name: z.string().max(100).optional(),
  role: z.enum(['USER', 'ADMIN']).default('USER')
})

export async function listUsers(query: unknown) {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }
  if (session.user.role !== 'ADMIN') {
    redirect('/')
  }

  try {
    const validated = listUsersSchema.parse(query)
    const result = await userRepository.list(validated)
    return {
      success: true,
      ...result
    }
  } catch (error) {
    return {
      success: false,
      error: '获取用户列表失败',
      code: 'DATABASE_ERROR',
      users: [],
      total: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0
    }
  }
}

export async function updateUser(userId: string, data: unknown) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  try {
    const validated = updateUserSchema.parse(data)

    // 如果更新邮箱，检查是否已被使用
    if (validated.email) {
      const existing = await userRepository.findByEmail(validated.email)
      if (existing && existing.id !== userId) {
        return {
          success: false,
          error: '邮箱已被其他用户使用',
          code: 'EMAIL_EXISTS'
        }
      }
    }

    const user = await userRepository.update(userId, validated)
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

export async function deleteUser(userId: string) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  // 防止删除自己
  if (session.user.id === userId) {
    return {
      success: false,
      error: '不能删除自己的账户',
      code: 'CANNOT_DELETE_SELF'
    }
  }

  try {
    await userRepository.delete(userId)
    return {
      success: true
    }
  } catch (error) {
    return {
      success: false,
      error: '删除失败，请稍后重试',
      code: 'DATABASE_ERROR'
    }
  }
}

export async function createUser(data: unknown) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  try {
    const validated = createUserSchema.parse(data)

    // 检查邮箱是否已存在
    const existing = await userRepository.findByEmail(validated.email)
    if (existing) {
      return {
        success: false,
        error: '邮箱已被使用',
        code: 'EMAIL_EXISTS'
      }
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(validated.password, 10)

    // 创建用户
    const user = await userRepository.create({
      email: validated.email,
      password: hashedPassword,
      name: validated.name,
      role: validated.role
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
      error: '创建失败，请稍后重试',
      code: 'DATABASE_ERROR'
    }
  }
}
