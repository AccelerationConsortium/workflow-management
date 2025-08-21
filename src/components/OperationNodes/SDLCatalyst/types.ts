import React from 'react';

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

// Parameter types - enhanced to match SDL1
export type ParameterType = 'number' | 'string' | 'boolean' | 'select' | 'custom';

export interface ParameterDefinition {
  type: ParameterType;
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
  readOnly?: boolean;
}

export interface ParameterGroup {
  label: string;
  parameters: Record<string, ParameterDefinition>;
}

// Legacy Parameter interface for backward compatibility
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

export interface SDLCatalystNode {
  data: SDLCatalystNodeData;
}

export interface SDLCatalystNodeData {
  label: string;
  parameters?: Record<string, any>;
  parameterGroups: Record<string, ParameterGroup>;
  nodeType: string;
  category?: string;
  description?: string;
  primitiveOperations?: string[];
  executionSteps?: Array<{
    operation: string;
    condition?: string;
    description?: string;
  }>;
  onDataChange?: (data: any) => void;
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

// Common parameter interfaces for OER workflow
export interface CommonUOParams {
  uo_name?: string;
  description?: string;
  wait_before?: number;
  wait_after?: number;
  error_handling: 'continue' | 'stop' | 'retry';
  log_level: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR';
}

// OCV parameters
export interface OCVParams extends CommonUOParams {
  duration: number;
  sample_interval: number;
  settle_time?: number;
  stability_threshold?: number;
}

// LSV parameters  
export interface LSVParams extends CommonUOParams {
  start_potential: number;
  end_potential: number;
  scan_rate: number;
  sample_interval: number;
  quiet_time: number;
  max_current: number;
}

// CVA parameters
export interface CVAParams extends CommonUOParams {
  start_voltage: number;
  first_voltage_limit: number;
  second_voltage_limit: number;
  end_voltage: number;
  scan_rates: number[];
  cycles: number;
  sample_interval: number;
  quiet_time: number;
}

// CP parameters
export interface CPParams extends CommonUOParams {
  current: number;
  sample_interval: number;
  duration: number;
  area_cm2?: number;
  current_density?: number;
}

// PEIS parameters
export interface PEISParams extends CommonUOParams {
  start_frequency: number;
  end_frequency: number;
  steps_per_decade: number;
  voltage_bias: number;
  voltage_amplitude: number;
  quiet_time: number;
}

// OT2 liquid handling parameters
export interface OT2Params extends CommonUOParams {
  labware_from: string;
  well_from: string;
  labware_to: string;
  well_to: string;
  volume: number;
  pipette_name: string;
  aspiration_offset_z: number;
  dispense_offset_x: number;
  dispense_offset_y: number;
  dispense_offset_z: number;
  movement_speed: number;
} 
