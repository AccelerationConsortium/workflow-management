# 创建新节点完整指南

## 1. 数据定义
- 在 `src/types/workflow.ts` 中确保有正确的类型定义：
  ```typescript
  export interface OperationNode {
    id?: string;
    type: string;
    label: string;
    category: string;
    description?: string;
    specs?: {
      model?: string;
      manufacturer?: string;
      range?: string;
      precision?: string;
    };
    parameters?: Array<{
      name: string;
      label: string;
      type: string;
      unit?: string;
      range?: [number, number];
      default?: number;
      description?: string;
    }>;
    inputs?: Array<{
      id: string;
      label: string;
      type: string;
      required?: boolean;
      description?: string;
    }>;
    outputs?: Array<{
      id: string;
      label: string;
      type: string;
      description?: string;
    }>;
    status?: string;
  }
  ```

## 2. 节点数据定义
- 在 `src/data/operationNodes.ts` 中添加节点定义：
  ```typescript
  export const operationNodes: OperationNode[] = [
    {
      type: 'newNodeType',
      label: 'New Node',
      description: 'Node description',
      category: 'Test',
      specs: {
        model: 'Model name',
        manufacturer: 'Manufacturer name',
        range: 'Operating range',
        precision: 'Precision value'
      },
      parameters: [...],
      inputs: [...],
      outputs: [...]
    }
  ];
  ```

## 3. 组件创建
- 在 `src/components/OperationNodes/index.tsx` 中创建和导出节点组件：
  ```typescript
  export const NewNode = createNodeComponent('Category');
  ```

## 4. 节点注册
- 在 `App.tsx` 中注册节点类型：
  ```typescript
  const MemoizedNodes = {
    newNode: memo(NewNode),
    // ... other nodes
  };
  ```

## 5. 主题配置
- 在 `src/styles/nodeTheme.ts` 中添加节点样式：
  ```typescript
  export const nodeColors = {
    'Category': {
      handle: '#555',
      border: '#customColor',
      background: '#customBg',
      text: '#textColor'
    }
  };
  ```

## 6. 接口定义
- 在 `src/services/unitOperationService.ts` 中添加相关接口：
  ```typescript
  export const unitOperationService = {
    getUnitOperation: async (id: string) => {...},
    updateUnitOperation: async (id: string, data: Partial<UnitOperation>) => {...},
    createUnitOperation: async (data: UnitOperation) => {...}
  };
  ```

## 7. 验证规则
- 在相关验证文件中添加节点特定的验证规则：
  ```typescript
  export const validationRules = {
    newNode: {
      parameters: [...],
      connections: [...]
    }
  };
  ```

## 8. 类别颜色
- 在 `src/components/Sidebar.tsx` 中添加新类别的颜色（如果是新类别）：
  ```typescript
  const categoryColors = {
    'NewCategory': '#hexColor',
  };
  ```

## 9. 测试数据
- 在测试数据中添加节点示例：
  ```typescript
  export const testNodes = [
    {
      type: 'newNodeType',
      // ... test data
    }
  ];
  ```

## 检查清单
- [ ] 类型定义完整
- [ ] 节点数据结构符合要求
- [ ] 组件正确创建和导出
- [ ] 节点类型已在 App 中注册
- [ ] 主题样式已配置
- [ ] 接口已定义
- [ ] 验证规则已添加
- [ ] 类别颜色已设置
- [ ] 测试数据已准备

## 常见问题
1. 节点拖放不生效
   - 检查 nodeTypes 注册
   - 检查类型名称匹配
   - 确认数据结构完整

2. 节点样式异常
   - 检查主题配置
   - 确认 CSS 类名正确
   - 验证颜色定义

3. 属性面板显示不正确
   - 检查数据结构完整性
   - 确认属性传递正确
   - 验证渲染逻辑

4. 连接点问题
   - 检查 Handle 组件配置
   - 确认位置设置正确
   - 验证连接规则

## 最佳实践
1. 始终使用 TypeScript 类型定义
2. 为新节点添加完整的文档注释
3. 遵循现有的命名约定
4. 使用 memo 优化性能
5. 添加适当的错误处理
6. 确保数据验证完整 

目前是测试节点，之后需要连接后端 API，需要：
启动后端服务器
确保后端服务器运行在正确的端口上
检查 CORS 配置
恢复使用 axios 调用 API