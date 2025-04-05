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

// Primitive configuration
export interface PrimitiveConfig {
  id: string;
  name: string;
  enabled: boolean;
  optional?: boolean;
  executionCondition?: ExecutionCondition;
  parameters: Record<string, ParameterValue>;
  parameterDefinitions: ParameterDefinition[];
  inputs: PortDefinition[];
  outputs: PortDefinition[];
  category: PrimitiveCategory;
  disabledReason?: string;
  tags?: string[];       // e.g. ["diagnostic", "safety-check"]
  description?: string;  // Human readable description
  examplePrompt?: string;// AI assistant prompt template
  metadata?: {
    version?: string;
    author?: string;
    lastModified?: Date;
    documentation?: string;
    customData?: Record<string, any>;
  };
}

// Validation rules for the entire node
export interface ValidationRules {
  requiredPrimitives?: string[];
  mutuallyExclusive?: string[][];
  dependencies?: Array<{
    if: string;
    then: string[];
    description?: string;  // Why this dependency exists
  }>;
  custom?: (primitives: PrimitiveConfig[]) => ValidationResult;
}

// Main node data structure
export interface ActivationNodeData {
  id: string;
  type: 'activation';
  label: string;
  primitives: PrimitiveConfig[];
  version: string;
  validationRules?: ValidationRules;
  metadata: {
    template: string;
    created: string;
    modified: string;
    description?: string;
    tags?: string[];
    author?: string;
    documentation?: string;
  };
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
  severity: ValidationSeverity;
  message: string;
  primitiveId?: string;
  parameterId?: string;
  context?: {
    expected?: any;
    received?: any;
    path?: string[];
  };
  timestamp: Date;
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
