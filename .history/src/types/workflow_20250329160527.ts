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

export interface ValidationConfig {
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
}

export interface Metadata {
  author?: string;
  version?: string;
  lastUpdated?: string;
  tags?: string[];
  documentation?: string;
  examples?: string[];
}

export interface Performance {
  estimatedDuration?: number;
  resourceIntensity?: 'low' | 'medium' | 'high';
  parallelizable?: boolean;
  failureRate?: number;
}

export interface Requirements {
  power?: number;
  environment?: {
    temperature?: [number, number];
    humidity?: [number, number];
    pressure?: [number, number];
  };
  certifications?: string[];
  safetyProtocols?: string[];
}

export interface OperationNode {
  id: string;
  type: string;
  label: string;
  category: string;
  description?: string;
  icon?: string;
  parameters: Parameter[];
  supportedDevices?: Device[];
  validation?: ValidationConfig;
  metadata?: Metadata;
  performance?: Performance;
  requirements?: Requirements;
  expanded?: boolean;
  content?: React.ReactNode;
  version?: string;
  primitives?: Record<string, { enabled: boolean; disabledReason?: string }>;
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
