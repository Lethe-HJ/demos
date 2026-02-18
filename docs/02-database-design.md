# 数据库设计文档

## 概述

本文档描述用户认证与用户管理系统的数据库设计。使用 **Prisma ORM** 管理 SQLite 数据库，支持后续迁移到其他数据库（PostgreSQL、MySQL 等）。

## 一、数据库选型

- **当前**: SQLite（文件数据库，适合开发与小型应用）
- **可迁移**: PostgreSQL、MySQL、MongoDB（通过更换 Prisma datasource）

## 二、数据模型设计

### 2.1 User（用户表）

存储用户基本信息。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | String | PK, @default(cuid()) | 用户唯一标识 |
| email | String? | UNIQUE | 邮箱（OAuth 用户可能为空） |
| emailVerified | DateTime? | - | 邮箱验证时间 |
| name | String? | - | 显示名称 |
| image | String? | - | 头像 URL |
| password | String? | - | 加密后的密码（仅 Credentials 用户） |
| role | String | @default("USER") | 角色：USER 或 ADMIN |
| createdAt | DateTime | @default(now()) | 创建时间 |
| updatedAt | DateTime | @updatedAt | 更新时间 |

**索引**:
- `email` 唯一索引（用于快速查找）
- `role` 普通索引（用于管理员查询）

**关系**:
- 一对多：`accounts`（Account[]）
- 一对多：`sessions`（Session[]）

### 2.2 Account（账户关联表）

存储 OAuth 提供商账户信息（Google、GitHub 等）。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | String | PK, @default(cuid()) | 账户 ID |
| userId | String | FK → User.id | 关联的用户 ID |
| type | String | - | 账户类型：oauth、credentials 等 |
| provider | String | - | 提供商：google、credentials 等 |
| providerAccountId | String | - | 提供商账户 ID |
| refresh_token | String? | @db.Text | OAuth 刷新令牌 |
| access_token | String? | @db.Text | OAuth 访问令牌 |
| expires_at | Int? | - | 令牌过期时间（Unix 时间戳） |
| token_type | String? | - | 令牌类型：Bearer 等 |
| scope | String? | - | OAuth 权限范围 |
| id_token | String? | @db.Text | OpenID Connect ID Token |
| session_state | String? | - | OAuth 会话状态 |

**复合唯一索引**:
- `(provider, providerAccountId)` - 同一提供商下账户唯一

**关系**:
- 多对一：`user`（User）

**外键约束**:
- `onDelete: Cascade` - 删除用户时自动删除关联账户

### 2.3 Session（会话表）

存储用户登录会话信息。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | String | PK, @default(cuid()) | 会话 ID |
| sessionToken | String | UNIQUE | 会话令牌（用于 cookie） |
| userId | String | FK → User.id | 关联的用户 ID |
| expires | DateTime | - | 过期时间 |

**索引**:
- `sessionToken` 唯一索引（用于快速查找会话）

**关系**:
- 多对一：`user`（User）

**外键约束**:
- `onDelete: Cascade` - 删除用户时自动删除所有会话

### 2.4 VerificationToken（验证令牌表）

存储邮箱验证、密码重置等临时令牌。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| identifier | String | - | 标识符（如邮箱） |
| token | String | - | 验证令牌 |
| expires | DateTime | - | 过期时间 |

**复合唯一索引**:
- `(identifier, token)` - 同一标识符下令牌唯一

**用途**:
- 邮箱验证（当前未实现，预留）
- 密码重置（当前未实现，预留）

## 三、Prisma Schema 完整定义

**文件**: `prisma/schema.prisma`

```prisma
// datasource 配置
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// User 模型
model User {
  id            String    @id @default(cuid())
  email         String?   @unique
  emailVerified DateTime?
  name          String?
  image         String?
  password      String?   // 仅 Credentials 用户使用
  role          String    @default("USER") // USER 或 ADMIN
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  accounts      Account[]
  sessions      Session[]

  @@index([role])
  @@map("users")
}

// Account 模型（Auth.js 标准）
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?  @db.Text
  access_token      String?  @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?  @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

// Session 模型（Auth.js 标准）
model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

// VerificationToken 模型（Auth.js 标准）
model VerificationToken {
  identifier String
  token      String
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}
```

## 四、数据库迁移

### 4.1 初始化数据库

```bash
# 初始化 Prisma（如果未初始化）
npx prisma init --datasource-provider sqlite

# 创建迁移
npx prisma migrate dev --name init

# 生成 Prisma Client
npx prisma generate
```

### 4.2 后续迁移

当修改 schema 后：

```bash
# 创建并应用迁移
npx prisma migrate dev --name add_user_role

# 或仅创建迁移文件（不应用）
npx prisma migrate dev --create-only
```

### 4.3 查看数据库

```bash
# 打开 Prisma Studio（可视化工具）
npx prisma studio
```

## 五、数据访问层设计

### 5.1 领域类型（与 Prisma 解耦）

**文件**: `src/lib/repositories/types.ts`

```typescript
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
```

### 5.2 仓储接口

**文件**: `src/lib/repositories/user-repository.ts`

```typescript
import type {
  User,
  UserWithPassword,
  CreateUserInput,
  UpdateUserInput,
  ListUsersQuery,
  ListUsersResult
} from './types'

export interface IUserRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<UserWithPassword | null>
  create(data: CreateUserInput): Promise<User>
  update(id: string, data: UpdateUserInput): Promise<User>
  delete(id: string): Promise<void>
  list(query: ListUsersQuery): Promise<ListUsersResult>
}
```

### 5.3 Prisma 实现示例（关键方法）

**文件**: `src/lib/repositories/implementations/prisma-user-repository.ts`

```typescript
import { PrismaClient } from '@prisma/client'
import type { IUserRepository } from '../user-repository'
import type {
  User,
  UserWithPassword,
  CreateUserInput,
  UpdateUserInput,
  ListUsersQuery,
  ListUsersResult
} from '../types'

export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async findByEmail(email: string): Promise<UserWithPassword | null> {
    const user = await this.prisma.user.findUnique({
      where: { email }
    })
    return user ? this.mapToUserWithPassword(user) : null
  }

  async list(query: ListUsersQuery): Promise<ListUsersResult> {
    const { page = 1, pageSize = 10, search, role } = query
    const skip = (page - 1) * pageSize

    const where = {
      ...(search && {
        OR: [
          { email: { contains: search } },
          { name: { contains: search } }
        ]
      }),
      ...(role && { role })
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' }
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

  // ... 其他方法实现

  private mapToUser(prismaUser: any): User {
    // 映射 Prisma 模型到领域模型
  }

  private mapToUserWithPassword(prismaUser: any): UserWithPassword {
    // 映射 Prisma 模型到领域模型（含 password）
  }
}
```

## 六、数据关系图

```mermaid
erDiagram
  User ||--o{ Account : "has"
  User ||--o{ Session : "has"
  
  User {
    string id PK
    string email UK
    string name
    string image
    string password
    string role
    datetime createdAt
    datetime updatedAt
  }
  
  Account {
    string id PK
    string userId FK
    string type
    string provider
    string providerAccountId
    string refresh_token
    string access_token
    int expires_at
  }
  
  Session {
    string id PK
    string sessionToken UK
    string userId FK
    datetime expires
  }
  
  VerificationToken {
    string identifier
    string token
    datetime expires
  }
```

## 七、索引优化建议

1. **User.email**: 唯一索引，用于快速查找用户
2. **User.role**: 普通索引，用于管理员查询用户列表
3. **Account(provider, providerAccountId)**: 复合唯一索引，用于 OAuth 账户查找
4. **Session.sessionToken**: 唯一索引，用于会话验证

## 八、数据一致性

1. **外键约束**: Account 和 Session 的 `userId` 外键设置为 `onDelete: Cascade`，删除用户时自动清理关联数据
2. **唯一性约束**: User.email 唯一，防止重复注册
3. **默认值**: User.role 默认为 "USER"，新用户自动分配普通角色

## 九、未来扩展

### 9.1 可能的扩展字段

- `User.lastLoginAt`: 最后登录时间
- `User.isActive`: 账户是否激活（软删除）
- `User.preferences`: JSON 字段存储用户偏好设置

### 9.2 可能的扩展表

- `PasswordResetToken`: 密码重置令牌（当前使用 VerificationToken）
- `EmailVerificationToken`: 邮箱验证令牌（当前使用 VerificationToken）
- `UserActivity`: 用户活动日志

## 十、迁移到其他数据库

### 10.1 迁移到 PostgreSQL

修改 `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

更新 `.env`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
```

运行迁移:
```bash
npx prisma migrate dev
```

### 10.2 迁移到 MySQL

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

### 10.3 注意事项

- SQLite 的 `@db.Text` 在 PostgreSQL/MySQL 中可能需要调整
- 某些 SQLite 特有语法需要替换
- 索引和约束语法可能略有不同
