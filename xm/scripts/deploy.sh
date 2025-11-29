#!/bin/bash

# 企业网络监控数据大屏系统 - 部署脚本
# 作者: 开发团队
# 版本: 1.0.0
# 描述: 部署到 Vercel 平台

echo "🚀 开始部署企业网络监控数据大屏系统..."

# 检查是否安装了 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "⚠️  Vercel CLI 未安装，正在安装..."
    npm install -g vercel
fi

# 检查是否已登录 Vercel
echo "🔐 检查 Vercel 登录状态..."
if ! vercel whoami &> /dev/null; then
    echo "请先登录 Vercel:"
    vercel login
fi

# 构建项目
echo "🏗️  构建项目..."
./scripts/build.sh

if [ $? -ne 0 ]; then
    echo "❌ 构建失败，停止部署"
    exit 1
fi

# 部署到 Vercel
echo "🌐 部署到 Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo "✅ 部署成功！"
    echo "🎉 您的应用已成功部署到 Vercel"
else
    echo "❌ 部署失败"
    exit 1
fi