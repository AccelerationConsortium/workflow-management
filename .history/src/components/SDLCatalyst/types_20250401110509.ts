// Unit Operation Types
export enum UOType {
  OCV = 'OCV',
  CP = 'CP',
  CVA = 'CVA',
  PEIS = 'PEIS',
  LSV = 'LSV'
}

// Base Parameter Types
export type ParameterValue = number | string | boolean | number[];

// Parameter Definition
export interface Parameter {
  type: 'number' | 'string' | 'boolean' | 'range';
  label: string;
  defaultValue: ParameterValue;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  description?: string;
}

// Node Data Structure
export interface NodeData {
  uo_type: UOType;
  parameters: Record<string, ParameterValue>;
}

// Node Configuration
export interface NodeConfig {
  type: UOType;
  label: string;
  description: string;
  parameters: Record<string, Parameter>;
  category: 'electrochemistry';
}

// Parameter Validation Error
export interface ValidationError {
  parameter: string;
  message: string;
}

// Node Props Interface
export interface NodeProps {
  data: NodeData;
  onChange: (data: NodeData) => void;
  onExport?: () => void;
} 
