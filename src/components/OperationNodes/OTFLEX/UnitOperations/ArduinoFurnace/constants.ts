import { ParameterGroup } from '../../types';

export const FURNACE_ACTION_OPTIONS = [
  { value: 'open', label: 'Open Furnace' },
  { value: 'close', label: 'Close Furnace' },
  { value: 'toggle', label: 'Toggle State' },
  { value: 'status', label: 'Check Status' },
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
  uo_name: 'Arduino_Furnace_Control',
  description: 'Control furnace open/close via Arduino',
  wait_before: 0,
  wait_after: 0,
  error_handling: 'stop',
  log_level: 'INFO',
  
  // Furnace parameters
  furnace_action: 'open',
  hold_duration: 5.0,
  
  // Safety parameters
  enable_temperature_check: true,
  max_safe_temperature: 200,
  enable_position_feedback: false,
  
  // Timing parameters
  operation_timeout: 30,
  wait_for_completion: true,
  completion_timeout: 60,
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
  furnace_settings: {
    label: 'Furnace Settings',
    parameters: {
      furnace_action: {
        type: 'select',
        label: 'Furnace Action',
        description: 'Action to perform on furnace',
        options: FURNACE_ACTION_OPTIONS,
        defaultValue: DEFAULT_VALUES.furnace_action,
        required: true,
      },
      hold_duration: {
        type: 'number',
        label: 'Hold Duration',
        description: 'How long to hold the position',
        defaultValue: DEFAULT_VALUES.hold_duration,
        min: 0.1,
        max: 300,
        step: 0.1,
        unit: 's',
        dependsOn: {
          parameter: 'furnace_action',
          value: 'open',
        },
      },
    },
  },
  safety_settings: {
    label: 'Safety Settings',
    parameters: {
      enable_temperature_check: {
        type: 'boolean',
        label: 'Temperature Check',
        description: 'Check temperature before operation',
        defaultValue: DEFAULT_VALUES.enable_temperature_check,
      },
      max_safe_temperature: {
        type: 'number',
        label: 'Max Safe Temperature',
        description: 'Maximum safe operating temperature',
        defaultValue: DEFAULT_VALUES.max_safe_temperature,
        min: 50,
        max: 500,
        step: 10,
        unit: '°C',
        dependsOn: {
          parameter: 'enable_temperature_check',
          value: true,
        },
      },
      enable_position_feedback: {
        type: 'boolean',
        label: 'Position Feedback',
        description: 'Enable position feedback verification',
        defaultValue: DEFAULT_VALUES.enable_position_feedback,
      },
    },
  },
  timing_settings: {
    label: 'Timing Settings',
    parameters: {
      operation_timeout: {
        type: 'number',
        label: 'Operation Timeout',
        description: 'Maximum time for operation',
        defaultValue: DEFAULT_VALUES.operation_timeout,
        min: 5,
        max: 300,
        step: 5,
        unit: 's',
      },
      wait_for_completion: {
        type: 'boolean',
        label: 'Wait for Completion',
        description: 'Wait for operation to complete',
        defaultValue: DEFAULT_VALUES.wait_for_completion,
      },
      completion_timeout: {
        type: 'number',
        label: 'Completion Timeout',
        description: 'Maximum wait time for completion',
        defaultValue: DEFAULT_VALUES.completion_timeout,
        min: 10,
        max: 600,
        step: 10,
        unit: 's',
        dependsOn: {
          parameter: 'wait_for_completion',
          value: true,
        },
      },
    },
  },
};

export const PRIMITIVE_OPERATIONS = [
  'initialize_arduino',
  'check_furnace_connection',
  'read_temperature',
  'verify_safe_temperature',
  'open_furnace',
  'close_furnace',
  'check_position_feedback',
  'wait_for_completion',
  'log_furnace_operation',
];
