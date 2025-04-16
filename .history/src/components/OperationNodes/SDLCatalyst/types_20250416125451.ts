// Common types for SDL Catalyst UOs
export interface BaseUOProps {
  id: string;
  position: { x: number; y: number };
  onParameterChange: (parameters: Record<string, any>) => void;
  onExport: () => void;
  workflowId?: string;
}

export interface BaseUOState {
  parameters: Record<string, any>;
  isValid: boolean;
  errors: string[];
}

// Parameter types
export type ParameterType = 'number' | 'string' | 'boolean' | 'select' | 'custom';

export interface Parameter {
  type: ParameterType;
  label: string;
  defaultValue: any;
  required?: boolean;
  min?: number;
  max?: number;
  options?: { value: string; label: string }[];  // For select type
  unit?: string;
  description?: string;
  render?: (props: any) => React.ReactNode;
  inputProps?: any;
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

export interface BaseUONodeData {
  label: string;
  parameters: Record<string, Parameter>;
  onParameterChange?: (params: Record<string, any>) => void;
  onExport?: () => void;
  workflowId: string;
  onDelete?: (id: string) => void;
  onNodeDelete?: (id: string) => void;
} 
