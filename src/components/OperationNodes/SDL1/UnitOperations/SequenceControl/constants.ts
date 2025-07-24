import { ParameterGroup } from '../../types';

export const LOOP_TYPE_OPTIONS = [
  { value: 'fixed_count', label: 'Fixed Count' },
  { value: 'time_based', label: 'Time Based' },
  { value: 'condition_based', label: 'Condition Based' },
];

export const LOOP_CONDITION_OPTIONS = [
  { value: 'voltage_threshold', label: 'Voltage Threshold' },
  { value: 'current_threshold', label: 'Current Threshold' },
  { value: 'time_limit', label: 'Time Limit' },
];

export const DATA_COLLECTION_MODE_OPTIONS = [
  { value: 'all_cycles', label: 'All Cycles' },
  { value: 'from_cycle_n', label: 'From Cycle N' },
  { value: 'last_n_cycles', label: 'Last N Cycles' },
];

export const ERROR_HANDLING_OPTIONS = [
  { value: 'continue', label: 'Continue' },
  { value: 'stop', label: 'Stop' },
  { value: 'retry', label: 'Retry' },
];

export const LOG_LEVEL_OPTIONS = [
  { value: 'DEBUG', label: 'DEBUG' },
  { value: 'INFO', label: 'INFO' },
  { value: 'WARNING', label: 'WARNING' },
  { value: 'ERROR', label: 'ERROR' },
];

export const DEFAULT_VALUES = {
  // Common parameters
  uo_name: 'Sequence_Control_Loop',
  description: 'Loop and conditional control for experimental sequences with data collection management',
  wait_before: 0,
  wait_after: 0,
  error_handling: 'continue',
  log_level: 'INFO',
  // Specific parameters
  loop_type: 'fixed_count',
  loop_count: 5,
  loop_condition: 'voltage_threshold',
  break_condition: 'voltage < -1.5',
  // New data collection parameters
  data_collection_start: 3,
  data_collection_mode: 'from_cycle_n',
  stabilization_cycles: 2,
  last_n_cycles: 3,
};

export const PARAMETER_GROUPS: Record<string, ParameterGroup> = {
  common: {
    label: 'Common Parameters',
    parameters: {
      uo_name: {
        type: 'string',
        label: 'UO Name',
        description: 'Custom name for this operation',
        defaultValue: DEFAULT_VALUES.uo_name,
        required: false,
      },
      description: {
        type: 'string',
        label: 'Description',
        description: 'Operation description',
        defaultValue: DEFAULT_VALUES.description,
        required: false,
      },
      wait_before: {
        type: 'number',
        label: 'Wait Before',
        description: 'Wait time before execution',
        defaultValue: DEFAULT_VALUES.wait_before,
        min: 0,
        max: 3600,
        step: 1,
        unit: 's',
      },
      wait_after: {
        type: 'number',
        label: 'Wait After',
        description: 'Wait time after execution',
        defaultValue: DEFAULT_VALUES.wait_after,
        min: 0,
        max: 3600,
        step: 1,
        unit: 's',
      },
      error_handling: {
        type: 'select',
        label: 'Error Handling',
        description: 'How to handle errors',
        options: ERROR_HANDLING_OPTIONS,
        defaultValue: DEFAULT_VALUES.error_handling,
        required: true,
      },
      log_level: {
        type: 'select',
        label: 'Log Level',
        description: 'Logging level',
        options: LOG_LEVEL_OPTIONS,
        defaultValue: DEFAULT_VALUES.log_level,
        required: true,
      },
    },
  },
  loop_configuration: {
    label: 'Loop Configuration',
    parameters: {
      loop_type: {
        type: 'select',
        label: 'Loop Type',
        description: 'Type of loop control',
        options: LOOP_TYPE_OPTIONS,
        defaultValue: DEFAULT_VALUES.loop_type,
        required: true,
      },
      loop_count: {
        type: 'number',
        label: 'Loop Count',
        description: 'Number of iterations (for fixed count type)',
        defaultValue: DEFAULT_VALUES.loop_count,
        min: 1,
        max: 100,
        step: 1,
        unit: '',
        dependsOn: {
          parameter: 'loop_type',
          value: 'fixed_count',
        },
      },
      loop_condition: {
        type: 'select',
        label: 'Loop Condition',
        description: 'Condition type for loop control',
        options: LOOP_CONDITION_OPTIONS,
        defaultValue: DEFAULT_VALUES.loop_condition,
        dependsOn: {
          parameter: 'loop_type',
          value: 'condition_based',
        },
      },
      break_condition: {
        type: 'string',
        label: 'Break Condition',
        description: 'Expression for breaking the loop (e.g., "voltage < -1.5", "current > 0.1")',
        defaultValue: DEFAULT_VALUES.break_condition,
        dependsOn: {
          parameter: 'loop_type',
          value: 'condition_based',
        },
      },
    },
  },
  data_collection: {
    label: 'Data Collection Settings',
    parameters: {
      data_collection_start: {
        type: 'number',
        label: 'Data Collection Start',
        description: 'From which cycle to start collecting data',
        defaultValue: DEFAULT_VALUES.data_collection_start,
        min: 1,
        max: 50,
        step: 1,
        unit: 'cycle',
        required: true,
      },
      data_collection_mode: {
        type: 'select',
        label: 'Data Collection Mode',
        description: 'How to collect data across cycles',
        options: DATA_COLLECTION_MODE_OPTIONS,
        defaultValue: DEFAULT_VALUES.data_collection_mode,
        required: true,
      },
      stabilization_cycles: {
        type: 'number',
        label: 'Stabilization Cycles',
        description: 'Number of initial cycles for stabilization (no data collection)',
        defaultValue: DEFAULT_VALUES.stabilization_cycles,
        min: 0,
        max: 20,
        step: 1,
        unit: 'cycles',
      },
      last_n_cycles: {
        type: 'number',
        label: 'Last N Cycles',
        description: 'Number of last cycles to collect (for Last N Cycles mode)',
        defaultValue: DEFAULT_VALUES.last_n_cycles,
        min: 1,
        max: 20,
        step: 1,
        unit: 'cycles',
        dependsOn: {
          parameter: 'data_collection_mode',
          value: 'last_n_cycles',
        },
      },
    },
  },
};

export const PRIMITIVE_OPERATIONS = [
  'initialize_loop',
  'check_condition',
  'increment_counter',
  'evaluate_break_condition',
  'loop_iteration',
  'finalize_loop',
];