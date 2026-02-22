# 管理员账户设置指南

## 方法一：使用 Seed 脚本（推荐）

### 1. 运行 Seed 脚本

```bash
# 确保使用正确的 Node 版本
source ~/.nvm/nvm.sh && nvm use 22.13.0

# 运行 seed 脚本
yarn db:seed
```

### 2. 默认管理员账户信息

- **邮箱**: `admin@example.com`
- **密码**: `Admin123456`

⚠️ **重要**: 登录后请立即修改密码！

### 3. 登录后台

1. 访问登录页面: `http://localhost:3000/login`
2. 使用上述管理员账户登录
3. 登录成功后，点击导航栏的"用户管理"链接，或直接访问: `http://localhost:3000/admin/users`

---

## 方法二：使用 Prisma Studio（可视化工具）

### 1. 打开 Prisma Studio

```bash
source ~/.nvm/nvm.sh && nvm use 22.13.0
npx prisma studio
```

### 2. 创建管理员用户

1. 在 Prisma Studio 中，点击 `User` 模型
2. 点击 "Add record" 按钮
3. 填写以下信息：
   - `email`: 你的邮箱（如 `admin@example.com`）
   - `password`: 使用 bcrypt 加密后的密码（见下方说明）
   - `name`: 管理员名称（可选）
   - `role`: 选择 `ADMIN`
4. 点击 "Save 1 change"

### 3. 生成密码哈希

在 Node.js REPL 中运行：

```bash
node
> const bcrypt = require('bcryptjs');
> bcrypt.hash('你的密码', 10).then(hash => console.log(hash));
```

复制输出的哈希值，粘贴到 Prisma Studio 的 `password` 字段。

---

## 方法三：使用 SQL 直接插入（高级）

### 1. 打开数据库

```bash
sqlite3 prisma/dev.db
```

### 2. 生成密码哈希

```bash
node -e "const bcrypt=require('bcryptjs');bcrypt.hash('你的密码',10).then(h=>console.log(h))"
```

### 3. 插入管理员记录

```sql
INSERT INTO users (id, email, password, name, role, "createdAt", "updatedAt")
VALUES (
  'clxxxxxxxxxxxxxxxxxxxxx',  -- 生成一个唯一 ID（可以使用 cuid()）
  'admin@example.com',
  '生成的密码哈希',  -- 替换为步骤 2 生成的哈希
  '系统管理员',
  'ADMIN',
  datetime('now'),
  datetime('now')
);
```

---

## 方法四：通过现有用户升级（如果已有普通用户）

### 1. 使用 Prisma Studio

1. 打开 Prisma Studio: `npx prisma studio`
2. 找到要升级的用户
3. 将 `role` 字段从 `USER` 改为 `ADMIN`
4. 保存

### 2. 使用 SQL

```sql
UPDATE users SET role = 'ADMIN' WHERE email = '你的邮箱';
```

---

## 登录后台管理系统

### 步骤

1. **访问登录页面**
   - URL: `http://localhost:3000/login`

2. **使用管理员账户登录**
   - 输入邮箱和密码
   - 点击"登录"

3. **进入用户管理页面**
   - 登录成功后，导航栏会显示"用户管理"链接
   - 点击链接或直接访问: `http://localhost:3000/admin/users`

### 后台功能

- ✅ 查看所有用户列表（分页）
- ✅ 搜索用户（按邮箱或姓名）
- ✅ 按角色筛选（USER / ADMIN）
- ✅ 编辑用户信息（邮箱、姓名、角色、头像）
- ✅ 删除用户
- ✅ 创建新用户

---

## 常见问题

### Q: 登录后看不到"用户管理"链接？

A: 检查你的用户角色是否为 `ADMIN`。只有管理员才能看到该链接。

### Q: 访问 `/admin/users` 被重定向？

A: 确保：

1. 已登录
2. 用户角色为 `ADMIN`
3. Session 中的 role 字段正确

### Q: 如何验证用户是否为管理员？

A: 在个人中心页面 (`/profile`) 可以看到当前用户的角色。

---

## 安全建议

1. ✅ **立即修改默认密码**: 使用 seed 脚本创建的管理员账户密码是公开的
2. ✅ **使用强密码**: 至少 8 位，包含大小写字母和数字
3. ✅ **定期审查管理员账户**: 确保只有授权人员拥有管理员权限
4. ✅ **生产环境**: 不要使用默认的管理员账户，创建自己的管理员账户
