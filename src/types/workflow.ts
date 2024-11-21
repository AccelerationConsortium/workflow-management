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