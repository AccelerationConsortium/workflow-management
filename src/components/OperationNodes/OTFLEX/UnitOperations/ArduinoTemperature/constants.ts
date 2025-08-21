import { ParameterGroup } from '../../types';

export const TEMPERATURE_MODE_OPTIONS = [
  { value: 'set', label: 'Set Temperature' },
  { value: 'ramp', label: 'Temperature Ramp' },
  { value: 'get', label: 'Get Temperature' },
];

export const BASE_NUMBER_OPTIONS = [
  { value: 0, label: 'Base 0' },
  { value: 1, label: 'Base 1' },
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
  uo_name: 'Arduino_Temperature_Control',
  description: 'Control temperature using Arduino-connected heater',
  wait_before: 0,
  wait_after: 0,
  error_handling: 'stop',
  log_level: 'INFO',
  
  // Temperature parameters
  base_number: 0,
  temperature_mode: 'set',
  target_temperature: 25.0,
  start_temperature: 20.0,
  temperature_tolerance: 1.0,
  
  // Control parameters
  heating_rate: 5.0,
  cooling_rate: 2.0,
  ramp_rate: 1.0,
  hold_time: 60,
  
  // PID parameters
  pid_kp: 1.0,
  pid_ki: 0.1,
  pid_kd: 0.05,
  
  // Monitoring parameters
  enable_monitoring: true,
  monitoring_interval: 5,
  wait_for_stability: true,
  stability_time: 30,
  stability_timeout: 300,
  
  // Safety parameters
  safety_max_temp: 150,
  max_heating_time: 600,
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
  temperature_settings: {
    label: 'Temperature Settings',
    parameters: {
      base_number: {
        type: 'select',
        label: 'Base Number',
        description: 'Base plate number',
        options: BASE_NUMBER_OPTIONS,
        defaultValue: DEFAULT_VALUES.base_number,
        required: true,
      },
      temperature_mode: {
        type: 'select',
        label: 'Temperature Mode',
        description: 'Temperature control mode',
        options: TEMPERATURE_MODE_OPTIONS,
        defaultValue: DEFAULT_VALUES.temperature_mode,
        required: true,
      },
      target_temperature: {
        type: 'number',
        label: 'Target Temperature',
        description: 'Target temperature to reach',
        defaultValue: DEFAULT_VALUES.target_temperature,
        min: 15,
        max: 150,
        step: 0.1,
        unit: '°C',
      },
      start_temperature: {
        type: 'number',
        label: 'Start Temperature',
        description: 'Starting temperature for ramp',
        defaultValue: DEFAULT_VALUES.start_temperature,
        min: 15,
        max: 150,
        step: 0.1,
        unit: '°C',
        dependsOn: {
          parameter: 'temperature_mode',
          value: 'ramp',
        },
      },
      temperature_tolerance: {
        type: 'number',
        label: 'Temperature Tolerance',
        description: 'Acceptable temperature deviation',
        defaultValue: DEFAULT_VALUES.temperature_tolerance,
        min: 0.1,
        max: 10,
        step: 0.1,
        unit: '°C',
      },
    },
  },
  control_settings: {
    label: 'Control Settings',
    parameters: {
      heating_rate: {
        type: 'number',
        label: 'Heating Rate',
        description: 'Maximum heating rate',
        defaultValue: DEFAULT_VALUES.heating_rate,
        min: 0.1,
        max: 20,
        step: 0.1,
        unit: '°C/min',
      },
      cooling_rate: {
        type: 'number',
        label: 'Cooling Rate',
        description: 'Maximum cooling rate',
        defaultValue: DEFAULT_VALUES.cooling_rate,
        min: 0.1,
        max: 10,
        step: 0.1,
        unit: '°C/min',
      },
      ramp_rate: {
        type: 'number',
        label: 'Ramp Rate',
        description: 'Temperature ramp rate',
        defaultValue: DEFAULT_VALUES.ramp_rate,
        min: 0.1,
        max: 10,
        step: 0.1,
        unit: '°C/min',
        dependsOn: {
          parameter: 'temperature_mode',
          value: 'ramp',
        },
      },
      hold_time: {
        type: 'number',
        label: 'Hold Time',
        description: 'Time to hold at target temperature',
        defaultValue: DEFAULT_VALUES.hold_time,
        min: 0,
        max: 3600,
        step: 1,
        unit: 's',
        dependsOn: {
          parameter: 'temperature_mode',
          value: 'ramp',
        },
      },
    },
  },
  pid_settings: {
    label: 'PID Settings',
    parameters: {
      pid_kp: {
        type: 'number',
        label: 'PID Kp',
        description: 'Proportional gain',
        defaultValue: DEFAULT_VALUES.pid_kp,
        min: 0.01,
        max: 10,
        step: 0.01,
      },
      pid_ki: {
        type: 'number',
        label: 'PID Ki',
        description: 'Integral gain',
        defaultValue: DEFAULT_VALUES.pid_ki,
        min: 0.001,
        max: 1,
        step: 0.001,
      },
      pid_kd: {
        type: 'number',
        label: 'PID Kd',
        description: 'Derivative gain',
        defaultValue: DEFAULT_VALUES.pid_kd,
        min: 0.001,
        max: 1,
        step: 0.001,
      },
    },
  },
  monitoring_settings: {
    label: 'Monitoring Settings',
    parameters: {
      enable_monitoring: {
        type: 'boolean',
        label: 'Enable Monitoring',
        description: 'Enable temperature monitoring',
        defaultValue: DEFAULT_VALUES.enable_monitoring,
      },
      monitoring_interval: {
        type: 'number',
        label: 'Monitoring Interval',
        description: 'Temperature monitoring interval',
        defaultValue: DEFAULT_VALUES.monitoring_interval,
        min: 1,
        max: 60,
        step: 1,
        unit: 's',
        dependsOn: {
          parameter: 'enable_monitoring',
          value: true,
        },
      },
      wait_for_stability: {
        type: 'boolean',
        label: 'Wait for Stability',
        description: 'Wait for temperature to stabilize',
        defaultValue: DEFAULT_VALUES.wait_for_stability,
      },
      stability_time: {
        type: 'number',
        label: 'Stability Time',
        description: 'Time to maintain stable temperature',
        defaultValue: DEFAULT_VALUES.stability_time,
        min: 5,
        max: 300,
        step: 5,
        unit: 's',
        dependsOn: {
          parameter: 'wait_for_stability',
          value: true,
        },
      },
      stability_timeout: {
        type: 'number',
        label: 'Stability Timeout',
        description: 'Maximum wait time for stability',
        defaultValue: DEFAULT_VALUES.stability_timeout,
        min: 30,
        max: 1800,
        step: 30,
        unit: 's',
        dependsOn: {
          parameter: 'wait_for_stability',
          value: true,
        },
      },
    },
  },
  safety_settings: {
    label: 'Safety Settings',
    parameters: {
      safety_max_temp: {
        type: 'number',
        label: 'Safety Max Temperature',
        description: 'Maximum safe temperature',
        defaultValue: DEFAULT_VALUES.safety_max_temp,
        min: 50,
        max: 200,
        step: 1,
        unit: '°C',
      },
      max_heating_time: {
        type: 'number',
        label: 'Max Heating Time',
        description: 'Maximum heating time',
        defaultValue: DEFAULT_VALUES.max_heating_time,
        min: 60,
        max: 3600,
        step: 60,
        unit: 's',
      },
    },
  },
};

export const PRIMITIVE_OPERATIONS = [
  'initialize_arduino',
  'check_heater_connection',
  'configure_temperature_control',
  'set_temperature',
  'get_temperature',
  'temperature_ramp',
  'monitor_temperature',
  'wait_for_temperature_stability',
  'emergency_shutdown',
  'log_temperature_data',
];
