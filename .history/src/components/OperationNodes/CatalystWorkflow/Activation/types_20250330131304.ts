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

// Parameter value source tracking
export type ParameterValueSource = 'default' | 'user' | 'inferred' | 'template';

// Parameter value with source tracking
export interface ParameterValue<T = any> {
  value: T;
  source: ParameterValueSource;
  timestamp?: Date;  // When this value was last updated
  metadata?: Record<string, any>;  // Additional context about the value
}

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
  category?: string;  // For grouping in UI
  tags?: string[];    // For filtering and categorization
}

// Input/Output port definition
export interface PortDefinition {
  id: string;
  name: string;
  type: string;
  required?: boolean;
  description?: string;
  validation?: z.ZodType<any>;
  metadata?: {
    displayName?: string;
    group?: string;
    order?: number;
  };
}

// Execution condition with clear dependency structure
export interface ExecutionCondition {
  expression: string;     // e.g. "CVA.ecsa > 0.5"
  dependsOn: string[];    // primitiveId(s) it depends on
  timeout?: number;       // Optional timeout in milliseconds
  retryStrategy?: {
    maxAttempts: number;
    backoffMs: number;
  };
}

// Validation error types
export const ValidationErrorType = {
  MISSING_PARAMETER: 'missing-parameter',
  INVALID_VALUE: 'invalid-value',
  DEPENDENCY_VIOLATION: 'dependency-violation',
  CONDITION_UNMET: 'condition-unmet',
  TYPE_MISMATCH: 'type-mismatch',
  CUSTOM_ERROR: 'custom-error',
  CUSTOM_WARNING: 'custom-warning',
} as const;

export type ValidationErrorType = typeof ValidationErrorType[keyof typeof ValidationErrorType];
export type ValidationSeverity = 'error' | 'warning' | 'info';

export enum PrimitiveCategory {
  Core = 'Core',
  Optional = 'Optional',
  Diagnostic = 'Diagnostic',
  Custom = 'Custom'
}

// Category display order (lower number = higher priority)
export const CATEGORY_ORDER: Record<PrimitiveCategory, number> = {
  [PrimitiveCategory.Core]: 1,
  [PrimitiveCategory.Optional]: 2,
  [PrimitiveCategory.Diagnostic]: 3,
  [PrimitiveCategory.Custom]: 4
};

// Execution context types
export type PrimitiveExecutionStatus = 'idle' | 'running' | 'success' | 'error';

export interface ExecutionContext {
  primitiveId: string;
  status: PrimitiveExecutionStatus;
  startTime?: Date;
  endTime?: Date;
  error?: string;
  metrics?: {
    duration?: number;
    resourceUsage?: {
      cpu?: number;
      memory?: number;
    };
  };
}

export interface NodeExecutionState {
  status: PrimitiveExecutionStatus;
  contexts: Record<string, ExecutionContext>;
  currentPrimitiveId?: string;
  startTime?: Date;
  endTime?: Date;
}

// Parameter dependency system
export interface ParameterDependencyRule {
  if: string; // e.g. "scanRate > 500"
  then: {
    param?: string;
    max?: number;
    min?: number;
    disablePrimitive?: string;
    message?: string;
  };
}

// Template system
export interface NodeTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  parameters: Record<string, any>;
  primitives: string[];
  metadata: {
    author: string;
    createdAt: Date;
    tags: string[];
    version: string;
  };
}

// Operation logging
export type LogAction = 
  | { type: 'PARAMETER_CHANGE'; primitiveId: string; param: string; value: any; source: ParameterValueSource }
  | { type: 'PRIMITIVE_TOGGLE'; primitiveId: string; enabled: boolean }
  | { type: 'NODE_EXECUTION'; status: PrimitiveExecutionStatus }
  | { type: 'TEMPLATE_LOAD'; templateId: string }
  | { type: 'CONFIG_IMPORT'; source: string }
  | { type: 'CONFIG_EXPORT'; format: 'json' | 'markdown' };

export interface LogEntry {
  id: string;
  timestamp: Date;
  action: LogAction;
  user: string;
  metadata?: Record<string, any>;
}

// Update ParameterConfig to include dependencies
export interface ParameterConfig {
  // ... existing parameter config ...
  dependencies?: ParameterDependencyRule[];
}

// Update PrimitiveConfig to include execution context
export interface PrimitiveConfig {
  name: string;
  type: 'operation' | 'measurement';
  description: string;
  inputs: Record<string, boolean>;
  outputs: Record<string, boolean>;
  parameters: Record<string, PrimitiveParameter>;
  monitoring_metrics: PrimitiveMetrics[];
  side_effects: {
    modifies_material: boolean | 'maybe';
  };
  enabled: boolean;
  executionContext?: ExecutionContext;
  parameters?: Record<string, ParameterValue>;
  metadata?: Record<string, any>;
}

// Update ActivationNodeData to include new features
export interface ActivationNodeData {
  label: string;
  version: string;
  description?: string;
  metadata: {
    created: string;
    modified?: string;
    template?: string;
  };
  primitives: Record<string, PrimitiveConfig>;
  validationRules?: {
    requiredPrimitives: string[];
  };
  validationErrors?: ValidationError[];
  execution?: NodeExecutionState;
  templates?: NodeTemplate[];
  logs?: LogEntry[];
}

// Node change event types
export type PrimitiveChangeEvent = {
  primitiveId: string;
  type: 'enable' | 'disable' | 'parameterChange';
  value?: ParameterValue;
  timestamp: Date;
  userId?: string;  // For audit tracking
};

// Enhanced validation result
export interface ValidationError {
  type: ValidationErrorType;
  message: string;
  severity: ValidationSeverity;
  primitiveId?: string;
  parameterId?: string;
  details?: Record<string, any>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  metadata?: {
    validatedAt: Date;
    validatedBy?: string;
    validationDuration?: number;
  };
}

// Helper type for primitive status
export type PrimitiveStatus = 'idle' | 'running' | 'completed' | 'error' | 'skipped';

// Runtime execution context
export interface ExecutionContext {
  nodeId: string;
  primitiveId: string;
  status: PrimitiveStatus;
  startTime?: Date;
  endTime?: Date;
  error?: Error;
  results?: Record<string, ParameterValue>;
  metrics?: {
    duration: number;
    resourceUsage?: {
      cpu?: number;
      memory?: number;
    };
  };
}

// Primitive related types
export interface PrimitiveMetrics {
  name: string;
  unit?: string;
  description?: string;
}

export interface PrimitiveParameter {
  name: string;
  value: number | number[];
  unit: string;
  description?: string;
} 
