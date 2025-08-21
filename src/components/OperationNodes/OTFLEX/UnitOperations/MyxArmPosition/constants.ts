import { ParameterGroup } from '../../types';

export const MOVEMENT_MODE_OPTIONS = [
  { value: 'absolute', label: 'Absolute Position' },
  { value: 'relative', label: 'Relative Movement' },
  { value: 'joint', label: 'Joint Angles' },
];

export const SPEED_MODE_OPTIONS = [
  { value: 'slow', label: 'Slow (100 mm/s)' },
  { value: 'normal', label: 'Normal (200 mm/s)' },
  { value: 'fast', label: 'Fast (300 mm/s)' },
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
  uo_name: 'MyxArm_Position_Movement',
  description: 'Control MyxArm robot position and movement',
  wait_before: 0,
  wait_after: 0,
  error_handling: 'stop',
  log_level: 'INFO',
  
  // Movement parameters
  movement_mode: 'absolute',
  x_position: 200,
  y_position: 0,
  z_position: 150,
  rx_angle: 180,
  ry_angle: 0,
  rz_angle: 0,
  
  // Joint angles (for joint mode)
  joint1: 0,
  joint2: 0,
  joint3: 0,
  joint4: 0,
  joint5: 0,
  joint6: 0,
  
  // Speed settings
  speed_mode: 'normal',
  custom_speed: 200,
  acceleration: 500,
  
  // Safety settings
  enable_collision_detection: true,
  force_limit: 10,
  safe_mode: false,
  
  // Precision settings
  position_tolerance: 0.5,
  angle_tolerance: 0.1,
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
  movement_settings: {
    label: 'Movement Settings',
    parameters: {
      movement_mode: {
        type: 'select',
        label: 'Movement Mode',
        description: 'Type of movement control',
        options: MOVEMENT_MODE_OPTIONS,
        defaultValue: DEFAULT_VALUES.movement_mode,
        required: true,
      },
      x_position: {
        type: 'number',
        label: 'X Position',
        description: 'X coordinate position',
        defaultValue: DEFAULT_VALUES.x_position,
        min: -300,
        max: 300,
        step: 0.1,
        unit: 'mm',
        dependsOn: {
          parameter: 'movement_mode',
          value: 'absolute',
        },
      },
      y_position: {
        type: 'number',
        label: 'Y Position',
        description: 'Y coordinate position',
        defaultValue: DEFAULT_VALUES.y_position,
        min: -300,
        max: 300,
        step: 0.1,
        unit: 'mm',
        dependsOn: {
          parameter: 'movement_mode',
          value: 'absolute',
        },
      },
      z_position: {
        type: 'number',
        label: 'Z Position',
        description: 'Z coordinate position',
        defaultValue: DEFAULT_VALUES.z_position,
        min: 0,
        max: 400,
        step: 0.1,
        unit: 'mm',
        dependsOn: {
          parameter: 'movement_mode',
          value: 'absolute',
        },
      },
      rx_angle: {
        type: 'number',
        label: 'RX Angle',
        description: 'Rotation around X axis',
        defaultValue: DEFAULT_VALUES.rx_angle,
        min: -180,
        max: 180,
        step: 0.1,
        unit: '°',
        dependsOn: {
          parameter: 'movement_mode',
          value: 'absolute',
        },
      },
      ry_angle: {
        type: 'number',
        label: 'RY Angle',
        description: 'Rotation around Y axis',
        defaultValue: DEFAULT_VALUES.ry_angle,
        min: -180,
        max: 180,
        step: 0.1,
        unit: '°',
        dependsOn: {
          parameter: 'movement_mode',
          value: 'absolute',
        },
      },
      rz_angle: {
        type: 'number',
        label: 'RZ Angle',
        description: 'Rotation around Z axis',
        defaultValue: DEFAULT_VALUES.rz_angle,
        min: -180,
        max: 180,
        step: 0.1,
        unit: '°',
        dependsOn: {
          parameter: 'movement_mode',
          value: 'absolute',
        },
      },
    },
  },
  joint_control: {
    label: 'Joint Control',
    parameters: {
      joint1: {
        type: 'number',
        label: 'Joint 1',
        description: 'Base joint angle',
        defaultValue: DEFAULT_VALUES.joint1,
        min: -180,
        max: 180,
        step: 0.1,
        unit: '°',
        dependsOn: {
          parameter: 'movement_mode',
          value: 'joint',
        },
      },
      joint2: {
        type: 'number',
        label: 'Joint 2',
        description: 'Shoulder joint angle',
        defaultValue: DEFAULT_VALUES.joint2,
        min: -130,
        max: 130,
        step: 0.1,
        unit: '°',
        dependsOn: {
          parameter: 'movement_mode',
          value: 'joint',
        },
      },
      joint3: {
        type: 'number',
        label: 'Joint 3',
        description: 'Elbow joint angle',
        defaultValue: DEFAULT_VALUES.joint3,
        min: -135,
        max: 135,
        step: 0.1,
        unit: '°',
        dependsOn: {
          parameter: 'movement_mode',
          value: 'joint',
        },
      },
      joint4: {
        type: 'number',
        label: 'Joint 4',
        description: 'Wrist pitch angle',
        defaultValue: DEFAULT_VALUES.joint4,
        min: -180,
        max: 180,
        step: 0.1,
        unit: '°',
        dependsOn: {
          parameter: 'movement_mode',
          value: 'joint',
        },
      },
      joint5: {
        type: 'number',
        label: 'Joint 5',
        description: 'Wrist roll angle',
        defaultValue: DEFAULT_VALUES.joint5,
        min: -180,
        max: 180,
        step: 0.1,
        unit: '°',
        dependsOn: {
          parameter: 'movement_mode',
          value: 'joint',
        },
      },
      joint6: {
        type: 'number',
        label: 'Joint 6',
        description: 'End effector angle',
        defaultValue: DEFAULT_VALUES.joint6,
        min: -180,
        max: 180,
        step: 0.1,
        unit: '°',
        dependsOn: {
          parameter: 'movement_mode',
          value: 'joint',
        },
      },
    },
  },
  speed_settings: {
    label: 'Speed Settings',
    parameters: {
      speed_mode: {
        type: 'select',
        label: 'Speed Mode',
        description: 'Movement speed setting',
        options: SPEED_MODE_OPTIONS,
        defaultValue: DEFAULT_VALUES.speed_mode,
        required: true,
      },
      custom_speed: {
        type: 'number',
        label: 'Custom Speed',
        description: 'Custom movement speed',
        defaultValue: DEFAULT_VALUES.custom_speed,
        min: 10,
        max: 500,
        step: 10,
        unit: 'mm/s',
        dependsOn: {
          parameter: 'speed_mode',
          value: 'custom',
        },
      },
      acceleration: {
        type: 'number',
        label: 'Acceleration',
        description: 'Movement acceleration',
        defaultValue: DEFAULT_VALUES.acceleration,
        min: 100,
        max: 2000,
        step: 50,
        unit: 'mm/s²',
      },
    },
  },
  safety_settings: {
    label: 'Safety Settings',
    parameters: {
      enable_collision_detection: {
        type: 'boolean',
        label: 'Collision Detection',
        description: 'Enable collision detection',
        defaultValue: DEFAULT_VALUES.enable_collision_detection,
      },
      force_limit: {
        type: 'number',
        label: 'Force Limit',
        description: 'Maximum force before stopping',
        defaultValue: DEFAULT_VALUES.force_limit,
        min: 1,
        max: 50,
        step: 1,
        unit: 'N',
        dependsOn: {
          parameter: 'enable_collision_detection',
          value: true,
        },
      },
      safe_mode: {
        type: 'boolean',
        label: 'Safe Mode',
        description: 'Enable reduced speed safe mode',
        defaultValue: DEFAULT_VALUES.safe_mode,
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
        min: 0.01,
        max: 5,
        step: 0.01,
        unit: 'mm',
      },
      angle_tolerance: {
        type: 'number',
        label: 'Angle Tolerance',
        description: 'Acceptable angle error',
        defaultValue: DEFAULT_VALUES.angle_tolerance,
        min: 0.01,
        max: 1,
        step: 0.01,
        unit: '°',
      },
      wait_for_completion: {
        type: 'boolean',
        label: 'Wait for Completion',
        description: 'Wait for movement to complete',
        defaultValue: DEFAULT_VALUES.wait_for_completion,
      },
      completion_timeout: {
        type: 'number',
        label: 'Completion Timeout',
        description: 'Maximum wait time for movement',
        defaultValue: DEFAULT_VALUES.completion_timeout,
        min: 1,
        max: 120,
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
  'initialize_myxarm',
  'check_connection',
  'enable_robot',
  'set_movement_parameters',
  'calculate_trajectory',
  'move_to_position',
  'monitor_position',
  'verify_position',
  'handle_collision',
  'log_movement',
];