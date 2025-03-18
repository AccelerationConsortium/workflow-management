# Node Creation Guide

This guide explains how to create new nodes in the workflow management system.

## Node Structure Overview

Each node in the system consists of:
- Basic/Advanced property panels
- Primitives tabs that expand when the node is placed on the canvas
- Adjustable parameters
- Input/Output interfaces
- Drag and drop functionality

## File Structure

For each new node, create a directory with the following structure:
```
NodeName/
├── index.tsx          # Node component definition
├── types.ts           # Type definitions (parameters, I/O, etc.)
├── constants.ts       # Constants (default values, ranges, etc.)
└── styles.css         # Node styles
```

## Step-by-Step Creation Process

### 1. Create Node Directory
Create a new directory under the appropriate category:
```bash
mkdir -p src/components/OperationNodes/CategoryName/NodeName
```

### 2. Create Required Files
```bash
cd src/components/OperationNodes/CategoryName/NodeName
touch index.tsx types.ts constants.ts styles.css
```

### 3. Define Node Data
In `src/data/operationNodes.ts`, add the node definition:
```typescript
{
  type: 'NodeName',              // Unique identifier
  label: 'Node Label',           // Display name
  description: 'Description',    // Node description
  category: 'CategoryName',      // Node category
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
      unit: 'unit',              // Optional
      range: [min, max],         // Optional
      default: defaultValue      // Optional
    }
  ],
  inputs: [
    {
      id: 'input-id',
      label: 'Input Label',
      type: 'input-type',
      required: true/false,
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
      pythonCode: `def function_name(param: type):
    # Implementation
    return result`,
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

### 4. Create Node Component
In `NodeName/index.tsx`:
```typescript
import React from 'react';
import { BaseNode } from '../../../BaseNode';
import { NodeProps } from '../../../types';
import './styles.css';

export const NodeName: React.FC<NodeProps> = ({ data, id }) => {
  return <BaseNode data={data} />;
};
```

### 5. Define Types
In `NodeName/types.ts`:
```typescript
export interface NodeNameProps {
  // Node specific props
}

export interface NodeNameData {
  // Node specific data
}

export interface NodeNameParameters {
  // Node parameters
}
```

### 6. Define Constants
In `NodeName/constants.ts`:
```typescript
export const DEFAULT_VALUES = {
  // Default values for parameters
};

export const RANGES = {
  // Parameter ranges
};

export const UNITS = {
  // Parameter units
};
```

### 7. Add Styles
In `NodeName/styles.css`:
```css
/* Node specific styles */
.node-name {
  /* Custom styles */
}
```

### 8. Register Node
In `src/components/OperationNodes/CategoryName/index.tsx`:
```typescript
export * from './NodeName';
```

In `src/components/OperationNodes/index.tsx`:
```typescript
export const NodeName = createNodeComponent('CategoryName');
```

## Node Interaction Flow
1. Node is dragged from sidebar to canvas
2. Node expands to show primitives tabs
3. Left-click shows property panel
4. Input/Output ports can be connected to other nodes

## Data Flow
1. Node definition in operationNodes.ts
2. Component creation using createNodeComponent
3. UI rendering
4. User interaction
5. State updates

## Best Practices
1. Use meaningful and consistent naming
2. Include comprehensive documentation
3. Validate all parameters
4. Handle error cases
5. Follow existing node patterns
6. Test node functionality thoroughly

## Common Issues and Solutions
1. Node not appearing in sidebar
   - Check node registration in index.tsx
   - Verify category name is correct

2. Properties panel not showing
   - Check data structure in operationNodes.ts
   - Verify parameter definitions

3. Primitives not working
   - Check primitive definitions
   - Verify Python code syntax

## Testing
1. Create test file for node
2. Test drag and drop functionality
3. Test parameter updates
4. Test primitive operations
5. Test input/output connections
6. Test error handling

## Documentation Requirements
Each node should include:
- Usage examples
- Parameter descriptions
- Hardware requirements
- Error handling procedures 
