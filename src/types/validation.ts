export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  nodeId: string;
  field: string;
  message: string;
  type: 'connection' | 'parameter' | 'data';
}

export interface ValidationWarning {
  nodeId: string;
  message: string;
}

export interface DataType {
  type: string;
  unit?: string;
  range?: [number, number];
  format?: string;
}

export const dataTypeRules: Record<string, DataType> = {
  'powder': {
    type: 'number',
    unit: 'mg',
    range: [0.1, 1000]
  },
  'liquid': {
    type: 'number',
    unit: 'μL',
    range: [1, 10000]
  },
  'temperature': {
    type: 'number',
    unit: '°C',
    range: [-200, 1000]
  },
  'dataset': {
    type: 'object',
    format: 'csv/json'
  }
}; 