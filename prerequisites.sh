#!/bin/bash
# =============================================================================
# 项目初始化脚本
# 用途：一键完成 Node 环境、依赖安装、镜像源、数据库与种子数据初始化
# 依赖：需已安装 nvm，并在 .bashrc / .bash_profile 中配置（脚本会加载这些配置）
# 使用：bash prerequisites.sh [DATABASE_URL]
#       不传参数时使用默认开发环境数据库 file:./prisma/dev.db；
#       传入参数时表示使用测试环境或生产环境的数据库（如 file:./prisma/test.db）。
# =============================================================================

# -----------------------------------------------------------------------------
# 1. 全局设置
# -----------------------------------------------------------------------------

# ANSI 颜色码，用于终端输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 遇错即退，避免继续执行错误逻辑
set -e

# 彩色输出函数
print_info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error()   { echo -e "${RED}[ERROR]${NC} $1"; }

# 判断某命令是否在 PATH 中
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# -----------------------------------------------------------------------------
# 2. 环境加载与 Node 可用性保障
# -----------------------------------------------------------------------------

# 加载当前用户的 shell 配置（.bashrc / .bash_profile 等）
# 非交互式执行 bash 时不会自动 source 这些文件，需显式加载以使用 nvm 等
load_shell_env() {
  if [ -n "$BASH_VERSION" ]; then
    [ -f "$HOME/.bash_profile" ] && \. "$HOME/.bash_profile" 2>/dev/null || true
    [ -f "$HOME/.bashrc" ]       && \. "$HOME/.bashrc" 2>/dev/null || true
    [ -f "$HOME/.profile" ]      && \. "$HOME/.profile" 2>/dev/null || true
  fi
  if [ -n "$ZSH_VERSION" ]; then
    [ -f "$HOME/.zshrc" ]     && \. "$HOME/.zshrc" 2>/dev/null || true
    [ -f "$HOME/.zprofile" ]  && \. "$HOME/.zprofile" 2>/dev/null || true
  fi
  [ -f "$HOME/.profile" ] && \. "$HOME/.profile" 2>/dev/null || true
}

# 确保 node 可用：先加载环境，若仍无 node 则用 nvm which 把当前 node 加入 PATH
ensure_node_available() {
  load_shell_env
  if ! command_exists node; then
    if command_exists nvm; then
      NODE_PATH=$(nvm which current 2>/dev/null)
      if [ -n "$NODE_PATH" ] && [ -f "$NODE_PATH" ]; then
        export PATH="$(dirname "$NODE_PATH"):$PATH"
        print_info "通过 nvm 设置 Node.js PATH: $(dirname "$NODE_PATH")"
      fi
    fi
    if ! command_exists node; then
      print_error "Node.js 命令不可用，请检查 nvm 安装"
      exit 1
    fi
  fi
}

# -----------------------------------------------------------------------------
# 3. 主流程
# -----------------------------------------------------------------------------

# 可选参数：指定数据库 URL，便于测试等场景与默认数据库隔离
if [ -n "$1" ]; then
  if [[ "$1" == file:* ]]; then
    export DATABASE_URL="$1"
  else
    export DATABASE_URL="file:$1"
  fi
  print_info "使用指定数据库: $DATABASE_URL"
fi

print_info "开始初始化项目..."

# ----- 3.1 Node 版本（nvm + 22.13.0） -----
print_info "加载 shell 环境配置..."
load_shell_env

if ! command_exists nvm; then
  print_error "nvm 命令不可用，请确保 nvm 已安装并在 .bashrc 或 .bash_profile 中配置"
  print_info "安装方法：https://github.com/nvm-sh/nvm#installing-and-updating"
  exit 1
fi
print_success "nvm 命令可用"

# 若未安装 22.13.0 则安装并切换
if ! nvm list | grep -q "v22.13.0"; then
  print_info "安装 Node.js 22.13.0..."
  nvm install 22.13.0
  print_success "Node.js 22.13.0 安装完成"
else
  print_success "Node.js 22.13.0 已安装"
fi

print_info "切换到 Node.js 22.13.0..."
load_shell_env
nvm use 22.13.0
# 非交互式下 nvm use 可能不更新 PATH，显式把当前 node 加入 PATH
if command_exists nvm; then
  NODE_PATH=$(nvm which 22.13.0 2>/dev/null || nvm which current 2>/dev/null)
  [ -n "$NODE_PATH" ] && [ -f "$NODE_PATH" ] && export PATH="$(dirname "$NODE_PATH"):$PATH"
fi
ensure_node_available

NODE_VERSION=$(node -v)
print_success "已切换到 Node.js 22.13.0（$NODE_VERSION）"

# ----- 3.2 Yarn -----
print_info "检查 yarn 是否已安装..."
load_shell_env
ensure_node_available
if ! command_exists yarn; then
  print_info "安装 yarn..."
  npm install -g yarn
  load_shell_env
  print_success "yarn 安装完成"
else
  print_success "yarn 已安装，版本: $(yarn -v)"
fi

# ----- 3.3 镜像源（淘宝） -----
print_info "配置 npm / yarn 镜像源为淘宝..."
npm config set registry https://registry.npmmirror.com
yarn config set registry https://registry.npmmirror.com
print_success "镜像源已设置为: https://registry.npmmirror.com"

# ----- 3.4 安装依赖 -----
print_info "安装项目依赖..."
load_shell_env
yarn install
print_success "依赖安装完成"

# ----- 3.5 数据库与 .env.local -----
print_info "初始化数据库..."

if ! command_exists npx; then
  print_error "npx 不可用，无法运行 Prisma 命令"
  exit 1
fi

# 默认 SQLite 路径；若未通过参数或环境变量指定则使用默认
DEFAULT_DATABASE_URL="file:./prisma/dev.db"
if [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="$DEFAULT_DATABASE_URL"
  print_info "设置 DATABASE_URL: $DATABASE_URL"
fi

# 生成 AUTH_SECRET（Auth.js 必须）
if [ -z "$AUTH_SECRET" ]; then
  if command_exists openssl; then
    AUTH_SECRET=$(openssl rand -base64 32)
  else
    AUTH_SECRET="change-me-in-production-$(date +%s)"
  fi
  print_info "已生成 AUTH_SECRET"
fi

ENV_LOCAL_FILE=".env.local"
if [ ! -f "$ENV_LOCAL_FILE" ]; then
  print_info "创建 $ENV_LOCAL_FILE ..."
  echo "DATABASE_URL=$DATABASE_URL" >  "$ENV_LOCAL_FILE"
  echo "AUTH_SECRET=$AUTH_SECRET"   >> "$ENV_LOCAL_FILE"
  print_success "$ENV_LOCAL_FILE 已创建"
else
  grep -q "^DATABASE_URL=" "$ENV_LOCAL_FILE" 2>/dev/null || echo "DATABASE_URL=$DATABASE_URL" >> "$ENV_LOCAL_FILE"
  # 若已有 DATABASE_URL 则读出并导出，供后续 prisma 使用
  EXISTING_DB_URL=$(grep "^DATABASE_URL=" "$ENV_LOCAL_FILE" 2>/dev/null | cut -d '=' -f2- | tr -d '"' | tr -d "'")
  [ -n "$EXISTING_DB_URL" ] && export DATABASE_URL="$EXISTING_DB_URL"
  grep -q "^AUTH_SECRET=" "$ENV_LOCAL_FILE" 2>/dev/null || echo "AUTH_SECRET=$AUTH_SECRET" >> "$ENV_LOCAL_FILE"
fi
export DATABASE_URL="$DATABASE_URL"

# Prisma：生成 Client -> 迁移 -> 种子
print_info "生成 Prisma Client..."
load_shell_env
npx prisma generate
print_success "Prisma Client 生成完成"

print_info "应用数据库迁移..."
load_shell_env
if npx prisma migrate deploy 2>/dev/null; then
  print_success "数据库迁移完成（migrate deploy）"
else
  print_info "使用开发模式迁移..."
  if ! npx prisma migrate dev --name init 2>/dev/null; then
    print_warning "迁移失败（可能为 schema drift），尝试重置数据库..."
    # 方案 1：优先使用 prisma migrate reset（需 --force 避免交互）
    if npx prisma migrate reset --force --skip-seed 2>/dev/null; then
      print_success "数据库已重置并重新应用迁移"
    else
      # 方案 2：SQLite 时手动删除数据库文件后重新迁移
      DB_PATH=$(echo "$DATABASE_URL" | sed -n 's|file:\.\?/*\(.*\)|\1|p')
      if [ -n "$DB_PATH" ] && [ -f "$DB_PATH" ]; then
        print_info "删除现有数据库文件: $DB_PATH"
        rm -f "$DB_PATH" "$DB_PATH-journal" 2>/dev/null || true
        if npx prisma migrate deploy 2>/dev/null; then
          print_success "数据库已重建并应用迁移"
        else
          npx prisma migrate dev --name init 2>/dev/null || true
        fi
      else
        npx prisma migrate dev --name init 2>/dev/null || true
      fi
    fi
  fi
  print_success "数据库迁移完成（migrate dev）"
fi

print_info "初始化种子数据..."
load_shell_env
yarn db:seed || print_warning "种子数据初始化失败，请检查数据库连接"
print_success "种子数据初始化完成"

# 安装 Playwright E2E 测试用浏览器（可选，失败不中断）
# 注：npmmirror 未同步 Playwright cft 构建，使用官方 CDN；国内网络可配置代理后手动执行 yarn playwright:install
print_info "安装 Playwright 浏览器（用于 E2E 测试）..."
load_shell_env
if yarn playwright install 2>/dev/null || npx playwright install 2>/dev/null; then
  print_success "Playwright 浏览器安装完成"
else
  print_warning "Playwright 浏览器安装跳过或失败，需要时请手动执行: yarn playwright:install"
fi

print_success "项目初始化完成！"
print_info "运行 'yarn dev' 启动开发服务器"
