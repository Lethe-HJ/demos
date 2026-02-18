import type {
  User,
  UserWithPassword,
  CreateUserInput,
  UpdateUserInput,
  ListUsersQuery,
  ListUsersResult
} from './types'

/**
 * 用户仓储接口
 * 所有数据库操作通过此接口，便于更换数据库实现
 */
export interface IUserRepository {
  /**
   * 根据 ID 查找用户
   */
  findById(id: string): Promise<User | null>

  /**
   * 根据邮箱查找用户（含 password，用于登录验证）
   */
  findByEmail(email: string): Promise<UserWithPassword | null>

  /**
   * 创建用户
   */
  create(data: CreateUserInput): Promise<User>

  /**
   * 更新用户
   */
  update(id: string, data: UpdateUserInput): Promise<User>

  /**
   * 删除用户
   */
  delete(id: string): Promise<void>

  /**
   * 分页查询用户列表
   */
  list(query: ListUsersQuery): Promise<ListUsersResult>
}
