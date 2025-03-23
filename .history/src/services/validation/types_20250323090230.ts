/**
 * Validation system type definitions
 */

export enum ValidationErrorType {
  CYCLE_DETECTED = 'CYCLE_DETECTED',
  ISOLATED_NODE = 'ISOLATED_NODE',
  MISSING_START_END = 'MISSING_START_END',
  INVALID_CONNECTION = 'INVALID_CONNECTION',
  MISSING_REQUIRED_CONNECTION = 'MISSING_REQUIRED_CONNECTION',
  INVALID_PARAMETER = 'INVALID_PARAMETER',
  MISSING_REQUIRED_PARAMETER = 'MISSING_REQUIRED_PARAMETER',
}

export enum ValidationErrorSeverity {
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  INFO = 'INFO',
}

export interface ValidationError {
  type: ValidationErrorType;
  severity: ValidationErrorSeverity;
  message: string;
  nodeId?: string;
  connectionId?: string;
  parameterName?: string;
  details?: Record<string, any>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export interface ValidationContext {
  workflow: WorkflowData;
  nodes: Map<string, WorkflowNode>;
  connections: Map<string, WorkflowConnection>;
}

export interface ValidationRule {
  validate(context: ValidationContext): ValidationResult;
  name: string;
  description: string;
}

// Helper type for node port definition
export interface PortDefinition {
  id: string;
  type: string;
  required: boolean;
  direction: 'input' | 'output';
  allowMultiple: boolean;
}

// Helper type for parameter definition
export interface ParameterDefinition {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: any;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    enum?: any[];
  };
} 
