// 参数类型定义
export type ParameterType = 'number' | 'string' | 'boolean' | 'select';

export interface ParameterDefinition {
  id: string;
  name: string;
  type: ParameterType;
  defaultValue: any;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];  // 用于select类型
  unit?: string;
  description?: string;
  constraints?: ParameterConstraint[];
}

export interface ParameterConstraint {
  type: 'range' | 'dependency' | 'custom';
  condition: string;
  message: string;
}

export interface ParameterValue {
  id: string;
  value: any;
  timestamp: number;
  metadata?: Record<string, any>;
} 