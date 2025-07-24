import { OperationNode } from '../../types';

export type SDL7Node = OperationNode & {
  data: SDL7NodeData;
};

export interface SDL7NodeData {
  label: string;
  parameters: Record<string, any>;
  primitiveOperations?: PrimitiveOperation[];
}

export interface PrimitiveOperation {
  operation: string;
  parameters: Record<string, any>;
  condition?: string;
  trace_id?: string;
  parent_uo_id?: string;
}

export interface ParameterDefinition {
  type: 'number' | 'string' | 'boolean' | 'select';
  label: string;
  description?: string;
  defaultValue?: any;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  options?: Array<{ value: string; label: string }>;
  dependsOn?: {
    parameter: string;
    value: any;
  };
}

export interface ParameterGroup {
  label: string;
  parameters: Record<string, ParameterDefinition>;
}

// Specific parameter interfaces for each UO
export interface PrepareAndInjectHPLCSampleParams {
  source_tray: string;
  source_vial: string;
  aliquot_volume_ul: number;
  dest_tray: string;
  dest_vial: string;
  perform_weighing: boolean;
  sample_name?: string;
  hplc_method: string;
  injection_volume: number;
  stall: boolean;
}

export interface PrepareAndInjectHPLCSampleData extends SDL7NodeData {
  parameters: PrepareAndInjectHPLCSampleParams;
}

export interface RunExtractionAndTransferToHPLCParams {
  stir_time: number;
  settle_time: number;
  rate: number;
  reactor: number;
  time_units: string;
  extraction_vial: string;
  perform_aliquot: boolean;
  aliquot_volume_ul?: number;
  hplc_method: string;
  injection_volume: number;
  sample_name: string;
}

export interface RunExtractionAndTransferToHPLCData extends SDL7NodeData {
  parameters: RunExtractionAndTransferToHPLCParams;
}

export interface DeckInitializationParams {
  experiment_name: string;
  solvent_file: string;
  method_name: string;
  injection_volume: number;
  sequence?: string;
}

export interface DeckInitializationData extends SDL7NodeData {
  parameters: DeckInitializationParams;
}

export interface AddSolventToSampleVialParams {
  vial: string;
  tray: string;
  solvent: string;
  solvent_vol: number;
  clean: boolean;
  perform_weighing: boolean;
  sample_name?: string;
}

export interface AddSolventToSampleVialData extends SDL7NodeData {
  parameters: AddSolventToSampleVialParams;
}

export const SDL7_NODE_TYPES = [
  'sdl7PrepareAndInjectHPLCSample',
  'sdl7RunExtractionAndTransferToHPLC',
  'sdl7DeckInitialization',
  'sdl7AddSolventToSampleVial',
] as const;

export type SDL7NodeType = typeof SDL7_NODE_TYPES[number];