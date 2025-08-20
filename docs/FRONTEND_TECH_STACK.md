# 前端技术栈说明

## 🎯 核心技术栈

您的工作流管理系统前端使用的是现代化的 **React + TypeScript** 技术栈，而不是PySide6或PyQt5。

### 主要技术组件

- **前端框架**: React 18.3.1 + TypeScript 5.7.2
- **构建工具**: Vite 5.4.19（现代化、快速的构建工具）
- **UI组件库**: Material-UI (MUI) 7.0.2
- **流程图**: ReactFlow 11.11.4（专业的流程图库）
- **图表**: Chart.js 4.4.9 + React-ChartJS-2 5.3.0
- **HTTP客户端**: Axios 1.8.4
- **状态管理**: React Hooks + Context API
- **表单处理**: Formik 2.4.5 + Yup 1.3.2
- **文件处理**: React-Dropzone 14.3.5, PapaParse 5.5.2, XLSX 0.18.5

### 架构特点

#### 1. Web应用架构
```
浏览器 → React前端 → Express后端 → 数据库/微服务
```

#### 2. 组件化设计
- 使用React组件化开发
- Material-UI提供统一的设计语言
- ReactFlow实现可视化工作流编辑器

#### 3. 现代化工具链
- Vite提供快速的开发体验
- TypeScript提供类型安全
- ESLint + Prettier确保代码质量

## 🔧 与桌面应用的区别

### Web应用 vs 桌面应用

| 特性 | React Web应用 | PySide6/PyQt5桌面应用 |
|------|---------------|----------------------|
| **部署方式** | 浏览器访问 | 本地安装 |
| **跨平台** | 天然跨平台 | 需要编译不同版本 |
| **更新机制** | 即时更新 | 需要重新安装 |
| **UI框架** | Material-UI | Qt组件 |
| **开发语言** | TypeScript/JavaScript | Python |
| **网络访问** | 原生支持 | 需要额外配置 |

### 为什么选择Web架构

1. **易于部署和维护**: 无需在每台机器上安装软件
2. **跨平台兼容**: 支持Windows、macOS、Linux
3. **协作友好**: 多用户可同时访问和编辑工作流
4. **集成便利**: 易于与云服务和API集成
5. **现代化UI**: Material-UI提供专业的用户界面

## 📦 项目结构

```
src/
├── components/           # React组件
│   ├── OperationNodes/  # 工作流节点组件
│   ├── UOBuilder/       # 单元操作构建器
│   └── ...
├── services/            # API服务和业务逻辑
├── context/             # React Context状态管理
├── types/               # TypeScript类型定义
├── data/                # 静态数据和配置
└── styles/              # 样式文件

backend/
├── api/                 # API路由
├── services/            # 后端服务
├── executors/           # 执行器
└── ...
```

## 🛠️ 开发环境设置

### 前端开发
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 后端开发
```bash
# 启动后端服务
python backend/main.py

# 或使用FastAPI
uvicorn backend.api.workflow_api:app --reload
```

## 🔌 组件开发指南

### 创建新的操作节点

1. **React组件** (推荐)
   ```typescript
   // src/components/OperationNodes/MyNode.tsx
   export const MyNode: React.FC<NodeProps> = ({ data, selected }) => {
     return (
       <Box sx={{ /* 样式 */ }}>
         <Handle type="target" position={Position.Top} />
         {/* 节点内容 */}
         <Handle type="source" position={Position.Bottom} />
       </Box>
     );
   };
   ```

2. **注册节点类型**
   ```typescript
   // src/App.tsx
   const ALL_NODE_TYPES: NodeTypes = {
     // ...其他节点
     myNode: memo(MyNode)
   };
   ```

3. **添加到操作列表**
   ```typescript
   // src/data/operationNodes.ts
   export const operationNodes: OperationNode[] = [
     // ...
     {
       type: 'myNode',
       label: 'My Node',
       category: 'Custom'
     }
   ];
   ```

### Material-UI组件使用

```typescript
import {
  Box, Typography, Button, TextField,
  Dialog, Chip, LinearProgress
} from '@mui/material';
import { PlayArrow, Settings } from '@mui/icons-material';

// 使用sx prop进行样式设置
<Box sx={{ 
  p: 2, 
  border: '1px solid #ddd',
  borderRadius: 2
}}>
  <Typography variant="h6">标题</Typography>
  <Button startIcon={<PlayArrow />}>运行</Button>
</Box>
```

## 📱 响应式设计

系统支持不同屏幕尺寸：
- 桌面端：完整功能界面
- 平板端：自适应布局
- 移动端：简化操作界面

## 🌐 浏览器兼容性

支持现代浏览器：
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 总结

您的工作流管理系统采用现代化的Web技术栈，通过React + Material-UI构建了专业的用户界面，这比传统的桌面应用具有更好的可访问性、可维护性和协作能力。所有的EIS分析组件都应该基于React和TypeScript开发，而不是PySide6或PyQt5。