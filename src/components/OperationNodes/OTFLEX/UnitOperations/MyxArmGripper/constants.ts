import { ParameterGroup } from '../../types';

export const GRIPPER_ACTION_OPTIONS = [
  { value: 'open', label: 'Open Gripper' },
  { value: 'close', label: 'Close Gripper' },
  { value: 'position', label: 'Set Position' },
];

export const SPEED_MODE_OPTIONS = [
  { value: 'slow', label: 'Slow (50%)' },
  { value: 'normal', label: 'Normal (70%)' },
  { value: 'fast', label: 'Fast (100%)' },
  { value: 'custom', label: 'Custom Speed' },
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
  uo_name: 'MyxArm_Gripper_Control',
  description: 'Control MyxArm robot gripper operation',
  wait_before: 0,
  wait_after: 0,
  error_handling: 'stop',
  log_level: 'INFO',
  
  // Gripper parameters
  gripper_action: 'close',
  target_position: 50,
  grip_force: 70,
  
  // Speed settings
  speed_mode: 'normal',
  custom_speed: 70,
  
  // Force settings
  enable_force_control: true,
  max_force: 100,
  force_threshold: 80,
  
  // Safety settings
  safe_mode: false,
  collision_detection: true,
  
  // Precision settings
  position_tolerance: 1.0,
  force_tolerance: 5.0,
  wait_for_completion: true,
  completion_timeout: 10,
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
  gripper_settings: {
    label: 'Gripper Settings',
    parameters: {
      gripper_action: {
        type: 'select',
        label: 'Gripper Action',
        description: 'Action to perform with gripper',
        options: GRIPPER_ACTION_OPTIONS,
        defaultValue: DEFAULT_VALUES.gripper_action,
        required: true,
      },
      target_position: {
        type: 'number',
        label: 'Target Position',
        description: 'Gripper position (0=fully open, 100=fully closed)',
        defaultValue: DEFAULT_VALUES.target_position,
        min: 0,
        max: 100,
        step: 1,
        unit: '%',
        dependsOn: {
          parameter: 'gripper_action',
          value: 'position',
        },
      },
      grip_force: {
        type: 'number',
        label: 'Grip Force',
        description: 'Force to apply when gripping',
        defaultValue: DEFAULT_VALUES.grip_force,
        min: 10,
        max: 100,
        step: 5,
        unit: '%',
      },
    },
  },
  speed_settings: {
    label: 'Speed Settings',
    parameters: {
      speed_mode: {
        type: 'select',
        label: 'Speed Mode',
        description: 'Gripper movement speed',
        options: SPEED_MODE_OPTIONS,
        defaultValue: DEFAULT_VALUES.speed_mode,
        required: true,
      },
      custom_speed: {
        type: 'number',
        label: 'Custom Speed',
        description: 'Custom gripper speed',
        defaultValue: DEFAULT_VALUES.custom_speed,
        min: 10,
        max: 100,
        step: 5,
        unit: '%',
        dependsOn: {
          parameter: 'speed_mode',
          value: 'custom',
        },
      },
    },
  },
  force_settings: {
    label: 'Force Settings',
    parameters: {
      enable_force_control: {
        type: 'boolean',
        label: 'Force Control',
        description: 'Enable force-based gripper control',
        defaultValue: DEFAULT_VALUES.enable_force_control,
      },
      max_force: {
        type: 'number',
        label: 'Maximum Force',
        description: 'Maximum allowable force',
        defaultValue: DEFAULT_VALUES.max_force,
        min: 20,
        max: 150,
        step: 5,
        unit: '%',
        dependsOn: {
          parameter: 'enable_force_control',
          value: true,
        },
      },
      force_threshold: {
        type: 'number',
        label: 'Force Threshold',
        description: 'Force threshold to detect object',
        defaultValue: DEFAULT_VALUES.force_threshold,
        min: 10,
        max: 100,
        step: 5,
        unit: '%',
        dependsOn: {
          parameter: 'enable_force_control',
          value: true,
        },
      },
    },
  },
  safety_settings: {
    label: 'Safety Settings',
    parameters: {
      safe_mode: {
        type: 'boolean',
        label: 'Safe Mode',
        description: 'Enable reduced force safe mode',
        defaultValue: DEFAULT_VALUES.safe_mode,
      },
      collision_detection: {
        type: 'boolean',
        label: 'Collision Detection',
        description: 'Enable gripper collision detection',
        defaultValue: DEFAULT_VALUES.collision_detection,
      },
    },
  },
  precision_settings: {
    label: 'Precision Settings',
    parameters: {
      position_tolerance: {
        type: 'number',
        label: 'Position Tolerance',
        description: 'Acceptable position error',
        defaultValue: DEFAULT_VALUES.position_tolerance,
        min: 0.1,
        max: 5.0,
        step: 0.1,
        unit: '%',
      },
      force_tolerance: {
        type: 'number',
        label: 'Force Tolerance',
        description: 'Acceptable force variation',
        defaultValue: DEFAULT_VALUES.force_tolerance,
        min: 1.0,
        max: 20.0,
        step: 1.0,
        unit: '%',
      },
      wait_for_completion: {
        type: 'boolean',
        label: 'Wait for Completion',
        description: 'Wait for gripper action to complete',
        defaultValue: DEFAULT_VALUES.wait_for_completion,
      },
      completion_timeout: {
        type: 'number',
        label: 'Completion Timeout',
        description: 'Maximum wait time for completion',
        defaultValue: DEFAULT_VALUES.completion_timeout,
        min: 1,
        max: 60,
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
  'initialize_gripper',
  'check_gripper_status',
  'set_gripper_parameters',
  'open_gripper',
  'close_gripper',
  'set_gripper_position',
  'monitor_gripper_force',
  'verify_gripper_position',
  'handle_gripper_collision',
  'log_gripper_action',
];