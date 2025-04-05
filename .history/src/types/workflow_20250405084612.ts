export type ConnectionType = 'sequential' | 'parallel' | 'conditional';

export interface ValidationRule {
  type: 'required' | 'range' | 'format' | 'custom';
  message: string;
  validator?: (value: any) => boolean;
  range?: [number, number];
  format?: string;
}

export interface PortDefinition {
  id: string;
  label: string;
  type: string;
  rules?: ValidationRule[];
  description?: string;
}

export interface BranchCondition {
  id: string;
  sourcePort: string;
  targetPort: string;
  operator: '>' | '<' | '==' | '>=' | '<=' | '!=' | 'contains' | 'matches';
  value: any;
  description?: string;
}

export interface NodeData {
  label: string;
  type: string;
  inputs: PortDefinition[];
  outputs: PortDefinition[];
  parameters?: {
    name: string;
    type: 'number' | 'string' | 'boolean' | 'select';
    label: string;
    rules?: ValidationRule[];
    options?: string[];
    default?: any;
  }[];
  validationRules?: {
    [key: string]: ValidationRule[];
  };
  branchConditions?: BranchCondition[];
}

export interface Connection {
  id: string;
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
  type: ConnectionType;
  data?: {
    condition?: BranchCondition;
    validation?: ValidationRule[];
  };
}

export interface Primitive {
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
  order?: number;  // 执行顺序
  dependencies?: string[];  // 依赖的其他 primitive IDs
}

export interface Parameter {
  name: string;
  label: string;
  type: 'number' | 'string' | 'boolean' | 'select' | 'file' | 'int' | 'float' | 'list';
  unit?: string;
  default?: any;
  options?: string[];
  constraints?: {
    min?: number;
    max?: number;
    pattern?: string;
    required?: boolean;
    fileTypes?: string[];
  };
  description?: string;
}

export interface DeviceConstraints {
  plateFormat?: string[];          // 支持的板型，如 ['96-well', '384-well']
  volumeRange?: [number, number];  // 支持的体积范围 [最小值, 最大值]
  temperatureRange?: [number, number];
  speedRange?: [number, number];   // 如搅拌速度范围
  materials?: string[];            // 支持的材料类型
  dimensions?: {                   // 物理尺寸限制
    width?: [number, number];
    height?: [number, number];
    depth?: [number, number];
  };
}

export interface Device {
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

export interface OperationNode {
  id?: string;
  type: string;
  label: string;
  description?: string;
  category: 'Sample Processing' | 'Analysis & Measurement' | 'Reaction Control' | 
           'Separation & Purification' | 'Data Acquisition' | 'Environment Control' | 
           'Test' | 'Medusa' | 'Catalyst Workflow' | 'SDL Catalyst';
  expanded?: boolean;
  icon?: any;  // 改为 any 以支持 React 组件
  parameters?: Parameter[];
  inputs?: {
    id: string;
    label: string;
    type?: string;
    required?: boolean;
    description?: string;
    value?: {
      fileName?: string;
      fileType?: string;
      data?: any;
    };
  }[];
  outputs?: {
    id?: string;
    label: string;
    type?: string;
    description?: string;
  }[];
  specs?: Record<string, any>;
  primitives?: Record<string, { enabled: boolean; disabledReason?: string }> | Primitive[];
  supportedDevices?: Device[];
  onDataChange?: (updatedData: any) => void;
  onParameterChange?: (name: string, value: any) => void;
}

export interface WorkflowStep {
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
    estimatedDuration?: number;  // 预计执行时间（分钟）
  };
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  status: 'draft' | 'ready' | 'running' | 'completed' | 'failed';
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    author: string;
    version: string;
    tags: string[];
  };
}

export interface ValidationConfig {
  rules: ValidationRule[];
  dependencies?: {
    [key: string]: string[];
  };
}

export interface Metadata {
  createdAt: Date;
  updatedAt: Date;
  author: string;
  version: string;
  tags: string[];
}

export interface Performance {
  executionTime?: number;
  resourceUsage?: {
    cpu?: number;
    memory?: number;
    disk?: number;
  };
  reliability?: number;
}

export interface Requirements {
  hardware?: {
    cpu?: number;
    memory?: number;
    disk?: number;
  };
  software?: {
    os?: string[];
    dependencies?: string[];
  };
  permissions?: string[];
}

export interface WorkflowData {
  id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  metadata?: Metadata;
  version?: string;
}

export interface WorkflowNode extends OperationNode {
  id: string;
  position: {
    x: number;
    y: number;
  };
  data?: NodeData;
}

export interface WorkflowConnection extends Connection {
  id: string;
  type: ConnectionType;
  data?: {
    condition?: BranchCondition;
    validation?: ValidationRule[];
  };
}

export interface NodeDefinition {
  type: string;
  label: string;
  category: string;
  description?: string;
  parameters: Parameter[];
  inputs: PortDefinition[];
  outputs: PortDefinition[];
  validation?: ValidationConfig;
} 
