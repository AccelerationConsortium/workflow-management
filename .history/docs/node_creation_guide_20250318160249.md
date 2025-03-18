# Node Creation Guide

This guide explains how to create new nodes in the workflow management system. Based on our successful experience creating nodes like ValveControl, here's a comprehensive guide for creating new nodes.

## Required Files Overview

For each new node, you need to create or modify these files:

1. Component Files (New):
```
src/components/OperationNodes/CategoryName/NodeName/
├── index.tsx          # Node component implementation
├── constants.ts       # Default values and specifications
└── styles.css         # Component styles
```

2. System Files (Modify):
```
src/
├── components/OperationNodes/index.tsx  # Node registration
├── App.tsx                             # Node import and memo
└── data/operationNodes.ts              # Node definition
```

## Step-by-Step Creation Process

### 1. Create Component Files

#### 1.1 Create Directory Structure
```bash
mkdir -p src/components/OperationNodes/CategoryName/NodeName
```

#### 1.2 Create Component (index.tsx)
```typescript
import React from 'react';
import { createNodeComponent } from '../../index';
import { DEFAULT_VALUES } from './constants';
import './styles.css';

// Create the control panel component
const NodeNamePanel = ({ data }) => (
  <div className="node-name-panel">
    <div className="parameter-group">
      {/* Add your parameter controls here */}
    </div>
  </div>
);

// Create the wrapper component
const NodeNameWrapper = (props) => {
  const BaseNode = createNodeComponent('CategoryName');
  return (
    <div className="node-name-wrapper">
      <BaseNode {...props} />
      <NodeNamePanel data={props.data} />
    </div>
  );
};

export const NodeName = NodeNameWrapper;
```

#### 1.3 Create Constants (constants.ts)
```typescript
export const DEFAULT_VALUES = {
  // Define default values for all parameters
  parameterName1: defaultValue1,
  parameterName2: defaultValue2
};

export const SPECS = {
  // Define hardware specifications
  model: 'Model Name',
  manufacturer: 'Manufacturer Name',
  type: 'Device Type',
  // Add other specs
};
```

#### 1.4 Create Styles (styles.css)
```css
.node-name-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.node-name-panel {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 15px;
  margin-top: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
  min-width: 250px;
}

.parameter-group {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* Add other necessary styles */
```

### 2. Modify System Files

#### 2.1 Register Node (src/components/OperationNodes/index.tsx)
Add these lines:
```typescript
// Export the node creation
export const NodeName = createNodeComponent('CategoryName');

// Add to nodeComponents object
export const nodeComponents = {
  // ... existing components
  NodeName,
};
```

#### 2.2 Add to App.tsx
Add these modifications:
```typescript
// Add to imports
import { NodeName } from './components/OperationNodes';

// Add to MemoizedNodes object
const MemoizedNodes = {
  // ... existing nodes
  NodeName: memo(NodeName),
};
```

#### 2.3 Define Node in operationNodes.ts
Add the node definition:
```typescript
{
  type: 'NodeName',
  label: 'Node Display Name',
  description: 'Node Description',
  category: 'CategoryName',
  expanded: true,
  specs: {
    model: 'Model Name',
    manufacturer: 'Manufacturer Name',
    range: 'Operating Range',
    precision: 'Precision Value'
  },
  parameters: [
    {
      name: 'parameterName',
      label: 'Parameter Label',
      type: 'number' | 'string' | 'boolean',
      unit: 'unit',
      range: [min, max],
      default: defaultValue
    }
    // Add more parameters
  ],
  inputs: [
    {
      id: 'input-id',
      label: 'Input Label',
      type: 'input-type',
      required: true,
      description: 'Input description'
    }
  ],
  outputs: [
    {
      id: 'output-id',
      label: 'Output Label',
      type: 'output-type',
      description: 'Output description'
    }
  ],
  primitives: [
    {
      id: 'primitive-id',
      name: 'Primitive Name',
      description: 'Primitive description',
      order: 1,
      pythonCode: `def function_name(param: type = default_value):
    # Implementation
    return True`,
      parameters: [
        {
          name: 'paramName',
          type: 'paramType',
          default: defaultValue,
          description: 'Parameter description'
        }
      ]
    }
  ]
}
```

## Verification Checklist

After creating a new node, verify:

1. Component Files:
   - [ ] All required files are created in the correct directory
   - [ ] Component renders correctly
   - [ ] Styles are applied properly
   - [ ] Constants are defined correctly

2. System Integration:
   - [ ] Node is properly registered in index.tsx
   - [ ] Node is correctly imported and memo-wrapped in App.tsx
   - [ ] Node definition in operationNodes.ts is complete

3. Functionality:
   - [ ] Node appears in the correct category in the sidebar
   - [ ] Node can be dragged onto the canvas
   - [ ] Parameters panel opens correctly
   - [ ] All parameters can be adjusted
   - [ ] Input/Output ports work correctly

## Best Practices

1. Naming Conventions:
   - Use PascalCase for component names (e.g., ValveControl)
   - Use kebab-case for CSS classes (e.g., valve-control-panel)
   - Use camelCase for parameter names (e.g., flowRate)

2. Code Organization:
   - Keep component logic in index.tsx
   - Put all default values in constants.ts
   - Keep styles modular in styles.css

3. Parameter Definition:
   - Always provide default values
   - Include proper type definitions
   - Add clear descriptions
   - Specify units where applicable

4. Documentation:
   - Comment complex logic
   - Document parameter ranges
   - Explain hardware requirements
   - Include usage examples

## Common Issues and Solutions

1. Node not appearing in sidebar:
   - Check if the node is properly exported in index.tsx
   - Verify the category name matches exactly

2. Parameters not updating:
   - Verify parameter names match between component and definition
   - Check if default values are properly set

3. Styling issues:
   - Ensure CSS classes are properly named
   - Check CSS specificity
   - Verify style imports

4. Type errors:
   - Ensure all required properties are defined
   - Check parameter types match the interface
   - Verify import/export statements

完成了 ValveControl 节点的创建，包括：
组件文件结构：
index.tsx：组件定义
constants.ts：默认值和规格
styles.css：样式定义
节点功能：
阀门位置控制（开/关）
多端口选择（4个端口）
切换时间控制
液体输入输出接口
注册和导出：
在 operationNodes.ts 中定义节点配置
在 index.tsx 中创建和导出节点
在 App.tsx 中注册为记忆化组件
原语操作：
设置阀门位置
选择端口
定时切换
这个节点现在应该可以在工作流中使用了。
