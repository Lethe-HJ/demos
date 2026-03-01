'use server'

import { auth } from '@/auth'
import { demoRepository } from '@/lib/repositories'
import type { DemoCreateInput, DemoUpdateInput } from '@/lib/repositories/demo-repository'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const createDemoSchema = z.object({
  category: z.string().min(1, '请输入一级分类'),
  subcategory: z.string().min(1, '请输入二级分类'),
  name: z.string().min(1, '请输入名称'),
  description: z.string().optional(),
  iframeUrl: z.string().min(1, '请输入 iframe 链接'),
  markdownUrl: z.string().optional(),
  techStack: z.string().optional()
})

const updateDemoSchema = createDemoSchema.partial()

export async function listDemos() {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }
  if (session.user.role !== 'ADMIN') {
    redirect('/')
  }

  try {
    const demos = await demoRepository.findAll()
    return { success: true, demos }
  } catch (error) {
    return {
      success: false,
      error: '获取示例列表失败',
      demos: []
    }
  }
}

export async function createDemo(data: unknown) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  try {
    const validated = createDemoSchema.parse(data) as z.infer<
      typeof createDemoSchema
    >
    const input: DemoCreateInput = {
      category: validated.category,
      subcategory: validated.subcategory,
      name: validated.name,
      description: validated.description ?? null,
      iframeUrl: validated.iframeUrl,
      markdownUrl: validated.markdownUrl ?? null,
      techStack: validated.techStack ?? null
    }
    const demo = await demoRepository.create(input)
    return { success: true, demo }
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

export async function updateDemo(id: string, data: unknown) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  try {
    const validated = updateDemoSchema.parse(data) as z.infer<
      typeof updateDemoSchema
    >
    const input: DemoUpdateInput = {}
    if (validated.category != null) input.category = validated.category
    if (validated.subcategory != null) input.subcategory = validated.subcategory
    if (validated.name != null) input.name = validated.name
    if (validated.description !== undefined) input.description = validated.description ?? null
    if (validated.iframeUrl != null) input.iframeUrl = validated.iframeUrl
    if (validated.markdownUrl !== undefined) input.markdownUrl = validated.markdownUrl ?? null
    if (validated.techStack !== undefined) input.techStack = validated.techStack ?? null

    const demo = await demoRepository.update(id, input)
    return { success: true, demo }
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

export async function deleteDemo(id: string) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  try {
    await demoRepository.delete(id)
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: '删除失败，请稍后重试',
      code: 'DATABASE_ERROR'
    }
  }
}
