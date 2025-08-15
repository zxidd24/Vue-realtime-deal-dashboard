#!/bin/bash

# Vue Dashboard 启动脚本（完整版 - 前端 + 后端）
echo "🚀 启动 Vue Dashboard 完整项目..."

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js，请先安装 Node.js (版本 >= 16.0.0)"
    exit 1
fi

# 检查 Node.js 版本
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ 错误: Node.js 版本过低，需要 16.0.0 或更高版本"
    echo "当前版本: $(node -v)"
    exit 1
fi

echo "✅ Node.js 版本检查通过: $(node -v)"

# 检查 npm 是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未找到 npm，请先安装 npm"
    exit 1
fi

echo "✅ npm 版本: $(npm -v)"

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 正在安装项目依赖..."
    npm install
    
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败，请检查网络连接或重试"
        exit 1
    fi
    
    echo "✅ 依赖安装完成"
else
    echo "✅ 依赖已安装"
fi

# 检查数据库连接
echo "🔍 检查数据库配置..."
echo "   数据库主机: localhost"
echo "   数据库用户: root"
echo "   数据库名称: my_database"
echo "   请确保 MySQL 服务正在运行"
echo ""

# 启动完整项目（前端 + 后端）
echo "🌐 启动完整项目..."
echo "   前端页面: http://localhost:3001"
echo "   后端API: http://localhost:3000"
echo "   WebSocket: ws://localhost:3000"
echo "   按 Ctrl+C 停止所有服务"
echo ""

npm run dev
