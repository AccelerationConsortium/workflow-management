import { ParameterGroup } from '../../types';

export const REACTOR_ACTION_OPTIONS = [
  { value: 'open', label: 'Open Reactor' },
  { value: 'close', label: 'Close Reactor' },
  { value: 'toggle', label: 'Toggle State' },
  { value: 'status', label: 'Check Status' },
];

export const REACTOR_TYPE_OPTIONS = [
  { value: 'main', label: 'Main Reactor' },
  { value: 'secondary', label: 'Secondary Reactor' },
  { value: 'bypass', label: 'Bypass Reactor' },
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
  uo_name: 'Arduino_Reactor_Control',
  description: 'Control actuated reactor open/close',
  wait_before: 0,
  wait_after: 0,
  error_handling: 'stop',
  log_level: 'INFO',
  
  // Reactor parameters
  reactor_action: 'open',
  reactor_type: 'main',
  actuation_force: 50,
  hold_duration: 10.0,
  
  // Control parameters
  actuation_speed: 100,
  position_precision: 1.0,
  
  // Safety parameters
  enable_pressure_monitoring: true,
  max_pressure: 50,
  enable_force_feedback: false,
  max_force: 100,
  
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
  reactor_settings: {
    label: 'Reactor Settings',
    parameters: {
      reactor_action: {
        type: 'select',
        label: 'Reactor Action',
        description: 'Action to perform on reactor',
        options: REACTOR_ACTION_OPTIONS,
        defaultValue: DEFAULT_VALUES.reactor_action,
        required: true,
      },
      reactor_type: {
        type: 'select',
        label: 'Reactor Type',
        description: 'Type of reactor to control',
        options: REACTOR_TYPE_OPTIONS,
        defaultValue: DEFAULT_VALUES.reactor_type,
        required: true,
      },
      actuation_force: {
        type: 'number',
        label: 'Actuation Force',
        description: 'Force to apply during actuation',
        defaultValue: DEFAULT_VALUES.actuation_force,
        min: 10,
        max: 200,
        step: 5,
        unit: '%',
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
      },
    },
  },
  control_settings: {
    label: 'Control Settings',
    parameters: {
      actuation_speed: {
        type: 'number',
        label: 'Actuation Speed',
        description: 'Speed of actuation movement',
        defaultValue: DEFAULT_VALUES.actuation_speed,
        min: 10,
        max: 100,
        step: 5,
        unit: '%',
      },
      position_precision: {
        type: 'number',
        label: 'Position Precision',
        description: 'Required position accuracy',
        defaultValue: DEFAULT_VALUES.position_precision,
        min: 0.1,
        max: 10,
        step: 0.1,
        unit: 'mm',
      },
    },
  },
  safety_settings: {
    label: 'Safety Settings',
    parameters: {
      enable_pressure_monitoring: {
        type: 'boolean',
        label: 'Pressure Monitoring',
        description: 'Monitor reactor pressure',
        defaultValue: DEFAULT_VALUES.enable_pressure_monitoring,
      },
      max_pressure: {
        type: 'number',
        label: 'Max Pressure',
        description: 'Maximum safe pressure',
        defaultValue: DEFAULT_VALUES.max_pressure,
        min: 10,
        max: 200,
        step: 5,
        unit: 'psi',
        dependsOn: {
          parameter: 'enable_pressure_monitoring',
          value: true,
        },
      },
      enable_force_feedback: {
        type: 'boolean',
        label: 'Force Feedback',
        description: 'Enable force feedback monitoring',
        defaultValue: DEFAULT_VALUES.enable_force_feedback,
      },
      max_force: {
        type: 'number',
        label: 'Max Force',
        description: 'Maximum allowable force',
        defaultValue: DEFAULT_VALUES.max_force,
        min: 20,
        max: 500,
        step: 10,
        unit: 'N',
        dependsOn: {
          parameter: 'enable_force_feedback',
          value: true,
        },
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
  'check_reactor_connection',
  'read_pressure',
  'verify_safe_pressure',
  'open_reactor',
  'close_reactor',
  'monitor_force_feedback',
  'verify_position',
  'wait_for_completion',
  'log_reactor_operation',
];
