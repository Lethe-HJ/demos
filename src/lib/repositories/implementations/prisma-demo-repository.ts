import type { PrismaClient } from '@prisma/client'
import type { IDemoRepository, DemoDomain } from '../demo-repository'

export class PrismaDemoRepository implements IDemoRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(): Promise<DemoDomain[]> {
    // 检查 Prisma 客户端是否包含 Demo 模型
    if (!this.prisma.demo) {
      console.warn(
        '[PrismaDemoRepository] Demo model not found in Prisma client. Please run: npx prisma generate'
      )
      return []
    }
    try {
      const demos = await this.prisma.demo.findMany({
        orderBy: [{ category: 'asc' }, { subcategory: 'asc' }, { name: 'asc' }]
      })
      return demos.map(this.toDomain)
    } catch (error: any) {
      // 处理表不存在的情况
      if (
        error?.code === 'P2021' ||
        error?.message?.includes('does not exist')
      ) {
        console.warn(
          '[PrismaDemoRepository] Demo table does not exist. Please run: npx prisma migrate dev'
        )
        return []
      }
      throw error
    }
  }

  async findByCategory(category: string): Promise<DemoDomain[]> {
    if (!this.prisma.demo) {
      console.warn(
        '[PrismaDemoRepository] Demo model not found in Prisma client. Please run: npx prisma generate'
      )
      return []
    }
    try {
      const demos = await this.prisma.demo.findMany({
        where: { category },
        orderBy: [{ subcategory: 'asc' }, { name: 'asc' }]
      })
      return demos.map(this.toDomain)
    } catch (error: any) {
      if (
        error?.code === 'P2021' ||
        error?.message?.includes('does not exist')
      ) {
        console.warn(
          '[PrismaDemoRepository] Demo table does not exist. Please run: npx prisma migrate dev'
        )
        return []
      }
      throw error
    }
  }

  async findByCategoryAndSubcategory(
    category: string,
    subcategory: string
  ): Promise<DemoDomain[]> {
    if (!this.prisma.demo) {
      console.warn(
        '[PrismaDemoRepository] Demo model not found in Prisma client. Please run: npx prisma generate'
      )
      return []
    }
    try {
      const demos = await this.prisma.demo.findMany({
        where: {
          category,
          subcategory
        },
        orderBy: { name: 'asc' }
      })
      return demos.map(this.toDomain)
    } catch (error: any) {
      if (
        error?.code === 'P2021' ||
        error?.message?.includes('does not exist')
      ) {
        console.warn(
          '[PrismaDemoRepository] Demo table does not exist. Please run: npx prisma migrate dev'
        )
        return []
      }
      throw error
    }
  }

  async findById(id: string): Promise<DemoDomain | null> {
    if (!this.prisma.demo) {
      console.warn(
        '[PrismaDemoRepository] Demo model not found in Prisma client. Please run: npx prisma generate'
      )
      return null
    }
    try {
      const demo = await this.prisma.demo.findUnique({
        where: { id }
      })
      return demo ? this.toDomain(demo) : null
    } catch (error: any) {
      if (
        error?.code === 'P2021' ||
        error?.message?.includes('does not exist')
      ) {
        console.warn(
          '[PrismaDemoRepository] Demo table does not exist. Please run: npx prisma migrate dev'
        )
        return null
      }
      throw error
    }
  }

  // 将 Prisma 模型转换为领域模型
  private toDomain(prismaDemo: any): DemoDomain {
    return {
      id: prismaDemo.id,
      category: prismaDemo.category,
      subcategory: prismaDemo.subcategory,
      name: prismaDemo.name,
      description: prismaDemo.description,
      iframeUrl: prismaDemo.iframeUrl,
      markdownUrl: prismaDemo.markdownUrl,
      techStack: prismaDemo.techStack,
      createdAt: prismaDemo.createdAt,
      updatedAt: prismaDemo.updatedAt
    }
  }
}
