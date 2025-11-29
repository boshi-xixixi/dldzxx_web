#!/bin/bash

# 企业网络监控数据大屏系统 - 生产环境构建脚本
# 作者: 开发团队
# 版本: 1.0.0
# 描述: 构建生产环境代码

echo "🏗️  开始构建企业网络监控数据大屏系统..."

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

# 安装依赖
echo "📦 安装项目依赖..."
pnpm install --frozen-lockfile

# 类型检查
echo "🔍 执行 TypeScript 类型检查..."
pnpm run check
if [ $? -ne 0 ]; then
    echo "❌ TypeScript 类型检查失败"
    exit 1
fi

# 代码检查
echo "🔍 执行 ESLint 代码检查..."
pnpm run lint
if [ $? -ne 0 ]; then
    echo "❌ ESLint 检查失败"
    exit 1
fi

# 清理旧的构建文件
echo "🧹 清理旧的构建文件..."
rm -rf dist

# 设置生产环境变量
export NODE_ENV=production
export VITE_API_BASE_URL=/api

echo "✅ 环境变量设置完成"
echo "   - NODE_ENV: $NODE_ENV"
echo "   - VITE_API_BASE_URL: $VITE_API_BASE_URL"

# 构建项目
echo "🔨 构建项目..."
pnpm run build

if [ $? -eq 0 ]; then
    echo "✅ 构建成功！"
    echo "📁 构建文件位于: ./dist"
    
    # 显示构建文件大小
    if [ -d "dist" ]; then
        echo "📊 构建文件大小:"
        du -sh dist/*
    fi
else
    echo "❌ 构建失败"
    exit 1
fi