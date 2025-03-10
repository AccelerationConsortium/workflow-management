# 系统数据结构定义

## 1. 基础操作 (Primitive)
```typescript
interface Primitive {
  id: string;
  name: string;
  description?: string;
  pythonCode: string;
  parameters?: Array<{
    name: string;
    type: string;
    default?: any;
    description?: string;
  }>;
  order?: number;           // 执行顺序
  dependencies?: string[];  // 依赖的其他 primitive IDs
}

// 设备原语
interface DevicePrimitive {
  id: string;
  name: string;
  description: string;
  deviceType: string[];  // 兼容的设备类型
  manufacturer: string[];  // 兼容的制造商
  controlDetails: ControlDetail;
  constraints: PrimitiveConstraint[];
  parameters: Parameter[];
  validation?: {
    preConditions?: string[];
    postConditions?: string[];
  };
}

// 原语约束
interface PrimitiveConstraint {
  parameter: string;
  type: 'range' | 'enum' | 'boolean';
  values: number[] | string[] | boolean;
  unit?: string;
  description?: string;
}

// 控制细节
interface ControlDetail {
  software: {
    name: string;
    version: string;
    apiEndpoint?: string;
    documentation?: string;
  };
  communication: {
    protocol: 'serial' | 'tcp' | 'http' | 'modbus' | 'other';
    settings?: {
      port?: number;
      baudRate?: number;
      host?: string;
      timeout?: number;
    };
  };
  scripts: {
    path: string;
    language: 'python' | 'javascript' | 'other';
    dependencies: string[];
    version: string;
  };
  authentication?: {
    type: 'api_key' | 'oauth' | 'basic' | 'none';
    credentials?: {
      username?: string;
      apiKey?: string;
      tokenUrl?: string;
    };
  };
}
```

## 2. 参数定义 (Parameter)
```typescript
interface Parameter {
  name: string;
  label: string;
  type: 'number' | 'string' | 'boolean' | 'select' | 'file';
  unit?: string;
  default?: any;
  options?: string[];  // 用于 select 类型
  constraints?: {
    min?: number;
    max?: number;
    pattern?: string;
    required?: boolean;
    fileTypes?: string[];  // 用于 file 类型
  };
}
```

## 3. 设备约束 (Device)
```typescript
interface DeviceConstraints {
  plateFormat?: string[];          // 支持的板型
  volumeRange?: [number, number];  // 体积范围
  temperatureRange?: [number, number];
  speedRange?: [number, number];   // 搅拌速度等范围
  materials?: string[];            // 支持的材料类型
  dimensions?: {
    width?: [number, number];
    height?: [number, number];
    depth?: [number, number];
  };
}

interface Device {
  manufacturer: string;
  model: string;
  serialNumber?: string;
  firmware?: string;
  constraints?: DeviceConstraints;
  calibrationDate?: string;
  maintenanceSchedule?: {
    lastMaintenance: string;
    nextMaintenance: string;
    maintenanceInterval: number;  // 天数
  };
}
```

## 4. 操作节点 (Operation Node)
```typescript
interface OperationNode {
  type: string;
  label: string;
  category: string;
  description?: string;
  icon?: string;
  parameters: Parameter[];
  supportedDevices?: Device[];
  
  // 输入输出定义
  inputs?: Array<{
    id: string;
    label: string;
    type: string;
    required?: boolean;
  }>;
  outputs?: Array<{
    id: string;
    label: string;
    type: string;
  }>;
  
  validation?: {
    inputRules?: {
      minInputs?: number;
      maxInputs?: number;
      allowedTypes?: string[];
    };
    outputRules?: {
      minOutputs?: number;
      maxOutputs?: number;
      outputTypes?: string[];
    };
  };
  
  metadata?: {
    author?: string;
    version?: string;
    lastUpdated?: string;
    tags?: string[];
    documentation?: string;
    examples?: string[];
  };

  performance?: {
    estimatedDuration?: number;  // 预计执行时间（分钟）
    resourceIntensity?: 'low' | 'medium' | 'high';
    parallelizable?: boolean;    // 是否可并行执行
    failureRate?: number;        // 历史失败率
  };

  requirements?: {
    power?: number;              // 功率要求（瓦特）
    environment?: {
      temperature?: [number, number];
      humidity?: [number, number];
      pressure?: [number, number];
    };
    certifications?: string[];   // 需要的认证
    safetyProtocols?: string[];  // 安全协议
  };
}
```

## 5. 工作流步骤 (Workflow Step)
```typescript
interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  objective: string;
  nodeIds: string[];  // 包含的 UO 节点 IDs
  order: number;      // 执行顺序
  status: 'pending' | 'running' | 'completed' | 'failed';
  dependencies: string[];  // 依赖的其他 Step IDs
  metadata?: {
    createdAt: Date;
    updatedAt: Date;
    estimatedDuration?: number;
  };
}
```

## 6. 工作流 (Workflow)
```typescript
interface WorkflowData {
  id: string;
  name: string;
  description: string;
  steps: Array<WorkflowStep>;
  nodes: Array<{
    id: string;
    type: string;
    data: {
      label: string;
      parameters: any;
      primitives: any;
    };
    position: { x: number; y: number };
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    type: string;
    data?: any;
  }>;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    author: string;
    version: string;
    tags: string[];
  };
}
```

## 7. 操作历史 (Operation History)
```typescript
interface Operation {
  id: string;
  type: 'add' | 'remove' | 'update' | 'connect' | 'disconnect' | 'group' | 'ungroup';
  timestamp: number;
  target: {
    id: string;
    type: string;
  };
  data?: any;
  metadata?: {
    relatedNodes?: string[];
    parameterChanges?: Record<string, any>;
    groupId?: string;
  };
}

interface OperationGroup {
  id: string;
  name: string;
  operations: Operation[];
  timestamp: number;
  category: 'parameter' | 'structure' | 'workflow' | 'environment';
  description: string;
  canUndo: boolean;
}
```

## 8. 可视化模板 (Visualization Template)
```typescript
interface VisualizationTemplate {
  id: string;
  name: string;
  type: 'chart' | 'gauge' | 'timeline';
  description: string;
  applicableTypes: string[];
  dataMapping: {
    x?: string;
    y?: string;
    color?: string;
    size?: string;
  };
  config: ChartOptions;
}
```

## 9. 数据库表结构
```sql
CREATE TABLE workflows (
  id VARCHAR PRIMARY KEY,
  name VARCHAR,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE workflow_steps (
  id VARCHAR PRIMARY KEY,
  workflow_id VARCHAR REFERENCES workflows(id),
  name VARCHAR,
  description TEXT,
  node_ids JSONB,
  order_index INTEGER,
  status VARCHAR,
  dependencies JSONB,
  metadata JSONB
);

CREATE TABLE workflow_nodes (
  id VARCHAR PRIMARY KEY,
  workflow_id VARCHAR REFERENCES workflows(id),
  type VARCHAR,
  data JSONB,
  position JSONB
);

CREATE TABLE workflow_edges (
  id VARCHAR PRIMARY KEY,
  workflow_id VARCHAR REFERENCES workflows(id),
  source VARCHAR,
  target VARCHAR,
  type VARCHAR,
  data JSONB
);

CREATE TABLE primitives (
  id VARCHAR PRIMARY KEY,
  name VARCHAR,
  description TEXT,
  python_code TEXT,
  parameters JSONB,
  order_index INTEGER,
  dependencies JSONB
);

CREATE TABLE devices (
  id VARCHAR PRIMARY KEY,
  manufacturer VARCHAR,
  model VARCHAR,
  serial_number VARCHAR,
  firmware VARCHAR,
  constraints JSONB,
  calibration_date TIMESTAMP,
  maintenance_schedule JSONB
);

CREATE TABLE operation_history (
  id VARCHAR PRIMARY KEY,
  type VARCHAR,
  timestamp TIMESTAMP,
  target_id VARCHAR,
  target_type VARCHAR,
  data JSONB,
  metadata JSONB
);
```

## 10. 文件和数据类型
```typescript
interface FileData {
  id: string;
  name: string;
  type: string;
  size: number;
  path: string;
  metadata?: {
    format?: string;
    encoding?: string;
    lastModified?: Date;
    tags?: string[];
  };
}

interface DataType {
  name: string;
  format: 'csv' | 'json' | 'xml' | 'binary';
  schema?: {
    fields: Array<{
      name: string;
      type: string;
      required?: boolean;
    }>;
  };
  validation?: {
    rules: string[];
    constraints: Record<string, any>;
  };
}
```