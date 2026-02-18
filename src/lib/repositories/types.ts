// 用户角色枚举
export type UserRole = 'USER' | 'ADMIN'

// 用户领域模型（不含 password）
export interface User {
  id: string
  email: string | null
  name: string | null
  image: string | null
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

// 用户（含 password，仅内部使用）
export interface UserWithPassword extends User {
  password: string | null
}

// 创建用户输入
export interface CreateUserInput {
  email: string
  password?: string // 可选，OAuth 用户无密码
  name?: string
  image?: string
  role?: UserRole
}

// 更新用户输入
export interface UpdateUserInput {
  email?: string
  password?: string
  name?: string
  image?: string
  role?: UserRole
}

// 列表查询参数
export interface ListUsersQuery {
  page?: number
  pageSize?: number
  search?: string // 搜索 email 或 name
  role?: UserRole
}

// 列表查询结果
export interface ListUsersResult {
  users: User[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
