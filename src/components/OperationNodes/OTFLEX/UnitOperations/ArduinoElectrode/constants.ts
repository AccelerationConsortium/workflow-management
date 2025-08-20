import { ParameterGroup } from '../../types';

export const ELECTRODE_MODE_OPTIONS = [
  { value: '2-electrode', label: '2-Electrode System' },
  { value: '3-electrode', label: '3-Electrode System' },
  { value: 'auto', label: 'Auto Select' },
];

export const ELECTRODE_TYPE_OPTIONS = [
  { value: 'working', label: 'Working Electrode' },
  { value: 'counter', label: 'Counter Electrode' },
  { value: 'reference', label: 'Reference Electrode' },
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
  uo_name: 'Arduino_Electrode_Switch',
  description: 'Switch between 2-electrode and 3-electrode system',
  wait_before: 0,
  wait_after: 0,
  error_handling: 'stop',
  log_level: 'INFO',
  
  // Electrode parameters
  electrode_mode: '3-electrode',
  primary_electrode: 'working',
  switch_delay: 1.0,
  
  // Verification parameters
  enable_continuity_check: true,
  resistance_threshold: 1000,
  
  // Safety parameters
  enable_isolation_check: true,
  max_leakage_current: 0.1,
  
  // Timing parameters
  switch_timeout: 10,
  wait_for_stabilization: true,
  stabilization_time: 2.0,
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
  electrode_settings: {
    label: 'Electrode Settings',
    parameters: {
      electrode_mode: {
        type: 'select',
        label: 'Electrode Mode',
        description: 'Electrode system configuration',
        options: ELECTRODE_MODE_OPTIONS,
        defaultValue: DEFAULT_VALUES.electrode_mode,
        required: true,
      },
      primary_electrode: {
        type: 'select',
        label: 'Primary Electrode',
        description: 'Primary electrode for switching',
        options: ELECTRODE_TYPE_OPTIONS,
        defaultValue: DEFAULT_VALUES.primary_electrode,
        required: true,
      },
      switch_delay: {
        type: 'number',
        label: 'Switch Delay',
        description: 'Delay between switch operations',
        defaultValue: DEFAULT_VALUES.switch_delay,
        min: 0.1,
        max: 10,
        step: 0.1,
        unit: 's',
      },
    },
  },
  verification_settings: {
    label: 'Verification Settings',
    parameters: {
      enable_continuity_check: {
        type: 'boolean',
        label: 'Continuity Check',
        description: 'Check electrode continuity after switching',
        defaultValue: DEFAULT_VALUES.enable_continuity_check,
      },
      resistance_threshold: {
        type: 'number',
        label: 'Resistance Threshold',
        description: 'Maximum acceptable resistance',
        defaultValue: DEFAULT_VALUES.resistance_threshold,
        min: 100,
        max: 10000,
        step: 100,
        unit: 'Ω',
        dependsOn: {
          parameter: 'enable_continuity_check',
          value: true,
        },
      },
    },
  },
  safety_settings: {
    label: 'Safety Settings',
    parameters: {
      enable_isolation_check: {
        type: 'boolean',
        label: 'Isolation Check',
        description: 'Check electrical isolation',
        defaultValue: DEFAULT_VALUES.enable_isolation_check,
      },
      max_leakage_current: {
        type: 'number',
        label: 'Max Leakage Current',
        description: 'Maximum acceptable leakage current',
        defaultValue: DEFAULT_VALUES.max_leakage_current,
        min: 0.01,
        max: 1,
        step: 0.01,
        unit: 'mA',
        dependsOn: {
          parameter: 'enable_isolation_check',
          value: true,
        },
      },
    },
  },
  timing_settings: {
    label: 'Timing Settings',
    parameters: {
      switch_timeout: {
        type: 'number',
        label: 'Switch Timeout',
        description: 'Maximum time for switch operation',
        defaultValue: DEFAULT_VALUES.switch_timeout,
        min: 1,
        max: 60,
        step: 1,
        unit: 's',
      },
      wait_for_stabilization: {
        type: 'boolean',
        label: 'Wait for Stabilization',
        description: 'Wait for electrical stabilization',
        defaultValue: DEFAULT_VALUES.wait_for_stabilization,
      },
      stabilization_time: {
        type: 'number',
        label: 'Stabilization Time',
        description: 'Time to wait for stabilization',
        defaultValue: DEFAULT_VALUES.stabilization_time,
        min: 0.5,
        max: 30,
        step: 0.5,
        unit: 's',
        dependsOn: {
          parameter: 'wait_for_stabilization',
          value: true,
        },
      },
    },
  },
};

export const PRIMITIVE_OPERATIONS = [
  'initialize_arduino',
  'check_electrode_connections',
  'switch_to_2_electrode',
  'switch_to_3_electrode',
  'verify_continuity',
  'check_isolation',
  'measure_resistance',
  'wait_for_stabilization',
  'log_electrode_operation',
];
