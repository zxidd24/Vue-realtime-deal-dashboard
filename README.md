# Vue Dashboard - 西安城乡融合要素交易市场数据可视化平台

## 项目简介

基于 Vue 3 + Vite 构建的西安城乡融合要素交易市场数据可视化展示平台，提供实时数据展示、交互式地图、统计图表等功能。

## 技术栈

- **前端**: Vue 3 + Vite + Pinia + Vue Router
- **图表**: ECharts 5
- **后端**: Node.js + Express + MySQL
- **通信**: WebSocket

## 功能特性

- 实时数据展示（WebSocket）
- 交互式地图可视化
- 区县成交金额TOP5柱状图
- 多维度数据筛选
- 数据表格展示
- Excel数据导出

## 快速开始

### 环境要求
- Node.js >= 16.0.0
- MySQL 数据库

### 安装启动
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 访问地址
- **前端**: http://localhost:3001
- **后端**: http://localhost:3000
- **WebSocket**: ws://localhost:3000

## 项目结构

```
Vue_DashBoard/
├── src/
│   ├── components/          # 组件
│   ├── views/               # 页面
│   ├── stores/              # 状态管理
│   ├── utils/               # 工具函数
│   └── router/              # 路由配置
├── server/                  # 后端服务
├── public/                  # 静态资源
└── package.json
```

## 数据库配置

```javascript
// server/app.js
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Root@123456',
    database: 'my_database'
});
```

## 核心SQL查询

项目核心数据来源于以下SQL查询，展示各区县成交数据：

```sql
SELECT
    left(sys_article.village_code,6) as "区代码",
    sys_organization.name AS "街道",
    pt_pro_cq_type.name AS "项目类别", 
    sum(sys_article.amount) AS "成交金额",
    sum(...) AS "成交笔数"
FROM sys_article
    LEFT JOIN pt_pro_tenders ON sys_article.pro_id = pt_pro_tenders.pro_id
    LEFT JOIN pt_pro_cq_type ON sys_article.pro_type = pt_pro_cq_type.code
    LEFT JOIN sys_organization ON left(sys_article.village_code,9)=sys_organization.code
WHERE
    sys_article.article_title LIKE '%成交公示' AND
    sys_article.village_code like '6101%'
GROUP BY left(sys_article.village_code,6), left(sys_article.village_code,9), 
         sys_organization.name, pt_pro_cq_type.name
ORDER BY left(sys_article.village_code,6)
```

## 开发说明

- 前端使用Vue 3 Composition API
- 状态管理使用Pinia
- 地图组件基于ECharts
- 实时数据通过WebSocket推送
- 每小时自动刷新数据

## 维护人

- **项目维护者**: 张哲溪
- **GitHub**: [zxidd24](https://github.com/zxidd24)
- **邮箱**: [z1124340034@sina.com](mailto:z1124340034@sina.com)
