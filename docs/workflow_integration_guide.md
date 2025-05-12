# Workflow Integration Guide

This document provides a standardized process for adding new workflow categories and unit operations to the system.

## Table of Contents

1. [Overview](#overview)
2. [Directory Structure](#directory-structure)
3. [Frontend Implementation](#frontend-implementation)
4. [Backend Implementation](#backend-implementation)
5. [System Registration](#system-registration)
6. [Testing](#testing)
7. [Deployment](#deployment)

## Overview

Adding a new workflow category involves creating both frontend components and backend services. The process follows a standardized pattern to ensure consistency and maintainability.

## Directory Structure

### Frontend Structure

```
src/
└── components/
    └── OperationNodes/
        └── [WorkflowName]/           # New workflow category folder
            ├── README.md             # Documentation
            ├── index.ts              # Exports all components
            ├── types.ts              # Shared type definitions
            ├── BaseUONode.tsx        # Base node component (optional)
            └── [UnitOperation1]/     # First unit operation folder
                ├── index.tsx         # Main component
                ├── constants.ts      # Constants definition
                ├── types.ts          # Type definitions
                ├── styles.css        # Styles
                └── components/       # Sub-components (if needed)
```

### Backend Structure

```
src/
└── app/
    └── api/
        └── [workflow-name]/
            ├── node/
            │   └── route.ts         # Routes for node operations
            └── nodes/
                └── [nodeId]/
                    └── route.ts     # Routes for specific node

backend/
└── [workflow_name]/
    ├── __init__.py
    ├── config/
    │   └── uo_function_map.yaml    # Function mapping configuration
    ├── primitives/
    │   ├── __init__.py
    │   ├── unit_operation1.py      # Implementation of first unit operation
    │   └── unit_operation2.py      # Implementation of second unit operation
    └── utils/
        └── helpers.py              # Helper functions
```

## Frontend Implementation

### 1. Define Shared Types

Create a `types.ts` file in your workflow folder:

```typescript
import { OperationNode } from '../../../types/workflow';

// Base node type
export interface WorkflowNameNode extends OperationNode {
  category: 'Workflow Name';
  // Other shared properties
}

// Export configuration type
export interface UOExportConfig {
  uo_type: string;
  parameters: Record<string, any>;
}
```

### 2. Create Index File

Create an `index.ts` file to register and export all components:

```typescript
import UnitOperation1Node from './UnitOperation1';
import UnitOperation2Node from './UnitOperation2';
import { OperationNode } from '../../../types/workflow';

// Node type definitions (for sidebar display)
export const WORKFLOW_NAME_NODE_TYPES: OperationNode[] = [
  {
    type: 'workflow_name_uo1',
    label: 'UO1',
    description: 'First unit operation description',
    category: 'Workflow Name',
    expanded: false
  },
  {
    type: 'workflow_name_uo2',
    label: 'UO2',
    description: 'Second unit operation description',
    category: 'Workflow Name',
    expanded: false
  }
];

// Export components
export const WorkflowNameNodes = {
  workflow_name_uo1: UnitOperation1Node,
  workflow_name_uo2: UnitOperation2Node
};

// Alternative naming style export
export const WORKFLOW_NAME_NODES = WorkflowNameNodes;
```

### 3. Implement Unit Operation Components

For each unit operation, create an `index.tsx` file:

```typescript
import React from 'react';
import { NodeProps } from 'reactflow';
import { BaseUONode } from '../BaseUONode';

// Define parameters
const parameters = {
  param1: {
    type: 'number',
    label: 'Parameter 1',
    unit: 'units',
    description: 'Description of parameter 1',
    defaultValue: 0,
    required: true
  },
  // More parameters...
};

export const UnitOperation1Node: React.FC<NodeProps> = (props) => {
  return (
    <BaseUONode
      {...props}
      data={{
        ...props.data,
        label: 'UO1',
        parameters,
        onParameterChange: (params) => {
          console.log('Parameters changed:', params);
          // Handle parameter changes
        },
        onExport: () => {
          console.log('Exporting configuration');
          // Handle configuration export
        }
      }}
    />
  );
};

export default UnitOperation1Node;
```

### 4. Define Constants

Create a `constants.ts` file for each unit operation:

```typescript
export const DEFAULT_VALUES = {
  param1: 0,
  param2: 'default',
  // More default values...
};

export const RANGES = {
  param1: [0, 100],
  // More ranges...
};

export const UNITS = {
  param1: 'units',
  // More units...
};
```

### 5. Register in Main Application

Update `src/components/OperationNodes/index.ts`:

```typescript
import { WORKFLOW_NAME_NODES, WORKFLOW_NAME_NODE_TYPES } from './WorkflowName';

// Add to existing node types list
export const NODE_TYPES = [
  ...existing_node_types,
  ...WORKFLOW_NAME_NODE_TYPES
];

// Add to node component mapping
export const nodeComponents = {
  ...existing_components,
  ...WORKFLOW_NAME_NODES
};
```

## Backend Implementation

### 1. Create API Routes

Implement route handlers in `src/app/api/[workflow-name]/node/route.ts`:

```typescript
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Logic for creating a new node
    
    return NextResponse.json({ success: true, node: createdNode });
  } catch (error) {
    console.error('Error creating node:', error);
    return NextResponse.json({ error: 'Failed to create node' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const nodeId = searchParams.get('nodeId');
    
    if (!nodeId) {
      return NextResponse.json({ error: 'Node ID is required' }, { status: 400 });
    }
    
    // Logic for deleting a node
    
    return NextResponse.json({ success: true, message: `Node ${nodeId} deleted successfully` });
  } catch (error) {
    console.error('Error deleting node:', error);
    return NextResponse.json({ error: 'Failed to delete node' }, { status: 500 });
  }
}
```

### 2. Implement Backend Functionality

Create Python modules for each unit operation in the `backend/[workflow_name]/primitives/` directory.

### 3. Configure Function Mapping

Create a `uo_function_map.yaml` file in `backend/[workflow_name]/config/`:

```yaml
UnitOperation1:
  function: run_unit_operation1
  module: backend.[workflow_name].primitives.unit_operation1
  description: First unit operation
  parameters:
    param1:
      type: number
      unit: units
      description: Description of parameter 1
      min: 0
      max: 100
    # More parameters...

UnitOperation2:
  function: run_unit_operation2
  module: backend.[workflow_name].primitives.unit_operation2
  description: Second unit operation
  parameters:
    # Parameter definitions...
```

## System Registration

### 1. Update Type Definitions

Update `src/types/GenericUnitOperation.ts`:

```typescript
export enum UOCategory {
  // Existing categories...
  WORKFLOW_NAME = 'WORKFLOW_NAME'
}

export enum UOType {
  // Existing types...
  
  // Workflow Name types
  UO1 = 'UO1',
  UO2 = 'UO2'
}
```

### 2. Update Workflow Manager

Ensure the workflow manager can recognize and handle the new unit operation types.

## Testing

1. Create unit tests for each component and backend function
2. Test the integration of frontend and backend
3. Perform end-to-end testing of the complete workflow

## Deployment

1. Build and deploy the updated frontend
2. Deploy the new backend services
3. Update the database schema if needed
4. Document the new workflow and unit operations
