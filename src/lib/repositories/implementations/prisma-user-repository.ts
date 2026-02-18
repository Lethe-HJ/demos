import { PrismaClient } from '@prisma/client'
import type { IUserRepository } from '../user-repository'
import type {
  User,
  UserWithPassword,
  CreateUserInput,
  UpdateUserInput,
  ListUsersQuery,
  ListUsersResult,
  UserRole
} from '../types'

export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id }
    })
    return user ? this.mapToUser(user) : null
  }

  async findByEmail(email: string): Promise<UserWithPassword | null> {
    const user = await this.prisma.user.findUnique({
      where: { email }
    })
    return user ? this.mapToUserWithPassword(user) : null
  }

  async create(data: CreateUserInput): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password, // 注意：password 应该已加密
        name: data.name,
        image: data.image,
        role: data.role || 'USER'
      }
    })
    return this.mapToUser(user)
  }

  async update(id: string, data: UpdateUserInput): Promise<User> {
    const updateData: any = {}
    if (data.email !== undefined) updateData.email = data.email
    if (data.password !== undefined) updateData.password = data.password // 注意：password 应该已加密
    if (data.name !== undefined) updateData.name = data.name
    if (data.image !== undefined) updateData.image = data.image
    if (data.role !== undefined) updateData.role = data.role

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData
    })
    return this.mapToUser(user)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id }
    })
    // 外键约束会自动删除关联的 Account 和 Session
  }

  async list(query: ListUsersQuery): Promise<ListUsersResult> {
    const { page = 1, pageSize = 10, search, role } = query
    const skip = (page - 1) * pageSize

    const where: any = {}

    if (search) {
      where.OR = [
        { email: { contains: search } },
        { name: { contains: search } }
      ]
    }

    if (role) {
      where.role = role
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          role: true,
          createdAt: true,
          updatedAt: true
          // 不选择 password
        }
      }),
      this.prisma.user.count({ where })
    ])

    return {
      users: users.map(this.mapToUser),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    }
  }

  // 映射 Prisma 模型到领域模型
  private mapToUser(prismaUser: any): User {
    return {
      id: prismaUser.id,
      email: prismaUser.email,
      name: prismaUser.name,
      image: prismaUser.image,
      role: prismaUser.role as UserRole,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt
    }
  }

  private mapToUserWithPassword(prismaUser: any): UserWithPassword {
    return {
      ...this.mapToUser(prismaUser),
      password: prismaUser.password
    }
  }
}
