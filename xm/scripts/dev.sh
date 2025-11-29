#!/bin/bash

# 企业网络监控数据大屏系统 - 开发环境启动脚本
# 作者: 开发团队
# 版本: 1.0.0
# 描述: 启动开发环境，包括前端和后端服务

echo "🚀 启动企业网络监控数据大屏系统开发环境..."

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: Node.js 未安装，请先安装 Node.js (版本 >= 18)"
    exit 1
fi

# 检查 pnpm 是否安装
if ! command -v pnpm &> /dev/null; then
    echo "⚠️  警告: pnpm 未安装，正在安装 pnpm..."
    npm install -g pnpm
fi

# 检查依赖是否已安装
if [ ! -d "node_modules" ]; then
    echo "📦 安装项目依赖..."
    pnpm install
fi

# 设置环境变量
export NODE_ENV=development
export PORT=13001
export VITE_API_BASE_URL=http://localhost:13001

echo "✅ 环境变量设置完成"
echo "   - NODE_ENV: $NODE_ENV"
echo "   - PORT: $PORT"
echo "   - VITE_API_BASE_URL: $VITE_API_BASE_URL"

# 启动开发服务器
echo "🌟 启动开发服务器..."
echo "   - 前端服务: http://localhost:15173"
echo "   - 后端API: http://localhost:13001"
echo ""
echo "按 Ctrl+C 停止服务器"

pnpm run dev