# 开发指南

## 一、准备

首次使用请先完成环境与数据库初始化：[准备工作](./init.md)

---

## 二、常用命令速查

| 命令 | 说明 |
|------|------|
| `yarn dev` | 启动开发服务器 |
| `yarn build` | 生产构建 |
| `yarn start` | 启动生产服务（需先 build） |
| `yarn db:generate` | 重新生成 Prisma Client |
| `yarn db:migrate` | 开发环境迁移（会交互） |
| `yarn db:seed` | 执行种子（创建默认管理员等） |
| `yarn db:studio` | 打开 Prisma Studio 查看/编辑数据 |
| `yarn db:reset` | 重置数据库并重新迁移 |
| `yarn test:run` | 单元测试 |
| `yarn test:e2e` | E2E 测试（需先安装 Playwright 浏览器） |

---

## 三、相关文档

- [init.md](./init.md) — 首次使用：安装与初始化（前置要求、一键/手动初始化、首次登录）
- [manual-prerequisites.md](./manual-prerequisites.md) — 与 `prerequisites.sh` 等价的手动步骤，便于排查脚本问题
- [ADMIN_SETUP.md](./ADMIN_SETUP.md) — 管理员账号的多种创建方式及后台使用说明
- [README.md](../README.md) — 项目概述、技术栈与脚本说明

如在首次安装或初始化中遇到报错，可先对照 [init.md](./init.md) 中的**方式 B** 逐步执行，确定卡在哪一步，再结合上述文档或错误信息排查。
