#!/usr/bin/env bash
set -euo pipefail

# =========================================
# 启动脚本：一键启动前端与后端开发环境
# 说明：为 Mac 环境优化，自动安装依赖、设置环境变量、启动并输出地址
# =========================================

## 函数：带时间戳的日志输出
log() {
  local level="$1"; shift
  printf "[%s] [%s] %s\n" "$(date '+%Y-%m-%d %H:%M:%S')" "$level" "$*"
}

## 函数：检查命令是否存在
require_cmd() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    log ERROR "未找到命令: $cmd，请先安装后重试"
    exit 1
  fi
}

## 函数：选择包管理器（优先 pnpm，其次 npm）
choose_pm() {
  if command -v pnpm >/dev/null 2>&1; then
    echo pnpm
  else
    echo npm
  fi
}

## 函数：安装依赖（幂等）
install_deps() {
  local pm
  pm="$(choose_pm)"
  log INFO "使用包管理器: $pm 安装依赖"
  if [ "$pm" = "pnpm" ]; then
    pnpm install --prefer-offline || pnpm install
  else
    npm install --no-audit --no-fund
  fi
}

## 函数：导出环境变量（可通过参数或已存在的 .env 覆盖）
export_env() {
  export NODE_ENV="development"
  export PORT="${PORT:-13001}"
  export VITE_API_BASE_URL="${VITE_API_BASE_URL:-http://localhost:$PORT}"
  export FRONT_PORT="${FRONT_PORT:-15173}"
  log INFO "环境变量设置完成"
  log INFO "- NODE_ENV: $NODE_ENV"
  log INFO "- PORT: $PORT"
  log INFO "- FRONT_PORT: $FRONT_PORT"
  log INFO "- VITE_API_BASE_URL: $VITE_API_BASE_URL"
}

## 函数：启动开发环境（复用现有 dev.sh）
start_dev() {
  log INFO "启动开发服务器..."
  bash "$(dirname "$0")/dev.sh"
}

## 函数：入口
main() {
  require_cmd node
  require_cmd bash
  install_deps
  export_env
  start_dev
}

main "$@"

