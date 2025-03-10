# 待解决问题记录

## UI设计与样式问题

### 1. 节点样式导入路径错误
- **文件**: `src/components/nodes/BaseNode.tsx`
- **问题**: 导入nodeStyles的路径错误
- **当前代码**: 
  ```typescript
  import { nodeStyles } from './nodeStyles'; // 错误路径
  ```
- **修复建议**: 
  ```typescript
  import { nodeStyles } from '../../theme/nodeStyles'; // 正确路径
  ```
- **状态**: 待修复

### 2. 类型定义缺失
- **文件**: `src/components/nodes/BaseNode.tsx`
- **问题**: 组件props缺少类型定义，导致TypeScript错误
- **当前代码**: 
  ```typescript
  export const BaseNode = ({ data, category, state }) => { // 缺少类型定义
  ```
- **修复建议**: 添加适当的接口定义
  ```typescript
  interface BaseNodeProps {
    data: {
      label: string;
      description?: string;
      icon?: React.ComponentType;
      metric?: string;
      metricLabel?: string;
    };
    category?: string;
    state?: string;
  }

  export const BaseNode: React.FC<BaseNodeProps> = ({ data, category, state }) => {
  ```
- **状态**: 待修复

### 3. JSX配置问题
- **文件**: `tsconfig.json`
- **问题**: TypeScript报错"无法使用JSX，除非提供了--jsx标志"
- **修复建议**: 确保tsconfig.json包含正确的JSX配置
  ```json
  {
    "compilerOptions": {
      "jsx": "react-jsx"
    }
  }
  ```
- **状态**: 待检查

### 4. 样式组件属性问题
- **文件**: `src/components/nodes/BaseNode.tsx`
- **问题**: NodeWrapper组件没有正确定义category和state属性
- **修复建议**: 添加泛型类型定义
  ```typescript
  interface NodeWrapperProps {
    category?: string;
    state?: string;
    theme?: any;
  }

  export const NodeWrapper = styled(Box)<NodeWrapperProps>(({ theme, category, state }) => ({
  ```
- **状态**: 待修复

### 5. 节点样式不生效
- **问题**: 修改了样式文件但在浏览器中没有看到效果
- **可能原因**:
  - 样式被其他样式覆盖
  - 节点类型没有正确注册
  - 节点数据格式不匹配样式定义
- **调试建议**:
  - 在浏览器开发工具中检查实际应用的样式
  - 添加明显的测试样式（如背景色）验证样式是否生效
  - 检查控制台错误信息
- **状态**: 待调查

## 功能问题

### 1. 节点类型注册
- **文件**: `src/App.tsx`
- **问题**: 可能没有正确注册BaseNode组件
- **修复建议**: 确保在nodeTypes对象中包含BaseNode
  ```typescript
  const nodeTypes = {
    baseNode: BaseNode,
    // ...其他节点类型
  };
  ```
- **状态**: 待检查

### 2. 主题注入
- **问题**: 可能没有正确注入MUI主题
- **修复建议**: 确保ThemeProvider正确包裹应用
  ```typescript
  <ThemeProvider theme={theme}>
    <App />
  </ThemeProvider>
  ```
- **状态**: 待检查

## 依赖问题

### 1. 确保安装了必要的依赖
- **问题**: 可能缺少某些样式相关的依赖
- **修复建议**: 确保package.json中包含以下依赖
  ```json
  {
    "dependencies": {
      "@emotion/react": "^11.x.x",
      "@emotion/styled": "^11.x.x",
      "@mui/material": "^5.x.x"
    }
  }
  ```
- **状态**: 待检查 
