// Common types for SDL Catalyst UOs
export interface BaseUOProps {
  id: string;
  position: { x: number; y: number };
  onParameterChange: (parameters: Record<string, any>) => void;
  onExport: () => void;
}

export interface BaseUOState {
  parameters: Record<string, any>;
  isValid: boolean;
  errors: string[];
}

// Parameter types
export type ParameterType = 'number' | 'string' | 'boolean' | 'select';

export interface Parameter {
  type: ParameterType;
  label: string;
  defaultValue: any;
  required?: boolean;
  min?: number;
  max?: number;
  options?: string[];  // For select type
  unit?: string;
  description?: string;
}

export interface UOConfig {
  uo_type: string;
  parameters: Record<string, Parameter>;
}

// Export configuration type
export interface UOExportConfig {
  uo_type: string;
  parameters: Record<string, any>;
} 
