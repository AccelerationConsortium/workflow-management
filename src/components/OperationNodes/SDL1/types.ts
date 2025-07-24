import { OperationNode } from '../../types';

export type SDL1Node = OperationNode & {
  data: SDL1NodeData;
};

export interface SDL1NodeData {
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

// Common parameter interfaces
export interface CommonUOParams {
  uo_name?: string;
  description?: string;
  wait_before?: number;
  wait_after?: number;
  error_handling: 'continue' | 'stop' | 'retry';
  log_level: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR';
}

// Experiment Setup parameters
export interface ExperimentSetupParams extends CommonUOParams {
  // Experiment configuration
  experiment_id: string;
  test_well_address: string;
  pipette_tip_start_id: number;
  run_number?: number;
  experiment_notes?: string;
  
  // Hardware configuration
  robot_ip: string;
  robot_port: number;
  squidstat_port: string;
  squidstat_channel: number;
  
  // Safety checks
  validate_hardware_connection: boolean;
  check_pipette_tips: boolean;
  verify_well_availability: boolean;
}

// Solution Preparation parameters
export interface SolutionPreparationParams extends CommonUOParams {
  source_labware: string;
  source_well: string;
  target_labware: string;
  target_well: string;
  volume: number;
  pipette_type: string;
  aspiration_offset_z: number;
  dispense_offset_x: number;
  dispense_offset_y: number;
  dispense_offset_z: number;
}

// Electrode Setup parameters
export interface ElectrodeSetupParams extends CommonUOParams {
  electrode_type: 'reference' | 'counter' | 'working';
  electrode_position: string;
  target_well: string;
  insertion_depth: number;
  lateral_offset_x: number;
  lateral_offset_y: number;
  movement_speed: number;
}

// Electrochemical Measurement parameters (Consolidated)
export interface ElectrochemicalMeasurementParams extends CommonUOParams {
  // Hardware configuration
  com_port: string;
  channel: number;
  
  // Measurement selection
  measurement_type: 'OCV' | 'CP' | 'CVA' | 'PEIS' | 'LSV';
  
  // OCV parameters
  ocv_duration?: number;
  ocv_sample_interval?: number;
  ocv_settle_time?: number;
  ocv_stability_threshold?: number;
  
  // CP parameters  
  cp_current?: number;
  cp_duration?: number;
  cp_sample_interval?: number;
  cp_voltage_limit_min?: number;
  cp_voltage_limit_max?: number;
  
  // CVA parameters
  cva_start_voltage?: number;
  cva_end_voltage?: number;
  cva_scan_rate?: number;
  cva_cycles?: number;
  cva_sample_interval?: number;
  
  // PEIS parameters
  peis_start_frequency?: number;
  peis_end_frequency?: number;
  peis_points_per_decade?: number;
  peis_ac_amplitude?: number;
  peis_dc_bias?: number;
  peis_bias_vs_ocp?: boolean;
  peis_minimum_cycles?: number;
  
  // LSV parameters
  lsv_start_voltage?: number;
  lsv_end_voltage?: number;
  lsv_scan_rate?: number;
  lsv_sample_interval?: number;
  
  // Data collection parameters
  data_collection_enabled: boolean;
  cycle_dependent_collection: boolean;
  data_tag: string;
}

// Wash/Cleaning parameters
export interface WashCleaningParams extends CommonUOParams {
  cleaning_tool_position: string;
  target_well: string;
  pump1_volume: number;
  pump2_volume: number;
  ultrasonic_time: number;
  insertion_depth: number;
  cleaning_cycles: number;
}

// Data Export parameters
export interface DataExportParams extends CommonUOParams {
  export_format: 'CSV' | 'Excel' | 'JSON';
  file_naming: string;
  include_metadata: boolean;
  separate_ac_dc_files: boolean;
  data_path: string;
}

// Sequence Control parameters
export interface SequenceControlParams extends CommonUOParams {
  loop_type: 'fixed_count' | 'time_based' | 'condition_based';
  loop_count?: number;
  loop_condition?: 'voltage_threshold' | 'current_threshold' | 'time_limit';
  break_condition?: string;
}

// Cycle Counter parameters
export interface CycleCounterParams extends CommonUOParams {
  // Cycle status (read-only)
  current_cycle: number;
  total_cycles: number;
  cycle_start_time: string;
  cycle_elapsed_time: number;
  estimated_completion_time: string;
  
  // Performance statistics (read-only)
  average_cycle_time: number;
  fastest_cycle_time: number;
  slowest_cycle_time: number;
  
  // Display configuration
  display_mode: 'basic' | 'detailed' | 'statistics';
  time_format: 'HH:MM:SS' | 'seconds' | 'minutes';
  show_progress_bar: boolean;
  show_eta: boolean;
  
  // Data collection status (read-only)
  data_collection_enabled: boolean;
  cycle_dependent_collection: boolean;
  data_tag: string;
}

export const SDL1_NODE_TYPES = [
  'sdl1ExperimentSetup',
  'sdl1SolutionPreparation',
  'sdl1ElectrodeSetup',
  'sdl1ElectrochemicalMeasurement',
  'sdl1WashCleaning',
  'sdl1DataExport',
  'sdl1SequenceControl',
  'sdl1CycleCounter',
] as const;

export type SDL1NodeType = typeof SDL1_NODE_TYPES[number];