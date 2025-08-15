# 🚀 Vue Dashboard 快速开始指南（完整版）

## 📋 前置要求

- **Node.js**: 版本 16.0.0 或更高
- **npm**: 版本 8.0.0 或更高
- **MySQL**: 数据库服务正在运行
- **数据库**: `my_database` 数据库已创建

## ⚡ 一键启动

### macOS/Linux 用户
```bash
./start.sh
```

### Windows 用户
```cmd
start.bat
```

## 🔧 手动启动步骤

### 1. 安装依赖
```bash
npm install
```

### 2. 启动完整项目（前端 + 后端）
```bash
npm run dev
```

### 3. 访问应用
- **前端页面**: `http://localhost:3001`
- **后端API**: `http://localhost:3000`
- **WebSocket**: `ws://localhost:3000`

## 🌐 端口配置

- **前端**: 3001 (Vue Dashboard)
- **后端**: 3000 (Express + WebSocket)

## 🗄️ 数据库配置

项目使用以下数据库配置：
- **主机**: localhost
- **用户**: root
- **密码**: Root@123456
- **数据库**: my_database

如需修改，请编辑 `server/app.js` 文件中的数据库连接配置。

## 📱 功能测试

### 1. 数据连接测试
- 确保 MySQL 服务正在运行
- 检查状态栏连接状态
- 观察数据是否正常加载

### 2. SSO 功能测试
- 访问 `/test-sso` 页面
- 使用预设用户或自定义信息登录
- 验证用户信息显示

### 3. 数据可视化测试
- 测试区县筛选功能
- 验证地图交互
- 检查图表渲染

## 🚨 常见问题

### Q: 依赖安装失败
**A**: 检查网络连接，或使用国内镜像：
```bash
npm config set registry https://registry.npmmirror.com
```

### Q: 数据库连接失败
**A**: 确保 MySQL 服务正在运行：
```bash
# macOS
brew services start mysql

# Ubuntu/Debian
sudo systemctl start mysql

# Windows
net start mysql
```

### Q: 端口被占用
**A**: 修改配置文件中的端口：
- 前端端口：`vite.config.js` 中的 `port: 3001`
- 后端端口：`server/app.js` 中的 `port: 3000`

### Q: 地图数据加载失败
**A**: 确保 `public/assets/Data/陕西街道.geojson` 文件存在

## 📁 项目结构说明

```
Vue_DashBoard/
├── src/                    # 前端源码
│   ├── components/         # 组件目录
│   ├── views/              # 页面目录
│   ├── stores/             # 状态管理
│   ├── utils/              # 工具函数
│   └── router/             # 路由配置
├── server/                 # 后端源码
│   ├── routes/             # API路由
│   ├── config/             # 配置文件
│   └── app.js              # 主服务器文件
├── public/                 # 静态资源
├── start.sh                # Linux/Mac 启动脚本
├── start.bat               # Windows 启动脚本
└── README.md               # 详细文档
```

## 🎯 下一步

1. **熟悉前端组件**: 查看 `src/components/` 目录
2. **了解后端API**: 学习 `server/routes/` 目录
3. **状态管理**: 学习 `src/stores/dashboard.js`
4. **自定义样式**: 修改组件样式文件
5. **添加新功能**: 基于现有架构扩展

## 📞 技术支持

如遇问题，请检查：
1. Node.js 版本是否符合要求
2. MySQL 服务是否正常运行
3. 端口是否被占用
4. 数据库连接配置是否正确

## 🎉 恭喜！

您已成功启动 Vue Dashboard 完整项目！🎊

现在您拥有了一个完全独立的全栈应用，包含：
- ✅ 现代化前端（Vue 3 + Vite）
- ✅ 完整后端服务（Express + WebSocket）
- ✅ 数据库连接和API
- ✅ SSO统一登录系统

开始探索这个强大的数据可视化平台吧！
