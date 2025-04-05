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

import { OperationNode } from '../../../types/workflow';
import { OT2_PARAMETERS } from '../../../types/ot2Types';

export const SDL_CATALYST_NODE_TYPES: OperationNode[] = [
  {
    type: 'CVA',
    label: 'CVA 测量',
    description: '循环伏安法测量',
    category: 'SDL Catalyst',
    parameters: [],
  },
  {
    type: 'BatchCVA',
    label: 'BatchCVA 测量',
    description: '批量循环伏安法测量',
    category: 'SDL Catalyst',
    parameters: [],
  },
  {
    type: 'OT2',
    label: 'OT2 控制',
    description: 'Opentrons OT-2 自动化液体处理工作站控制',
    category: 'SDL Catalyst',
    parameters: OT2_PARAMETERS,
  }
]; 
