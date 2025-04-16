# SDL Catalyst 工作流节点组件结构

本目录包含 SDL Catalyst 工作流中使用的节点组件的实现。这些组件用于在工作流程图中表示不同的单元操作 (Unit Operations, UO)。

## 目录结构

```
SDLCatalyst/
├── BaseUO.tsx             # 基础参数编辑组件，用于非流程图环境中使用
├── BaseUONode.tsx         # 基础节点组件，所有具体UO节点的基础
├── types.ts               # 共享类型定义
├── index.ts               # 导出和注册所有组件
├── README.md              # 本文档
├── CP/                    # Chronopotentiometry (CP) 相关组件
├── CVA/                   # Cyclic Voltammetry Analysis (CVA) 相关组件
├── LSV/                   # Linear Sweep Voltammetry (LSV) 相关组件
├── OCV/                   # Open Circuit Voltage (OCV) 相关组件
├── OT2/                   # OT-2 Liquid Handler 相关组件
└── PEIS/                  # Potentiostatic Electrochemical Impedance Spectroscopy (PEIS) 相关组件
```

## 核心组件

### BaseUONode

`BaseUONode` 是所有UO节点的基础组件，它：

- 在 React Flow 中表示一个可交互的节点
- 支持参数编辑和验证
- 处理连接到其他节点的句柄
- 提供常见的操作（运行、模拟、查看结果、导出）
- 集成工作流状态管理

### BaseUO

`BaseUO` 是一个简化版的参数编辑组件，不包含 React Flow 特定功能，可用于：

- 独立测试参数编辑逻辑
- 在配置面板或对话框中使用
- 开发不需要流程图功能的界面

## 类型定义

主要类型定义在 `types.ts` 中：

- `Parameter`: 参数定义，包含类型、标签、默认值等
- `BaseUOProps`: BaseUO 组件的属性
- `BaseUONodeData`: BaseUONode 组件的 data 属性
- `UOConfig`: UO 配置，包含类型和参数定义

## 支持的参数类型

- `string`: 文本输入
- `number`: 数字输入，支持范围验证
- `boolean`: 布尔值，通过下拉或单选按钮选择
- `select`: 从预定义选项中选择
- `custom`: 自定义渲染的参数组件

## 创建新的UO节点

创建新的 UO 节点的步骤：

1. 在对应的子目录下创建新的组件文件（例如 `NewUO/NewUONode.tsx`）
2. 导入并使用 `BaseUONode` 作为基础组件
3. 定义该 UO 特有的参数
4. 在 `index.ts` 中注册新节点

示例：

```tsx
// NewUO/NewUONode.tsx
import React from 'react';
import { NodeProps } from 'reactflow';
import { BaseUONode } from '../BaseUONode';
import { Parameter } from '../types';

export const NewUONode: React.FC<NodeProps> = (props) => {
  // 定义该 UO 特有的参数
  const parameters: Record<string, Parameter> = {
    parameter1: {
      type: 'number',
      label: '参数1',
      defaultValue: 0,
      min: 0,
      max: 100,
      unit: 'mm',
      description: '描述参数1的用途'
    },
    // 更多参数...
  };

  // 使用 BaseUONode 并传递参数
  return (
    <BaseUONode
      {...props}
      data={{
        ...props.data,
        label: 'New UO',
        parameters,
      }}
    />
  );
};
```

然后在 `index.ts` 中注册：

```ts
// 在 SDL_CATALYST_NODE_TYPES 中添加
{
  type: 'sdl_catalyst_new_uo',
  label: 'New UO',
  description: 'Description of the new UO',
  category: 'SDL Catalyst',
},

// 在 SDL_CATALYST_NODES 中添加
sdl_catalyst_new_uo: NewUONode,
``` 
