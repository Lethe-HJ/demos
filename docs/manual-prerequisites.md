# 环境准备（手动步骤）

本文档对应自动化脚本 `prerequisites.sh` 中的操作(该文档是其对应的手动操作版本)。若无法运行脚本或需逐步排查，可按下列步骤手动执行。

---

## 前置要求

- 已安装 **nvm**，并在当前 shell 的配置文件中加载（如 `~/.bashrc`、`~/.bash_profile` 或 `~/.zshrc`）。
- 安装 nvm：<https://github.com/nvm-sh/nvm#installing-and-updating>  
  安装后请**重新打开终端**或执行 `source ~/.bashrc`（或对应配置文件）使 `nvm` 命令可用。

---

## 1. Node.js 22.13.0

- 检查是否已安装该版本：
  ```bash
  nvm list | grep "v22.13.0"
  ```
- 若未安装，安装并切换：
  ```bash
  nvm install 22.13.0
  nvm use 22.13.0
  ```
- 验证：
  ```bash
  node -v   # 应显示 v22.13.0
  ```

---

## 2. Yarn

- 检查是否已安装：
  ```bash
  yarn -v
  ```
- 若未安装，全局安装：
  ```bash
  npm install -g yarn
  ```

---

## 3. 镜像源（可选，国内建议配置）

将 npm、yarn registry 设为淘宝镜像以加速安装：

```bash
npm config set registry https://registry.npmmirror.com
yarn config set registry https://registry.npmmirror.com
```

验证：

```bash
npm config get registry
yarn config get registry
```

---

## 4. 安装项目依赖

在项目根目录执行：

```bash
yarn install
```

---

## 5. 数据库与 .env.local

### 5.1 环境变量

- **DATABASE_URL**（默认）：`file:./prisma/dev.db`  
  若需使用其他数据库文件（例如测试隔离），可自行设置，例如：
  ```bash
  export DATABASE_URL="file:./prisma/test.db"
  ```
- **AUTH_SECRET**：Auth.js 必须。可随机生成并写入 `.env.local`（见下）。

### 5.2 创建 .env.local

在项目根目录创建 `.env.local`，内容示例：

```env
DATABASE_URL=file:./prisma/dev.db
AUTH_SECRET=<随机字符串，建议至少 32 位>
```

生成随机 AUTH_SECRET 示例（任选其一）：

```bash
# 有 openssl 时
openssl rand -base64 32
```

将输出填入上述 `AUTH_SECRET=` 即可。

### 5.3 Prisma：生成 Client、迁移、种子

在项目根目录依次执行：

```bash
# 生成 Prisma Client
npx prisma generate

# 应用数据库迁移（二选一）
npx prisma migrate deploy
# 或开发环境首次/重置时：
npx prisma migrate dev --name init

# 初始化种子数据
yarn db:seed
```

若 `migrate deploy` 失败，可尝试：

```bash
npx prisma migrate reset --force --skip-seed
npx prisma migrate dev --name init
yarn db:seed
```

---

## 6. Playwright 浏览器（E2E 测试，可选）

若需运行 E2E 测试（`yarn test:e2e`），需安装 Playwright 浏览器：

```bash
# 国内建议使用镜像
export PLAYWRIGHT_DOWNLOAD_HOST="https://npmmirror.com/mirrors/playwright"
yarn playwright install
# 或
npx playwright install
```

未配置镜像时可直接执行：

```bash
yarn playwright:install
```

---

## 完成后

- 启动开发服务器：`yarn dev`
- 运行单元测试：`yarn test:run`
- 运行 E2E 测试：`yarn test:e2e`（需先完成第 6 步）

---
