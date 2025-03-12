# Unit Operations Registration System

一个用于管理和注册化工单元操作设备的现代化网页应用程序。该系统允许用户创建、查看、编辑和删除单元操作记录，以及管理与设备相关的技术文档。

## 功能特点

- 仪表盘总览，展示关键统计信息
- 单元操作设备的完整CRUD操作
- 详细的设备信息管理，包括技术规格、位置和维护信息
- 响应式设计，支持移动设备和桌面设备
- 现代化的Material UI界面

## 技术栈

- **前端**:
  - React 18
  - TypeScript
  - React Router v6
  - Material UI
  - React Query
  - Vite

- **后端**:
  - Node.js
  - Express
  - RESTful API设计

## 开发设置

### 前提条件

- Node.js 18.x或更高版本
- npm或yarn

### 安装依赖

```bash
npm install
# 或
yarn install
```

### 开发模式

```bash
# 启动前端开发服务器
npm run dev
# 或
yarn dev

# 启动后端开发服务器
npm run dev:server
# 或
yarn dev:server
```

### 构建生产版本

```bash
# 构建前端
npm run build
# 或
yarn build

# 构建后端
npm run build:server
# 或
yarn build:server
```

### 运行生产版本

```bash
npm run start
# 或
yarn start
```

## 项目结构

```
uo-registration/
├── public/                # 静态资源
├── src/
│   ├── components/        # React组件
│   │   ├── common/        # 通用组件
│   │   ├── forms/         # 表单组件
│   │   ├── layout/        # 布局组件
│   │   └── ui/            # UI组件
│   ├── hooks/             # 自定义React hooks
│   ├── pages/             # 页面组件
│   ├── server/            # 后端服务器代码
│   │   └── routes/        # API路由
│   ├── services/          # API服务
│   ├── types/             # TypeScript类型定义
│   ├── utils/             # 工具函数
│   ├── App.tsx            # 应用程序入口
│   ├── main.tsx           # React渲染入口
│   └── index.css          # 全局样式
├── index.html             # HTML模板
├── tsconfig.json          # TypeScript配置
├── tsconfig.node.json     # Node.js TypeScript配置
├── vite.config.ts         # Vite配置
└── package.json           # 项目依赖与脚本
```

## API文档

### 单元操作API端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/unit-operations` | GET | 获取所有单元操作 |
| `/api/unit-operations/:id` | GET | 获取特定单元操作 |
| `/api/unit-operations` | POST | 创建新单元操作 |
| `/api/unit-operations/:id` | PUT | 更新单元操作 |
| `/api/unit-operations/:id` | DELETE | 删除单元操作 |

## 未来计划

- 用户认证与授权
- 文件上传功能
- 数据库集成
- 单元测试
- 国际化支持 
