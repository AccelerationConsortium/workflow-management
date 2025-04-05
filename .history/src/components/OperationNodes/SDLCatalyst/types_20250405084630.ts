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
    type: 'OT2',
    label: 'OT2',
    description: 'OT2 液体处理工作站',
    category: 'SDL Catalyst',
    parameters: [
      {
        name: 'protocol',
        label: '协议文件',
        type: 'file',
        description: '上传 Python 协议文件',
        constraints: {
          required: true,
          fileTypes: ['.py']
        }
      },
      {
        name: 'simulate',
        label: '模拟运行',
        type: 'boolean',
        default: false,
        description: '是否在模拟模式下运行'
      }
    ]
  },
  {
    type: 'CVA',
    label: 'CVA',
    description: '循环伏安法测量',
    category: 'SDL Catalyst',
    parameters: [
      {
        name: 'start_voltage',
        label: '起始电压',
        type: 'float',
        unit: 'V',
        default: 0,
        description: '扫描的起始电压'
      },
      {
        name: 'end_voltage',
        label: '终止电压',
        type: 'float',
        unit: 'V',
        default: 1,
        description: '扫描的终止电压'
      },
      {
        name: 'scan_rate',
        label: '扫描速率',
        type: 'float',
        unit: 'V/s',
        default: 0.1,
        description: '电压扫描速率'
      },
      {
        name: 'cycles_per_measurement',
        label: '每次测量循环数',
        type: 'int',
        default: 1,
        description: '每次测量的循环次数'
      },
      {
        name: 'sample_interval',
        label: '采样间隔',
        type: 'float',
        unit: 's',
        default: 0.1,
        description: '数据采样时间间隔'
      },
      {
        name: 'vs_ref',
        label: '参比电极',
        type: 'select',
        options: ['Ag/AgCl', 'SCE', 'Hg/HgO', 'RHE'],
        default: 'Ag/AgCl',
        description: '选择参比电极类型'
      }
    ]
  },
  {
    type: 'BatchCVA',
    label: 'BatchCVA',
    description: '批量循环伏安法测量',
    category: 'SDL Catalyst',
    parameters: [
      {
        name: 'data',
        label: '批量数据',
        type: 'file',
        description: '上传包含批量测量参数的 CSV 或 Excel 文件',
        constraints: {
          required: true,
          fileTypes: ['.csv', '.xlsx', '.xls']
        }
      }
    ]
  }
]; 
