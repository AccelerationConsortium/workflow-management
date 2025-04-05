import { z } from 'zod';

// Parameter type definitions
export const ParameterType = {
  NUMBER: 'number',
  STRING: 'string',
  BOOLEAN: 'boolean',
  ENUM: 'enum',
  ARRAY: 'array',
  OBJECT: 'object',
} as const;

export type ParameterType = typeof ParameterType[keyof typeof ParameterType];

// Parameter definition with validation schema
export interface ParameterDefinition {
  id: string;
  name: string;
  type: ParameterType;
  default?: any;
  required?: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    enum?: string[];
    custom?: (value: any) => boolean;
  };
  unit?: string;
  description?: string;
}

// Input/Output port definition
export interface PortDefinition {
  id: string;
  name: string;
  type: string;
  required?: boolean;
  description?: string;
  validation?: z.ZodType<any>;
}

// Condition for future conditional execution
export interface ExecutionCondition {
  type: 'always' | 'if' | 'unless';
  target?: string;  // Target primitive ID
  expression?: string;  // Condition expression
}

// Primitive configuration
export interface PrimitiveConfig {
  id: string;
  name: string;
  enabled: boolean;
  optional?: boolean;  // Whether this primitive can be disabled
  condition?: ExecutionCondition;  // Future: Conditional execution
  parameters: Record<string, any>;
  parameterDefinitions: ParameterDefinition[];  // For UI generation
  inputs: PortDefinition[];
  outputs: PortDefinition[];
  metadata?: Record<string, any>;
}

// Validation rules for the entire node
export interface ValidationRules {
  requiredPrimitives?: string[];  // Primitives that must be enabled
  mutuallyExclusive?: string[][];  // Primitives that cannot be enabled together
  dependencies?: Array<{
    if: string;  // If this primitive is enabled
    then: string[];  // These primitives must also be enabled
  }>;
  custom?: (primitives: PrimitiveConfig[]) => boolean;
}

// Main node data structure
export interface ActivationNodeData {
  id: string;
  type: 'activation';
  label: string;
  primitives: PrimitiveConfig[];
  version: string;
  validationRules?: ValidationRules;  // Rules for primitive combinations
  metadata: {
    template: string;
    created: string;
    modified: string;
    description?: string;
    tags?: string[];
  };
}

// Node change event types
export type PrimitiveChangeEvent = {
  primitiveId: string;
  type: 'enable' | 'disable' | 'parameterChange';
  value?: any;
};

// Node validation result
export interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    type: 'error' | 'warning';
    message: string;
    primitiveId?: string;
    parameterId?: string;
  }>;
}

// Helper type for primitive status
export type PrimitiveStatus = 'idle' | 'running' | 'completed' | 'error';

// Runtime execution context
export interface ExecutionContext {
  nodeId: string;
  primitiveId: string;
  status: PrimitiveStatus;
  startTime?: Date;
  endTime?: Date;
  error?: Error;
  results?: Record<string, any>;
} 
