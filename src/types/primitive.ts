export interface ControlDetail {
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

export interface PrimitiveConstraint {
  parameter: string;
  type: 'range' | 'enum' | 'boolean';
  values: number[] | string[] | boolean;
  unit?: string;
  description?: string;
}

export interface DevicePrimitive {
  id: string;
  name: string;
  description: string;
  deviceType: string[];  // 兼容的设备类型
  manufacturer: string[];  // 兼容的制造商
  controlDetails: ControlDetail;
  constraints: PrimitiveConstraint[];
  parameters: Parameter[];  // 从 workflow.ts 导入的 Parameter 类型
  validation?: {
    preConditions?: string[];
    postConditions?: string[];
  };
} 