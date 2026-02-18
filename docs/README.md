# 设计文档索引

本文档目录包含用户认证与用户管理系统的完整设计文档。

## 文档列表

### 1. [HTTP 接口设计](./01-http-api-design.md)

描述所有 HTTP 端点和 Server Actions：
- Auth.js 自动生成的认证端点
- Server Actions（注册、更新资料、修改密码、管理员操作等）
- 错误响应格式
- 认证流程（Credentials 和 OAuth）
- 会话管理

### 2. [数据库设计](./02-database-design.md)

描述数据库结构和数据访问层：
- 数据模型（User、Account、Session、VerificationToken）
- Prisma Schema 完整定义
- 领域类型（与 ORM 解耦）
- 仓储接口设计
- Prisma 实现示例
- 数据库迁移指南

### 3. [前端逻辑设计](./03-frontend-design.md)

描述前端架构和组件设计：
- 页面结构和路由
- 组件设计（表单、表格、对话框等）
- 状态管理（服务端和客户端）
- 路由保护
- 错误处理
- UI/UX 设计原则

### 4. [后端逻辑设计](./04-backend-design.md)

描述后端架构和业务逻辑：
- 架构层次（Server Actions、业务逻辑层、数据访问层）
- 数据访问层完整实现（接口、Prisma 实现、导出）
- Auth.js 配置
- 所有 Server Actions 的详细实现
- 错误处理和安全考虑

## 技术栈

- **框架**: Next.js 16 App Router
- **认证**: Auth.js (NextAuth v5)
- **数据库**: SQLite + Prisma
- **UI**: Shadcn UI + Tailwind CSS
- **表单**: react-hook-form + Zod
- **架构模式**: Repository Pattern（仓储模式）

## 设计原则

1. **数据库解耦**: 业务逻辑不直接依赖 Prisma，通过仓储接口访问数据，便于更换数据库
2. **类型安全**: 使用 TypeScript 和 Zod 确保类型安全
3. **权限控制**: 所有受保护操作在服务端验证权限
4. **错误处理**: 统一的错误响应格式和错误代码
5. **可扩展性**: 支持未来添加新功能或更换技术栈

## 快速开始

1. 阅读 [数据库设计](./02-database-design.md) 了解数据模型
2. 阅读 [后端逻辑设计](./04-backend-design.md) 了解服务端实现
3. 阅读 [前端逻辑设计](./03-frontend-design.md) 了解前端实现
4. 阅读 [HTTP 接口设计](./01-http-api-design.md) 了解 API 端点

## 相关文档

- [实现计划](../.cursor/plans/登录与用户管理实现_288eaa0f.plan.md): 详细的实现步骤和文件清单
