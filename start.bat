@echo off
chcp 65001 >nul
echo 🚀 启动 Vue Dashboard 完整项目（前端 + 后端）...

REM 检查 Node.js 是否安装
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到 Node.js，请先安装 Node.js (版本 >= 16.0.0)
    pause
    exit /b 1
)

REM 检查 Node.js 版本
for /f "tokens=1,2 delims=." %%a in ('node -v') do set NODE_VERSION=%%a
set NODE_VERSION=%NODE_VERSION:~1%
if %NODE_VERSION% lss 16 (
    echo ❌ 错误: Node.js 版本过低，需要 16.0.0 或更高版本
    echo 当前版本: 
    node -v
    pause
    exit /b 1
)

echo ✅ Node.js 版本检查通过: 
node -v

REM 检查 npm 是否安装
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到 npm，请先安装 npm
    pause
    exit /b 1
)

echo ✅ npm 版本: 
npm -v

REM 检查是否已安装依赖
if not exist "node_modules" (
    echo 📦 正在安装项目依赖...
    npm install
    
    if %errorlevel% neq 0 (
        echo ❌ 依赖安装失败，请检查网络连接或重试
        pause
        exit /b 1
    )
    
    echo ✅ 依赖安装完成
) else (
    echo ✅ 依赖已安装
)

REM 检查数据库配置
echo 🔍 检查数据库配置...
echo    数据库主机: localhost
echo    数据库用户: root
echo    数据库名称: my_database
echo    请确保 MySQL 服务正在运行
echo.

REM 启动完整项目（前端 + 后端）
echo 🌐 启动完整项目...
echo    前端页面: http://localhost:3001
echo    后端API: http://localhost:3000
echo    WebSocket: ws://localhost:3000
echo    按 Ctrl+C 停止所有服务
echo.

npm run dev

pause
