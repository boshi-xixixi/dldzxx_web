#!/bin/bash

# 企业网络监控数据大屏系统 - 测试脚本
# 作者: 开发团队
# 版本: 1.0.0
# 描述: 运行项目测试和代码质量检查

echo "🧪 开始运行企业网络监控数据大屏系统测试..."

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: Node.js 未安装，请先安装 Node.js (版本 >= 18)"
    exit 1
fi

# 检查依赖是否已安装
if [ ! -d "node_modules" ]; then
    echo "📦 安装项目依赖..."
    pnpm install
fi

echo "🔍 执行代码质量检查..."

# TypeScript 类型检查
echo "📝 TypeScript 类型检查..."
pnpm run check
TYPE_CHECK_RESULT=$?

if [ $TYPE_CHECK_RESULT -eq 0 ]; then
    echo "✅ TypeScript 类型检查通过"
else
    echo "❌ TypeScript 类型检查失败"
fi

# ESLint 代码检查
echo "🔍 ESLint 代码检查..."
pnpm run lint
LINT_RESULT=$?

if [ $LINT_RESULT -eq 0 ]; then
    echo "✅ ESLint 检查通过"
else
    echo "❌ ESLint 检查发现问题"
    echo "💡 提示: 运行 'pnpm run lint:fix' 自动修复部分问题"
fi

# 构建测试
echo "🏗️  构建测试..."
pnpm run build
BUILD_RESULT=$?

if [ $BUILD_RESULT -eq 0 ]; then
    echo "✅ 构建测试通过"
else
    echo "❌ 构建测试失败"
fi

# 汇总结果
echo ""
echo "📊 测试结果汇总:"
echo "   TypeScript 类型检查: $([ $TYPE_CHECK_RESULT -eq 0 ] && echo "✅ 通过" || echo "❌ 失败")"
echo "   ESLint 代码检查:     $([ $LINT_RESULT -eq 0 ] && echo "✅ 通过" || echo "❌ 失败")"
echo "   构建测试:           $([ $BUILD_RESULT -eq 0 ] && echo "✅ 通过" || echo "❌ 失败")"

# 计算总体结果
TOTAL_RESULT=$((TYPE_CHECK_RESULT + LINT_RESULT + BUILD_RESULT))

if [ $TOTAL_RESULT -eq 0 ]; then
    echo ""
    echo "🎉 所有测试通过！项目状态良好"
    exit 0
else
    echo ""
    echo "⚠️  发现问题，请修复后重新测试"
    exit 1
fi