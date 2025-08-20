import { ParameterGroup } from '../../types';

export const ULTRASONIC_MODE_OPTIONS = [
  { value: 'continuous', label: 'Continuous' },
  { value: 'pulsed', label: 'Pulsed' },
  { value: 'sweep', label: 'Frequency Sweep' },
  { value: 'stop', label: 'Stop' },
];

export const BASE_NUMBER_OPTIONS = [
  { value: 0, label: 'Base 0' },
  { value: 1, label: 'Base 1' },
];

export const PULSE_MODE_OPTIONS = [
  { value: 'square', label: 'Square Wave' },
  { value: 'sine', label: 'Sine Wave' },
  { value: 'triangle', label: 'Triangle Wave' },
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
  uo_name: 'Arduino_Ultrasonic_Control',
  description: 'Control ultrasonic module via Arduino',
  wait_before: 0,
  wait_after: 0,
  error_handling: 'stop',
  log_level: 'INFO',
  
  // Ultrasonic parameters
  base_number: 0,
  ultrasonic_mode: 'continuous',
  duration: 5000, // ms
  frequency: 40000, // Hz (40 kHz)
  power_level: 50, // %
  
  // Pulse parameters
  pulse_mode: 'square',
  pulse_duration: 100, // ms
  pulse_interval: 200, // ms
  duty_cycle: 50, // %
  
  // Sweep parameters
  start_frequency: 20000, // Hz
  end_frequency: 80000, // Hz
  sweep_rate: 1000, // Hz/s
  
  // Monitoring parameters
  enable_monitoring: true,
  monitoring_interval: 1000, // ms
  power_monitoring: true,
  temperature_monitoring: false,
  
  // Completion parameters
  wait_for_completion: true,
  completion_timeout: 60, // s
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
  ultrasonic_settings: {
    label: 'Ultrasonic Settings',
    parameters: {
      base_number: {
        type: 'select',
        label: 'Base Number',
        description: 'Base plate number',
        options: BASE_NUMBER_OPTIONS,
        defaultValue: DEFAULT_VALUES.base_number,
        required: true,
      },
      ultrasonic_mode: {
        type: 'select',
        label: 'Ultrasonic Mode',
        description: 'Ultrasonic operation mode',
        options: ULTRASONIC_MODE_OPTIONS,
        defaultValue: DEFAULT_VALUES.ultrasonic_mode,
        required: true,
      },
      duration: {
        type: 'number',
        label: 'Duration',
        description: 'Sonication duration',
        defaultValue: DEFAULT_VALUES.duration,
        min: 100,
        max: 60000,
        step: 100,
        unit: 'ms',
      },
      frequency: {
        type: 'number',
        label: 'Frequency',
        description: 'Ultrasonic frequency',
        defaultValue: DEFAULT_VALUES.frequency,
        min: 10000,
        max: 100000,
        step: 1000,
        unit: 'Hz',
      },
      power_level: {
        type: 'number',
        label: 'Power Level',
        description: 'Ultrasonic power level',
        defaultValue: DEFAULT_VALUES.power_level,
        min: 10,
        max: 100,
        step: 5,
        unit: '%',
      },
    },
  },
  pulse_settings: {
    label: 'Pulse Settings',
    parameters: {
      pulse_mode: {
        type: 'select',
        label: 'Pulse Mode',
        description: 'Pulse waveform type',
        options: PULSE_MODE_OPTIONS,
        defaultValue: DEFAULT_VALUES.pulse_mode,
        dependsOn: {
          parameter: 'ultrasonic_mode',
          value: 'pulsed',
        },
      },
      pulse_duration: {
        type: 'number',
        label: 'Pulse Duration',
        description: 'Duration of each pulse',
        defaultValue: DEFAULT_VALUES.pulse_duration,
        min: 10,
        max: 1000,
        step: 10,
        unit: 'ms',
        dependsOn: {
          parameter: 'ultrasonic_mode',
          value: 'pulsed',
        },
      },
      pulse_interval: {
        type: 'number',
        label: 'Pulse Interval',
        description: 'Interval between pulses',
        defaultValue: DEFAULT_VALUES.pulse_interval,
        min: 10,
        max: 2000,
        step: 10,
        unit: 'ms',
        dependsOn: {
          parameter: 'ultrasonic_mode',
          value: 'pulsed',
        },
      },
      duty_cycle: {
        type: 'number',
        label: 'Duty Cycle',
        description: 'Pulse duty cycle',
        defaultValue: DEFAULT_VALUES.duty_cycle,
        min: 10,
        max: 90,
        step: 5,
        unit: '%',
        dependsOn: {
          parameter: 'ultrasonic_mode',
          value: 'pulsed',
        },
      },
    },
  },
  sweep_settings: {
    label: 'Frequency Sweep Settings',
    parameters: {
      start_frequency: {
        type: 'number',
        label: 'Start Frequency',
        description: 'Starting frequency for sweep',
        defaultValue: DEFAULT_VALUES.start_frequency,
        min: 10000,
        max: 100000,
        step: 1000,
        unit: 'Hz',
        dependsOn: {
          parameter: 'ultrasonic_mode',
          value: 'sweep',
        },
      },
      end_frequency: {
        type: 'number',
        label: 'End Frequency',
        description: 'Ending frequency for sweep',
        defaultValue: DEFAULT_VALUES.end_frequency,
        min: 10000,
        max: 100000,
        step: 1000,
        unit: 'Hz',
        dependsOn: {
          parameter: 'ultrasonic_mode',
          value: 'sweep',
        },
      },
      sweep_rate: {
        type: 'number',
        label: 'Sweep Rate',
        description: 'Frequency sweep rate',
        defaultValue: DEFAULT_VALUES.sweep_rate,
        min: 100,
        max: 10000,
        step: 100,
        unit: 'Hz/s',
        dependsOn: {
          parameter: 'ultrasonic_mode',
          value: 'sweep',
        },
      },
    },
  },
  monitoring_settings: {
    label: 'Monitoring Settings',
    parameters: {
      enable_monitoring: {
        type: 'boolean',
        label: 'Enable Monitoring',
        description: 'Enable operation monitoring',
        defaultValue: DEFAULT_VALUES.enable_monitoring,
      },
      monitoring_interval: {
        type: 'number',
        label: 'Monitoring Interval',
        description: 'Monitoring data collection interval',
        defaultValue: DEFAULT_VALUES.monitoring_interval,
        min: 100,
        max: 10000,
        step: 100,
        unit: 'ms',
        dependsOn: {
          parameter: 'enable_monitoring',
          value: true,
        },
      },
      power_monitoring: {
        type: 'boolean',
        label: 'Power Monitoring',
        description: 'Monitor power consumption',
        defaultValue: DEFAULT_VALUES.power_monitoring,
        dependsOn: {
          parameter: 'enable_monitoring',
          value: true,
        },
      },
      temperature_monitoring: {
        type: 'boolean',
        label: 'Temperature Monitoring',
        description: 'Monitor transducer temperature',
        defaultValue: DEFAULT_VALUES.temperature_monitoring,
        dependsOn: {
          parameter: 'enable_monitoring',
          value: true,
        },
      },
    },
  },
  completion_settings: {
    label: 'Completion Settings',
    parameters: {
      wait_for_completion: {
        type: 'boolean',
        label: 'Wait for Completion',
        description: 'Wait for ultrasonic operation to complete',
        defaultValue: DEFAULT_VALUES.wait_for_completion,
      },
      completion_timeout: {
        type: 'number',
        label: 'Completion Timeout',
        description: 'Maximum wait time for completion',
        defaultValue: DEFAULT_VALUES.completion_timeout,
        min: 5,
        max: 300,
        step: 5,
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
  'check_ultrasonic_connection',
  'configure_ultrasonic',
  'start_continuous_ultrasonic',
  'start_pulsed_ultrasonic',
  'start_frequency_sweep',
  'stop_ultrasonic',
  'monitor_ultrasonic',
  'wait_for_ultrasonic_completion',
  'log_ultrasonic_operation',
];
