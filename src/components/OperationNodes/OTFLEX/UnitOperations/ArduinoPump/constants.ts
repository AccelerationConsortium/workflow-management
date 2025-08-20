import { ParameterGroup } from '../../types';

export const PUMP_MODE_OPTIONS = [
  { value: 'pump', label: 'Pump (Forward)' },
  { value: 'suck', label: 'Suck (Reverse)' },
  { value: 'stop', label: 'Stop' },
  { value: 'purge', label: 'Purge' },
];

export const PUMP_SELECTION_OPTIONS = [
  { value: 'pump1', label: 'Pump 1' },
  { value: 'pump2', label: 'Pump 2' },
  { value: 'pump3', label: 'Pump 3' },
  { value: 'pump4', label: 'Pump 4' },
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
  uo_name: 'Arduino_Pump_Control',
  description: 'Control Arduino-connected pump system',
  wait_before: 0,
  wait_after: 0,
  error_handling: 'stop',
  log_level: 'INFO',
  
  // Pump parameters
  pump_selection: 'pump1',
  pump_mode: 'pump',
  volume: 10.0,
  flow_rate: 5.0,
  duration: 2.0,
  
  // Control parameters
  speed_percentage: 100,
  reverse_direction: false,
  
  // Safety parameters
  enable_flow_monitoring: false,
  max_pressure: 100,
  enable_emergency_stop: true,
  
  // Precision parameters
  volume_tolerance: 0.5,
  flow_tolerance: 0.2,
  wait_for_completion: true,
  completion_timeout: 30,
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
  pump_settings: {
    label: 'Pump Settings',
    parameters: {
      pump_selection: {
        type: 'select',
        label: 'Pump Selection',
        description: 'Which pump to control',
        options: PUMP_SELECTION_OPTIONS,
        defaultValue: DEFAULT_VALUES.pump_selection,
        required: true,
      },
      pump_mode: {
        type: 'select',
        label: 'Pump Mode',
        description: 'Pump operation mode',
        options: PUMP_MODE_OPTIONS,
        defaultValue: DEFAULT_VALUES.pump_mode,
        required: true,
      },
      volume: {
        type: 'number',
        label: 'Volume',
        description: 'Volume to pump/suck',
        defaultValue: DEFAULT_VALUES.volume,
        min: 0.1,
        max: 100,
        step: 0.1,
        unit: 'mL',
      },
      flow_rate: {
        type: 'number',
        label: 'Flow Rate',
        description: 'Target flow rate',
        defaultValue: DEFAULT_VALUES.flow_rate,
        min: 0.1,
        max: 50,
        step: 0.1,
        unit: 'mL/s',
      },
      duration: {
        type: 'number',
        label: 'Duration',
        description: 'Pumping duration',
        defaultValue: DEFAULT_VALUES.duration,
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
      speed_percentage: {
        type: 'number',
        label: 'Speed Percentage',
        description: 'Pump speed as percentage',
        defaultValue: DEFAULT_VALUES.speed_percentage,
        min: 10,
        max: 100,
        step: 5,
        unit: '%',
      },
      reverse_direction: {
        type: 'boolean',
        label: 'Reverse Direction',
        description: 'Reverse pump direction',
        defaultValue: DEFAULT_VALUES.reverse_direction,
      },
    },
  },
  safety_settings: {
    label: 'Safety Settings',
    parameters: {
      enable_flow_monitoring: {
        type: 'boolean',
        label: 'Flow Monitoring',
        description: 'Enable flow rate monitoring',
        defaultValue: DEFAULT_VALUES.enable_flow_monitoring,
      },
      max_pressure: {
        type: 'number',
        label: 'Max Pressure',
        description: 'Maximum allowed pressure',
        defaultValue: DEFAULT_VALUES.max_pressure,
        min: 10,
        max: 500,
        step: 10,
        unit: 'kPa',
        dependsOn: {
          parameter: 'enable_flow_monitoring',
          value: true,
        },
      },
      enable_emergency_stop: {
        type: 'boolean',
        label: 'Emergency Stop',
        description: 'Enable emergency stop capability',
        defaultValue: DEFAULT_VALUES.enable_emergency_stop,
      },
    },
  },
  precision_settings: {
    label: 'Precision Settings',
    parameters: {
      volume_tolerance: {
        type: 'number',
        label: 'Volume Tolerance',
        description: 'Acceptable volume error',
        defaultValue: DEFAULT_VALUES.volume_tolerance,
        min: 0.01,
        max: 5,
        step: 0.01,
        unit: 'mL',
      },
      flow_tolerance: {
        type: 'number',
        label: 'Flow Tolerance',
        description: 'Acceptable flow rate error',
        defaultValue: DEFAULT_VALUES.flow_tolerance,
        min: 0.01,
        max: 2,
        step: 0.01,
        unit: 'mL/s',
      },
      wait_for_completion: {
        type: 'boolean',
        label: 'Wait for Completion',
        description: 'Wait for pump operation to complete',
        defaultValue: DEFAULT_VALUES.wait_for_completion,
      },
      completion_timeout: {
        type: 'number',
        label: 'Completion Timeout',
        description: 'Maximum wait time for completion',
        defaultValue: DEFAULT_VALUES.completion_timeout,
        min: 1,
        max: 300,
        step: 1,
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
  'check_pump_connection',
  'set_pump_parameters',
  'start_pump',
  'stop_pump',
  'monitor_flow_rate',
  'monitor_pressure',
  'verify_volume',
  'handle_emergency_stop',
  'log_pump_operation',
];