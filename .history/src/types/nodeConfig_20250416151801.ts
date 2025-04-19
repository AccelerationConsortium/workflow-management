export interface NodeConfig {
  name: string;
  label: string;
  type: string;
  options?: string[];
}

export interface NodeMapping {
  type: string;
  taskType: string;
  parameters: Record<string, any>;
  inputs?: Array<string | { name: string; type: string; description?: string }>;
  outputs?: Array<string | { name: string; type: string; description?: string }>;
}

export interface DeviceDefinition {
  id: string;
  name: string;
  manufacturer: string;
  model: string;
  capabilities: string[];
  constraints?: {
    temperature?: [number, number];
    volume?: [number, number];
    speed?: [number, number];
  };
}

export type ParameterType = 'string' | 'number' | 'boolean' | 'select';

export interface BaseParameter {
  name: string;
  label: string;
  type: ParameterType;
  description?: string;
  required?: boolean;
}

export interface NumericParameter extends BaseParameter {
  type: 'number';
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  default?: number;
}

export interface StringParameter extends BaseParameter {
  type: 'string';
  maxLength?: number;
  pattern?: string;
  default?: string;
}

export interface BooleanParameter extends BaseParameter {
  type: 'boolean';
  default?: boolean;
}

export interface SelectParameter extends BaseParameter {
  type: 'select';
  options: { value: string; label: string }[];
  default?: string;
}

export type TaskParameter = 
  | NumericParameter 
  | StringParameter 
  | BooleanParameter 
  | SelectParameter; 
