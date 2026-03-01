# 首次使用指南：安装与初始化

本文档面向**第一次使用本项目**的开发者，按顺序说明如何从零完成环境准备、依赖安装、数据库初始化，并成功启动开发服务器。

---

## 一、前置要求

在开始前，请确认本机已具备：

| 项目 | 要求 | 说明 |
|------|------|------|
| Node.js | **22.x**（推荐 22.13.0） | 建议通过 nvm 管理，便于切换版本 |
| 包管理器 | npm / yarn / pnpm / bun 其一 | 文档中以 `yarn` 为例 |
| Git | 任意版本 | 用于克隆或更新代码 |

若使用**自动化脚本**初始化，还需：

- 已安装 **nvm**，并在 `~/.bashrc`、`~/.bash_profile` 或 `~/.zshrc` 中完成配置  
- 安装方法：<https://github.com/nvm-sh/nvm#installing-and-updating>  
- 安装后需**重新打开终端**或执行 `source ~/.bashrc`（或对应配置文件）使 `nvm` 生效。

---

## 二、两种初始化方式

可根据情况二选一：

- **方式 A：一键脚本**（推荐，适合能跑 bash 且已装 nvm 的环境）
- **方式 B：手动步骤**（适合无法运行脚本或需逐步排查时）

---

## 三、方式 A：一键脚本初始化

在项目根目录执行：

```bash
bash prerequisites.sh
```

脚本会自动完成：

1. 加载 shell 环境，检查并安装 **Node.js 22.13.0**（通过 nvm）
2. 检查并安装 **Yarn**
3. 将 npm / yarn 镜像设为**淘宝源**（国内加速）
4. 执行 **yarn install** 安装依赖
5. 创建 **.env.local**（含 `DATABASE_URL`、自动生成的 `AUTH_SECRET`）
6. **Prisma**：生成 Client → 应用迁移 → 执行种子数据
7. 可选：安装 **Playwright** 浏览器（用于 E2E 测试）

执行成功后，终端会提示「项目初始化完成」，可直接执行：

```bash
yarn dev
```

然后访问 [http://localhost:3000](http://localhost:3000)。

若需使用**独立数据库**（如测试库），可传入数据库路径：

```bash
bash prerequisites.sh "file:./prisma/test.db"
```

脚本依赖说明与故障排查，可参阅 [docs/manual-prerequisites.md](./manual-prerequisites.md)。

---

## 四、方式 B：手动安装与初始化

### 4.1 获取代码

若尚未克隆项目：

```bash
git clone <仓库地址>
```

### 4.2 Node.js 版本

推荐使用 **Node.js 22.13.0**（nvm）：

```bash
nvm install 22.13.0
nvm use 22.13.0
node -v   # 应显示 v22.13.0
```

若无 nvm，请确保本机 Node 为 20+，且与团队约定版本一致。

### 4.3 安装依赖

在项目根目录执行：

```bash
yarn install
# 或
npm install
```

国内建议配置淘宝镜像以加速：

```bash
npm config set registry https://registry.npmmirror.com
yarn config set registry https://registry.npmmirror.com
```

### 4.4 环境变量与数据库

#### 4.4.1 创建 `.env.local`

在项目根目录新建 **`.env.local`**（不要提交到 Git），内容示例：

```env
# 数据库（SQLite，路径相对于项目根）
DATABASE_URL="file:./prisma/dev.db"

# Auth.js 必须，建议 32 位以上随机字符串
AUTH_SECRET=请替换为随机字符串

# 可选：种子脚本创建的管理员账号（不写则使用下方默认值）
# ADMIN_EMAIL=admin@example.com
# ADMIN_PASSWORD=Admin123456
```

生成 `AUTH_SECRET` 示例：

```bash
openssl rand -base64 32
```

将输出填入 `AUTH_SECRET=` 即可。

若需使用其他数据库文件（如测试隔离），可修改 `DATABASE_URL`，例如：

```env
DATABASE_URL="file:./prisma/test.db"
```

#### 4.4.2 Prisma：生成 Client、迁移、种子

在项目根目录**依次**执行：

```bash
# 1. 生成 Prisma Client
npx prisma generate

# 2. 应用数据库迁移（首次或开发环境推荐）
npx prisma migrate dev --name init

# 若上面失败，可尝试重置后再迁移
# npx prisma migrate reset --force --skip-seed
# npx prisma migrate dev --name init

# 3. 初始化种子数据（会创建默认管理员账号）
yarn db:seed
```

生产环境部署时使用：

```bash
npx prisma migrate deploy
yarn db:seed   # 按需执行
```

### 4.5 可选：Playwright（E2E 测试）

若要运行 E2E 测试（`yarn test:e2e`），需安装浏览器：

```bash
# 国内可先设置镜像再安装
export PLAYWRIGHT_DOWNLOAD_HOST="https://npmmirror.com/mirrors/playwright"
npx playwright install
```

未安装时，`yarn test:e2e` 会提示安装，按提示操作即可。

---

## 五、启动开发服务器

在项目根目录执行：

```bash
yarn dev
```

浏览器访问：**[http://localhost:3000](http://localhost:3000)**。

---

## 六、首次登录与管理员账号

- 若已执行 **yarn db:seed**，会创建默认管理员账号：
  - **邮箱**：`admin@example.com`（或你在 `.env.local` 中配置的 `ADMIN_EMAIL`）
  - **密码**：`Admin123456`（或你配置的 `ADMIN_PASSWORD`）
- 登录地址：**[http://localhost:3000/login](http://localhost:3000/login)**
- 登录后可在导航进入「用户管理」「Demo 管理」等后台功能。

⚠️ **安全**：默认密码仅用于本地开发，**登录后请尽快在个人中心修改密码**。  
更多管理员账号创建方式（Prisma Studio、SQL 等），见 [docs/ADMIN_SETUP.md](./ADMIN_SETUP.md)。

---

## 七、验证安装是否成功

可按下面检查：

1. **依赖**：`node_modules` 存在且无报错。
2. **数据库**：`prisma/dev.db`（或你配置的路径）已生成；可执行 `npx prisma studio` 查看表与数据。
3. **启动**：`yarn dev` 无报错，访问 http://localhost:3000 能看到首页。
4. **登录**：使用上述管理员账号能成功登录并进入后台。
