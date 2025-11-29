#!/bin/bash

# 企业网络监控数据大屏系统 - 项目初始化脚本
# 作者: 开发团队
# 版本: 1.0.0
# 描述: 初始化项目环境和依赖

echo "🎯 初始化企业网络监控数据大屏系统..."

# 检查操作系统
OS="$(uname -s)"
case "${OS}" in
    Linux*)     MACHINE=Linux;;
    Darwin*)    MACHINE=Mac;;
    CYGWIN*)    MACHINE=Cygwin;;
    MINGW*)     MACHINE=MinGw;;
    *)          MACHINE="UNKNOWN:${OS}"
esac

echo "🖥️  检测到操作系统: ${MACHINE}"

# 检查 Node.js 版本
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js 已安装: $NODE_VERSION"
    
    # 检查 Node.js 版本是否满足要求 (>= 18)
    NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR_VERSION" -lt 18 ]; then
        echo "⚠️  警告: Node.js 版本过低，建议升级到 18.0.0 或更高版本"
    fi
else
    echo "❌ Node.js 未安装"
    echo "请访问 https://nodejs.org/ 下载并安装 Node.js (版本 >= 18)"
    exit 1
fi

# 检查并安装 pnpm
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm --version)
    echo "✅ pnpm 已安装: $PNPM_VERSION"
else
    echo "📦 安装 pnpm..."
    npm install -g pnpm
    if [ $? -eq 0 ]; then
        echo "✅ pnpm 安装成功"
    else
        echo "❌ pnpm 安装失败"
        exit 1
    fi
fi

# 安装项目依赖
echo "📦 安装项目依赖..."
pnpm install

if [ $? -eq 0 ]; then
    echo "✅ 依赖安装成功"
else
    echo "❌ 依赖安装失败"
    exit 1
fi

# 创建环境变量文件
if [ ! -f ".env" ]; then
    echo "📝 创建环境变量文件..."
    cat > .env << EOF
# 企业网络监控数据大屏系统环境变量配置

# 开发环境配置
NODE_ENV=development
PORT=3001

# API 配置
VITE_API_BASE_URL=http://localhost:3001

# 数据库配置 (如果需要)
# DATABASE_URL=

# 其他配置
# JWT_SECRET=your-jwt-secret-here
EOF
    echo "✅ 环境变量文件创建成功"
else
    echo "✅ 环境变量文件已存在"
fi

# 设置脚本执行权限
echo "🔧 设置脚本执行权限..."
chmod +x scripts/*.sh

# 运行类型检查
echo "🔍 执行类型检查..."
pnpm run check

if [ $? -eq 0 ]; then
    echo "✅ 类型检查通过"
else
    echo "⚠️  类型检查发现问题，请检查代码"
fi

echo ""
echo "🎉 项目初始化完成！"
echo ""
echo "📋 可用命令:"
echo "   pnpm run dev        - 启动开发服务器"
echo "   pnpm run build      - 构建生产版本"
echo "   pnpm run preview    - 预览生产版本"
echo "   pnpm run lint       - 代码检查"
echo "   pnpm run lint:fix   - 自动修复代码问题"
echo ""
echo "🚀 快速开始:"
echo "   ./scripts/dev.sh    - 启动开发环境"
echo "   ./scripts/build.sh  - 构建项目"
echo "   ./scripts/deploy.sh - 部署到 Vercel"
echo ""
echo "📖 更多信息请查看 README.md"